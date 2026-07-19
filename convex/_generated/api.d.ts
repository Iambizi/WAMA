/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activityLogs from "../activityLogs.js";
import type * as aiSecurity from "../aiSecurity.js";
import type * as authz from "../authz.js";
import type * as buyers from "../buyers.js";
import type * as dashboard from "../dashboard.js";
import type * as matches from "../matches.js";
import type * as onboarding from "../onboarding.js";
import type * as privacyRequests from "../privacyRequests.js";
import type * as securityValidation from "../securityValidation.js";
import type * as sellers from "../sellers.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activityLogs: typeof activityLogs;
  aiSecurity: typeof aiSecurity;
  authz: typeof authz;
  buyers: typeof buyers;
  dashboard: typeof dashboard;
  matches: typeof matches;
  onboarding: typeof onboarding;
  privacyRequests: typeof privacyRequests;
  securityValidation: typeof securityValidation;
  sellers: typeof sellers;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
