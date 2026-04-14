# Invoice Management System with Budget Tracker

A modern, full-stack invoice management system built with Next.js, Prisma, PostgreSQL, and Tailwind CSS. Manage invoices, track budgets, and monitor expenses all in one place.

## 🚀 Features

### Invoice Management
- ✅ Create, read, update, delete invoices
- ✅ Multiple line items per invoice
- ✅ Track invoice status (draft, sent, paid, overdue, cancelled)
- ✅ Record payments received
- ✅ Add client information
- ✅ Add invoice descriptions and notes

### Budget Tracking
- ✅ Create budgets with spending limits
- ✅ Support multiple budget periods (monthly, quarterly, yearly, custom)
- ✅ Track expenses against budgets
- ✅ Visual budget progress indicators
- ✅ Budget alerts for overspending
- ✅ Category-based expense tracking

### Dashboard Analytics
- ✅ Key metrics overview (total revenue, expenses, budget utilization)
- ✅ Recent invoices list
- ✅ Budget summary
- ✅ Expense breakdown by category
- ✅ Cash flow visualization

## 🛠 Tech Stack

- **Frontend**: Next.js 16+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Supabase or Neon)
- **ORM**: Prisma
- **Authentication**: Ready for NextAuth.js integration

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (Supabase or Neon account)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Database

Create `.env.local` with your database URL:

**For Supabase:**
```env
DATABASE_URL="postgresql://postgres:PASSWORD@db.XXXXXXXXXXXX.supabase.co:5432/postgres?schema=public"
```

**For Neon:**
```env
DATABASE_URL="postgresql://user:password@ep-XXXXXXXXXX.us-east-1.neon.tech/database?schema=public"
```

### 3. Setup Database

```bash
# Push the schema to your database
npx prisma db push

# Generate Prisma client
npx prisma generate

# (Optional) Open Prisma Studio to view/edit data
npx prisma studio
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
invoice_app/
├── src/
│   ├── app/
│   │   ├── api/                  # API routes
│   │   │   ├── invoices/         # Invoice endpoints
│   │   │   ├── budgets/          # Budget endpoints
│   │   │   └── expenses/         # Expense endpoints
│   │   ├── (dashboard)/          # Dashboard pages
│   │   ├── page.tsx              # Home page
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Global styles
│   ├── components/               # Reusable React components
│   ├── lib/
│   │   ├── prisma.ts            # Prisma client instance
│   │   ├── utils.ts             # Utility functions
│   │   └── constants.ts         # Application constants
│   ├── types/                   # TypeScript type definitions
│   └── generated/               # Auto-generated Prisma types
├── prisma/
│   └── schema.prisma            # Database schema
├── .github/
│   └── copilot-instructions.md  # Project guidelines
└── .env.local                   # Environment variables (local)
```

## 🗄 Database Schema

The application uses 6 main tables: User, Invoice, InvoiceItem, Payment, Budget, and Expense.

See [prisma/schema.prisma](./prisma/schema.prisma) for the complete schema.

## 🔌 API Endpoints

### Invoices
- `GET /api/invoices` - Get all invoices
- `POST /api/invoices` - Create new invoice
- `GET /api/invoices/[id]` - Get specific invoice
- `PUT /api/invoices/[id]` - Update invoice
- `DELETE /api/invoices/[id]` - Delete invoice

### Budgets
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create new budget
- `GET /api/budgets/[id]` - Get specific budget
- `PUT /api/budgets/[id]` - Update budget
- `DELETE /api/budgets/[id]` - Delete budget

## 🔧 Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint

# Prisma commands
npx prisma generate      # Generate Prisma client
npx prisma db push       # Push schema to database
npx prisma studio       # Open database GUI
```

## 🚨 Common Issues & Solutions

### Database connection issues
- Verify `DATABASE_URL` in `.env.local`
- Check if database is running/accessible
- Test connection in Prisma Studio: `npx prisma studio`

### Prisma client not found
```bash
npx prisma generate
```

## 📚 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/docs)
- [Neon](https://neon.tech/docs)

---

**Built with ❤️ using Next.js, Prisma, and Tailwind CSS**
