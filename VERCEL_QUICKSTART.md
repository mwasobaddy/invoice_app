# Quick Start: Deploy to Vercel in 10 Minutes

This is a streamlined version of the deployment process. For detailed information, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md).

## What You Need (5 minutes)

1. **PostgreSQL Database URL** (one of these):
   - ✅ [Supabase](https://supabase.com) (recommended, free tier available)
   - ✅ [Neon](https://neon.tech) (also free)

2. **OAuth Credentials** (optional but recommended):
   - ✅ [GitHub OAuth App](https://github.com/settings/developers)
   - ✅ [Google OAuth 2.0 Credentials](https://console.cloud.google.com)

3. **Accounts:**
   - ✅ [Vercel Account](https://vercel.com) (free, sign in with GitHub)
   - ✅ GitHub (already have this - repo is already there!)

---

## Deploy Steps (5 minutes)

### Step 1: Get Your Database URL (1 min)

**Using Supabase:**
```
1. Go to supabase.com → Create account
2. New project → Wait ~2 min for creation
3. Settings → Database → Connection Pooling
4. Copy the connection string (mode=transaction)
```

**Using Neon:**
```
1. Go to neon.tech → Create account
2. New project → Copy connection string from dashboard
```

### Step 2: Create Vercel Project (1 min)

```
1. Go to vercel.com
2. Sign in with GitHub
3. Click "Add New" → "Project"
4. Import: mwasobaddy/invoice_app
5. Click "Import"
```

### Step 3: Set Environment Variables (2 mins)

In Vercel dashboard → Settings → Environment Variables → Add these:

```
DATABASE_URL = [paste from Supabase/Neon]

NEXTAUTH_SECRET = [Generate with:]
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

NEXTAUTH_URL = https://[your-vercel-url].vercel.app
```

**Optional - Add OAuth (for GitHub/Google sign-in):**
```
AUTH_GITHUB_ID = [from GitHub settings]
AUTH_GITHUB_SECRET = [from GitHub settings]

AUTH_GOOGLE_ID = [from Google Cloud Console]
AUTH_GOOGLE_SECRET = [from Google Cloud Console]
```

### Step 4: Deploy (1 min)

```
1. In Vercel, click "Deploy"
2. Wait for green "Ready" status (usually 2-3 min)
3. Click "Visit" or open the provided URL
```

### Step 5: Initialize Database (Immediate)

Once deployment shows "Ready":

**Option A: Using Vercel CLI (recommended)**
```bash
npm i -g vercel
vercel link
vercel env pull
npx prisma db push
```

**Option B: Quick one-liner**
```bash
DATABASE_URL="[your-postgres-url]" npx prisma db push
```

---

## Test Your App (2 minutes)

Visit your live URL and test:

- [ ] **Sign Up**: Create account with email/password
- [ ] **Sign In**: Log back in
- [ ] **Create Invoice**: Go to Dashboard → New Invoice → Save
- [ ] **Dashboard**: Check if chart displays
- [ ] **Edit/Delete**: Try editing an invoice

✅ **All working?** You're deployed! 🎉

---

## If Something Goes Wrong

### "Database Error" or "500 Error"
```bash
# Check environment variables
vercel env pull

# Verify DATABASE_URL is set correctly
echo $DATABASE_URL

# Try pushing schema again
npx prisma db push
```

### "OAuth Redirect Error"
Make sure your OAuth provider callback URLs match EXACTLY:
- GitHub: `https://[your-vercel-url].vercel.app/api/auth/callback/github`
- Google: `https://[your-vercel-url].vercel.app/api/auth/callback/google`

### Build Fails
```bash
# Test build locally first
npm run build

# Check Vercel logs
vercel logs [your-project-name]
```

---

## Next Steps

1. ✅ **Share your app**: Send the Vercel URL to others
2. 📊 **Add real data**: Use your app to create invoices
3. 🌐 **Add custom domain** (optional): In Vercel → Settings → Domains
4. 📈 **Monitor**: Check Vercel Analytics dashboard

---

## Full Documentation

- [Complete Deployment Guide →](./VERCEL_DEPLOYMENT.md)
- [Deployment Checklist →](./VERCEL_CHECKLIST.md)
- [Environment Variables Template →](./.env.example)

---

## Support

- **Vercel Issues?** → Check [Vercel Docs](https://vercel.com/docs)
- **Database Issues?** → Check [Prisma Docs](https://www.prisma.io/docs/guides/deployment)
- **Auth Issues?** → Check [NextAuth Docs](https://next-auth.js.org)

Good luck! 🚀
