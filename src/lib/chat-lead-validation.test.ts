import { describe, it, expect } from 'vitest';
import { isLeadComplete, getMissingLeadFields } from './chat-lead-validation';

describe('Chat Lead Validation', () => {
    it('returns false for an empty lead', () => {
        const lead = { name: '', phone: '', from: '', to: '' };
        expect(isLeadComplete(lead)).toBe(false);
        expect(getMissingLeadFields(lead)).toEqual(['name', 'phone', 'from', 'to']);
    });

    it('returns false for only name', () => {
        const lead = { name: 'John Doe', phone: '', from: '', to: '' };
        expect(isLeadComplete(lead)).toBe(false);
        expect(getMissingLeadFields(lead)).toEqual(['phone', 'from', 'to']);
    });

    it('returns false for name + phone', () => {
        const lead = { name: 'John', phone: '123456', from: '', to: '' };
        expect(isLeadComplete(lead)).toBe(false);
        expect(getMissingLeadFields(lead)).toEqual(['from', 'to']);
    });

    it('returns false for missing from', () => {
        const lead = { name: 'John', phone: '123456', from: '', to: 'Berlin' };
        expect(isLeadComplete(lead)).toBe(false);
        expect(getMissingLeadFields(lead)).toEqual(['from']);
    });

    it('returns false for missing to', () => {
        const lead = { name: 'John', phone: '123456', from: 'Hamburg', to: '' };
        expect(isLeadComplete(lead)).toBe(false);
        expect(getMissingLeadFields(lead)).toEqual(['to']);
    });

    it('returns true for a complete lead', () => {
        const lead = { name: 'John', phone: '123456', from: 'Hamburg', to: 'Berlin' };
        expect(isLeadComplete(lead)).toBe(true);
        expect(getMissingLeadFields(lead)).toEqual([]);
    });

    it('accepts invalid phone because current logic only checks truthiness', () => {
        const lead = { name: 'John', phone: 'not-a-number', from: 'Hamburg', to: 'Berlin' };
        expect(isLeadComplete(lead)).toBe(true);
    });

    it('extra fields do not affect result', () => {
        const lead = { name: 'John', phone: '123', from: 'A', to: 'B', extraInfo: 'Hello' } as any;
        expect(isLeadComplete(lead)).toBe(true);
    });
});
