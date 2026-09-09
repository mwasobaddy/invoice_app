import { describe, it, expect } from 'vitest';
import { formatCurrency, isOverdue, generateInvoiceNumber, calculateInvoiceTotal, toNumber } from './utils';

describe('utils', () => {
  it('formatCurrency handles number and Decimal-like', () => {
    expect(formatCurrency(1234.5, 'USD')).toBe('$1234.50');
    expect(formatCurrency({ toString: () => '99.9' }, 'EUR')).toBe('€99.90');
  });

  it('toNumber converts Decimal-like', () => {
    expect(toNumber({ toString: () => '12.34' })).toBe(12.34);
    expect(toNumber(null)).toBe(0);
  });

  it('calculateInvoiceTotal sums correctly', () => {
    expect(calculateInvoiceTotal([{ quantity: 2, rate: 10 }, { quantity: 1, rate: 5 }])).toBe(25);
  });

  it('isOverdue respects paid/cancelled', () => {
    const past = new Date(Date.now() - 86400000).toISOString();
    expect(isOverdue(past, 'paid')).toBe(false);
    expect(isOverdue(past, 'sent')).toBe(true);
  });

  it('generateInvoiceNumber format', () => {
    const n = generateInvoiceNumber();
    expect(n).toMatch(/^INV-\d{6}-[A-Z0-9]{6}$/);
    expect(generateInvoiceNumber()).not.toBe(n); // unique
  });
});
