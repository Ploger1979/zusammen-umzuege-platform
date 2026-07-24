'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const images = [
    '/Bilder-Unsere-Leistungen/07a5c069-c816-4739-b08c-05341ed2f182.jpg',
    '/Bilder-Unsere-Leistungen/1633a422-6bfa-4844-b313-9727d6b3dac1.jpg',
    '/Bilder-Unsere-Leistungen/18733066-d70b-41e1-8d13-9787a2086085.jpg',
    '/Bilder-Unsere-Leistungen/1f1b8ac2-7851-4db6-99a0-7129a6f1a502.jpg',
    '/Bilder-Unsere-Leistungen/5413718067029679939.jpg',
    '/Bilder-Unsere-Leistungen/5413718067029679940.jpg',
    '/Bilder-Unsere-Leistungen/5413718067029679941.jpg',
    '/Bilder-Unsere-Leistungen/5413718067029679942.jpg',
    '/Bilder-Unsere-Leistungen/5413718067029679943.jpg',
    '/Bilder-Unsere-Leistungen/5413718067029679944.jpg',
    '/Bilder-Unsere-Leistungen/55f8bf17-8830-4ed8-911f-f6b70da1b629.jpg',
    '/Bilder-Unsere-Leistungen/9f8fccad-eca5-495d-af1a-d3ebc97db0e9.jpg',
    '/Bilder-Unsere-Leistungen/b1ef8322-abbf-4cb7-8881-cc72dbbc21a8.jpg',
    '/Bilder-Unsere-Leistungen/brand-vans-hero.jpg',
    '/Bilder-Unsere-Leistungen/d68a6842-bb99-4080-b22c-74fafa83405c.jpg',
    '/Bilder-Unsere-Leistungen/e8ec320e-2537-4fc9-a271-a4a5f2cc7e37.jpg',
    '/Bilder-Unsere-Leistungen/eabe8b36-bc18-4ff8-928b-fd61ff9ee78e.jpg',
    '/Bilder-Unsere-Leistungen/f02f12eb-505d-452a-b649-949ffd6cdc1d.jpg',
];

export default function GallerySlider() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [visibleCount, setVisibleCount] = useState(3);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) setVisibleCount(1);
            else if (window.innerWidth < 1024) setVisibleCount(2);
            else setVisibleCount(3);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const slideNext = useCallback(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % images.length);
    }, []);

    const slidePrev = useCallback(() => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            slideNext();
        }, 5000);
        return () => clearInterval(interval);
    }, [slideNext]);

    const getVisibleImages = () => {
        const result = [];
        for (let i = 0; i < visibleCount; i++) {
            result.push({
                src: images[(currentIndex + i) % images.length],
                originalIndex: (currentIndex + i) % images.length
            });
        }
        return result;
    };

    return (
        <section className="py-20 px-4 md:px-8 relative">
            <div className="absolute inset-0 bg-white dark:bg-gray-900 rounded-[4rem] md:rounded-[5rem] shadow-2xl border border-gray-100 dark:border-gray-800 pointer-events-none mx-2 md:mx-4" />
            
            <div className="container mx-auto relative z-10 py-10 md:py-16">
                
                <div className="mb-12 px-8 md:px-16 text-left">
                    <p className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight border-l-8 border-secondary pl-8">
                        Echte Einblicke in unsere täglichen Umzüge
                    </p>
                </div>

                <div className="relative px-2 md:px-16 group/slider">
                    
                    <button 
                        onClick={slidePrev}
                        className="absolute left-0 md:-left-4 top-1/2 -translate-y-1/2 z-20 p-3 md:p-5 rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md text-gray-900 dark:text-white shadow-xl border border-gray-200 dark:border-gray-700 hover:bg-secondary hover:text-white transition-all transform hover:scale-110 active:scale-95 opacity-100 md:opacity-0 group-hover/slider:opacity-100 translate-x-0 md:-translate-x-4 group-hover/slider:translate-x-0"
                        aria-label="Previous image"
                    >
                        <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" strokeWidth={3} />
                    </button>
                    
                    <button 
                        onClick={slideNext}
                        className="absolute right-0 md:-right-4 top-1/2 -translate-y-1/2 z-20 p-3 md:p-5 rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md text-gray-900 dark:text-white shadow-xl border border-gray-200 dark:border-gray-700 hover:bg-secondary hover:text-white transition-all transform hover:scale-110 active:scale-95 opacity-100 md:opacity-0 group-hover/slider:opacity-100 translate-x-0 md:translate-x-4 group-hover/slider:translate-x-0"
                        aria-label="Next image"
                    >
                        <ChevronRight className="w-6 h-6 md:w-8 md:h-8" strokeWidth={3} />
                    </button>

                    <div className="flex gap-4 md:gap-10 overflow-hidden min-h-[400px] md:min-h-[550px]">
                        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
                            {getVisibleImages().map((imgObj, idx) => (
                                <motion.div
                                    key={`gallery-classic-v3-${imgObj.src}-${imgObj.originalIndex}`}
                                    custom={direction}
                                    initial={{ opacity: 0, scale: 0.98, x: direction > 0 ? 50 : -50 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.98, x: direction > 0 ? -50 : 50 }}
                                    transition={{ 
                                        type: 'spring', 
                                        stiffness: 240, 
                                        damping: 26,
                                        opacity: { duration: 0.2 }
                                    }}
                                    className="relative flex-1 min-w-0"
                                >
                                    <div className="w-full h-full rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-2xl border-4 border-gray-50 dark:border-gray-800 bg-gray-100 dark:bg-gray-950 relative group/img">
                                        <Image
                                            src={imgObj.src}
                                            alt={`Zusammen Umzüge Service Image ${imgObj.originalIndex + 1}`}
                                            fill
                                            unoptimized={true}
                                            className="object-cover transition-transform duration-[2s] group-hover/img:scale-110"
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-700" />
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="mt-16 text-center">
                    <p className="text-xl md:text-3xl font-bold text-gray-500 dark:text-gray-400 tracking-wide opacity-80 italic mb-10">
                        Zusammen Umzüge — Qualität, die man sieht.
                    </p>
                    <div className="flex justify-center gap-4">
                        {images.slice(0, Math.ceil(images.length / visibleCount)).map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setDirection(idx * visibleCount > currentIndex ? 1 : -1);
                                    setCurrentIndex(idx * visibleCount);
                                }}
                                className={`h-3 rounded-full transition-all duration-500 ${
                                    Math.floor(currentIndex / visibleCount) === idx 
                                    ? 'w-14 bg-secondary shadow-[0_0_20px_rgba(16,185,129,0.5)]' 
                                    : 'w-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300'
                                }`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
