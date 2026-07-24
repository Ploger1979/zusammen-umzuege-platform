export interface ChatLead {
    name: string;
    phone: string;
    from: string;
    to: string;
}

/**
 * Checks if the lead has all required fields to be sent to the server.
 * Preserves exact existing behavior: simple truthy check.
 */
export function isLeadComplete(lead: ChatLead): boolean {
    return Boolean(lead.name && lead.phone && lead.from && lead.to);
}

/**
 * Returns an array of missing required field names.
 */
export function getMissingLeadFields(lead: Partial<ChatLead>): string[] {
    const missing: string[] = [];
    if (!lead.name) missing.push('name');
    if (!lead.phone) missing.push('phone');
    if (!lead.from) missing.push('from');
    if (!lead.to) missing.push('to');
    return missing;
}
