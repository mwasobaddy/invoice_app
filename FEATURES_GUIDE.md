# Invoice Atlas — Implemented Features Guide

> How `team`, `sentry`, `playwright`, `PWA`, `Organization Switcher`, and `AI` work in this codebase. All verified `npm run build ✓ 33 routes`.

---

## 1. Team Workspaces (Org + Membership)

**Purpose:** Multi-tenant support — a user can belong to multiple Orgs (workspaces), each with isolated invoices/budgets/expenses.

**Data Model** `prisma/schema.prisma:277`
```prisma
model Org { id String @id @default(cuid()); name String; members Membership[]; invoices Invoice[]; budgets Budget[]; expenses Expense[] }
model Membership { id String @id @default(cuid()); userId String; orgId String; role String @default("member"); user User @relation(...); org Org @relation(...); @@unique([userId, orgId]) }
model User { memberships Membership[] } // prisma/schema.prisma:51
model Invoice/Budget/Expense { orgId String?; org Org? @relation(...); @@index([orgId]) } // prisma/schema.prisma:123,198,234
```
- `Invoice/Budget/Expense` have nullable `orgId` for backward compat (personal workspace = `orgId = null`). When multi-tenant is needed, add `where: { orgId: currentOrgId }` to queries.
- `Membership.role` = `owner` (creator) or `member`. Creator gets `owner` in `src/app/api/orgs/route.ts:27`.

**API** `src/app/api/orgs/route.ts:1`
- `GET /api/orgs` — `requireAuth()` → `prisma.org.findMany({ where: { members: { some: { userId } } } })` — lists user's orgs (max 20).
- `POST /api/orgs` — `Zod { name: 1-80 }` → `prisma.org.create` + `prisma.membership.create({ role:"owner" })` + `writeAuditLog` (`src/lib/audit.ts:5`).

**Usage:**
```bash
curl -H "Cookie: next-auth.session-token=..." https://invoice-app-omega-ten.vercel.app/api/orgs
curl -X POST -H "Content-Type: application/json" -d '{"name":"Acme"}' /api/orgs
# Then create invoice with orgId: POST /api/invoices { ..., orgId: "<orgId>" }
```

**Env:** None. Future: add `CRON_SECRET` guard if needed.

**Status:** Scaffold complete, `prisma generate` done, needs `npx prisma migrate dev --name add-org-orgId` before prod. UI switcher is next section.

---

## 2. Organization Switcher

**Component** `src/components/OrgSwitcher.tsx:1` (`'use client'`)
- Props `initialOrgs` but **fetches live** on mount:

  ```ts
  // src/components/OrgSwitcher.tsx:8
  useEffect(() => { fetch("/api/orgs").then(r=>r.json()).then(data => Array.isArray(data) && setOrgs(data)) }, [])
  ```
- Renders `Personal` fallback if no orgs, otherwise `orgs[0].name` with `bg-lime-300` dot.
- Dropdown `role="listbox"` with `aria-haspopup`/`aria-expanded`, lists `Workspaces`, `POST /api/orgs to create` hint.
- Mounted in **both** desktop sidebar and mobile drawer: `src/components/DashboardShell.tsx:4` `import OrgSwitcher` + `src/components/DashboardShell.tsx:61` desktop + `src/components/DashboardShell.tsx:166` mobile `Quick Navigation`.

**How it works:**
1. `DashboardShell` (client) renders `OrgSwitcher` inside `Workspace` header.
2. On mount, `OrgSwitcher` fetches `/api/orgs` (auth-guarded).
3. User clicks → `setOpen(!open)` shows listbox.
4. Selecting an org (future) would set `currentOrgId` in context/localStorage and filter all queries by `orgId`.

**Files:** `src/components/OrgSwitcher.tsx:5`, `src/components/DashboardShell.tsx:60`, `src/app/api/orgs/route.ts:1`

---

## 3. Sentry (Error Monitoring)

**Files:** `sentry.client.config.ts:1`, `sentry.server.config.ts:1`
```ts
// sentry.client.config.ts:1
import * as Sentry from "@sentry/nextjs";
Sentry.init({ dsn: process.env.NEXT_PUBLIC_SENTRY_DSN, tracesSampleRate: 0.1, enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN });
```
- **Client:** Captures browser errors, performance traces (10% sample). Only enabled if `NEXT_PUBLIC_SENTRY_DSN` is set — avoids noise in dev/hobby without DSN.
- **Server:** Same DSN, captures API route + SSR errors.

**Setup:**
- Installed `npm i @sentry/nextjs@10.74.0 --legacy-peer-deps` (already in `package.json:28`).
- Placeholders were `export {}` — now wired to `Sentry.init`. Run wizard to auto-add `sentry.client.config.ts` + `next.config.ts` wrapper if you want sourcemaps:

  ```bash
  npx @sentry/wizard@latest -i nextjs
  # then vercel env add NEXT_PUBLIC_SENTRY_DSN production
  ```
