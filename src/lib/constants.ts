export const INVOICE_STATUSES = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
} as const;

export const BUDGET_PERIODS = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
  custom: 'Custom',
} as const;

export const PAYMENT_METHODS = {
  credit_card: 'Credit Card',
  bank_transfer: 'Bank Transfer',
  cheque: 'Cheque',
  cash: 'Cash',
} as const;

export const EXPENSE_CATEGORIES = [
  'Marketing',
  'Operations',
  'Travel',
  'Software',
  'Office Supplies',
  'Utilities',
  'Payroll',
  'Other',
] as const;

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
} as const;

export const INVOICE_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-200 text-gray-700',
} as const;
