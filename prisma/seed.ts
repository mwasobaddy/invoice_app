import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config()

const TARGET_EMAIL = 'kelvinramsiel@gmail.com'

const categoryPool = ['Marketing', 'Operations', 'Travel', 'Software', 'Office']
const expenseCategoryPool = [
  'marketing',
  'operations',
  'travel',
  'software',
  'office',
  'utilities',
  'other',
]

const clientPool = [
  { name: 'Kenha Holdings', email: 'accounts@kenha.co', phone: '(555) 301-1101' },
  { name: 'Atlas Ventures', email: 'finance@atlasventures.io', phone: '(555) 512-2233' },
  { name: 'Greenline Co', email: 'billing@greenline.co', phone: '(555) 447-9921' },
  { name: 'Nova Retail', email: 'billing@novaretail.com', phone: '(555) 233-0044' },
]

const paymentMethods = ['bank_transfer', 'credit_card', 'cash']

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(list: T[], rand: () => number) {
  return list[Math.floor(rand() * list.length)]
}

function randomBetween(min: number, max: number, rand: () => number) {
  return Math.round((min + (max - min) * rand()) * 100) / 100
}

function monthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function monthEnd(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function formatInvoiceNo(date: Date, index: number) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const seq = String(index + 1).padStart(3, '0')
  return `INV-${year}${month}-${seq}`
}

async function main() {
  const { prisma } = await import('../src/lib/prisma')
  try {
    const rand = mulberry32(20260415)

    const user = await prisma.user.upsert({
      where: { email: TARGET_EMAIL },
      create: {
        email: TARGET_EMAIL,
        name: 'Kelvin Ramsiel',
      },
      update: {},
    })

    const seedStart = new Date(2025, 9, 1)
    const seedEnd = new Date(2026, 3, 30)

    const months: Date[] = []
    let cursor = monthStart(seedStart)
    while (cursor <= seedEnd) {
      months.push(new Date(cursor))
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
    }

    for (const month of months) {
      const start = monthStart(month)
      const end = monthEnd(month)

      const budgetsToCreate = 2 + Math.floor(rand() * 2)
      const budgets = [] as Array<{ id: string; limit: number }>

      for (let i = 0; i < budgetsToCreate; i += 1) {
        const category = pick(categoryPool, rand)
        const limit = randomBetween(4000, 12000, rand)
        const budget = await prisma.budget.create({
          data: {
            userId: user.id,
            name: `${category} - ${start.toLocaleString('en-US', { month: 'short' })}`,
            limit,
            spent: 0,
            remaining: limit,
            period: 'monthly',
            startDate: start,
            endDate: end,
            category,
            isActive: true,
          },
        })
        budgets.push({ id: budget.id, limit })
      }

      const expenseCount = 8 + Math.floor(rand() * 7)
      for (let i = 0; i < expenseCount; i += 1) {
        const budget = pick(budgets, rand)
        const amount = randomBetween(120, 1400, rand)
        const date = addDays(start, Math.floor(rand() * (end.getDate() - start.getDate() + 1)))
        await prisma.expense.create({
          data: {
            userId: user.id,
            budgetId: budget.id,
            description: `Expense ${i + 1} (${pick(expenseCategoryPool, rand)})`,
            amount,
            category: pick(expenseCategoryPool, rand),
            date,
          },
        })
      }

      const invoicesCount = 4 + Math.floor(rand() * 5)
      for (let i = 0; i < invoicesCount; i += 1) {
        const client = pick(clientPool, rand)
        const issueDate = addDays(start, Math.floor(rand() * 20))
        const dueDate = addDays(issueDate, 14 + Math.floor(rand() * 10))
        const statusPool = ['draft', 'sent', 'paid', 'overdue']
        const status = pick(statusPool, rand)
        const itemCount = 1 + Math.floor(rand() * 3)
        const items = Array.from({ length: itemCount }).map((_, idx) => {
          const quantity = randomBetween(1, 6, rand)
          const rate = randomBetween(150, 900, rand)
          const amount = Math.round(quantity * rate * 100) / 100
          return {
            description: `Service ${idx + 1}`,
            quantity,
            rate,
            amount,
          }
        })
        const totalAmount = items.reduce((sum, item) => sum + item.amount, 0)
        const invoiceNo = formatInvoiceNo(issueDate, i)

        const invoice = await prisma.invoice.create({
          data: {
            userId: user.id,
            invoiceNo,
            clientName: client.name,
            clientEmail: client.email,
            clientPhone: client.phone,
            amount: totalAmount,
            currency: 'USD',
            status,
            issueDate,
            dueDate,
            paidDate: status === 'paid' ? addDays(issueDate, 10) : null,
            description: 'Monthly services',
            items: {
              create: items,
            },
          },
        })

        if (status === 'paid') {
          await prisma.payment.create({
            data: {
              invoiceId: invoice.id,
              amount: totalAmount,
              method: pick(paymentMethods, rand),
              paidDate: addDays(issueDate, 10),
              reference: `PAY-${invoiceNo}`,
            },
          })
        }
      }

      const createdBudgets = await prisma.budget.findMany({
        where: {
          userId: user.id,
          startDate: start,
        },
        include: { expenses: true },
      })

      for (const budget of createdBudgets) {
        const spent = budget.expenses.reduce((sum: number, exp: { amount: number }) => sum + exp.amount, 0)
        const remaining = Math.max(0, budget.limit - spent)
        await prisma.budget.update({
          where: { id: budget.id },
          data: {
            spent,
            remaining,
          },
        })
      }
    }

    console.log('Seed data created for', TARGET_EMAIL)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error('Seed failed', error)
    process.exit(1)
  })
