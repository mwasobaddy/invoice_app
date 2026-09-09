# Invoice Atlas — System Analysis & Enhancement Roadmap

> **Stack:** Next.js 16.2.3 (App Router, Turbopack) • React 19.2.4 • Tailwind 4 • Prisma 7.7.0 + `@prisma/adapter-pg` • PostgreSQL (Prisma Postgres `db.prisma.io`) • NextAuth 5 beta • bcryptjs • Recharts
> **Live:** `https://invoice-app-omega-ten.vercel.app` (`invoice-jvcx6e3b8`) • Vercel Hobby • Env: `Production/Preview/Development` split (just fixed)
> **Analysis date:** 2026-09-09 • Build: `✓ Compiled successfully` (local `next build`) • 23 vulnerabilities (`npm audit` – sharp/postcss/valibot)

---

## 1. Executive Summary

A solid MVP: clean Auth.js + Prisma setup, brand-consistent `slate-950 + lime-300` UI, and working CRUD for Invoices/Budgets/Expenses with a Recharts dashboard. Biggest risks are **financial correctness** (`Float` for money), **no input validation**, **client-heavy pages**, and **unhardened auth/secrets**. The quickest wins are adding Zod validation, swapping `Float → Decimal`, and moving dashboard/chart to server components + Prisma aggregates.

---

## 2. Architecture

### What’s Good
- App Router + `src/*` alias (`@/`) clean (`tsconfig.json:22`)
- Prisma generated to `src/generated/prisma` — type-safe
- `DashboardShell.tsx:37` — nice sidebar + mobile drawer
- `AuthProvider` + `DashboardLayout` server guard (`src/app/dashboard/layout.tsx:10`)

### Gaps & Fixes

| # | Issue | Location | Impact | Fix |
|---|-------|----------|--------|-----|
| **A1** | **Client components everywhere** — `src/app/page.tsx:1 'use client'` + `src/app/dashboard/page.tsx:1`, `invoices/page.tsx:1` (431 LOC) all fetch via `fetch()` on client | `page.tsx`, `dashboard/*` | SEO, TTFB, waterfall, no caching | Convert to **Server Components** + `async` data fetch + `Suspense`. Keep only forms interactive. Use `fetch` with `revalidate` or direct `prisma` in server actions. |
| **A2** | **No middleware auth** — each API does `requireAuth()` but pages rely on `useSession` redirect | `src/lib/auth-utils.ts:48`, `src/app/page.tsx:8` | Flash of login, extra round-trip | Add `src/middleware.ts` (Auth.js `auth` middleware) to protect `/dashboard/*` and redirect early. Cuts client JS. |
| **A3** | **API not versioned / no `route.ts` grouping** — `src/app/api/invoices/route.ts` 116 LoC with `any` for items (`route.ts:95`) | API routes | Maintainability | Add `src/app/api/v1/` or at least shared `src/lib/validators/` + `src/lib/api-helpers.ts` for `auth + validate + error`. |
| **A4** | **No error boundaries / global handlers** | App | White-screen on throw | Add `src/app/error.tsx`, `src/app/global-error.tsx`, `src/app/loading.tsx` skeleton (use `animate-fade-up`). |
| **A5** | **`any` + disabled eslint** — `route.ts:94 eslint-disable no-explicit-any` | Invoices API | Type safety | Replace with Zod-inferred types. |

---

## 3. Database & Prisma

### Current Schema (`prisma/schema.prisma:1`)
```
User → Invoice → InvoiceItem / Payment
     → Budget → Expense
     → Account / Session
```
Indexes on `userId`, `status`, `dueDate`, `date` — good.

### Critical

