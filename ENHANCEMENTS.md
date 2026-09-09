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

## 9. Quick Wins Checklist (Copy into issues)

- [ ] `npm i zod` + `src/lib/schemas.ts` + validate all `POST` (est. 3h)
- [ ] `Float` → `Decimal` migration (1h + test)
- [ ] `prisma.ts:17` conditional logging (5 min)
- [ ] `src/middleware.ts` auth guard (30 min)
- [ ] `src/app/error.tsx` + `loading.tsx` (30 min)
- [ ] `next.config.ts` restrict `images.hostname`, add `headers()` HSTS/CSP (20 min)
- [ ] `GenerateInvoiceNumber` (`utils.ts:62`) — use `cuid` or `nanoid` not `Date.now()` (collision) + add `@@unique([userId, invoiceNo])`
- [ ] `vercel.json` + Cron for overdue (30 min)
- [ ] `npm audit fix` (non-breaking) + `dependabot.yml` (15 min)
- [ ] `sentry` + `analytics` (30 min)
- [ ] Add `README` env table sync with `.env.example` (done) + `VERCEL_CHECKLIST` update

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

1.  **Week 1:** Decimal + Zod + `any` removal (correctness)
2.  **Week 2:** Middleware + Server Components + `loading.tsx` (perf)
3.  **Week 3:** PDF + CSV + Cron overdue (revenue)
4.  **Week 4:** Sentry + analytics + `vercel.json` headers (reliability)
5.  **Month 2:** Client model + receipts + budget alerts

---

*Generated for `big-obadiahs-projects/invoice-app`. To implement, create GitHub issues from the Quick Wins checklist — each maps to a file:line.*