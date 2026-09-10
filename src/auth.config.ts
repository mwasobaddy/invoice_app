import type { NextAuthConfig } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

// Edge-compatible config — no prisma, no bcrypt, no adapter
// Used by src/middleware.ts to keep Edge Function under 1MB Hobby limit
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  providers: [
    // Credentials is handled in src/lib/auth.ts only (Node), not here
    GithubProvider({
      clientId: process.env.GITHUB_ID || process.env.AUTH_GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || process.env.AUTH_GITHUB_SECRET || "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.GOOGLE_SECRET || process.env.AUTH_GOOGLE_SECRET || "",
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = (user as { id?: string }).id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as { id?: string }).id = token.id as string;
      return session;
    },
  },
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60, updateAge: 24 * 60 * 60 },
};
