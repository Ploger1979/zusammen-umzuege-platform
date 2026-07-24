'use client';

import React, { useState, useEffect, useRef } from 'react';
import { formatGermanAddress } from '@/lib/address-formatter';
import { MapPin } from 'lucide-react';

interface SplitAddressAutocompleteProps {
    nameStreet: string;
    nameCity: string;
    placeholderStreet: string;
    placeholderCity: string;
    required?: boolean;
}

export default function SplitAddressAutocomplete({
    nameStreet,
    nameCity,
    placeholderStreet,
    placeholderCity,
    required = false
}: SplitAddressAutocompleteProps) {
    const [streetVal, setStreetVal] = useState('');
    const [cityVal, setCityVal] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

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

    const handleStreetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setStreetVal(newVal);

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
        let cleanText = suggestion.description.replace(/, Deutschland$/, '').replace(/, Germany$/, '');
        const formatted = formatGermanAddress(cleanText);
        
        const parts = formatted.split('\n');
        if (parts.length >= 2) {
            setStreetVal(parts[0].trim());
            setCityVal(parts[1].trim());
        } else {
            setStreetVal(formatted);
            setCityVal('');
        }
        
        setIsOpen(false);
        setSuggestions([]);
    };

    return (
        <div className="space-y-3 w-full">
            <div className="relative w-full" ref={wrapperRef}>
                <input
                    type="text"
                    name={nameStreet}
                    value={streetVal}
                    onChange={handleStreetChange}
                    onFocus={() => {
                        if (suggestions.length > 0) setIsOpen(true);
                    }}
                    placeholder={placeholderStreet}
                    required={required}
                    autoComplete="off"
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
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
            
            <input
                type="text"
                name={nameCity}
                value={cityVal}
                onChange={(e) => setCityVal(e.target.value)}
                placeholder={placeholderCity}
                required={required}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
            />
        </div>
    );
}
