import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    patientId: v.id("patients"),
    date: v.string(),
    description: v.optional(v.string()),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("photos", args);
  },
});

export const list = query({
  args: {
    patientId: v.id("patients"),
  },
  handler: async (ctx, args) => {
    const photos = await ctx.db
      .query("photos")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .collect();

    return await Promise.all(
      photos.map(async (photo) => ({
        ...photo,
        url: await ctx.storage.getUrl(photo.storageId),
      }))
    );
  },
});

export const remove = mutation({
  args: {
    photoId: v.id("photos"),
  },
  handler: async (ctx, args) => {
    const photo = await ctx.db.get(args.photoId);
    if (!photo) return;
    
    // Supprimer le fichier du stockage
    await ctx.storage.delete(photo.storageId);
    // Supprimer l'entrée de la base de données
    await ctx.db.delete(args.photoId);
  },
});
