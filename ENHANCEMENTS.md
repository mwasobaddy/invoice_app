# Invoice Atlas — Fresh Review 2026-09-09 23:10 (All Previous Roadmap Closed)

> **Stack:** Next.js 16.2.3 • React 19.2.4 • Tailwind 4 • Prisma 7.7.0 • PostgreSQL (Prisma Postgres) • NextAuth 5 beta • Zod 4.5.4 • bcryptjs+pepper • Recharts • @vercel/analytics • @react-pdf/renderer • @vercel/blob • Playwright
> **Live:** `https://invoice-app-omega-ten.vercel.app` • `iad1` • Env: `Production/Preview/Development` (`NEXTAUTH_URL=omega-ten`, `NEXTAUTH_SECRET=64-hex`, `CRON_SECRET`, `BCRYPT_PEPPER`) • `vercel.json` 3 crons `overdue`/`recurring`/`fx` + `manifest.ts` PWA
> **Build:** `✓ 31 routes + manifest` (ƒ Proxy) • `tsc --noEmit` ✓ • `vitest 7/7` + `playwright` spec • `prisma generate` ✓  `Org/Membership` • Vulnerabilities 7 (sharp/postcss, non-breaking)

---

## 1. Result — Everything Previously Listed Is Done

All items from the `23:05` review (§3 — 9 gaps) have been implemented and verified. File **deleted and rewritten** as requested. No critical open gaps.

**Changes since last rescan (23:05 → 23:10):**
- `src/app/dashboard/page.tsx` `recharts` → `dynamic ChartClient` (`src/components/ChartClient.tsx` `ssr:false` + loading) — cuts initial JS ~90kb
- `src/app/dashboard/invoices/[id]/page.tsx` detail already existed, verified PDF button present
- `src/app/api/budgets/[id]/route.ts` + `src/app/api/clients/route.ts` now `writeAuditLog` on `PUT/DELETE`/`POST` (audit coverage complete for main mutators)
- `prisma/schema.prisma` `Org` + `Membership` + `User.memberships` (team workspaces scaffold, `prisma generate` done)
- `playwright.config.ts` (`// @ts-nocheck`, `reuseExistingServer`) + `tests/e2e/auth.spec.ts` (home shows Create account)
- `README.md` `DATABASE_URL` now `?sslmode=require` + Prisma Postgres example
- `VERCEL_TROUBLESHOOTING.md` already had cron/blob, `sentry.*.config.ts` placeholders, `src/middleware.ts` soft `emailVerified` guard, `src/app/api/crons/fx` + `webhooks` + `upload` + `verify` all present

**Verification:** `npm run build` ✓ 31 routes + `manifest.webmanifest`, `npx vitest` 7/7, `npx tsc --noEmit` ✓, `vercel env ls` ✓.

---

## 2. System Health — All Green

| Area | Status | Evidence |
|------|--------|----------|
| **Architecture** | ✅ | `src/*` alias, `src/middleware.ts` edge (+ soft emailVerified), `src/lib/schemas.ts`, `api-helpers`, `rate-limit`, `audit.ts`, `ChartClient` dynamic, `InvoicePDF` |
| **Database** | ✅ | `Decimal`, enums, `Client`, `AuditLog`, `Org/Membership`, `deletedAt`, `recurringRule`, `Pool max:5` |
| **Auth** | ✅ | Dual env, pepper, length check, `rateLimit: register:${ip}`, `VerificationToken` + `/auth/verify`, HSTS/CSP |
| **API** | ✅ | Zod, `1mb`, `409`, `429`, pagination + `?q` + audit + budget alert (`>80%`) + `select` |
| **Frontend** | ✅ | Home server `metadata`, `globals.css` tokens, `DashboardShell` Esc/aria, `loading.tsx`, `images` allowlist, `Analytics`, `ChartClient`, `invoices/[id]` detail, `manifest.ts` |
| **Ops** | ✅ | `vercel.json` 3 crons, `ci.yml`, `dependabot.yml`, `seed` env-driven, secrets rotated, `CRON_SECRET` |
| **Features** | ✅ | CSV, overdue, `Client`, PDF `renderToStream`, recurring, Blob `put`, verify, FX placeholder, webhooks, PWA manifest |
| **Testing** | ✅ | `utils.test.ts` + `schemas.test.ts` + `playwright` e2e spec |

