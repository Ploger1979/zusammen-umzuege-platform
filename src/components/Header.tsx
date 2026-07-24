'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import { ThemeToggle } from './ThemeToggle';
import { LoginStatus } from './LoginStatus';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();
    const t = useTranslations('Header');
    
    // Fixed locale to de
    const locale = 'de';

    // Close menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    const navLinks = [
        { name: t('home'), href: '' },
        { name: t('about_us'), href: 'ueber-uns' },
        { name: t('services'), href: 'services' },
        { name: t('contact'), href: 'kontakt' },
    ];

    const getLocalizedPath = (path: string) => {
        return path ? `/de/${path}` : `/de`;
    };

    const isActive = (path: string) => pathname === getLocalizedPath(path) || (path === '' && pathname === `/de`);

    return (
        <header className="print:hidden sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm border-b border-primary-100 dark:border-gray-800 transition-all duration-300">

            {/* Top Bar (Contact Info) */}
            <div className="bg-primary-50 border-b border-primary-100 hidden md:block dark:bg-gray-900 dark:border-gray-800">
                <div className="container mx-auto px-4 py-1.5 flex justify-between items-center gap-6 text-xs font-medium text-primary-800 dark:text-gray-300">
                    <div className="flex gap-4">
                        <LoginStatus />
                    </div>

                    <div className="flex items-center gap-4 mr-60">
                        <a href="https://www.facebook.com/profile.php?id=61590517277739" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="12" fill="#1877F2" />
                                <path d="M14.5 12.01h2l0.5-3h-2.5v-2c0-0.75 0.25-1 1-1h1.5v-3h-2.5c-2.5 0-3.5 1.25-3.5 3.5v2.5h-2v3h2v9h3.5v-9z" fill="white" />
                            </svg>
                        </a>
                        <a href="https://www.instagram.com/zusammen_umzuege" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#instagram-gradient-header)" />
                                <path d="M12 7C9.243 7 7 9.243 7 12S9.243 17 12 17 17 14.757 17 12 14.757 7 12 7ZM12 15C10.346 15 9 13.654 9 12S10.346 9 12 9 15 10.346 15 12 13.654 15 12 15Z" fill="white" />
                                <circle cx="17.5" cy="6.5" r="1.5" fill="white" />
                                <defs>
                                    <linearGradient id="instagram-gradient-header" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
                                        <stop offset="0" stopColor="#833AB4" />
                                        <stop offset="0.5" stopColor="#FD1D1D" />
                                        <stop offset="1" stopColor="#FCB045" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </a>
                        <a href="https://www.tiktok.com/@zusammen_umzuege" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform bg-black text-white rounded-full p-1 w-5 h-5 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-3 flex justify-between items-center h-20">

                {/* Logo */}
                <Link href="/de" className="flex items-center gap-3 group">
                    <Image src="/logo-new-transparent.png" alt="Zusammen Umzüge" width={60} height={60} className="w-14 h-14 object-contain transition-transform group-hover:scale-105 rounded-full" />
                    <div className="flex flex-col">
                        <span className="text-xl font-extrabold text-[#10b981] dark:text-[#34d399] leading-none tracking-tight group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">Zusammen</span>
                        <span className="text-xl font-bold text-secondary leading-none tracking-wide">Umzüge</span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    <nav className="flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={getLocalizedPath(link.href)}
                                className={clsx(
                                    "text-sm font-semibold transition-all duration-200 relative py-1",
                                    isActive(link.href) ? "text-secondary" : "text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-secondary"
                                )}
                            >
                                {link.name}
                                {isActive(link.href) && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary rounded-full"></span>
                                )}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />

                        <Link
                            href={getLocalizedPath('angebot')}
                            className="group bg-secondary hover:bg-[#0070f3] text-white px-5 py-2.5 rounded-full font-bold transition-colors duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 transform flex items-center gap-2 text-sm"
                        >
                            <span>Schnelles Angebot</span>
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* Mobile menu trigger */}
                <div className="flex items-center gap-3 md:hidden">
                    <ThemeToggle />
                    <button className="text-primary-800 dark:text-gray-200 p-2 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-lg transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {
                isMenuOpen && (
                    <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 absolute w-full shadow-xl animate-in fade-in slide-in-from-top-2 z-50">
                        <nav className="flex flex-col p-4 space-y-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={getLocalizedPath(link.href)}
                                    className={clsx(
                                        "p-3 text-lg font-medium rounded-xl transition-colors flex justify-between items-center",
                                        isActive(link.href) ? "bg-primary-50 dark:bg-gray-800 text-secondary" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    )}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {link.name}
                                    {isActive(link.href) && <ArrowRight size={18} />}
                                </Link>
                            ))}
                            <div className="h-px bg-gray-100 dark:bg-gray-800 my-2"></div>
                            <Link href={getLocalizedPath('angebot')} onClick={() => setIsMenuOpen(false)} className="bg-secondary hover:bg-[#0070f3] transition-colors duration-300 text-white p-3 rounded-xl font-bold text-center shadow-sm block">
                                Schnelles Angebot
                            </Link>
                        </nav>
                    </div>
                )
            }
        </header >
    );
}
