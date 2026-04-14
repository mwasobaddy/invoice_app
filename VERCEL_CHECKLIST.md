# Vercel Deployment Checklist

Quick reference for deploying to Vercel. Check off each item as you complete it.

## Pre-Deployment (Local Setup)

- [ ] Push all changes to GitHub: `git push origin main`
- [ ] Verify GitHub repo is public and accessible
- [ ] Test local build: `npm run build`
- [ ] Confirm `.next` and `node_modules` are in `.gitignore`

## Database Setup

### Supabase
- [ ] Create Supabase account at supabase.com
- [ ] Create new project
- [ ] Enable connection pooling
- [ ] Copy connection string (with transaction mode)
- [ ] Note: DATABASE_URL will be added to Vercel env vars

### OR Neon
- [ ] Create Neon account at neon.tech
- [ ] Create database project
- [ ] Copy connection string
- [ ] Note: DATABASE_URL will be added to Vercel env vars

## OAuth Providers

### GitHub OAuth
- [ ] Go to GitHub Settings → Developer Settings → OAuth Apps
- [ ] Create New OAuth App
- [ ] Set callback: `https://yourdomain.vercel.app/api/auth/callback/github`
- [ ] Copy Client ID and Client Secret
- [ ] Note: AUTH_GITHUB_ID and AUTH_GITHUB_SECRET for Vercel

### Google OAuth
- [ ] Go to Google Cloud Console
- [ ] Create new project (or use existing)
- [ ] Create OAuth 2.0 credentials (Web application)
- [ ] Add authorized redirect: `https://yourdomain.vercel.app/api/auth/callback/google`
- [ ] Copy Client ID and Client Secret
- [ ] Note: AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET for Vercel

## Vercel Setup

- [ ] Create Vercel account at vercel.com
- [ ] Connect GitHub account to Vercel
- [ ] Import `mwasobaddy/invoice_app` repository
- [ ] Select Next.js as framework (auto-detected)
- [ ] Click "Deploy"

## Environment Variables (Set in Vercel Dashboard)

- [ ] DATABASE_URL = `postgresql://...` (from Supabase/Neon)
- [ ] NEXTAUTH_URL = `https://yourdomain.vercel.app`
- [ ] NEXTAUTH_SECRET = `(run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")`
- [ ] AUTH_GITHUB_ID = `(GitHub Client ID)`
- [ ] AUTH_GITHUB_SECRET = `(GitHub Client Secret)`
- [ ] AUTH_GOOGLE_ID = `(Google Client ID)`
- [ ] AUTH_GOOGLE_SECRET = `(Google Client Secret)`

## Post-Deployment

- [ ] Wait for deployment to complete (green Ready status)
- [ ] Visit deployment URL in browser
- [ ] Initialize database: `npx prisma db push` (with DATABASE_URL exported)
- [ ] Test sign-up with email/password
- [ ] Test GitHub OAuth login
- [ ] Test Google OAuth login
- [ ] Create test invoice
- [ ] Verify chart displays on dashboard
- [ ] Update GitHub OAuth App callback URL with final domain
- [ ] Update Google OAuth redirect URI with final domain

## Optional: Seed Data

- [ ] Run: `vercel env pull`
- [ ] Run: `npx prisma db seed`
- [ ] Verify demo data appears in dashboard

## Monitoring (Ongoing)

- [ ] Check Vercel Analytics dashboard
- [ ] Monitor error logs: Deployments → Logs
- [ ] Set up Vercel alerts (email on failed deploys)
- [ ] Review Prisma Studio periodically for data health

## Troubleshooting

If deployment fails:
1. [ ] Check build logs in Vercel dashboard
2. [ ] Verify all environment variables are set
3. [ ] Ensure DATABASE_URL format is correct
4. [ ] Run `npm run build` locally to identify issues
5. [ ] Check that GitHub/Google OAuth credentials are valid
6. [ ] Verify callback URLs match exactly

## Custom Domain (Optional)

- [ ] Purchase domain from registrar
- [ ] In Vercel: Settings → Domains
- [ ] Add domain and follow DNS setup
- [ ] Update GitHub OAuth callback URL
- [ ] Update Google OAuth redirect URI
- [ ] Wait for DNS propagation (~24 hours)

## Completed! 🎉

Your app is now running on Vercel with:
- ✅ Next.js 16 deployment
- ✅ PostgreSQL database
- ✅ NextAuth v5 authentication
- ✅ GitHub & Google OAuth sign-in
- ✅ Recharts dashboard visualization
- ✅ Automatic HTTPS
- ✅ Serverless database pooling

