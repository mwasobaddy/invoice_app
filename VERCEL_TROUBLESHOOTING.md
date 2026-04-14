# Vercel Deployment Troubleshooting Guide

## Common Issues & Solutions

---

## 🔴 Database Connection Errors

### Error: "DATABASE_URL is not set"

**Cause**: Environment variable not configured in Vercel

**Solution**:
1. In Vercel dashboard, go to Settings → Environment Variables
2. Verify `DATABASE_URL` is listed
3. Restart deployment: Deployments → click latest → "Redeploy"

```bash
# Verify locally
vercel env pull
echo $DATABASE_URL
```

---

### Error: "Connection Pooling Error" or "Too many connections"

**Cause**: Database connection limit exceeded (common with Neon/Supabase free tier)

**Solution**:

**For Supabase:**
1. Go to project settings
2. Database → Connection Pooling → Mode: Transaction
3. Set pool size to 10-20
4. Redeploy your app

**For Neon:**
1. Go to project → Branch/Database → Pooler
2. Enable connection pooler
3. Mode: Transaction or Session
4. Use pooler connection string in DATABASE_URL

---

### Error: "PrismaClientInitializationError"

**Cause**: Invalid DATABASE_URL format or missing adapter

**Solution**:
1. Verify DATABASE_URL format:
   - Supabase: `postgresql://postgres:pass@db.xyz.supabase.co:6543/postgres?schema=public`
   - Neon: `postgresql://user:pass@ep-xyz.neon.tech/db?schema=public`
2. Check for special characters in password (URL encode if needed)
3. Verify schema exists in database

```bash
# Test connection
npx prisma db execute --stdin < /dev/null
```

---

### Error: "FATAL: password authentication failed"

**Cause**: Incorrect credentials in CONNECTION_URL

**Solution**:
1. Go back to your database provider (Supabase/Neon)
2. Copy connection string again carefully
3. Check for spaces or typos
4. If password has special chars, URL must be encoded
5. Update DATABASE_URL in Vercel

---

## 🔴 Authentication Issues

### Error: "Invalid OAuth callback"

**Cause**: Redirect URI mismatch between Vercel URL and OAuth provider settings

**Solution**:

**GitHub:**
1. Go to GitHub → Settings → Developer Settings → OAuth Apps
2. Edit your OAuth App
3. Authorization callback URL: `https://[your-vercel-url].vercel.app/api/auth/callback/github`
4. Click Update

**Google:**
1. Go to Google Cloud Console → Credentials
2. Select your OAuth 2.0 Client ID
3. Authorized redirect URIs:
   - `https://[your-vercel-url].vercel.app/api/auth/callback/google`
4. Click Save

**Check your Vercel URL:**
```bash
vercel ls
# or in dashboard: Deployments tab
```

---

### Error: "NEXTAUTH_SECRET not set" or "401 Unauthorized"

**Cause**: Missing or incorrect NEXTAUTH_SECRET environment variable

**Solution**:
1. Generate secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Add to Vercel Environment Variables: `NEXTAUTH_SECRET=<generated-value>`
3. Redeploy
4. Clear browser cookies and reload

---

### Error: "Session Invalid" / Can't log in

**Cause**: NEXTAUTH_URL doesn't match deployment URL

**Solution**:
1. Get your Vercel URL from dashboard
2. Set NEXTAUTH_URL: `https://[your-vercel-url].vercel.app`
3. No trailing slash!
4. Redeploy
5. Clear cookies: Settings → Privacy → Clear browsing data

---

## 🔴 Build & Deployment Issues

### Error: "Build Failed" (Check logs)

**Cause**: Various - check build logs

**Solution**:
1. In Vercel, click Deployments
2. Click failed deployment
3. Go to Build tab and read errors
4. Common causes:
   - TypeScript errors: Run locally `npm run build`
   - Missing env vars: Check Environment Variables
   - Prisma generation: Run `npx prisma generate`

```bash
# Test build locally
npm run build

# Generate Prisma client
npx prisma generate
```

---

### Error: "Module not found" or "Cannot find module"

**Cause**: Dependency not installed or incorrect import path

**Solution**:
1. List dependencies:
   ```bash
   npm ls
   ```
2. Missing recharts?
   ```bash
   npm install recharts
   ```
3. Missing Prisma?
   ```bash
   npm install @prisma/client prisma
   ```
4. Commit and push to GitHub
5. Vercel will auto-redeploy

---

### Error: "502 Bad Gateway" on live site

**Cause**: Runtime error in API routes or missing env vars

**Solution**:
1. Check runtime logs:
   ```bash
   vercel logs [project-name]
   ```
2. Common causes:
   - DATABASE_URL missing
   - Prisma client not initialized
   - Auth provider misconfigured
3. Update env vars and redeploy

```bash
# Check current env vars
vercel env pull cat > .env.local
```

---

### Error: "Function exceeded max duration" (Timeouts)

**Cause**: API route taking too long (usually database queries)