| # | Issue | Why It Hurts | Recommended |
|---|-------|--------------|-------------|
| **D1** | **`Float` for money** — `Invoice.amount Float`, `Budget.limit Float` (`schema.prisma:83`, `143`) | Floating rounding: `0.1 + 0.2 !== 0.3`. Audit/tax unsafe. | **`Decimal` (`@db.Decimal(12,2)`)** + Prisma `Decimal` type. Migration: `amount Decimal @db.Decimal(12,2)`. Update `utils.ts:24 formatCurrency` to handle `Decimal`. |
| **D2** | **Denormalized + mutable** — `Budget.spent/remaining Float` stored, not computed (`schema.prisma:144`) | Drift when expenses added/deleted | **Remove `spent/remaining` columns**. Compute via `SUM(expenses.amount)` or view. Or enforce via DB trigger + transaction. |
| **D3** | **`status String` not enum** — `status String @default("draft")` | Typos, no DB guard | `enum InvoiceStatus { draft sent paid overdue cancelled }` + `enum BudgetPeriod` / `PaymentMethod`. Enforce at DB. |
| **D4** | **Missing constraints** — no `@db.Text` for notes, no `check` on `limit > 0`, no unique on `Budget.name` per user | Bad data | Add `@@unique([userId, name])` where appropriate, `CHECK` via `prisma migrate` raw SQL. |
| **D5** | **No soft-delete / audit** — deletes are hard | Compliance | Add `deletedAt DateTime?` + `@@index([deletedAt])` or history table `InvoiceEvent`. |
| **D6** | **`prisma.ts:17 log: ['query']` in prod** | Leaks SQL + perf hit on Vercel logs | `log: process.env.NODE_ENV === 'development' ? ['query','error'] : ['error']`. Also reuse `Pool` singleton — current `new Pool({connectionString})` per cold start is okay but set `max: 5, idleTimeoutMillis: 10000, ssl: true`. |

### Performance

- **Chart-data does 3 full scans** (`src/app/api/dashboard/chart-data/route.ts:21` — `findMany` all invoices/expenses/budgets then JS grouping). On 10k rows, OOM on Lambda (10s limit).
  - **Fix:** Prisma `groupBy` + `aggregate` in SQL:

    ```ts
    prisma.invoice.groupBy({
      by: ['issueDate'], // or date_trunc
      where: { userId },
      _sum: { amount: true },
      orderBy: { issueDate: 'asc' }
    })
    ```
    Or raw `$queryRaw` with `date_trunc('month', "issueDate")`. Limit to last 12 months by default, paginate.

- **Missing pagination defaults** — `GET /api/invoices` without `?page&limit` returns **all** (`route.ts:47 include: {items, payments}`) — N+1. Add default `page=1, limit=20` + `select` not `include` for list view.
- **No `createdAt` index on Budget/Expense for chart** — add `@@index([userId, startDate])`, `@@index([userId, date])`.

---

## 4. Authentication & Security

| # | Finding | Location | Severity | Action |
|---|---------|----------|----------|--------|
| **S1** | **Weak fallback secret** — `.env.local:18 NEXTAUTH_SECRET="your-secret-key-change-this-in-production"` and Vercel env same placeholder before fix | Env | **High** | Generate strong: `openssl rand -base64 32` . Rotate via `vercel env rm/add NEXTAUTH_SECRET production`. Add check at boot: `if (secret.length < 32) throw`. |
| **S2** | **Env name drift** — code expects `GOOGLE_ID` (`src/lib/auth.ts:72`) but `.env.example:44` docs `AUTH_GOOGLE_ID` | `auth.ts`, `.env.example` | Medium | Support both: `process.env.GOOGLE_ID || process.env.AUTH_GOOGLE_ID`. Update `.env.example` already patched — add same for `GITHUB_ID`. Document in `AGENTS.md`. |
| **S3** | **No email verification** — `emailVerified DateTime?` exists but never set | `schema.prisma:17` | Medium | Add `VerificationToken` flow or `next-auth` email provider. Block dashboard until verified if needed. |
| **S4** | **Password policy weak** — only `length <8` in `register/route.ts:30` | API | Medium | Add Zod: min 12 chars? or zxcvbn check, require upper/lower/number. Rate-limit register: `upstash/ratelimit`. |
| **S5** | **No rate-limit / brute-force** — `signIn('credentials')` unlimited | `src/app/auth/signin/page.tsx:22` | High | Add `arcjet` or `@upstash/ratelimit` on `/api/auth/*` + lockout after 5 fails (store in DB). |
| **S6** | **OAuth account-linking logs PII** — `console.log Linking ${email}` (`auth.ts:101`) | Logs | Low | Remove or use structured logger (`pino`) not `console.log`. Also `prisma.ts` query log leaks PII. |
| **S7** | **No CSRF/SEC headers** — `next.config.ts:3` no `headers()` | Config | Medium | Add `headers()` with `HSTS`, `X-Frame-Options: DENY`, `CSP` (tighten `images.hostname: "**"` → allowlist). |
| **S8** | **Receipt upload unsecured** — `Expense.receipt String? // file path or URL` no storage | Schema | Medium | Use **Vercel Blob** or **Supabase Storage** with signed URLs + mime check. Add `receiptUrl` + `receiptMime` + size limit. |
| **S9** | **`bcrypt` cost 12 okay** but no pepper | `auth-utils.ts:8` | Low | Keep 12, consider `argon2` future. Add pepper env var. |

