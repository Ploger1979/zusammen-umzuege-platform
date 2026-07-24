import QuoteFormFull from '@/components/QuoteFormFull';
import { Metadata } from 'next';
import { useTranslations } from 'next-intl';

export const metadata: Metadata = {
    title: 'Angebot anfordern | Zusammen Umzüge',
    description: 'Fordern Sie jetzt Ihr unverbindliches Umzugsangebot an. Kostenlos und schnell.',
};

export default function AngebotPage() {
    const t = useTranslations('OfferPage');

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <main className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">{t('title')}</h1>
                        <p className="text-lg text-gray-600">
                            {t('desc')}
                        </p>
                    </div>
                    <QuoteFormFull />
                </div>
            </main>
        </div>
    );
}
