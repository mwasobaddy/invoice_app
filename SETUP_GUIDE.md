# Setup & Installation Guide

## ✅ What Has Been Set Up

### Project Initialization
- ✅ Next.js 16+ project with TypeScript
- ✅ App Router configured
- ✅ Tailwind CSS integrated
- ✅ ESLint configured
- ✅ Proper project structure with src/ directory

### Database & ORM
- ✅ Prisma ORM installed and configured
- ✅ Database schema with 6 models:
  - User (authentication)
  - Invoice (invoice records)
  - InvoiceItem (line items)
  - Payment (payment tracking)
  - Budget (budget limits)
  - Expense (expense tracking)

### API Routes (Complete CRUD Operations)
- ✅ `/api/invoices` - GET all, POST new
- ✅ `/api/invoices/[id]` - GET, PUT, DELETE single
- ✅ `/api/budgets` - GET all, POST new
- ✅ `/api/budgets/[id]` - GET, PUT, DELETE single
- ✅ `/api/expenses` - GET all, POST new
- ✅ `/api/expenses/[id]` - GET, PUT, DELETE single

### Utilities & Types
- ✅ Prisma client singleton (`src/lib/prisma.ts`)
- ✅ 32+ utility functions (`src/lib/utils.ts`)
- ✅ Application constants (`src/lib/constants.ts`)
- ✅ TypeScript type definitions (`src/types/index.ts`)

### Documentation
- ✅ Comprehensive README.md
- ✅ Project guidelines (.github/copilot-instructions.md)
- ✅ MCP Servers setup guide (MCP_SERVERS.md)
- ✅ Package.json with Prisma scripts

## 🔧 What You Need to Do Next

### 1. **Configure Database** (REQUIRED)
Edit `.env.local` and set your `DATABASE_URL`:

**Option A: Using Supabase**
```env
DATABASE_URL="postgresql://postgres:PASSWORD@db.XXXXXXXXXXXX.supabase.co:5432/postgres?schema=public"
```

**Option B: Using Neon**
```env
DATABASE_URL="postgresql://user:password@ep-XXXXXXXXXX.us-east-1.neon.tech/database?schema=public"
```

### 2. **Initialize Database**
```bash
cd /Users/app/Desktop/React2/invoice_app
npx prisma db push
```

This command will:
- Connect to your PostgreSQL database
- Create all the necessary tables
- Set up relationships and constraints

### 3. **Generate Prisma Client**
```bash
npx prisma generate
```

This generates type-safe database client code.

### 4. **Verify Setup**
```bash
# Open Prisma Studio to view your database
npx prisma studio
```

Prisma Studio will open at `http://localhost:5555` - you can create test data through the UI.

### 5. **Start Development Server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Install Optional MCP Servers

For enhanced AI-assisted development, install MCP servers:

```bash
npm install -D @modelcontextprotocol/server-postgres
npm install -D @modelcontextprotocol/server-prisma
npm install -D @modelcontextprotocol/server-nextjs
npm install -D @modelcontextprotocol/server-typescript
```

See [MCP_SERVERS.md](./MCP_SERVERS.md) for detailed configuration.

## 🎯 Next Development Steps

### Phase 1: Core UI Components (Recommended First)
Create React components for:
- [ ] InvoiceList component
- [ ] InvoiceForm component
- [ ] BudgetTracker component
- [ ] ExpenseForm component
- [ ] Dashboard page
- [ ] Navigation/Sidebar

### Phase 2: Authentication
- [ ] Integrate NextAuth.js
- [ ] Replace x-user-id header authentication
- [ ] Add user login/signup pages
- [ ] Implement role-based access control

### Phase 3: Advanced Features
- [ ] PDF invoice generation
- [ ] Email invoice sending
- [ ] Payment receipt upload
- [ ] Budget forecasting
- [ ] Expense categorization
- [ ] Data export (CSV, Excel)

### Phase 4: Optimization & Polish
- [ ] Form validation
- [ ] Error handling improvements
- [ ] Loading states
- [ ] Toast notifications
- [ ] Dark mode support
- [ ] Mobile responsiveness

## 📝 Useful Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Production server
npm run start

# Linting
npm run lint

# Prisma commands
npm run prisma:generate     # Generate client
npm run prisma:db-push      # Sync schema with DB
npm run prisma:studio       # Open database GUI
npm run prisma:migrate      # Create migration
npm run prisma:reset        # Reset database (dev only)
```

## 🗂 Directory Reference

```
invoice_app/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── invoices/
│   │   │   ├── budgets/
│   │   │   └── expenses/
│   │   ├── page.tsx          # Home page
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Global styles
│   ├── components/           # React components (TODO)
│   ├── lib/
│   │   ├── prisma.ts        # Database client
│   │   ├── utils.ts         # Utilities (32+ functions)
│   │   └── constants.ts     # Constants
│   └── types/
│       └── index.ts         # TypeScript interfaces
├── prisma/
│   └── schema.prisma        # Database schema
├── .github/
│   └── copilot-instructions.md
├── .env.local               # Environment config
├── .env.example             # Example env (TODO)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── MCP_SERVERS.md          # MCP Setup guide
└── README.md               # Project README
```

## 🔐 Environment Variables

The following variables are needed:

```env
# Required
DATABASE_URL=postgresql://...

# Optional
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development

# For NextAuth.js (when added)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here

# For Supabase (if using)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 🐛 Common Issues & Solutions

### "DATABASE_URL is not set"
- Make sure `.env.local` exists in project root
- Check you've set DATABASE_URL correctly
- Restart dev server after changing .env

### Connection refused to database
- Verify your PostgreSQL database is running
- Check DATABASE_URL is correct
- Test connection: `psql $DATABASE_URL`

### "Cannot find module '@prisma/client'"
- Run: `npm install`
- Run: `npx prisma generate`

### Port 3000 already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

## ✨ Key Features Ready to Use

### Utility Functions (in `src/lib/utils.ts`)
- `formatDate()` - Format dates
- `formatCurrency()` - Format money
- `daysTillDue()` - Calculate days
- `isOverdue()` - Check overdue status
- `calculateInvoiceTotal()` - Sum invoice items
- `generateInvoiceNumber()` - Create invoice IDs
- `calculateBudgetPercentage()` - Budget utilization
- `isValidEmail()` - Email validation
- `isValidPhone()` - Phone validation
- And 23 more...

### Constants (in `src/lib/constants.ts`)
- Invoice status options
- Budget period options
- Payment methods
- Expense categories
- Currency symbols
- Status color mappings

## 📚 Learn More

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/docs)
- [Neon](https://neon.tech/docs)

## 🚀 Quick Start Command Sequence

```bash
# 1. Navigate to project
cd /Users/app/Desktop/React2/invoice_app

# 2. Install dependencies (if needed)
npm install

# 3. Set DATABASE_URL in .env.local

# 4. Initialize database
npx prisma db push

# 5. Generate client
npx prisma generate

# 6. Start development
npm run dev

# 7. View database (optional)
npx prisma studio
```

---

**Status**: ✅ Project scaffold complete. Ready for UI development.

**Next Action**: Configure DATABASE_URL and run `npx prisma db push`
