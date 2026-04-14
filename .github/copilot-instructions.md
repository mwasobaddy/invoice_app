# Invoice Management System - Project Guidelines

## Project Overview

This is an invoice management system with budget tracker built with:
- **Frontend**: Next.js 16+ (App Router, TypeScript, Tailwind CSS)
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (via Supabase or Neon)
- **ORM**: Prisma
- **Architecture**: Monolithic file structure

## Project Structure

```
invoice_app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── invoices/
│   │   │   │   ├── route.ts          # GET all, POST new
│   │   │   │   └── [id]/route.ts     # GET, PUT, DELETE single
│   │   │   ├── budgets/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   └── expenses/
│   │   │       ├── route.ts
│   │   │       └── [id]/route.ts
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx              # Main dashboard
│   │   │   ├── invoices/
│   │   │   ├── budgets/
│   │   │   ├── expenses/
│   │   │   └── layout.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # Home page
│   │   └── globals.css
│   ├── components/
│   │   ├── InvoiceList.tsx
│   │   ├── InvoiceForm.tsx
│   │   ├── BudgetTracker.tsx
│   │   ├── ExpenseForm.tsx
│   │   ├── Sidebar.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── prisma.ts                 # Prisma client
│   │   ├── utils.ts                  # Helper functions
│   │   └── constants.ts              # Constants
│   ├── types/
│   │   └── index.ts                  # TypeScript interfaces
│   └── generated/
│       └── prisma/                   # Auto-generated Prisma types
├── prisma/
│   └── schema.prisma                 # Database schema
├── .env.local                        # Environment variables
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## Database Schema

The application uses 6 main tables:

1. **User** - Application users
2. **Invoice** - Invoice records
3. **InvoiceItem** - Line items within invoices
4. **Payment** - Payment records
5. **Budget** - Budget limits and tracking
6. **Expense** - Individual expenses tracked against budgets

## Key Features to Implement

### Invoice Management
- [ ] Create, read, update, delete invoices
- [ ] Generate invoice PDFs
- [ ] Track invoice statuses (draft, sent, paid, overdue, cancelled)
- [ ] Add multiple line items per invoice
- [ ] Track payments received
- [ ] Send invoice reminders

### Budget Tracking
- [ ] Create budgets with spending limits
- [ ] Support multiple budget periods (monthly, quarterly, yearly)
- [ ] Track expenses against budgets
- [ ] Visual budget progress indicators
- [ ] Budget alerts for overspending

### Dashboard
- [ ] Overview of key metrics (total revenue, expenses, budget utilization)
- [ ] Recent invoices list
- [ ] Budget summary
- [ ] Cash flow visualization
- [ ] Expense breakdown by category

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database
Update `DATABASE_URL` in `.env.local`:
- **Supabase**: `postgresql://user:password@db.XXXX.supabase.co:5432/postgres?schema=public`
- **Neon**: `postgresql://user:password@ep-XXXX.us-east-1.neon.tech/database?schema=public`

### 3. Create Database Tables
```bash
npx prisma db push
```

### 4. Generate Prisma Client
```bash
npx prisma generate
```

### 5. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000`

## Development Workflow

### Adding New Features
1. Update Prisma schema if needed
2. Run `npx prisma db push` to update database
3. Create/update API routes
4. Build React components
5. Add TypeScript types in `src/types/`

### Working with Prisma
```bash
# Push schema changes to database
npx prisma db push

# Generate client after schema updates
npx prisma generate

# Open Prisma Studio (database GUI)
npx prisma studio

# Create migration (for production)
npx prisma migrate dev --name <migration_name>
```

## API Endpoints

### Invoices
- `GET /api/invoices` - Get all invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/[id]` - Get single invoice
- `PUT /api/invoices/[id]` - Update invoice
- `DELETE /api/invoices/[id]` - Delete invoice

### Budgets
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create budget
- `GET /api/budgets/[id]` - Get single budget
- `PUT /api/budgets/[id]` - Update budget
- `DELETE /api/budgets/[id]` - Delete budget

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses/[id]` - Get single expense
- `PUT /api/expenses/[id]` - Update expense
- `DELETE /api/expenses/[id]` - Delete expense

## Authentication (TODO)
Currently uses `x-user-id` header for testing. Implement proper authentication:
- [ ] NextAuth.js integration
- [ ] JWT tokens
- [ ] User roles and permissions

## Styling
- Tailwind CSS for styling
- Custom components in `src/components/`
- Global styles in `src/app/globals.css`

## Best Practices
1. Keep API route handlers clean and focused
2. Use Prisma for all database operations
3. Add proper error handling and logging
4. Validate input data
5. Use TypeScript for type safety
6. Create reusable React components
7. Follow Next.js conventions

## Common Tasks

### Running the development server
```bash
npm run dev
```

### Building for production
```bash
npm run build
npm run start
```

### Linting
```bash
npm run lint
```

### Resetting the database
```bash
npx prisma db push --skip-generate
```

## MCP Server Configuration

To use MCP servers for enhanced development:

1. **Supabase MCP** - For database operations
2. **Prisma MCP** - For ORM assistance
3. **Next.js MCP** - For framework guidance

## Environment Variables

```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Support & Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [Neon](https://neon.tech/)
