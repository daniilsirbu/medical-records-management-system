import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuthorizedUser } from "./auth_helpers";

export const create = mutation({
  args: {
    patientId: v.id("patients"),
    title: v.string(),
    content: v.string(),
    category: v.optional(v.string()),
    isImportNote: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx);
    return await ctx.db.insert("patientNotes", args);
  },
});

export const list = query({
  args: {
    patientId: v.id("patients"),
  },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx);
    return await ctx.db
      .query("patientNotes")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .collect();
  },
});

export const update = mutation({
  args: {
    noteId: v.id("patientNotes"),
    title: v.string(),
    content: v.string(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx);
    const { noteId, ...updates } = args;
    return await ctx.db.patch(noteId, updates);
  },
});

export const remove = mutation({
  args: {
    noteId: v.id("patientNotes"),
  },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx);
    return await ctx.db.delete(args.noteId);
  },
});
