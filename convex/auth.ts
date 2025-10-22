import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";
import { query } from "./_generated/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET!,
    }),
  ],
});

export const loggedInUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    return { ...user, isAuthorized: !!user.isAuthorized };
  },
});

export const getUserAuthStatus = query({
  handler: async (ctx) => {
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
      user: { ...user, isAuthorized: !!user.isAuthorized }
    };
  },
});
