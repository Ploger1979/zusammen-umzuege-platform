import { describe, it, expect } from 'vitest';
import { calculateSubtotal, calculateTax, calculateTotal } from './invoice-calculations';

describe('Invoice Calculations', () => {
    it('calculates subtotal for a normal invoice amount', () => {
        const items = [{ id: '1', description: 'Item 1', qty: 2, price: 50 }];
        expect(calculateSubtotal(items)).toBe(100);
    });

    it('calculates zero amount for empty or zero-priced items', () => {
        expect(calculateSubtotal([])).toBe(0);
        expect(calculateSubtotal([{ id: '1', description: 'Zero', qty: 1, price: 0 }])).toBe(0);
    });

    it('calculates subtotal for decimal amounts correctly', () => {
        const items = [{ id: '1', description: 'Boxes', qty: 5, price: 2.50 }];
        expect(calculateSubtotal(items)).toBe(12.50);
    });

    it('calculates subtotal for multiple line items', () => {
        const items = [
            { id: '1', description: 'Moving', qty: 1, price: 500 },
            { id: '2', description: 'Boxes', qty: 20, price: 2.50 },
            { id: '3', description: 'Assembly', qty: 2, price: 50 }
        ];
        expect(calculateSubtotal(items)).toBe(500 + 50 + 100); // 650
    });

    it('calculates 19% tax calculation correctly', () => {
        const items = [{ id: '1', description: 'Moving', qty: 1, price: 100 }];
        expect(calculateTax(items, true)).toBe(19);
        expect(calculateTax(items, false)).toBe(0);
    });

    it('calculates gross total calculation correctly', () => {
        const items = [{ id: '1', description: 'Moving', qty: 1, price: 100 }];
        expect(calculateTotal(items, true)).toBe(119);
        expect(calculateTotal(items, false)).toBe(100);
    });
});