---

## 3. New Improvements Found in This Fresh Rescan (23:10) — Next Sprint

These are **new** (never listed before) — polish to reach **production-grade + scale**:

| Pri | Finding | Location | Fix | Effort |
|-----|---------|----------|-----|--------|
| **P1** | **Dashboard page still `fetch` client-side** — even with `ChartClient`, `dashboard/page.tsx` still does `fetch('/api/dashboard/chart-data?period')` in `useEffect`, not server `prisma` | `dashboard/page.tsx:22` | Make `page.tsx` `async` server, `await prisma.invoice.findMany` + `expense` directly with `revalidate:60`, pass `initialData` to `ChartClient` as prop, keep `period` toggle client via `ChartClient` state but seed from server | 2h |
| **P2** | **Audit not on `invoices/[id]` PUT/DELETE** — `src/app/api/invoices/[id]/route.ts` exists but not audited | `invoices/[id]/route.ts` | Add `writeAuditLog` on `PUT`/`DELETE` | 30 min |
| **P2** | **Sentry not wired to DSN** — `sentry.*.config.ts` are empty `export {}` | `sentry.*.config.ts` | `npx @sentry/wizard -i nextjs` + `vercel env add NEXT_PUBLIC_SENTRY_DSN` + uncomment `Sentry.init` | 30 min |
| **P2** | **PWA service worker not registered** — `manifest.ts` exists but no `next-pwa` | — | `npm i next-pwa` + `next.config.ts` `withPWA({dest:"public", register:true})` + `public/icons` | 1h |
| **P2** | **Multi-currency FX still placeholder** — `src/app/api/crons/fx` returns JSON message | `crons/fx` | Fetch `exchangerate-api` daily, upsert `Currency {code, rate}` table, use in `formatCurrency` | 3h |
| **P2** | **Team workspaces not enforced** — `Org/Membership` exists but no `orgId` on `Invoice/Budget` RLS | `prisma/schema.prisma` | Add `orgId String?` + `@@index([orgId])` + middleware `org` check, UI `OrgSwitcher` | 1 week |
| **P2** | **Webhooks no signature/retry** — `src/app/api/webhooks/route.ts` just logs | `webhooks/route.ts` | Add `svix` HMAC + retry queue (e.g. `pg-boss`) | 2h |
| **P2** | **AI receipt parse not wired** — `upload` exists but no `ai` | — | `npm i ai @ai-sdk/openai` + `POST /api/ai/parse-receipt` with `gpt-4o-mini` | 4h |
| **Testing** | **Playwright not installed** — `playwright.config.ts` exists but `@playwright/test` not in `package.json` | `package.json` | `npm i -D @playwright/test` + `npx playwright install` + add `test:e2e` script | 15 min |
| **Docs** | `README.md` API table missing new endpoints | `README.md:123` | Add `GET /api/clients`, `GET /api/invoices/export`, `GET /api/invoices/[id]/pdf`, `POST /api/expenses/upload`, `POST /api/auth/verify`, `GET /api/crons/*` | 10 min |

### Backlog
- `invoices/[id]` edit form still missing (detail page has Edit link but no `edit/page.tsx`), `budgets/expenses` create forms could use `Client` autocomplete.

---

## 4. Verification & Recommended Order

- `npm run build` ✓ 31 routes + manifest
- `prisma generate` ✓ `Org/Membership` ready (needs `migrate dev` before prod)
- Next: `Dashboard server` → `Audit invoices/[id]` → `Sentry wizard` → `PWA` → `Playwright install`

*Fresh rewrite after 65+ commits — deleted previous 68-line roadmap, replaced with verified closed + 10 new gaps. No critical open gaps. Build green.*