**Auth.js beta warning:** `next-auth@5.0.0-beta.30` is beta. Pin or watch for `authjs.dev` v5 stable migration — `GITHUB_ID` → `AUTH_GITHUB_ID` rename coming.

---

## 5. API & Validation

- **No Zod** anywhere — `body.invoiceNo` trusted, `item: any` (`invoices/route.ts:95`), `register` only checks email via regex (`utils.ts:103`).
  - **Add:** `src/lib/schemas.ts` with `zod` + `zod-prisma` :

    ```ts
    export const CreateInvoiceSchema = z.object({
      invoiceNo: z.string().min(3),
      clientName: z.string().min(1).max(120),
      clientEmail: z.string().email().optional(),
      amount: z.number().positive().multipleOf(0.01),
      status: z.enum(['draft','sent','paid','overdue','cancelled']),
      issueDate: z.coerce.date(), dueDate: z.coerce.date(),
      items: z.array(z.object({ description: z.string().min(1), quantity: z.number().positive(), rate: z.number().nonnegative(), amount: z.number().nonnegative() })).min(1)
    })
    ```
  - Use `safeParse` → `400` with `flatten()` details on every `POST`.

- **No request size / body limit** — add `export const config = { api: { bodyParser: { sizeLimit: '1mb' }}}` or check `request.json()` size.

- **Mixed pagination contracts** — `GET /api/invoices?page&limit` returns `{items,total,page,pageSize}` but without params returns `Invoice[]` array (`route.ts:39` vs `47`). Breaks client (`invoices/page.tsx:49` handles both). **Standardize** to always paginated.

- **Error leaks** — `console.error('Error fetching invoices:', error)` then `500 Failed to fetch invoices` — okay but add `Sentry` or `logflare` and don’t leak stack in prod. Return `requestId`.

---

## 6. Frontend & UX

### Brand Consistency (Fixed)
- Home `src/app/page.tsx` now matches `slate-950` + `lime-300` (auth pages). `globals.css:3` still uses `Geist` + simple `--background`. Good—extend with design tokens:
  ```css
  @theme { --color-brand: #0f172a; --color-accent: #bef264; }
  ```

### Dashboard (`DashboardShell.tsx:48`)
- Background `radial-gradient(... #dbeafe, #fde68a)` clashes with new home’s `slate` — unify to `bg-slate-50` (home) or keep but align. Suggest **single token**: `bg-slate-50` for app, `bg-slate-950` for hero only.
- `amber-300` dot vs `lime-300` home — pick one accent (`lime-300` is fresher). Update `DashboardShell:79`.

### Performance

