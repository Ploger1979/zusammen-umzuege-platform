'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Utensils, Bed, Sofa, TreePine } from 'lucide-react';

export default function MovingLabels() {
    const t = useTranslations('MovingLabels');

    const labels = [
        { color: 'bg-red-500', name: t('kitchen'), desc: t('kitchenDesc'), icon: Utensils },
        { color: 'bg-blue-500', name: t('bedroom'), desc: t('bedroomDesc'), icon: Bed },
        { color: 'bg-yellow-400', name: t('living'), desc: t('livingDesc'), icon: Sofa },
        { color: 'bg-green-500', name: t('garden'), desc: t('gardenDesc'), icon: TreePine },
    ];

    return (
        <section className="py-24 bg-white dark:bg-gray-950 transition-colors duration-300">
            <div className="container mx-auto px-4">
                
                <div className="flex flex-col lg:flex-row items-center gap-16 mb-20">
                    <div className="lg:w-1/2">
                        <motion.span 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="text-secondary font-black tracking-widest uppercase text-sm mb-4 block"
                        >
                            Zusammen Innovation
                        </motion.span>
                        <motion.h2 
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight"
                        >
                            {t('title')}
                        </motion.h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                            {t('desc')}
                        </p>
                    </div>

                    {/* Two-Frame Pro Collage System */}
                    <div className="w-full lg:w-[55%] relative grid grid-cols-2 gap-4 md:gap-6 items-center mt-10 lg:mt-0">
                        
                        {/* Frame 1: Left Cadre (The Color System Render) */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="relative w-full aspect-[4/5] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl border-[6px] border-white dark:border-gray-800 hover:scale-[1.02] transition-transform duration-500 z-10"
                        >
                            <Image 
                                src="/neu-box-logo.png" 
                                alt="Zusammen Moving Box with Branded Labels"
                                fill
                                sizes="(max-width: 768px) 50vw, 30vw"
                                className="object-cover object-center"
                            />
                            <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[2rem] md:rounded-[2.5rem] pointer-events-none" />
                        </motion.div>

                        {/* Frame 2: Right Cadre (The Real Life Stack of Boxes) */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="relative w-full aspect-[4/5] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-[6px] border-white dark:border-gray-800 hover:scale-[1.02] transition-transform duration-500 z-10"
                        >
                            <Image 
                                src="/real-boxes-3.jpg"
                                alt="Real Zusammen Umzüge Boxes stacked"
                                fill
                                sizes="(max-width: 768px) 50vw, 30vw"
                                className="object-cover object-center"
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-transparent pointer-events-none mix-blend-multiply" />
                            <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[2rem] md:rounded-[2.5rem] pointer-events-none" />
                        </motion.div>

                        {/* Decorative Ambient Blur (The magic soft glow behind them) */}
                        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-primary-200/50 dark:bg-primary-900/30 rounded-full blur-[80px] -z-10 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {labels.map((label, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-all group flex flex-col h-full"
                        >
                            <div className={`w-20 h-20 ${label.color} rounded-full flex items-center justify-center mb-8 shadow-2xl relative flex-shrink-0`}>
                                <label.icon className="text-white" size={36} strokeWidth={2} />
                                <div className="absolute -inset-2 bg-inherit opacity-20 blur-xl group-hover:opacity-40 transition-opacity rounded-full" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 leading-tight min-h-[4rem] flex items-center">{label.name}</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed flex-grow">{label.desc}</p>
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 mt-auto">
                                <span className={`w-3 h-3 rounded-full ${label.color}`} />
                                10cm Sticker
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}
