import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuthorizedUser } from "./auth_helpers";

export const create = mutation({
  args: {
    patientId: v.id("patients"),
    types: v.array(v.string()),
    text: v.string(),
    doctorSignature: v.string(),
    patientSignature: v.string(),
    date: v.string(),
    doctorName: v.string(),
    additionalInfo: v.optional(v.string()),
    medications: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx);
    return await ctx.db.insert("consents", args);
  },
});

export const list = query({
  args: {
    patientId: v.id("patients"),
  },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx);
    return await ctx.db
      .query("consents")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .collect();
  },
});
