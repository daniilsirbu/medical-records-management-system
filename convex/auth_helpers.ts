import { getAuthUserId } from "@convex-dev/auth/server";
import { QueryCtx, MutationCtx } from "./_generated/server";

export async function requireAuthorizedUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Check if user is authorized
  if (!user.isAuthorized) {
    throw new Error("Access denied. Your account needs to be authorized by an administrator.");
  }

  return { userId, user };
}

export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("User not found");
  }

  return { userId, user };
}

export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const { user } = await requireAuthorizedUser(ctx);
  
  if (user.role !== "admin") {
    throw new Error("Admin access required");
  }
  
  return { user };
}

export async function getUserAuthStatus(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    return { isAuthenticated: false, isAuthorized: false, user: null };
  }

  const user = await ctx.db.get(userId);
  if (!user) {
    return { isAuthenticated: true, isAuthorized: false, user: null };
  }

  return { 
    isAuthenticated: true, 
    isAuthorized: !!user.isAuthorized, 
    user 
  };
}