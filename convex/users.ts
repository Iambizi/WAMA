import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get the active logged-in user matching Clerk identity
export const current = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

// Sync Clerk session user with Convex database and assign initial roles
export const sync = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: Identity context missing");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    const now = Date.now();

    // Check if user email matches the ADMIN_EMAILS environment variable
    const adminEmailsEnv = process.env.ADMIN_EMAILS || "";
    const adminEmails = adminEmailsEnv
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);

    const userEmail = args.email.toLowerCase();
    const isAdmin = adminEmails.includes(userEmail);

    if (existing) {
      // Retain or update admin status dynamically if env variables change
      const targetRole = isAdmin ? "admin" : existing.role;
      
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
        role: targetRole,
        updatedAt: now,
      });
      return existing._id;
    }

    // New user signup
    const initialRole = isAdmin ? "admin" : "unassigned";

    const id = await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: args.email,
      name: args.name,
      role: initialRole,
      onboardingIntent: null,
      onboardingStatus: "not_started",
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },
});

// Update the user onboarding intent and status
export const updateIntent = mutation({
  args: {
    intent: v.union(v.literal("buyer"), v.literal("seller")),
    status: v.union(
      v.literal("not_started"),
      v.literal("in_progress"),
      v.literal("submitted")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User record not found");
    }

    await ctx.db.patch(user._id, {
      onboardingIntent: args.intent,
      onboardingStatus: args.status,
      // If user is currently unassigned, temporarily assign the role of their intent
      role: user.role === "unassigned" ? args.intent : user.role,
      updatedAt: Date.now(),
    });

    return user._id;
  },
});
