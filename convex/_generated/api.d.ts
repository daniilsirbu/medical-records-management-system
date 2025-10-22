/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as consents from "../consents.js";
import type * as dynamicForms from "../dynamicForms.js";
import type * as followUps from "../followUps.js";
import type * as formTemplates from "../formTemplates.js";
import type * as http from "../http.js";
import type * as medicalForms from "../medicalForms.js";
import type * as miscFiles from "../miscFiles.js";
import type * as patientNotes from "../patientNotes.js";
import type * as patients from "../patients.js";
import type * as photos from "../photos.js";
import type * as router from "../router.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  consents: typeof consents;
  dynamicForms: typeof dynamicForms;
  followUps: typeof followUps;
  formTemplates: typeof formTemplates;
  http: typeof http;
  medicalForms: typeof medicalForms;
  miscFiles: typeof miscFiles;
  patientNotes: typeof patientNotes;
  patients: typeof patients;
  photos: typeof photos;
  router: typeof router;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