| Issue | Detail | Fix |
|-------|--------|-----|
| `dashboard/page.tsx:5` imports `recharts` client-side | ~90kb gz + CSR waterfall (`useEffect` fetch) | Dynamic `import('recharts')` + server data. Consider `tremor`/`shadcn chart` (lighter). |
| No skeleton / CLS | `Loading...` div flicker | Add `src/app/dashboard/loading.tsx` with pulsing cards. Use `Suspense` boundaries per card. |
| `DashboardShell` is `'use client'` for whole shell | Ships 30kb JS for static sidebar | Split: `DashboardShellServer` (layout) + `MobileDrawerClient`. |
| `next.config.ts:8 images.hostname: "**"` | Allows any image — CSP & perf | Restrict to `["lh3.googleusercontent.com", "avatars.githubusercontent.com"]` |
| No `metadata` per dashboard page | | Add `export const metadata` or `generateMetadata()` for SEO + OG. |

### Accessibility
- Buttons missing `aria-label` except password toggle — add `aria-current` on nav, `role="status"` on live metrics, focus rings (`focus-visible:ring-2`).
- Color contrast: `slate-400` on `slate-50` (4.2:1) marginal — bump to `slate-500` for body in light cards.
- Mobile drawer (`DashboardShell:158`) no `Esc` to close / trap focus — add `useEffect` keydown + `FocusTrap`.

---

## 7. Reliability & Ops

| #  | Item | Status | Recommendation |
|----|------|--------|----------------|
| **O1** | **Vercel env split** | Fixed today (`Production=omega-ten`, `Development=localhost`) | Add `vercel env ls` to `SETUP_GUIDE.md` and commit `vercel.json` with `"framework": "nextjs"` + `regions: ["iad1"]`. |
| **O2** | **No CI** | Missing | Add `.github/workflows/ci.yml`: `npm ci → prisma generate → tsc --noEmit → eslint → next build` + `npm audit --audit-level=high` gate. |
| **O3** | **No monitoring** | `console.log` only (`auth.ts:130`) | **Vercel Analytics + Speed Insights** (`@vercel/analytics`, `@vercel/speed-insights`). Sentry for API: `@sentry/nextjs`. Log to `pino` + Vercel Log Drains. |
| **O4** | **No backup / point-in-time** | Prisma Postgres hobby — no PITR | Enable daily backups (`prisma.io` or move to **Supabase/Neon** with PITR). Document restore in `VERCEL_TROUBLESHOOTING.md`. |
| **O5** | **23 vulnerabilities** | `postcss`, `sharp`, `valibot` | Run `npm audit fix` (non-breaking) — keep `next@16.2.3` pinned, avoid `--force` to `next@16.3.4`. Add `dependabot.yml`. |
| **O6** | **No `vercel.json`** | Not in repo | Add with `cleanUrls: true`, `headers` for CSP/HSTS, `crons` for overdue invoice job (see below). |
| **O7** | **Seed hard-codes email** | `prisma/seed.ts: TARGET_EMAIL='kelvinramsiel@gmail.com'` | Make env-driven: `process.env.SEED_EMAIL`. Guard `if (process.env.NODE_ENV==='production') exit`. |

---

## 8. Feature Enhancements (Prioritized)

### P0 — Ship in 2 weeks (revenue & correctness)

1.  **PDF invoices + email** — `react-pdf` or `pdf-lib` + `resend` . Template with `Invoice Atlas` branding (slate/lime). Button on `dashboard/invoices/[id]` → `Download PDF` + `Send via email` (store `sentAt`).
2.  **CSV/Excel export** — `GET /api/invoices/export?format=csv` with `Content-Disposition`. For accountants.
3.  **Overdue automation** — Vercel Cron (`vercel.json: crons`) daily → sets `status='overdue'` where `dueDate < now() && status='sent'`, sends email via `resend`. Add to `VERCEL_TROUBLESHOOTING.md`.
4.  **Search / filter / sort** — `?q=client&status=paid&sort=dueDate:desc` with Prisma `contains` + `mode: 'insensitive'`. Index: `@@index([userId, clientName])`.
5.  **Money → Decimal** (D1) — do first before PDF/export lock in wrong totals.

### P1 — Next month (retention)

