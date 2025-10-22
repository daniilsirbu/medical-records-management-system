import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    patientId: v.id("patients"),
    fileName: v.string(),
    fileType: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("miscFiles", {
      ...args,
      uploadDate: new Date().toISOString().split("T")[0],
    });
  },
});

export const list = query({
  args: {
    patientId: v.id("patients"),
  },
  handler: async (ctx, args) => {
    const files = await ctx.db
      .query("miscFiles")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .collect();

    return await Promise.all(
      files.map(async (file) => ({
        ...file,
        url: await ctx.storage.getUrl(file.storageId),
      }))
    );
  },
});

export const remove = mutation({
  args: {
    fileId: v.id("miscFiles"),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) return;
    
    // Supprimer le fichier du stockage
    await ctx.storage.delete(file.storageId);
    // Supprimer l'entrée de la base de données
    await ctx.db.delete(args.fileId);
  },
});
