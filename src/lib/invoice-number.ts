export function getNextInvoiceNumber(existingInvoiceNumbers: string[], year?: number): string {
    const currentYear = year || new Date().getFullYear();
    const prefix = `RE-${currentYear}-`;
    
    let maxNumber = 0;

    for (const invoiceNr of existingInvoiceNumbers) {
        if (!invoiceNr) continue;
        
        if (invoiceNr.startsWith(prefix)) {
            const parts = invoiceNr.split('-');
            if (parts.length === 3) {
                const num = parseInt(parts[2], 10);
                if (!isNaN(num) && num > maxNumber) {
                    maxNumber = num;
                }
            }
        }
    }

    const nextNumber = maxNumber + 1;
    const formattedNumber = nextNumber.toString().padStart(3, '0');
    return `${prefix}${formattedNumber}`;
}
