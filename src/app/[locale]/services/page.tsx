'use client';

import ServiceCards from '@/components/ServiceCards';
import MovingLabels from '@/components/MovingLabels';
import GallerySlider from '@/components/GallerySlider';
import PricingAndDetails from '@/components/PricingAndDetails';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function ServicesPage() {
    const t = useTranslations('ServicesPage');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
            
            <main className="py-12 md:py-20">
                <div className="container mx-auto px-4">
                    
                    {/* Unique Professional Banner - Natural Size & Clear Context */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="relative w-full max-w-5xl mx-auto mb-12 overflow-hidden rounded-[2.5rem] shadow-2xl border-4 border-white dark:border-gray-800"
                    >
                        <Image 
                            src="/services-banner-Deutsch.webp" 
                            alt="Zusammen Moving Services Banner"
                            width={1200}
                            height={600}
                            className="w-full h-auto object-contain"
                            priority
                        />
                    </motion.div>

                    {/* Integrated Professional Heading - Clean and Single */}
                    <div className="text-center max-w-4xl mx-auto mb-16">
                        <motion.h1 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight"
                        >
                            {t('heroTitle')}
                        </motion.h1>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                                {t('heroSubtitle').split(' – ')[0]}
                            </p>
                            <span className="inline-flex items-center px-6 py-2 rounded-full bg-secondary/10 dark:bg-secondary/20 text-secondary border border-secondary/20 text-lg md:text-xl font-black tracking-widest uppercase shadow-sm">
                                <span className="mr-2 opacity-50">✦</span>
                                {t('heroSubtitle').split(' – ')[1]}
                                <span className="ml-2 opacity-50">✦</span>
                            </span>
                        </motion.div>
                    </div>

                    {/* Main Content Area - Direct and Focused on Services */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="bg-white dark:bg-gray-900 p-8 md:p-14 rounded-[4rem] shadow-xl border border-gray-100 dark:border-gray-800 mb-20"
                    >
                        {/* No redundant introductory text - Start directly with content */}
                        <ServiceCards showHeading={false} />
                    </motion.div>

                    {/* NEW INNOVATIVE SECTION: COLOR CODED LABELS */}
                    <div className="mb-20">
                        <MovingLabels />
                    </div>

                    {/* PROFESSIONAL IMAGE GALLERY SLIDER */}
                    <div className="mb-20">
                        <GallerySlider />
                    </div>

                    {/* Detailed Pricing & List */}
                    <div className="mb-20">
                        <PricingAndDetails />
                    </div>

                    {/* Professional Contact CTA */}
                    <section className="max-w-4xl mx-auto text-center">
                        <div className="p-12 md:p-16 rounded-[4rem] bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-100 dark:border-gray-700 shadow-2xl">
                            <h2 className="text-3xl md:text-4xl font-black mb-6 dark:text-white">{t('customReq')}</h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mb-10">
                                {t('customDesc')}
                            </p>
                            <div className="flex justify-center">
                                <a href="https://wa.me/491782722300" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black py-4 px-10 rounded-2xl shadow-xl transition-all transform hover:-translate-y-1 hover:scale-105 text-lg">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                    <span>{t('whatsapp')}</span>
                                </a>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