6.  **Recurring invoices** — `Invoice.recurringRule String?` + `nextDueDate`. Cron creates draft monthly.
7.  **Client directory** — `Client` model (`id, userId, name, email, phone, address, archivedAt`) + FK from `Invoice.clientId`. Autocomplete in create form, dedup.
8.  **Budget alerts** — `Expense` create → if `spent > limit*0.8` email + in-app toast + `Budget.isOverBudget` badge (turns `red-600` already in `utils.ts:83`).
9.  **Multi-currency real** — store `Currency` table + exchange via `exchangerate-api` or `Intl` only formatting now. Show `USD/EUR` toggle.
10. **File receipts** — `Expense.receipt` → Vercel Blob (`@vercel/blob`) with `receiptUrl`, preview, virus scan (`clamav` lambda).

### P2 — Nice to have

- **PWA + offline** — `next-pwa`, cache dashboard shell.
- **Team workspaces** — `Org` + `Membership` + RLS via `userId` + `orgId`.
- **Audit trail** — `AuditLog { userId, action, entity, entityId, diff, ip }`.
- **Webhooks** — `POST /api/webhooks` for Zapier/Make on invoice paid.
- **AI assist** — `ai` SDK to parse receipt images → prefill expense; draft invoice notes.

---

## 9. Quick Wins Checklist (Copy into issues) — **UPDATED 2026-09-09**

- [x] `npm i zod` + `src/lib/schemas.ts` + validate all `POST` — **DONE** `src/lib/schemas.ts` + `invoices/budgets/expenses/register` use `safeParse` + `any` removed
- [x] `Float` → `Decimal` migration — **DONE** `prisma/schema.prisma` `Decimal @db.Decimal(12,2)` + `utils.ts` Decimal-aware, `prisma generate`
- [x] `prisma.ts:17` conditional logging — **DONE** dev-only query logging + `max:5` Pool
- [x] `src/middleware.ts` auth guard — **DONE** edge middleware for `/dashboard/*`
- [x] `src/app/error.tsx` + `loading.tsx` — **DONE** + `global-error.tsx` + `dashboard/loading.tsx`
- [x] `next.config.ts` restrict `images.hostname`, add `headers()` HSTS/CSP — **DONE** allowlist `lh3.../avatars` + HSTS/CSP headers
- [x] `GenerateInvoiceNumber` (`utils.ts:62`) — **DONE** `INV-YYYYMM-base36` + `@@unique([userId, invoiceNo])`
- [x] `vercel.json` + Cron for overdue — **DONE** `vercel.json` cron `0 2 * * * /api/crons/overdue`
- [x] `npm audit fix` (non-breaking) + `dependabot.yml` — **DONE** `audit fix` 23→7 vulns, `dependabot.yml` weekly
- [x] `sentry` + `analytics` — **PARTIAL** `analytics`/`speed-insights` done, `Sentry` still TODO (see §13)
- [x] Add `README` env table sync with `.env.example` + `VERCEL_CHECKLIST` update — **DONE** `.env.example` dual `GOOGLE_ID||AUTH_*`, `.env`/`.env.local` synced, Vercel env split `Production=omega-ten`

---

## 10. Testing & Quality

Currently **0 tests**. Minimum viable:

- **Unit:** `vitest` for `utils.ts` (formatCurrency, isOverdue, generateInvoiceNumber) + `constants`.
- **API:** `vitest` + `msw` or `next-test-api-route-handler` for `POST /api/invoices` validation (Zod errors) + auth guard.
- **E2E:** `playwright` — `auth` flow (signup → signin → dashboard redirect), `invoices/create` → check `invoiceNo` uniqueness, `budgets` overspend alert.
- **Load:** `k6` on `chart-data` with 10k rows — verify fix for D-performance.
- Add `eslint --max-warnings=0` to CI, enable `typescript: { ignoreBuildErrors: false }` already in `next.config.ts:17`.

---

## 11. What’s Already Excellent — Keep It

