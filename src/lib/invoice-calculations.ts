export interface InvoiceItem {
    id: string;
    description: string;
    qty: number;
    price: number;
}

export function calculateSubtotal(items: InvoiceItem[]): number {
    if (!items || items.length === 0) return 0;
    return items.reduce((acc, item) => acc + (item.qty * item.price), 0);
}

export function calculateTax(items: InvoiceItem[], hasTax: boolean): number {
    if (!hasTax) return 0;
    const subtotal = calculateSubtotal(items);
    // Use Number() to ensure float arithmetic issues are minimized, though JS still has them.
    // For a real accounting system, we'd use a decimal library, but keeping it simple here.
    return subtotal * 0.19;
}

export function calculateTotal(items: InvoiceItem[], hasTax: boolean): number {
    const subtotal = calculateSubtotal(items);
    const tax = calculateTax(items, hasTax);
    return subtotal + tax;
}
