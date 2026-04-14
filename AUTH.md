# Auth.js (NextAuth.js) Implementation Guide

This document covers the Auth.js authentication system integrated into the Invoice Management System.

## Overview

Auth.js has been integrated for modern, secure authentication with support for:
- ✅ Email/Password authentication (Credentials provider)
- ✅ OAuth providers (GitHub, Google)
- ✅ Session management with JWT
- ✅ Database session storage
- ✅ Middleware-based route protection
- ✅ TypeScript support

## Architecture

### Authentication Flow

```
User → Sign Up → Register API → Prisma → Database
         ↓
      Hash Password
         ↓
   Create Session

User → Sign In → Credentials Provider → Compare Hash
         ↓
   JWT Token → Session Storage
         ↓
   Middleware → Route Protection
```

## Files Structure

```
src/
├── lib/
│   ├── auth.ts                 # Auth.js configuration
│   └── auth-utils.ts           # Authentication utilities
├── app/
│   ├── api/auth/
│   │   ├── [...]nextauth/route.ts    # Auth.js handler
│   │   └── register/route.ts         # Registration endpoint
│   ├── auth/
│   │   ├── signin/page.tsx           # Sign in page
│   │   └── signup/page.tsx           # Sign up page
│   ├── dashboard/page.tsx            # Protected route
│   └── layout.tsx
├── middleware.ts               # Route protection middleware
└── components/
    └── AuthProvider.tsx        # Session provider wrapper
```

## Configuration

### Environment Variables

Required in `.env.local`:

```env
# Auth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Optional: OAuth Providers
GITHUB_ID="your-github-id"
GITHUB_SECRET="your-github-secret"
GOOGLE_ID="your-google-id"
GOOGLE_SECRET="your-google-secret"
```

### Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

Or use:
```bash
npx auth secret
```

## Database Schema

Auth.js models added to Prisma schema:

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  password      String?   // For credentials provider
  image         String?
  
  accounts      Account[]
  sessions      Session[]
  invoices      Invoice[]
  budgets       Budget[]
  expenses      Expense[]
}

model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String?
  access_token       String?
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String?
  session_state      String?
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}
```

## Authentication Methods

### 1. Email/Password (Credentials)

**Sign Up:**
```typescript
// POST /api/auth/register
const response = await fetch('/api/auth/register', {
  method: 'POST',
  body: JSON.stringify({
    email: 'user@example.com',
    name: 'John Doe',
    password: 'secure-password'
  })
})
```

**Sign In:**
```typescript
import { signIn } from 'next-auth/react'

await signIn('credentials', {
  email: 'user@example.com',
  password: 'secure-password',
  redirect: false
})
```

### 2. OAuth Providers

#### GitHub OAuth

**Setup:**
1. Go to https://github.com/settings/developers
2. Create OAuth App
3. Get Client ID and Secret
4. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
5. Add to `.env.local`:
```env
GITHUB_ID="your-client-id"
GITHUB_SECRET="your-client-secret"
```

**Usage:**
```typescript
await signIn('github')
```

#### Google OAuth

**Setup:**
1. Go to https://console.cloud.google.com/
2. Create OAuth 2.0 Credentials
3. Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
4. Add to `.env.local`:
```env
GOOGLE_ID="your-client-id"
GOOGLE_SECRET="your-client-secret"
```

**Usage:**
```typescript
await signIn('google')
```

## Usage in Components

### Client Components

```typescript
'use client'

import { useSession, signIn, signOut } from 'next-auth/react'

export function MyComponent() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <p>Loading...</p>
  if (status === 'unauthenticated') {
    return <button onClick={() => signIn()}>Sign In</button>
  }

  return (
    <div>
      <p>Welcome, {session?.user?.name}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  )
}
```

### Server Components & API Routes

```typescript
import { requireAuth, getCurrentUser, getCurrentUserId } from '@/lib/auth-utils'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // This will throw if not authenticated
    const user = await requireAuth()
    
    // Or get the user ID safely
    const userId = await getCurrentUserId()
    
    // Query your data
    const data = await prisma.invoice.findMany({
      where: { userId: user.id }
    })
    
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
```

## Authentication Utilities

### `src/lib/auth-utils.ts`

```typescript
import { getCurrentUser } from '@/lib/auth-utils'

// Get current authenticated user
const user = await getCurrentUser()  // User | undefined

// Get current user ID
const userId = await getCurrentUserId()  // string | null

// Check if authenticated
const isAuth = await isAuthenticated()  // boolean

// Require authentication (throws if not auth'd)
const user = await requireAuth()  // User (throws on error)

// Hash password
const hashed = await hashPassword('password')

