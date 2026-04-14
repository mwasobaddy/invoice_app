export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  userId: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  description?: string;
  notes?: string;
  items: InvoiceItem[];
  payments: Payment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: 'credit_card' | 'bank_transfer' | 'cheque' | 'cash';
  paidDate: Date;
  reference?: string;
  notes?: string;
  createdAt: Date;
}

export interface Budget {
  id: string;
  userId: string;
  name: string;
  limit: number;
  spent: number;
  remaining: number;
  period: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  startDate: Date;
  endDate: Date;
  category?: string;
  color?: string;
  isActive: boolean;
  expenses: Expense[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  userId: string;
  budgetId?: string;
  description: string;
  amount: number;
  category: string;
  date: Date;
  notes?: string;
  receipt?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalExpenses: number;
  budgetUtilization: number;
  invoiceStatus: {
    draft: number;
    sent: number;
    paid: number;
    overdue: number;
  };
  activeBudgets: number;
  cashFlow: Array<{
    month: string;
    income: number;
    expenses: number;
  }>;
}
