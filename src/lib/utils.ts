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
 * Format currency
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD'
): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  return `${symbol}${amount.toFixed(2)}`;
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
 * Generate invoice number
 */
export function generateInvoiceNumber(): string {
  const prefix = 'INV';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `${prefix}-${timestamp}-${random}`;
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
