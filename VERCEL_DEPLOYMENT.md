# Vercel Deployment Guide for Invoice Management App

This guide walks you through deploying your Next.js invoice app to Vercel with full functionality including authentication, database, and charts.

## Prerequisites

- ✅ GitHub account with your repo pushed (already done: `mwasobaddy/invoice_app`)
- PostgreSQL database (Supabase or Neon)
- NextAuth OAuth credentials (GitHub & Google)
- Vercel account (free tier available at vercel.com)

---

## Step 1: Prepare Your Database

### Option A: Supabase (Recommended)

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project (note: it takes ~2 minutes)
3. Once created, go to **Settings** → **Database** → **Connection Pooling**
4. Enable connection pooling for serverless
5. Copy the connection string with mode=transaction
6. Keep this handy - you'll need it for Vercel

**Connection string format:**
```
postgresql://postgres:[PASSWORD]@[HOST].supabase.co:6543/postgres?schema=public
```

### Option B: Neon

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Go to **Connection String** and copy it
4. Keep this handy - you'll need it for Vercel

**Connection string format:**
```
postgresql://[USERNAME]:[PASSWORD]@[HOST].neon.tech/[DATABASE]?schema=public
```

---

## Step 2: Set Up OAuth Providers

### GitHub OAuth

1. Go to GitHub Settings → **Developer Settings** → **OAuth Apps** → **New OAuth App**
2. Fill in the form:
   - **Application name:** Invoice Management App
   - **Homepage URL:** `https://yourdomain.vercel.app` (or use vercel.app generated URL)
   - **Authorization callback URL:** `https://yourdomain.vercel.app/api/auth/callback/github`
3. You'll get:
   - Client ID
   - Client Secret (keep this secret!)

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
4. Choose **Web application**
5. Add authorized redirect URIs:
   - `https://yourdomain.vercel.app/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (for local dev)
6. You'll get:
   - Client ID
   - Client Secret

---

## Step 3: Create Vercel Project

### 3.1 Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New** → **Project**
3. Select **Import Git Repository**
4. Search for `invoice_app` and click **Import**

### 3.2 Configure Build Settings

The defaults should work fine, but verify:
- **Framework:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

---

## Step 4: Set Environment Variables in Vercel

In Vercel project settings, go to **Settings** → **Environment Variables** and add each of these:

### Database (Required)
```
DATABASE_URL = postgresql://... (copy from Supabase/Neon)
```

### NextAuth (Required)
```
NEXTAUTH_URL = https://yourdomain.vercel.app
NEXTAUTH_SECRET = (generate a secure random string below)
```

**Generate NEXTAUTH_SECRET:**
Run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Paste the output as your NEXTAUTH_SECRET value.

### GitHub OAuth (If using GitHub sign-in)
```
AUTH_GITHUB_ID = (your GitHub Client ID)
AUTH_GITHUB_SECRET = (your GitHub Client Secret)
```

### Google OAuth (If using Google sign-in)
```
AUTH_GOOGLE_ID = (your Google Client ID)
AUTH_GOOGLE_SECRET = (your Google Client Secret)
```

### Optional: Base URL (for dynamic OAuth redirects)
```
NEXTAUTH_URL = https://yourdomain.vercel.app
```

---

## Step 5: Deploy Your App

### 5.1 Initial Deployment

After setting all environment variables:

1. In Vercel, click the **Deploy** button
2. Wait for the build to complete (2-3 minutes usually)
3. You should see a green "Ready" status

### 5.2 Initialize Database

Once deployed, your database schema needs to be created:

**Option A: Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Link your local project to Vercel
vercel link

# Run Prisma migration on production database
vercel env pull  # Pulls environment variables locally
npx prisma migrate deploy
```

**Option B: Direct Migration**
```bash
# Set your production DATABASE_URL locally
export DATABASE_URL="your_postgres_connection_string"

# Create database schema
npx prisma db push

# Optionally seed demo data
npx prisma db seed
```

---

## Step 6: Verify Deployment

### Test Your App