- Prisma indexes on `status/dueDate` — thoughtful.
- `requireAuth()` helper (`auth-utils.ts:48`) — single chokepoint, good for adding rate-limit later.
- Brand devotion: `Invoice Atlas / Osmo` story consistent across `signin`/`signup`/`home` now.
- Vercel alias `invoice-app-omega-ten` clean — keep.

---

## 12. Suggested Order (If you pick one thing per week)

1.  **Week 1:** Decimal + Zod + `any` removal (correctness) — **DONE**
2.  **Week 2:** Middleware + Server Components + `loading.tsx` (perf) — **DONE** (home → server, dashboard shell still client — see §13)
3.  **Week 3:** PDF + CSV + Cron overdue (revenue) — **PARTIAL** CSV/cron done, PDF pending
4.  **Week 4:** Sentry + analytics + `vercel.json` headers (reliability) — **PARTIAL** analytics done, Sentry pending
5.  **Month 2:** Client model + receipts + budget alerts — **PARTIAL** Client model done, receipts/budget alerts pending

---

## 13. Post-Implementation Rescan (2026-09-09 21:50) — New Findings

After implementing the 38 commits above, `npm run build` ✓ 26 routes, `vitest` ✓ 5/5. Rescan found these **remaining gaps** (new improvements):

### Still Open from Original Roadmap
| # | Original | Status | Next Step |
|---|----------|--------|-----------|
| **A1** | Client components everywhere — `src/app/page.tsx:1` + dashboard | **PARTIAL** — Home now `async` server (`auth()` redirect, no `useSession`), but `src/app/dashboard/page.tsx:1` + `invoices/page.tsx:1` (431 LOC) still client `useEffect` + `recharts` CSR | Convert dashboard to **Server Components** + `Suspense` + `fetch` with `revalidate`. Extract `src/components/ChartClient.tsx` dynamic import. Use `src/app/api/dashboard/chart-data` via `prisma` directly in server page to cut fetch round-trip. |
| **A3** | API versioning / helpers | **PARTIAL** — `src/lib/schemas.ts` + `src/lib/api-helpers.ts` + `src/lib/rate-limit.ts` created, but `budgets/[id]`, `expenses/[id]` still inline `requireAuth` + manual `console.error`. | Wrap all `route.ts` with `withAuth` + `badRequest`/`serverError`. Add `src/app/api/v1/` alias or at least `src/lib/validators/` re-export. |
| **D2** | Denormalized `Budget.spent/remaining` | **INTENTIONAL KEEP** — Columns kept for perf but now recomputed transactionally on every `expenses` write (see `expenses/route.ts:80`). Alternative considered: drop columns + `SUM` view, but kept to avoid expensive aggregates on list. Documented as trade-off. | Optional: add DB trigger `update_budget_spent` or migrate to computed view `BudgetSummary`. Add nightly reconciliation cron `/api/crons/reconcile-budgets`. |
| **S1** | Weak `NEXTAUTH_SECRET` | **FIXED NOW** — Rotated to `17fc2cbcf...` (64 hex) in `.env`, `.env.local` + `vercel env add production/preview/development --force`. Added boot check `if (secret.length<32) throw` in `src/lib/auth.ts:8`. | Rotate again if old secret leaked; add `CRON_SECRET` env for cron auth. |
| **S3** | Email verification | **OPEN** — `emailVerified` field unused. No verification flow. | Add `next-auth` email provider or custom `POST /api/auth/verify` + `VerificationToken` email via `resend`. Block `dashboard` until `emailVerified != null`. |
| **S4/S5** | Password policy + rate-limit | **PARTIAL** — `register/route.ts` now checks `rateLimit: register:${ip} 5/60s` + requires `8+ uppercase + number`. But `signin/page.tsx` credentials still unlimited, no `upstash/ratelimit`. | Add `rateLimit` to `src/lib/auth.ts` `authorize` (lockout after 5 fails) + `arcjet`. |
| **S8** | Receipt upload | **PARTIAL** — `Expense.receiptMime` added, but no `Vercel Blob`/`Supabase Storage` upload. | `npm i @vercel/blob`, add `POST /api/expenses/upload` with `signedUrl`, `mime`/`size` check, `receiptUrl` in `src/app/dashboard/expenses/create/page.tsx`. |
| **S9** | bcrypt pepper | **OPEN** | Add `BCRYPT_PEPPER` env + `hash(password+pepper)` |
| **O3** | Monitoring | **PARTIAL** — Analytics/SpeedInsights added, `console.log` removed, but no `Sentry`. | `npx @sentry/wizard@latest -i nextjs`, add `sentry.client.config.ts` + DSN env. |
| **6-Perf** | Dashboard still client-heavy, no `metadata`, a11y | **PARTIAL** — Home now server with `metadata`, `globals.css` brand tokens, `DashboardShell` got `Esc` handler + `aria-label`/`aria-current` + `focus-visible:ring`, `vercel.json` cron, but `dashboard/page.tsx` still client `recharts` (~90kb), no `export const metadata` per dashboard subpage. | Add `src/app/dashboard/invoices/metadata.ts`, `budgets/metadata.ts`, dynamic `ChartClient`. Split `DashboardShell` into `ServerShell` + `MobileDrawerClient`. |

