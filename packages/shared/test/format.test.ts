import { describe, expect, it } from 'vitest';
import { REQUEST_STATUSES, formatCents } from '../src/index';

describe('formatCents', () => {
  it('formats whole and fractional dollars', () => {
    expect(formatCents(129900)).toBe('$1,299.00');
    expect(formatCents(4950)).toBe('$49.50');
    expect(formatCents(0)).toBe('$0.00');
  });
});

describe('REQUEST_STATUSES', () => {
  it('lists every lifecycle status in order', () => {
    expect(REQUEST_STATUSES).toEqual(['pending', 'approved', 'rejected', 'fulfilled', 'cancelled']);
  });
});