// Verify password
const match = await verifyPassword('password', hashed)
```

## Route Protection

### Middleware-based Protection

Routes are protected via `src/middleware.ts`:

**Protected Routes:**
- `/dashboard/*`
- `/invoices/*`
- `/budgets/*`
- `/expenses/*`

**Auth Routes:**
- `/auth/signin`
- `/auth/signup`
- `/auth/error`

Unauthenticated users are redirected to `/auth/signin` with a callback URL.

### Manual Protection

```typescript
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/auth/signin')
  }
  
  return <div>Protected Content</div>
}
```

## Session Configuration

### Session Strategy

**JWT (Default):**
```typescript
session: {
  strategy: 'jwt',
  maxAge: 7 * 24 * 60 * 60,  // 7 days
  updateAge: 24 * 60 * 60,    // Update every 1 day
}
```

### Session Callbacks

```typescript
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id
    }
    return token
  },

  async session({ session, token }) {
    if (session.user) {
      session.user.id = token.id as string
    }
    return session
  }
}
```

## Events & Logging

Auth.js events in `src/lib/auth.ts`:

```typescript
events: {
  async signIn({ user, account, profile, isNewUser }) {
    console.log(`User ${user.email} signed in`)
  },
  async signOut({ token }) {
    console.log(`User ${token.email} signed out`)
  },
  async createUser({ user }) {
    console.log(`New user created: ${user.email}`)
  },
  async updateUser({ user }) {
    console.log(`User updated: ${user.email}`)
  },
  async linkAccount({ user, account, profile }) {
    console.log(`Account linked for ${user.email}`)
  },
  async session({ session, token }) {
    // Useful for session modifications
  },
  async callback({ url, baseUrl }) {
    // Handle post-login redirects
  },
}
```

## API Routes Examples

### Sign Up API

```typescript
// src/app/api/auth/register/route.ts
export async function POST(request: NextRequest) {
  const { email, name, password } = await request.json()
  
  // Validate
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: 'Invalid email' },
      { status: 400 }
    )
  }
  
  // Check if exists
  const exists = await prisma.user.findUnique({
    where: { email }
  })
  
  if (exists) {
    return NextResponse.json(
      { error: 'User already exists' },
      { status: 409 }
    )
  }
  
  // Hash password
  const hashedPassword = await hashPassword(password)
  
  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword
    }
  })
  
  return NextResponse.json(user, { status: 201 })
}
```

### Protected API Route

```typescript
// src/app/api/invoices/route.ts
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth()
    
    // Get invoices for user
    const invoices = await prisma.invoice.findMany({
      where: { userId: user.id }
    })
    
    return NextResponse.json(invoices)
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
```

## Troubleshooting

### "NEXTAUTH_SECRET is not set"

**Solution:**
```env
NEXTAUTH_SECRET="your-secret-key-here"
```

Generate with: `openssl rand -base64 32`

### "Unsupported action name: ..."

**Cause:** Missing Auth.js route handler

**Solution:**
Make sure `src/app/api/auth/[...nextauth]/route.ts` exists and exports:
```typescript
export const { GET, POST } = handlers
```

### Session not persisting

**Cause:** AuthProvider not wrapping app

**Solution:**
Ensure `src/components/AuthProvider.tsx` wraps children in `SessionProvider`

### Prisma adapter issues

**Cause:** Schema not synced with database

**Solution:**
```bash
npx prisma db push
npx prisma generate
```

### OAuth callback URL mismatch

**Solution:**
Update OAuth app settings with correct callback URL:
- Development: `http://localhost:3000/api/auth/callback/[provider]`
- Production: `https://yourdomain.com/api/auth/callback/[provider]`

## Security Best Practices

1. **Never commit secrets**
   - Use `.env.local` for development
   - Use environment variables in production

2. **HTTPS in production**
   - Set `NEXTAUTH_URL` to HTTPS
   - Configure OAuth providers with HTTPS URLs

3. **Password hashing**
   - Always hash passwords before storing
   - Use bcryptjs (already installed)

4. **Session security**
   - Use JWT strategy for stateless sessions
   - Set appropriate session expiry
   - Update tokens regularly

5. **OAuth security**
   - Use PKCE flow for mobile apps
   - Store sensitive tokens server-side
   - Validate callback URLs

## Advanced Configuration

### Custom Pages

```typescript
// src/lib/auth.ts
pages: {
  signIn: '/auth/signin',
  signUp: '/auth/signup',
  error: '/auth/error',
  verifyRequest: '/auth/verify-request',
  newUser: '/auth/new-user'
}
```

### JWT Customization

```typescript
callbacks: {
  async encode({ token, secret }) {
    // Custom JWT encoding
    return token
  },
  async decode({ token, secret }) {
    // Custom JWT decoding  
    return token
  }
}
```

### Email Verification

```typescript
// Add email provider for verification emails
import EmailProvider from 'next-auth/providers/email'

providers: [
  EmailProvider({
    server: {
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    },
    from: process.env.EMAIL_FROM,
  }),
]
```

## Resources

- [Auth.js Documentation](https://authjs.dev/)
- [NextAuth.js v5](https://next-auth.js.org/)
- [Prisma Adapter](https://authjs.dev/reference/adapter/prisma)
- [OAuth Setup Guides](https://authjs.dev/guides/providers)

## Next Steps

1. Configure `NEXTAUTH_SECRET`
2. Update `NEXTAUTH_URL` for your environment
3. Add OAuth providers if desired
4. Test sign-up and sign-in flows
5. Deploy to production
6. Update environment variables in production

---

**Status**: ✅ Auth.js fully integrated and configured
**Last Updated**: April 14, 2026