**Solution**:
1. Check for N+1 query problems in Prisma queries
2. Use `select` to fetch only needed fields
3. Add database indexes for frequently queried columns
4. Move heavy computation to background job

Example optimization:
```typescript
// ❌ Slow: fetches all relations
const invoice = await prisma.invoice.findUnique({
  where: { id },
  include: { items: true, payments: true }
})

// ✅ Fast: fetches only needed fields
const invoice = await prisma.invoice.findUnique({
  where: { id },
  select: { id: true, amount: true, status: true }
})
```

---

## 🟠 Data & Database Issues

### Database Shows Empty After Deploy

**Cause**: Schema not pushed to production database

**Solution**:
1. Ensure DATABASE_URL is set in Vercel
2. Run from local machine:
   ```bash
   vercel env pull
   npx prisma db push
   ```
3. Or use Vercel CLI:
   ```bash
   vercel run "npx prisma db push"
   ```

---

### Data Doesn't Persist

**Cause**: Wrong database URL or new database created each deploy

**Solution**:
1. Verify DATABASE_URL points to same database:
   ```bash
   vercel env pull cat > .env.local
   npx prisma migrate status
   ```
2. Check that Supabase/Neon project is production
3. Never create new database each deploy

---

### Seed Script Doesn't Run

**Cause**: Seeder only runs locally, not in Vercel

**Solution**:
If you want seeded data in production:
```bash
# Pull prod env vars
vercel env pull

# Run seed against prod database
npx prisma db seed
```

Or use Vercel KV for scheduled seeding (advanced).

---

## 🟠 Performance Issues

### Chart Not Loading / Slow Dashboard

**Cause**: Too many API calls or unoptimized queries

**Solution**:
1. Check Network tab in DevTools
2. Look for multiple identical requests
3. Optimize Prisma queries with `select`
4. Add caching to API routes:
   ```typescript
   response.setHeader('Cache-Control', 'public, s-maxage=60')
   ```

---

### High Serverless Function Duration

**Cause**: Inefficient database queries

**Solution**:
1. Check query logs:
   ```bash
   npx prisma studio
   ```
2. Look for missing indexes
3. Use `select` instead of full `include`
4. Batch queries when possible

---

## 🟡 OAuth Provider Issues

### GitHub OAuth: "Invalid client ID"

**Cause**: Wrong credentials or app deleted

**Solution**:
1. Go to GitHub → Settings → Developer Settings → OAuth Apps
2. Verify your app exists
3. Copy Client ID and Secret again
4. Update in Vercel Environment Variables
5. Clear browser cookies

---

### Google OAuth: "redirect_uri_mismatch"

**Cause**: Authorized URI doesn't match request

**Solution**:
1. Get exact Vercel URL
2. Add to Google Cloud Console:
   - `https://yourdomain.vercel.app/api/auth/callback/google`
   - Must match EXACTLY (no trailing slash, correct case)
3. Save changes
4. Wait 10 seconds
5. Refresh browser and retry

---

### OAuth Provider Shows: "Application not configured"

**Cause**: Generic error - usually wrong credentials

**Solution**:
1. Verify credentials in Vercel env vars
2. Check spelling (AUTH_GITHUB_ID vs GITHUB_ID, etc.)
3. Copy/paste directly from provider (no typos)
4. Restart deployment: Deployments → Redeploy

---

## 🟢 Debugging Checklist

Before contacting support, verify:

- [ ] DATABASE_URL is set and correct format
- [ ] NEXTAUTH_SECRET is generated and set
- [ ] NEXTAUTH_URL matches your Vercel URL
- [ ] OAuth callback URLs match exactly in provider settings
- [ ] `npm run build` works locally
- [ ] `.env.local` is in `.gitignore`
- [ ] All dependencies installed: `npm install`
- [ ] Prisma client generated: `npx prisma generate`
- [ ] Database schema pushed: `npx prisma db push`

---

## 🔗 Quick Commands

```bash
# Pull environment variables from Vercel
vercel env pull

# Check build locally (before pushing)
npm run build

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# View database in GUI
npx prisma studio

# Run seed script (local only)
npx prisma db seed

# Check Vercel deployment status
vercel ls

# View live logs
vercel logs [project-name]

# Trigger redeploy
vercel redeploy
```

---

## 📞 Support Resources

- **Vercel Support**: https://vercel.com/support
- **Prisma Issues**: https://github.com/prisma/prisma/issues
- **NextAuth Issues**: https://github.com/nextauthjs/next-auth/discussions
- **Supabase Docs**: https://supabase.com/docs
- **Neon Docs**: https://neon.tech/docs

---

## Still Having Issues?

1. **Collect information**:
   ```bash
   node --version
   npm --version
   npx prisma --version
   ```

2. **Check exact error message** in Vercel logs or browser console

3. **Provide when asking for help**:
   - Error message (full text)
   - Vercel deployment URL
   - Steps you took
   - Output of `npm run build` locally

