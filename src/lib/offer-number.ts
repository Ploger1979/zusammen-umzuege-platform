export function getNextOfferNumber(existingOfferNumbers: string[], year?: number): string {
    const currentYear = year || new Date().getFullYear();
    const prefix = `ANG-${currentYear}-`;
    
    let maxNumber = 0;

    for (const offerNr of existingOfferNumbers) {
        if (!offerNr) continue;
        
        if (offerNr.startsWith(prefix)) {
            const parts = offerNr.split('-');
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
