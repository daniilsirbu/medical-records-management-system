import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuthorizedUser } from "./auth_helpers";

export const create = mutation({
  args: {
    patientId: v.id("patients"),
    name: v.string(),
    tldrawData: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx);
    const now = new Date().toISOString();
    return await ctx.db.insert("drawingNotes", {
      ...args,
      createdAt: now,
      updatedAt: now,
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
      .query("drawingNotes")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: {
    id: v.id("drawingNotes"),
  },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx);
    return await ctx.db.get(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("drawingNotes"),
    name: v.optional(v.string()),
    tldrawData: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx);
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const remove = mutation({
  args: {
    id: v.id("drawingNotes"),
  },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx);
    return await ctx.db.delete(args.id);
  },
});