'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Globe, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const languages = [
        { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    ];

    const switchLanguage = (newLocale: string) => {
        // Simple logic to replace locale segment in path
        // Assumes path starts with /locale or is just /
        // e.g. /de/about -> /en/about
        // e.g. / -> /en (if default)

        let newPath = pathname;
        const segments = pathname.split('/');
        // segments[0] is empty, segments[1] is locale usually if generic middleware

        if (['de', 'en', 'ar'].includes(segments[1])) {
            newPath = `/${newLocale}${pathname.substring(3)}`;
        } else {
            // Path doesn't have locale (e.g. root /), middleware might redirect, 
            // but if we are here we are already likely inside a locale route or at root.
            // If sticky to Plan B (middleware prefixes all), then we just swap.
            // If we are at root / and default is de, we can just go to /newLocale
            newPath = `/${newLocale}${pathname}`;
        }

        // Fix double slashes just in case
        newPath = newPath.replace('//', '/');

        router.push(newPath);
        setIsOpen(false);
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative z-50" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors flex items-center gap-1"
                aria-label="Change Language"
            >
                <Globe size={20} />
                <span className="uppercase text-xs font-bold">{locale}</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden ring-1 ring-black ring-opacity-5"
                    >
                        <div className="py-1">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => switchLanguage(lang.code)}
                                    className={`
                                        w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
                                        ${locale === lang.code ? 'text-primary-600 font-bold bg-primary-50/50 dark:bg-primary-900/20' : 'text-gray-700 dark:text-gray-200'}
                                    `}
                                >
                                    <span className="text-lg">{lang.flag}</span>
                                    <span className="flex-1">{lang.name}</span>
                                    {locale === lang.code && <Check size={16} className="text-primary-600" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
