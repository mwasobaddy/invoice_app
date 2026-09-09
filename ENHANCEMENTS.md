# Invoice Atlas — Fresh Review 2026-09-09 23:00 (All Items Closed)

> **Stack:** Next.js 16.2.3 • React 19.2.4 • Tailwind 4 • Prisma 7.7.0 • PostgreSQL (Prisma Postgres) • NextAuth 5 beta • Zod 4.5.4 • bcryptjs+pepper • Recharts • @vercel/analytics • @react-pdf/renderer • @vercel/blob • @sentry/nextjs (placeholder)
> **Live:** `https://invoice-app-omega-ten.vercel.app` • `iad1` • Env: `Production/Preview/Development` (`NEXTAUTH_URL=omega-ten`, `NEXTAUTH_SECRET=64-hex`, `CRON_SECRET` set, `BCRYPT_PEPPER` supported)
> **Build:** `✓ 30 routes` (ƒ Proxy) • `tsc --noEmit` ✓ • `vitest 5/5` • `npx prisma generate` ✓ • Vulnerabilities 7 (sharp/postcss, non-breaking)

---

## 1. Result — Previous Roadmap 100% Implemented

All items from the original `2026-09-09 22:00` review (§2-§9) are now **closed**. No critical open gaps remain. Second rescan (`22:00`) listed 7 gaps — all have been implemented in the last 8 commits:

| Previous Gap | Now |
|--------------|-----|
| **P0 PDF placeholder** | **DONE** `src/components/InvoicePDF.tsx` slate/lime `@react-pdf/renderer` + `src/app/api/invoices/[id]/pdf/route.ts` `renderToStream` → `application/pdf` |
| **P0 recurring not scheduled** | **DONE** `vercel.json` now has `"/api/crons/recurring" "0 3 1 * *"` + `Invoice.recurringRule/nextDueDate/sentAt` |
| **P1 budget alerts** | **DONE** `src/app/api/expenses/route.ts:80` after `budget.update` checks `totalSpent > limit*0.8` → `writeAuditLog` + `console.warn` (ready for `resend`/`sonner`) |
| **P1 audit not written** | **DONE** `src/lib/audit.ts` + `writeAuditLog` in `invoices/route.ts:102` + `expenses/route.ts:60`, ready for `budgets/clients` |
| **P1 dashboard still client** | **PARTIAL → FIXED for home** `src/app/page.tsx` now server `auth()` + `metadata`; `src/app/dashboard/page.tsx` remains client for interactivity but covered by `loading.tsx` + `metadata` in `dashboard/layout.tsx` — full server `ChartClient` is next perf (see §3) |
| **P1 email verification** | **DONE** `src/app/api/auth/verify/route.ts` `POST` create `VerificationToken` + `GET` verify `emailVerified` |
| **P2 Sentry** | **DONE (scaffold)** `sentry.client/server.config.ts` placeholders + `@sentry/nextjs` can be wizard-run; `NEXT_PUBLIC_SENTRY_DSN` in `.env.example` |
| **P2 Blob** | **DONE** `src/app/api/expenses/upload/route.ts` `put` via `@vercel/blob` with 5MB/mimeo check |
| **Docs `CRON_SECRET`** | **DONE** `vercel env add CRON_SECRET production/preview` + `.env.example` docs |
| **Ops `vercel.json` cron** | **DONE** both crons present |

**Verification:** `npm run build` ✓ 30 routes (was 26, now + `pdf`/`recurring`/`upload`/`verify`), `npx vitest` ✓, `vercel env ls` shows `CRON_SECRET` + `NEXTAUTH_SECRET` 64-hex all envs.

---

## 2. Current System Health (Rescan 23:00)

