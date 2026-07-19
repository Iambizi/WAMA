import { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import type { UserIdentity } from "convex/server";

type AuthCtx = QueryCtx | MutationCtx;

function envList(name: string, lowercase = false): string[] {
  return (process.env[name] ?? "")
    .split(",")
    .map((value) => lowercase ? value.trim().toLowerCase() : value.trim())
    .filter(Boolean);
}

export function trustedAdminClerkIds(): string[] {
  return envList("ADMIN_CLERK_IDS");
}

export function isTrustedAdminIdentity(identity: UserIdentity): boolean {
  const trustedSubjects = trustedAdminClerkIds();
  if (trustedSubjects.includes(identity.subject)) return true;

  // Transitional fallback only. The email and verification flag both come from
  // the signed Clerk JWT; browser-supplied profile values are never trusted.
  const trustedEmails = envList("ADMIN_EMAILS", true);
  return (
    identity.emailVerified === true &&
    typeof identity.email === "string" &&
    trustedEmails.includes(identity.email.trim().toLowerCase())
  );
}

export async function requireIdentity(ctx: AuthCtx): Promise<UserIdentity> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  return identity;
}

export async function getUserForIdentity(
  ctx: AuthCtx,
  identity: UserIdentity,
): Promise<Doc<"users"> | null> {
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();
}

export async function requireUser(ctx: AuthCtx): Promise<{
  identity: UserIdentity;
  user: Doc<"users">;
}> {
  const identity = await requireIdentity(ctx);
  const user = await getUserForIdentity(ctx, identity);
  if (!user) throw new Error("Unauthorized");
  return { identity, user };
}

export async function requireAdvisor(ctx: AuthCtx): Promise<{
  identity: UserIdentity;
  user: Doc<"users">;
}> {
  const identity = await requireIdentity(ctx);
  if (!isTrustedAdminIdentity(identity)) {
    throw new Error("Forbidden: Administrator privileges required");
  }

  const user = await getUserForIdentity(ctx, identity);
  if (!user || user.role !== "admin") {
    throw new Error("Forbidden: Administrator account is not synchronized");
  }

  return { identity, user };
}