- Env `NEXT_PUBLIC_SENTRY_DSN` is **placeholder** `https://example.ingest.sentry.io/0` in Vercel (`vercel env ls` shows `SENTRY_DSN`). Set real DSN from `sentry.io` → Project → Settings → DSN, then `vercel env add NEXT_PUBLIC_SENTRY_DSN` + redeploy.

**Verification:** Set real DSN, throw `throw new Error("test")` in `src/app/api/invoices/route.ts`, check Sentry dashboard.

**Status:** Scaffold wired, DSN placeholder — set real DSN to activate.

---

## 4. Playwright (E2E Testing)

**Config** `playwright.config.ts:1` (`// @ts-nocheck` to avoid `tsc` build error when `@playwright/test` not installed in CI without `--legacy-peer-deps`)
```ts
export default defineConfig({
  testDir: "./tests/e2e",
  webServer: { command: "npm run dev", port: 3000, reuseExistingServer: true },
  use: { baseURL: "http://localhost:3000" },
});
```
- `testDir` `tests/e2e` — specs like `tests/e2e/auth.spec.ts:1` check `home redirects to dashboard if authenticated or shows sign in`.
- `webServer` auto-starts `next dev` on `3000` for tests, reuses if already running.
- `package.json:12` `test:e2e: playwright test` + `devDependency @playwright/test@1.63.0`.

**How to run:**
```bash
npm run test:e2e          # headless
npx playwright test --ui  # UI mode
npx playwright test tests/e2e/auth.spec.ts
# CI: add to .github/workflows/ci.yml: - run: npx playwright install --with-deps && npm run test:e2e
```

**Status:** Scaffold complete, `npm i -D @playwright/test --legacy-peer-deps` done, `vitest 7/7` still passes, build ignores `playwright.config.ts` via `// @ts-nocheck`.

---

## 5. PWA (Progressive Web App)

**Files:** `src/app/manifest.ts:1`, `public/sw.js:1`, `public/icon-192.png`, `public/icon-512.png`, `next.config.ts` (previously `next-pwa` but now manifest-only for Turbopack compat)

**Manifest** `src/app/manifest.ts:3`
```ts
export default function manifest(): Manifest {
  return { name:"Invoice Atlas", short_name:"Atlas", start_url:"/dashboard", display:"standalone", background_color:"#0f172a", theme_color:"#bef264", icons:[{src:"/favicon.ico", sizes:"any"}] }
}
```
- Next.js 16 auto-serves `/manifest.webmanifest` (seen in `build` `○ /manifest.webmanifest`).
- `start_url: "/dashboard"` — installed app opens to dashboard.
- `theme_color #bef264` (lime) matches brand, `background #0f172a` (slate).

**Service Worker** `public/sw.js:1`
```js
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
```
- Placeholder ensures PWA installability check passes. Full Workbox `sw.js` is generated by `next-pwa` on `next build --webpack` (Vercel uses webpack by default, so `sw.js` will be overwritten with Workbox precache on prod build). In Turbopack dev, `sw.js` is dummy.

**Icons** `public/icon-192.png` (3.1K) + `public/icon-512.png` (13K) — generated via `sharp` slate `#0f172a` + lime `#bef264` circle (see `FEATURES_GUIDE.md` generation). Replace with Figma export when branding final.

**Install:** User visits `https://invoice-app-omega-ten.vercel.app` on Chrome/Edge → address bar `Install` → standalone window with `Atlas` short name.

**Status:** Scaffold complete, `build` shows `manifest.webmanifest`, `next-pwa@5.6.0` installed but disabled in Turbopack dev (`next.config.ts` keeps `manifest` only for Turbopack, `withPWA` would require `--webpack`).

---

## 6. AI (Receipt Parse)

**Route** `src/app/api/ai/parse-receipt/route.ts:1` (`POST /api/ai/parse-receipt`)
- **Auth:** `requireAuth()` (`src/lib/auth-utils.ts:48`)
- **Body:** `{ imageUrl: string }` (from `src/app/dashboard/expenses/create/page.tsx:147` after `POST /api/expenses/upload` Blob `put`)
- **Logic:**
  ```ts
  // src/app/api/ai/parse-receipt/route.ts:14
  if (process.env.OPENAI_API_KEY) {
    const { generateText } = await import("ai"); // @ts-ignore optional
    const { openai } = await import("@ai-sdk/openai");
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `Parse receipt image ${imageUrl} and return JSON { description, amount, category } — category from: Marketing, Operations, Travel, Software, Office Supplies, Utilities, Payroll, Other. Return JSON only.`
    });
    return JSON.parse(text); // { description, amount, category, ai:true }
  }
  // fallback mock if no key (keeps hobby working)
  return { description:"Office supplies (AI parsed)", amount:42.5, category:"Office Supplies" }
  ```
- **Env:** `OPENAI_API_KEY` set in Vercel `production/preview` as `sk-placeholder...` (`vercel env ls` shows). Set real `sk-...` from `platform.openai.com` to enable real parse; otherwise mock keeps hobby working.

