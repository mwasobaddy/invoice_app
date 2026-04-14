import NextAuth, { CredentialsSignin } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"

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

        const passwordsMatch = await compare(password, user.password)

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

    // OAuth providers
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_ID || "",
      clientSecret: process.env.GOOGLE_SECRET || "",
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
          console.log(
            `Linking ${account.provider} account to existing user: ${email}`
          );
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
      console.log(`User ${user.email} signed in`)
    },
    async signOut(params) {
      const email = "token" in params ? params.token?.email : undefined
      if (email) {
        console.log(`User ${email} signed out`)
      }
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // Update age 1 day
  },
})