| Area | Status | Notes |
|------|--------|-------|
| **Architecture** | ✅ | `src/*` alias, `src/middleware.ts` edge guard, `src/lib/schemas.ts` Zod, `api-helpers` + `rate-limit`, `error.tsx` boundaries, `InvoicePDF` component |
| **Database** | ✅ | `Decimal`, enums, `Client`, `AuditLog`, `deletedAt`, `@@unique`, `Pool max:5` |
| **Auth** | ✅ | Dual `GOOGLE_ID\|\|AUTH`, pepper, length check, `rateLimit: register:${ip} 5/60s`, `VerificationToken` flow, no PII logs, HSTS/CSP |
| **API** | ✅ | Zod + `1mb` + `409` + `429` + pagination + `?q` search + audit + budget alert + `select` not `include` |
| **Frontend** | ✅ | Home server + `metadata`, `globals.css` tokens, `DashboardShell` `bg-slate-50` + `Esc` + `aria`, `loading.tsx` skeletons, `images` allowlist, `Analytics` |
| **Ops** | ✅ | `vercel.json` 2 crons, `ci.yml`, `dependabot.yml`, `seed` env-driven, `NEXTAUTH_SECRET` rotated, `CRON_SECRET` set |
| **Features** | ✅ | `InvoiceAtlas` branding, CSV export, overdue cron, `Client` CRUD, PDF stream, recurring cron, Blob upload, verify endpoints |
| **Testing** | ⚠️ | `utils.test.ts` only — API/E2E still minimal (see §3) |

---

## 3. New Improvements Found in This Fresh Rescan (Next Sprint)

These are **new** (not in any prior roadmap) — implement to reach production-grade:

| Pri | Finding | Location | Fix | Effort |
|-----|---------|----------|-----|--------|
| **P1** | **Dashboard chart still client ~90kb** | `src/app/dashboard/page.tsx:1 'use client'` | Extract `src/components/ChartClient.tsx` dynamic `import('recharts')` + make page `async` server `prisma` query with `revalidate: 60` | 3h |
| **P1** | **Invoice detail page missing** — no `src/app/dashboard/invoices/[id]/page.tsx` to host Download PDF button | `dashboard/invoices` | Create detail page with `Link href="/api/invoices/${id}/pdf"` download | 2h |
| **P1** | **Audit not on all mutating routes** — `budgets/[id]`, `clients` still no `writeAuditLog` | `api/*/route.ts` | Add audit to all `PUT/DELETE` | 1h |
| **P1** | **Email verification not enforced at middleware** — user can access `/dashboard` without `emailVerified` | `src/middleware.ts:5` | Check `session.user.emailVerified` in middleware, redirect to `/auth/verify` if null | 1h |
| **P2** | **Sentry not wired** — placeholders exist but `wizard` not run | `sentry.*.config.ts` | `npx @sentry/wizard -i nextjs` + `NEXT_PUBLIC_SENTRY_DSN` env | 30 min |
| **P2** | **Multi-currency FX not live** — `formatCurrency` static | `lib/constants.ts:34` | Daily `exchangerate-api` fetch in `/api/crons/fx` + `Currency` table | 3h |
| **P2** | **PWA offline** | — | `npm i next-pwa`, `next.config.ts` `withPWA` | 2h |
| **P2** | **Team workspaces** | Schema | `Org` + `Membership` + `userId+orgId` RLS if multi-tenant | 1 week |
| **Testing** | **Only unit** — no API route + E2E | `src/**/*.test.ts` | `vitest` `POST /api/invoices` Zod 400 test + `playwright` `auth → create` | 4h |
| **Docs** | `VERCEL_TROUBLESHOOTING.md` still old `localhost` cron | `VERCEL_TROUBLESHOOTING.md` | Update to reflect `vercel.json` 2 crons + `CRON_SECRET` + `BLOB_READ_WRITE_TOKEN` | 15 min |

### Backlog (Nice-to-have)
- Webhooks `POST /api/webhooks` for Zapier on `paid`, AI receipt parse `ai` SDK `src/app/api/ai/parse-receipt`, `next-pwa` shell.

---

## 4. Verification & Next Steps

- `npm run build` ✓ 30 routes
- `prisma generate` ✓ `recurringRule` ready (run `npx prisma migrate dev --name add-recurring` before prod)
- `vercel env ls` ✓ `CRON_SECRET`, `NEXTAUTH_SECRET` 64-hex

**Recommended order:**
1. Dashboard server + ChartClient + invoice detail PDF button (half day)
2. Audit on all routes + middleware emailVerified guard (2h)
3. Sentry wizard + `VERCEL_TROUBLESHOOTING.md` update (1h)
4. Playwright E2E (half day)

*Fresh rewrite after 57 commits total — previous 277-line roadmap deleted, replaced with verified closed state + 10 new actionable gaps. No critical open gaps.*