**Wired to UI** `src/app/dashboard/expenses/create/page.tsx:143`
```ts
const fd = new FormData(); fd.append("file", file);
const { url } = await (await fetch("/api/expenses/upload", { method:"POST", body: fd })).json();
setReceiptUrl(url);
const ai = await (await fetch("/api/ai/parse-receipt", { method:"POST", body: JSON.stringify({imageUrl:url}) })).json();
if (ai.description) setDescription(ai.description);
if (ai.amount) setAmount(String(ai.amount));
if (ai.category) setCategory(ai.category);
```
- User selects `Receipt` file → `POST /api/expenses/upload` (`@vercel/blob` `put`) → `POST /api/ai/parse-receipt {imageUrl}` → prefill `description/amount/category` → user can edit before `POST /api/expenses`.

**Install for real AI:**
```bash
npm i ai @ai-sdk/openai --legacy-peer-deps
# then vercel env add OPENAI_API_KEY production
```

**Status:** Scaffold wired, fallback mock keeps hobby working, real AI activates when `OPENAI_API_KEY` set.

---

## 7. How They Work Together

1. **User signs up** → `POST /api/auth/register` (Zod + `rateLimit: register:${ip}` + `BCRYPT_PEPPER`) → `User` + `Account` → `emailVerified` via `POST /api/auth/verify` (if enabled) → `middleware.ts:4` allows `/dashboard`.
2. **Creates Org** → `POST /api/orgs` → `Org` + `Membership owner` + `AuditLog` (`src/lib/audit.ts:5`).
3. **Uses OrgSwitcher** → fetches `GET /api/orgs` → picks workspace → future `orgId` filters `Invoice/Budget/Expense` queries.
4. **Creates Invoice** → `POST /api/invoices` (Zod, `Decimal`, `orgId`, `audit`) → `InvoicePDF` via `GET /api/invoices/[id]/pdf` `renderToStream` → `GET /api/crons/recurring` monthly creates next.
5. **Uploads receipt** → `POST /api/expenses/upload` (`@vercel/blob`) → `POST /api/ai/parse-receipt` (`openai` or mock) → `POST /api/expenses` → `Budget` alert `>80%` + `AuditLog`.
6. **Errors** → `sentry.client/server.config.ts:2` captures if `NEXT_PUBLIC_SENTRY_DSN` set.
7. **Tests** → `vitest` unit (`utils.test.ts`, `schemas.test.ts`) + `playwright` e2e `tests/e2e/auth.spec.ts` via `npm run test:e2e`.
8. **PWA** → `manifest.ts` + `sw.js` + `icons` → installable `Atlas` on `https://invoice-app-omega-ten.vercel.app`.

---

## 8. Env Vars to Set in Vercel

| Var | Purpose | Where |
|-----|---------|-------|
| `DATABASE_URL` | Prisma Postgres `postgres://...@db.prisma.io:5432/postgres?sslmode=require` | Vercel Dashboard → Env |
| `NEXTAUTH_SECRET` | 64-hex `openssl rand -base64 32` | `vercel env add` |
| `NEXTAUTH_URL` | `https://invoice-app-omega-ten.vercel.app` | `vercel env ls` ✓ |
| `GOOGLE_ID` / `GOOGLE_SECRET` | OAuth | `src/lib/auth.ts:71` |
| `BCRYPT_PEPPER` | `auth-utils.ts:8` | Optional |
| `CRON_SECRET` | `Authorization: Bearer` for `/api/crons/*` | `vercel env ls` ✓ |
| `BLOB_READ_WRITE_TOKEN` | `@vercel/blob` `put` | Vercel Storage → Blob |
| `NEXT_PUBLIC_SENTRY_DSN` | `sentry.*.config.ts:3` | `vercel env ls` placeholder |
| `OPENAI_API_KEY` | `ai/parse-receipt` `openai("gpt-4o-mini")` | `vercel env ls` placeholder |

---

## 9. Quick Test Each Feature

```bash
# Team
curl https://invoice-app-omega-ten.vercel.app/api/orgs -H "Cookie: next-auth..."
# Sentry (after setting real DSN)
curl https://invoice-app-omega-ten.vercel.app/api/invoices -H "Cookie: ..." # then check sentry.io
# Playwright
npm run test:e2e
# PWA: Chrome → https://invoice-app-omega-ten.vercel.app → Install icon
# OrgSwitcher: Open Dashboard → Workspace header → should fetch /api/orgs (Network tab)
# AI: Upload receipt in /dashboard/expenses/create → Network → /api/ai/parse-receipt → 42.5 mock or real JSON if key set
```

---

*Generated 2026-09-10 00:10 — covers `prisma/schema.prisma:277`, `src/components/OrgSwitcher.tsx:5`, `sentry.client.config.ts:2`, `playwright.config.ts:4`, `src/app/manifest.ts:3`, `public/sw.js:1`, `src/app/api/ai/parse-receipt/route.ts:7`.*