1. Visit your Vercel deployment URL: `https://yourapp.vercel.app`
2. Try these workflows:

   **Sign Up:**
   - Create a new account with email/password
   - Verify you can log in

   **OAuth:**
   - Test GitHub sign-in (if configured)
   - Test Google sign-in (if configured)

   **Create Invoice:**
   - Navigate to Dashboard
   - Create a new invoice
   - Verify data appears in database

   **Dashboard Chart:**
   - Check the dashboard shows the recharts visualization
   - Verify monthly/yearly toggle works

   **CRUD Operations:**
   - Test editing an invoice
   - Test deleting a budget
   - Create an expense

### Check Logs

If something fails:

1. In Vercel dashboard, click **Deployments**
2. Click the failed deployment
3. Go to **Logs** → **Build** or **Runtime** to see errors
4. Common issues:
   - DATABASE_URL not set → add to Environment Variables
   - NEXTAUTH_SECRET missing → generate and add it
   - OAuth redirect URI mismatch → verify in OAuth provider settings

---

## Step 7: Post-Deployment Setup

### Update OAuth Redirect URLs

Now that you have your Vercel domain, update your OAuth providers:

**GitHub:**
- Go back to GitHub OAuth App settings
- Update **Authorization callback URL** to: `https://yourdomain.vercel.app/api/auth/callback/github`

**Google:**
- Go to Google Cloud Console
- Update authorized redirect URI to: `https://yourdomain.vercel.app/api/auth/callback/google`

### Add Custom Domain (Optional)

If you want a custom domain:

1. In Vercel Settings → **Domains**
2. Enter your domain name
3. Follow the DNS configuration instructions
4. Update your OAuth providers with the new domain

---

## Step 8: Seed Production Data (Optional)

To populate your production database with demo data:

```bash
# Pull production environment variables
vercel env pull

# Run seeder with prod database
npx prisma db seed
```

This will create 6 months of demo invoices, budgets, and expenses for testing.

---

## Troubleshooting

### "Database Error" on Login

**Problem:** `PrismaClientInitializationError`
- **Solution:** Check DATABASE_URL is set in Vercel Environment Variables
- Restart deployment after adding/fixing env var

### "Invalid OAuth Callback"

**Problem:** Redirect URI mismatch
- **Solution:** 
  - Verify your Vercel domain in GitHub/Google settings
  - Make sure callback URLs match exactly (no trailing slashes)
  - Include `/api/auth/callback/github` not just `/api/auth`

### Build Fails with "Prisma Error"

**Problem:** `Error: Database connection`
- **Solution:**
  - Run `vercel env pull` to verify env vars are accessible
  - Test connection: `npx prisma db execute --stdin < /dev/null`
  - Ensure DATABASE_URL has correct format

### 502 Bad Gateway on Production

**Problem:** Runtime errors in API routes
- **Solution:**
  - Check Vercel logs (Deployments → Logs)
  - Verify all required env vars are set
  - Check that Prisma client is being imported correctly

### Seed Data Not Appearing

**Problem:** Database empty after seed
- **Solution:**
  - Verify DATABASE_URL is pointing to production
  - Check seed logs: `vercel logs` in Vercel CLI
  - Manually verify data with Prisma Studio: `npx prisma studio`

---

## Local Development with Production Database

To test locally against production DB:

```bash
# Pull environment variables
vercel env pull

# This creates .env.local with production DATABASE_URL

# Start dev server (will use prod DB)
npm run dev
```

⚠️ **Warning:** This modifies your production database. Only do this for testing!

---

## Performance Tips

1. **Enable Database Connection Pooling:** Already configured with Prisma (check prisma.config.ts)
2. **Optimize Recharts:** Charts are memoized by default
3. **Cache API Responses:** Consider adding revalidate time to API routes
4. **Set ISR (Incremental Static Regeneration):** For dashboard stats

---

## Next Steps

- [ ] Create PostgreSQL database (Supabase/Neon)
- [ ] Generate OAuth credentials (GitHub/Google)
- [ ] Create Vercel account and link GitHub repo
- [ ] Set all environment variables in Vercel
- [ ] Deploy and test
- [ ] Update OAuth provider callback URLs
- [ ] Seed production data (optional)

---

## Support & Resources

- [Vercel Deployment Guide](https://vercel.com/docs)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [NextAuth.js Guide](https://next-auth.js.org)
- [Supabase PostgreSQL](https://supabase.com/docs/guides/database)
- [Neon PostgreSQL](https://neon.tech/docs)

