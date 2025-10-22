import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./auth_helpers";

// List all users (admin only)
export const listUsers = query({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("users").collect();
  },
});

// Authorize a user (admin only)
export const authorizeUser = mutation({
  args: { 
    userId: v.id("users"),
    role: v.optional(v.union(v.literal("admin"), v.literal("user")))
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.userId, { 
      isAuthorized: true,
      role: args.role || "user"
    });
  },
});

// Revoke user authorization (admin only)
export const revokeUserAuthorization = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.userId, { 
      isAuthorized: false,
      role: undefined
    });
  },
});

// Get unauthorized users (admin only)
export const getUnauthorizedUsers = query({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("users")
      .filter((q) => q.neq(q.field("isAuthorized"), true))
      .collect();
  },
});