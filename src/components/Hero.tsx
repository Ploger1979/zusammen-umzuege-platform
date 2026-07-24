import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function Hero() {
    const t = useTranslations('Hero');

    return (
        <section className="relative min-h-[600px] xl:min-h-[700px] flex items-center py-16 md:py-24 overflow-hidden transition-colors duration-500 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-[#111827] dark:to-gray-900">
            
            {/* Unique Brand Background - Full Bleed */}
            <div className="absolute inset-0 z-0">
                {/* Clean Cinematic Gradient: Left shadow only to protect text, leaving image brilliant */}
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/40 to-transparent z-10" />
                <Image 
                    src="/brand-vans-hero.jpg" 
                    alt="Zusammen Umzüge Vans"
                    fill
                    className="object-cover object-top lg:object-[75%_top]"
                    priority
                />
            </div>

            {/* Foreground Content */}
            <div className="container mx-auto px-4 relative z-20">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    
                    <div className="lg:w-[60%] xl:w-[50%] space-y-6 lg:space-y-8 text-center lg:text-left drop-shadow-2xl">
                        
                        <div className="inline-flex items-center gap-2 py-1 px-4 rounded-full bg-white/10 backdrop-blur-md shadow-sm border border-white/20 text-[#F9F8F6] font-bold text-sm tracking-wide">
                            <span className="text-lg">🤝</span> {t('trust')}
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#F9F8F6] leading-[1.15] drop-shadow-lg">
                            {t('title')} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-200">
                                {t('subtitle')}
                            </span>
                        </h1>

                        <p className="text-xl text-[#F0EBE1] max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                            {t('desc')}
                        </p>

                        <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-2">
                            <div className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md p-3 px-4 rounded-xl shadow-sm border border-white/10">
                                <div className="text-xl">🚛</div>
                                <div className="text-sm font-bold text-[#F9F8F6] leading-tight">{t.rich('fastTransport', { br: () => <br /> })}</div>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md p-3 px-4 rounded-xl shadow-sm border border-white/10">
                                <div className="text-xl">🛡️</div>
                                <div className="text-sm font-bold text-[#F9F8F6] leading-tight">{t.rich('fullyInsured', { br: () => <br /> })}</div>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md p-3 px-4 rounded-xl shadow-sm border border-white/10">
                                <div className="text-xl">💶</div>
                                <div className="text-sm font-bold text-[#F9F8F6] leading-tight">{t.rich('fairPrices', { br: () => <br /> })}</div>
                            </div>
                        </div>

                    </div>
                    
                </div>
            </div>
            
        </section>
    );
}
