/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as checkins from "../checkins.js";
import type * as crew from "../crew.js";
import type * as crewName from "../crewName.js";
import type * as feed from "../feed.js";
import type * as files from "../files.js";
import type * as groups from "../groups.js";
import type * as http from "../http.js";
import type * as keiki from "../keiki.js";
import type * as members from "../members.js";
import type * as profile from "../profile.js";
import type * as rainchecks from "../rainchecks.js";
import type * as reel from "../reel.js";
import type * as stake from "../stake.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  checkins: typeof checkins;
  crew: typeof crew;
  crewName: typeof crewName;
  feed: typeof feed;
  files: typeof files;
  groups: typeof groups;
  http: typeof http;
  keiki: typeof keiki;
  members: typeof members;
  profile: typeof profile;
  rainchecks: typeof rainchecks;
  reel: typeof reel;
  stake: typeof stake;
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
