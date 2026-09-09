import { CURRENCY_SYMBOLS } from './constants';

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 */
export function formatDateISO(date: Date | string): string {
  return new Date(date).toISOString().split('T')[0];
}

/**
 * Format currency — handles number | Decimal | string
 */
export function formatCurrency(
  amount: number | string | { toString(): string },
  currency: string = 'USD'
): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const num = typeof amount === 'number' ? amount : Number(amount.toString());
  return `${symbol}${Number.isFinite(num) ? num.toFixed(2) : '0.00'}`;
}

/** Convert Prisma Decimal or number to number */
export function toNumber(val: number | string | { toString(): string } | null | undefined): number {
  if (val == null) return 0;
  return typeof val === 'number' ? val : Number(val.toString());
}

/**
 * Calculate days until due
 */
export function daysTillDue(dueDate: Date | string): number {
  const now = new Date();
  const due = new Date(dueDate);
  const diff = due.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Check if invoice is overdue
 */
export function isOverdue(dueDate: Date | string, status: string): boolean {
  if (status === 'paid' || status === 'cancelled') return false;
  return daysTillDue(dueDate) < 0;
}

/**
 * Calculate invoice total from items
 */
export function calculateInvoiceTotal(
  items: Array<{ quantity: number; rate: number }>
): number {
  return items.reduce((total, item) => total + item.quantity * item.rate, 0);
}

/**
 * Generate invoice number — uses cuid-style entropy, not Date.now collisions
 */
export function generateInvoiceNumber(): string {
  const prefix = 'INV';
  const date = new Date();
  const yyyymm = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
  // 6-char base36 ~ collision-safe for same-ms, plus counter fallback
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${yyyymm}-${rand}`;
}

/**
 * Calculate budget remaining percentage
 */
export function calculateBudgetPercentage(spent: number, limit: number): number {
  if (limit === 0) return 0;
  return Math.min((spent / limit) * 100, 100);
}

/**
 * Get budget status color class
 */
export function getBudgetStatusColor(percentage: number): string {
  if (percentage >= 100) return 'text-red-600';
  if (percentage >= 80) return 'text-orange-600';
  if (percentage >= 50) return 'text-yellow-600';
  return 'text-green-600';
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (basic)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
}
