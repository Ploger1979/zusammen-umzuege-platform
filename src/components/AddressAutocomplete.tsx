'use client';

import React, { useState, useEffect, useRef } from 'react';
import { formatGermanAddress } from '@/lib/address-formatter';
import { MapPin } from 'lucide-react';

interface AddressAutocompleteProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    className?: string;
    rows?: number;
}

export default function AddressAutocomplete({ value, onChange, placeholder, className, rows = 2 }: AddressAutocompleteProps) {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchSuggestions = async (input: string) => {
        // Strip newlines for search query
        const query = input.replace(/[\r\n]+/g, ' ').trim();
        if (!query || query.length < 3) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data.success) {
                setSuggestions(data.predictions);
                setIsOpen(true);
            }
        } catch (error) {
            console.error('Failed to fetch address suggestions', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newVal = e.target.value;
        onChange(newVal);

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        
        if (newVal.trim().length > 2) {
            debounceTimeout.current = setTimeout(() => {
                fetchSuggestions(newVal);
            }, 300);
        } else {
            setSuggestions([]);
            setIsOpen(false);
        }
    };

    const handleSelectSuggestion = (suggestion: any) => {
        // Clean up "Deutschland" / "Germany" from the end
        let cleanText = suggestion.description.replace(/, Deutschland$/, '').replace(/, Germany$/, '');
        const formatted = formatGermanAddress(cleanText);
        onChange(formatted);
        setIsOpen(false);
        setSuggestions([]);
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <textarea
                value={value}
                onChange={handleInputChange}
                placeholder={placeholder}
                rows={rows}
                className={`resize-none ${className || ''}`}
            />
            {isOpen && suggestions.length > 0 && (
                <ul className="absolute z-50 w-full bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-600 rounded-md shadow-2xl mt-1 max-h-60 overflow-y-auto">
                    {suggestions.map((s) => (
                        <li 
                            key={s.place_id}
                            onClick={() => handleSelectSuggestion(s)}
                            className="p-3 hover:bg-gray-100 dark:hover:bg-[#0f172a] cursor-pointer text-sm text-gray-800 dark:text-gray-200 flex items-start gap-2 border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors"
                        >
                            <MapPin size={16} className="text-[#16a34a] mt-0.5 flex-shrink-0" />
                            <span>{s.description.replace(/, Deutschland$/, '').replace(/, Germany$/, '')}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
