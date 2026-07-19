import type { Doc } from "./_generated/dataModel";

export type ProfileKind = "buyer" | "seller";

export function assertCanSelectIntent(user: Doc<"users">, intent: ProfileKind): void {
  if (user.role === "admin") throw new Error("Administrators use the advisor workflow");
  if (user.role !== "unassigned") throw new Error("Onboarding role is already assigned");
  if (user.onboardingStatus === "submitted" || user.onboardingStatus === "approved") {
    throw new Error("Submitted onboarding cannot be changed");
  }
  if (user.onboardingIntent && user.onboardingIntent !== intent) {
    throw new Error("Onboarding intent cannot be switched");
  }
}

export function assertCanCreateSelfProfile(user: Doc<"users">, kind: ProfileKind): void {
  assertCanSelectIntent(user, kind);
  if (user.onboardingIntent !== kind || user.onboardingStatus !== "in_progress") {
    throw new Error(`Begin ${kind} onboarding before creating a profile`);
  }
}

export function assertCanEditSelfProfile(user: Doc<"users">, kind: ProfileKind): void {
  if (user.role !== kind || user.onboardingIntent !== kind) throw new Error("Forbidden");
  if (user.onboardingStatus !== "in_progress") {
    throw new Error("Submitted profiles require advisor reopening before edits");
  }
}
