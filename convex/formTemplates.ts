import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    sections: v.array(v.object({
      title: v.string(),
      fields: v.array(v.object({
        id: v.string(),
        type: v.union(
          v.literal("text"),
          v.literal("textarea"),
          v.literal("select"),
          v.literal("radio"),
          v.literal("checkbox"),
          v.literal("date"),
          v.literal("number"),
          v.literal("email"),
          v.literal("phone")
        ),
        label: v.string(),
        required: v.optional(v.boolean()),
        options: v.optional(v.array(v.string())),
        placeholder: v.optional(v.string()),
        validation: v.optional(v.object({
          min: v.optional(v.number()),
          max: v.optional(v.number()),
          pattern: v.optional(v.string()),
        })),
      })),
    })),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("formTemplates", {
      ...args,
      isActive: args.isActive ?? true,
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("formTemplates")
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: {
    templateId: v.id("formTemplates"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.templateId);
  },
});

export const update = mutation({
  args: {
    templateId: v.id("formTemplates"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    sections: v.optional(v.array(v.object({
      title: v.string(),
      fields: v.array(v.object({
        id: v.string(),
        type: v.union(
          v.literal("text"),
          v.literal("textarea"),
          v.literal("select"),
          v.literal("radio"),
          v.literal("checkbox"),
          v.literal("date"),
          v.literal("number"),
          v.literal("email"),
          v.literal("phone")
        ),
        label: v.string(),
        required: v.optional(v.boolean()),
        options: v.optional(v.array(v.string())),
        placeholder: v.optional(v.string()),
        validation: v.optional(v.object({
          min: v.optional(v.number()),
          max: v.optional(v.number()),
          pattern: v.optional(v.string()),
        })),
      })),
    }))),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { templateId, ...updates } = args;
    return await ctx.db.patch(templateId, updates);
  },
});

export const remove = mutation({
  args: {
    templateId: v.id("formTemplates"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.templateId, { isActive: false });
  },
});
