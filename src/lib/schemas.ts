import { z } from "zod";

// ---------- Shared ----------
export const CurrencySchema = z.enum(["USD", "EUR", "GBP", "INR", "JPY", "CAD", "AUD"]);
export const InvoiceStatusSchema = z.enum(["draft", "sent", "paid", "overdue", "cancelled"]);
export const BudgetPeriodSchema = z.enum(["monthly", "quarterly", "yearly", "custom"]);
export const PaymentMethodSchema = z.enum(["credit_card", "bank_transfer", "cheque", "cash"]);

// ---------- Invoice ----------
export const InvoiceItemSchema = z.object({
  description: z.string().min(1, "Description required").max(500),
  quantity: z.number().positive("Quantity must be >0"),
  rate: z.number().nonnegative("Rate must be >=0"),
  amount: z.number().nonnegative("Amount must be >=0"),
});

export const CreateInvoiceSchema = z.object({
  invoiceNo: z.string().min(3).max(50).optional(),
  clientName: z.string().min(1).max(120),
  clientEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  clientPhone: z.string().max(30).optional().or(z.literal("")),
  amount: z.number().positive().multipleOf(0.01).optional(), // computed from items if omitted
  currency: CurrencySchema.optional().default("USD"),
  status: InvoiceStatusSchema.optional().default("draft"),
  issueDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  description: z.string().max(2000).optional().or(z.literal("")),
  notes: z.string().max(5000).optional().or(z.literal("")),
  items: z.array(InvoiceItemSchema).min(1, "At least one line item required"),
});

export const UpdateInvoiceSchema = CreateInvoiceSchema.partial().extend({
  id: z.string().optional(),
});

// ---------- Budget ----------
export const CreateBudgetSchema = z.object({
  name: z.string().min(1).max(120),
  limit: z.number().positive("Limit must be >0").multipleOf(0.01),
  spent: z.number().nonnegative().optional().default(0),
  period: BudgetPeriodSchema,
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  category: z.string().max(80).optional().or(z.literal("")),
  color: z.string().regex(/^#([0-9A-Fa-f]{6})$/, "Must be hex #RRGGBB").optional().or(z.literal("")),
  isActive: z.boolean().optional().default(true),
}).refine((d) => d.endDate >= d.startDate, {
  message: "endDate must be >= startDate",
  path: ["endDate"],
});

// ---------- Expense ----------
export const CreateExpenseSchema = z.object({
  budgetId: z.string().optional().or(z.literal("")),
  description: z.string().min(1).max(500),
  amount: z.number().positive().multipleOf(0.01),
  category: z.string().min(1).max(80),
  date: z.coerce.date(),
  notes: z.string().max(2000).optional().or(z.literal("")),
  receipt: z.string().url("Must be a URL").optional().or(z.literal("")),
});

// ---------- Auth ----------
export const RegisterSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(120).optional(),
  password: z.string().min(8).max(128),
});

// Helper for API routes
export function formatZodError(error: z.ZodError) {
  return error.flatten();
}
