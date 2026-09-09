import NextAuth, { CredentialsSignin } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"

if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
  throw new Error("NEXTAUTH_SECRET must be at least 32 characters — generate with: openssl rand -base64 32");
}

class OAuthNoPasswordError extends CredentialsSignin {
  code = "oauth_no_password"
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // The generated Prisma client type differs slightly from @prisma/client's type expected by PrismaAdapter.
  adapter: PrismaAdapter(prisma as unknown as Parameters<typeof PrismaAdapter>[0]),
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  providers: [
    // Credentials provider for email/password authentication
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email : ""
        const password = typeof credentials?.password === "string" ? credentials.password : ""

        if (!email || !password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email },
          include: { accounts: true },
        })

        if (!user) {
          return null
        }

        // Check if user signed up with OAuth but no password is set
        if (!user.password) {
          throw new OAuthNoPasswordError()
        }

        const pepper = process.env.BCRYPT_PEPPER || "";
        const passwordsMatch = await compare(password + pepper, user.password)

        if (!passwordsMatch) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),

    // OAuth providers — support both naming conventions
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
    // Handle account linking and merging
    async signIn({ account, profile }) {
      // If signing in with OAuth provider (Google, Github)
      if (account?.provider === "google" || account?.provider === "github") {
        const email = profile?.email;

        if (!email) {
          return false;
        }

        // Check if email already exists in the database
        const existingUser = await prisma.user.findUnique({
          where: { email },
          include: { accounts: true },
        });

        // If user exists and this provider isn't already linked
        if (
          existingUser &&
          !existingUser.accounts.find((acc: { provider: string }) => acc.provider === account.provider)
        ) {
          // Account exists with different provider - linking is allowed
          // PrismaAdapter will handle linking automatically
          return true;
        }
      }

      return true;
    },

    // Include user ID in JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },

    // Include JWT token in session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },

  events: {
    async signIn({ user }) {
      // structured log placeholder — replace with pino/sentry when added
    },
    async signOut(params) {
      // noop — handled via audit log if needed
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // Update age 1 day
  },
})