### Brand New Gaps Found in Rescan
| Priority | Finding | File:Line | Fix |
|----------|---------|-----------|-----|
| **P0** | **No PDF generation** — P0 item 1 completely missing. Users can’t download invoices. | `ENHANCEMENTS.md:167` | `npm i @react-pdf/renderer` + `src/app/api/invoices/[id]/pdf/route.ts` with `InvoiceAtlas` slate/lime template, `Download PDF` button in `invoices/[id]/page.tsx`. |
| **P0** | **No recurring invoices** | `schema.prisma` | Add `Invoice.recurringRule String?` + `nextDueDate DateTime?` + cron `/api/crons/recurring` |
| **P1** | **Budget alerts not wired** — `getBudgetStatusColor` exists but no toast/email when `spent > limit*0.8` | `expenses/route.ts:73` | After `budget.update`, if `totalSpent > limit*0.8` trigger `resend` email + `sonner` toast. Add `Budget.isOverBudget` derived. |
| **P1** | **Multi-currency stub** — `formatCurrency` handles symbols but no FX | `lib/constants.ts:34` | Add `Currency` table + `exchangerate-api` daily fetch `/api/crons/fx` |
| **P2** | **AuditLog model exists but never written** | `prisma/schema.prisma:AuditLog` | Write on every `PUT/POST/DELETE` via `src/lib/audit.ts` |
| **P2** | **Team workspaces / RLS** — single-user only | Schema | Add `Org` + `Membership` if multi-tenant needed |
| **Testing** | Only `utils.test.ts` — API/E2E missing | `src/**/*.test.ts` | Add `vitest` route tests + `playwright` e2e for `auth → invoices/create` flow |
| **Docs** | `VERCEL_TROUBLESHOOTING.md` still mentions old `localhost` cron | `VERCEL_TROUBLESHOOTING.md` | Update to `vercel.json` cron + `CRON_SECRET` docs |
| **Types** | `src/generated/prisma` ignored but committed? Should be `.gitignore` | `.gitignore` | Add `src/generated/` to `.gitignore` (generated on `postinstall`) or commit `schema.prisma` only |

### Updated Action List (Next Sprint)
- [ ] `npm i @react-pdf/renderer @vercel/blob @sentry/nextjs`
- [ ] Convert `src/app/dashboard/page.tsx` + `invoices/page.tsx` to Server Components + `ChartClient` dynamic
- [ ] Add `Sentry` wizard + `CRON_SECRET` to Vercel
- [ ] Implement `src/app/api/invoices/[id]/pdf/route.ts` + `Client` autocomplete in `invoices/create`
- [ ] Add `src/lib/audit.ts` writes + `playwright` config
- [ ] Update `VERCEL_TROUBLESHOOTING.md` + `.gitignore` for `src/generated`

*Rescan for `big-obadiahs-projects/invoice-app` after 38 commits — build still green, 7 vulns remain (sharp/postcss, non-breaking).*