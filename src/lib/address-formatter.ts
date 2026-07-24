export function formatGermanAddress(address: string): string {
    if (!address) return '';
    // Normalize newlines
    let normalized = address.replace(/\r\n/g, '\n');
    
    // If it already has a newline, assume it's correctly formatted or user formatted it manually
    if (normalized.includes('\n')) {
        return normalized;
    }

    // Regex to match: (Street Number) (PLZ City)
    // German PLZ is exactly 5 digits.
    // E.g., "Gruckingerstr 4 85461 Bockhorn" -> "Gruckingerstr 4", "85461 Bockhorn"
    // E.g., "Musterstraße 12a, 10115 Berlin" -> "Musterstraße 12a", "10115 Berlin"
    
    // We look for 5 digits surrounded by word boundaries
    const plzRegex = /(.*?)[,\s]+(\d{5}\s+.*)/;
    const match = normalized.match(plzRegex);
    
    if (match) {
        const line1 = match[1].trim();
        const line2 = match[2].trim();
        return `${line1}\n${line2}`;
    }
    
    // Fallback: If no PLZ is found, but there is a comma, split by the first comma.
    // e.g., "Katharinenstraße 44, Zwickau" -> "Katharinenstraße 44", "Zwickau"
    const commaIndex = normalized.indexOf(',');
    if (commaIndex !== -1) {
        const line1 = normalized.substring(0, commaIndex).trim();
        const line2 = normalized.substring(commaIndex + 1).trim();
        return `${line1}\n${line2}`;
    }
    
    return normalized;
}

export function formatAddressOneLine(address: string): string {
    if (!address) return '';
    return address.replace(/[\r\n]+/g, ', ').trim();
}
