'use client';
import React from 'react';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';


export default function Footer() {
    const t = useTranslations('Footer');
    const tHeader = useTranslations('Header');

    const getLocalizedPath = (path: string) => `/de${path}`;

    return (
        <footer className="print:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-primary-100 dark:border-gray-800 pt-16 pb-8 transition-all duration-300">
            <div className="container mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                {/* Brand */}
                <div>
                    <Link href="/de" className="flex items-center gap-3 mb-6 group">
                        <div className="relative w-14 h-14 flex-shrink-0">
                            <Image
                                src="/logo-new-transparent.png"
                                alt="Zusammen Umzüge Logo"
                                fill
                                className="object-contain transition-transform group-hover:scale-105 rounded-full"
                            />
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="text-2xl font-extrabold text-[#10b981] dark:text-[#34d399] leading-none tracking-tight group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">Zusammen</span>
                            <span className="text-2xl font-bold text-secondary leading-none tracking-wide">Umzüge</span>
                        </div>
                    </Link>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                        {t('about')}
                    </p>
                    <div className="flex gap-6">
                        <a href="https://www.facebook.com/profile.php?id=61590517277739" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform duration-300">
                            <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="12" fill="#1877F2" />
                                <path d="M14.5 12.01h2l0.5-3h-2.5v-2c0-0.75 0.25-1 1-1h1.5v-3h-2.5c-2.5 0-3.5 1.25-3.5 3.5v2.5h-2v3h2v9h3.5v-9z" fill="white" />
                            </svg>
                        </a>
                        <a href="https://www.instagram.com/zusammen_umzuege" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform duration-300">
                            <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#instagram-gradient-footer)" />
                                <path d="M12 7C9.243 7 7 9.243 7 12S9.243 17 12 17 17 14.757 17 12 14.757 7 12 7ZM12 15C10.346 15 9 13.654 9 12S10.346 9 12 9 15 10.346 15 12 13.654 15 12 15Z" fill="white" />
                                <circle cx="17.5" cy="6.5" r="1.5" fill="white" />
                                <defs>
                                    <linearGradient id="instagram-gradient-footer" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
                                        <stop offset="0" stopColor="#833AB4" />
                                        <stop offset="0.5" stopColor="#FD1D1D" />
                                        <stop offset="1" stopColor="#FCB045" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </a>
                        <a href="https://www.tiktok.com/@zusammen_umzuege" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform duration-300 text-white bg-black rounded-full p-1.5 w-8 h-8 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" stroke="none" />
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Schnellzugriff (Quick Links) */}
                <div>
                    <h4 className="text-gray-900 dark:text-white font-bold text-lg mb-6">{t('quickLinks')}</h4>
                    <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                        <li><Link href={getLocalizedPath('/')} className="hover:text-primary-600 dark:hover:text-secondary transition-colors">{tHeader('home')}</Link></li>
                        <li><Link href={getLocalizedPath('/ueber-uns')} className="hover:text-primary-600 dark:hover:text-secondary transition-colors">{tHeader('about_us')}</Link></li>
                        <li><Link href={getLocalizedPath('/services')} className="hover:text-primary-600 dark:hover:text-secondary transition-colors">{tHeader('services')}</Link></li>
                        <li><Link href={getLocalizedPath('/kontakt')} className="hover:text-primary-600 dark:hover:text-secondary transition-colors">{tHeader('contact')}</Link></li>
                    </ul>
                </div>

                {/* Links */}
                <div>
                    <h4 className="text-gray-900 dark:text-white font-bold text-lg mb-6">{t('legal')}</h4>
                    <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                        <li><Link href={getLocalizedPath('/impressum')} className="hover:text-primary-600 dark:hover:text-secondary transition-colors">{t('imprint')}</Link></li>
                        <li><Link href={getLocalizedPath('/datenschutz')} className="hover:text-primary-600 dark:hover:text-secondary transition-colors">{t('privacy')}</Link></li>
                        <li><Link href={getLocalizedPath('/agb')} className="hover:text-primary-600 dark:hover:text-secondary transition-colors">{t('terms')}</Link></li>
                        <li><Link href={getLocalizedPath('/widerruf')} className="hover:text-primary-600 dark:hover:text-secondary transition-colors">{t('revocation')}</Link></li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h4 className="text-gray-900 dark:text-white font-bold text-lg mb-6">{t('contact')}</h4>
                    <ul className="space-y-3 text-sm">
                        <li className="flex gap-2 text-gray-600 dark:text-gray-400">
                            <span className="text-gray-900 dark:text-white font-medium">{t('address')}:</span>
                            <span>Zehnthofstraße 55<br />55252 Mainz-Kastel</span>
                        </li>
                        <li className="flex gap-2 text-gray-600 dark:text-gray-400">
                            <span className="text-gray-900 dark:text-white font-medium">{t('phone')}:</span>
                            <a href="tel:+491782722300" className="hover:text-secondary transition-colors">01782722300</a>
                        </li>
                        <li className="flex gap-2 text-gray-600 dark:text-gray-400">
                            <span className="text-gray-900 dark:text-white font-medium">{t('email')}:</span>
                            <a href="mailto:info@zusammenumzuege.de" className="hover:text-secondary transition-colors">info@zusammenumzuege.de</a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="container mx-auto px-4 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400 pb-8">
                <p>&copy; 2025 - {new Date().getFullYear()} Zusammen Umzüge. {t('rights')}</p>
            </div>
        </footer>
    );
}


