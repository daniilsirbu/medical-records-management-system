import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuthorizedUser } from "./auth_helpers";

export const create = mutation({
  args: {
    patientId: v.id("patients"),
    date: v.string(),
    bodyAnnotation: v.string(),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx);
    return await ctx.db.insert("followUps", {
      patientId: args.patientId,
      date: args.date,
      bodyAnnotation: args.bodyAnnotation,
      notes: args.notes,
    });
  },
});

export const list = query({
  args: {
    patientId: v.id("patients"),
  },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx);
    return await ctx.db
      .query("followUps")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .collect();
  },
});
