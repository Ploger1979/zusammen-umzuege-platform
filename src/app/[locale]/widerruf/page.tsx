import { useTranslations } from 'next-intl';
import Image from 'next/image';
import WiderrufForm from '@/components/WiderrufForm';

export default function WiderrufPage() {
    const t = useTranslations('Legal');

    return (
        <div className="relative min-h-screen font-sans text-gray-100 selection:bg-blue-500/30">
            {/* Fixed Fullscreen Background Image */}
            <div className="fixed inset-0 w-full h-full -z-10">
                <Image 
                    src="/widerruf-hero.png" 
                    alt="Widerrufsbelehrung Zusammen Umzüge" 
                    fill 
                    className="object-cover object-center scale-105"
                    quality={100}
                    priority
                />
                {/* Deep Overlay */}
                <div className="absolute inset-0 bg-gray-950/85 backdrop-blur-[3px]"></div>
            </div>

            {/* Scrollable Content Area */}
            <main className="relative z-10 container mx-auto px-4 max-w-4xl py-24 md:py-32 print:py-0 print:px-0 print:max-w-none">
                <div className="text-center mb-12 print:hidden">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl uppercase tracking-[0.2em] font-light text-white drop-shadow-[0_0_15px_rgba(96,165,250,0.3)]">
                        {t('revocationTitle')}
                    </h1>
                    <div className="w-20 h-1 bg-blue-400 mx-auto mt-8 opacity-70"></div>
                </div>

                {/* Interactive Widerruf Component */}
                <WiderrufForm />
            </main>
        </div>
    );
}
