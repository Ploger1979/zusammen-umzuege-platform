import { describe, it, expect } from 'vitest';
import { getNextInvoiceNumber } from './invoice-number';

describe('Invoice Number Generation', () => {
    it('no existing invoices returns RE-currentYear-001', () => {
        const year = 2026;
        expect(getNextInvoiceNumber([], year)).toBe('RE-2026-001');
    });

    it('RE-2026-001 returns RE-2026-002', () => {
        const year = 2026;
        expect(getNextInvoiceNumber(['RE-2026-001'], year)).toBe('RE-2026-002');
    });

    it('RE-2026-099 returns RE-2026-100', () => {
        const year = 2026;
        expect(getNextInvoiceNumber(['RE-2026-098', 'RE-2026-099'], year)).toBe('RE-2026-100');
    });

    it('ignores invoices from other years', () => {
        const existing = ['RE-2025-001', 'RE-2025-099', 'RE-2024-500'];
        expect(getNextInvoiceNumber(existing, 2026)).toBe('RE-2026-001');
    });

    it('ignores malformed invoice numbers', () => {
        const existing = ['RE-2026-ABC', 'INVALID', 'RE-2026-001'];
        expect(getNextInvoiceNumber(existing, 2026)).toBe('RE-2026-002');
    });

    it('handles gaps correctly by using max + 1', () => {
        const existing = ['RE-2026-001', 'RE-2026-005'];
        expect(getNextInvoiceNumber(existing, 2026)).toBe('RE-2026-006');
    });
});
