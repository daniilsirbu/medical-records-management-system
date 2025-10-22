import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuthorizedUser } from "./auth_helpers";

export const create = mutation({
  args: {
    patientId: v.id("patients"),
    templateId: v.id("formTemplates"),
    formData: v.any(), // Dynamic object to store form responses
    completedDate: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx);
    return await ctx.db.insert("dynamicForms", args);
  },
});

export const list = query({
  args: {
    patientId: v.id("patients"),
  },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx);
    const forms = await ctx.db
      .query("dynamicForms")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .collect();

    // Get template information for each form
    const formsWithTemplates = await Promise.all(
      forms.map(async (form) => {
        const template = await ctx.db.get(form.templateId);
        return {
          ...form,
          template,
        };
      })
    );

    return formsWithTemplates;
  },
});

export const get = query({
  args: {
    formId: v.id("dynamicForms"),
  },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx);
    const form = await ctx.db.get(args.formId);
    if (!form) return null;

    const template = await ctx.db.get(form.templateId);
    return {
      ...form,
      template,
    };
  },
});

export const update = mutation({
  args: {
    formId: v.id("dynamicForms"),
    formData: v.any(),
  },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx);
    const { formId, ...updates } = args;
    return await ctx.db.patch(formId, updates);
  },
});

export const remove = mutation({
  args: {
    formId: v.id("dynamicForms"),
  },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx);
    return await ctx.db.delete(args.formId);
  },
});
