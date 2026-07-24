import { useTranslations } from 'next-intl';
import { Check, Info, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export default function PricingAndDetails() {
    const tDetails = useTranslations('ServiceDetails');
    const tPricing = useTranslations('PricingInfo');
    const locale = useLocale();

    const serviceList = [
        "list.0", "list.1", "list.2", "list.3", "list.4", "list.5", "list.6", "list.7"
    ] as const;

    const reqList = [
        "reqList.0", "reqList.1", "reqList.2", "reqList.3", "reqList.4"
    ] as const;

    return (
        <section className="py-16 bg-white dark:bg-gray-800 transition-colors duration-300">
            <div className="container mx-auto px-4">

                {/* 1. Detailed Services List */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white flex items-center justify-center gap-3">
                        <ClipboardList className="text-primary" size={32} />
                        {tDetails('title')}
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {serviceList.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:shadow-md transition">
                                <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-1 rounded-full flex-shrink-0 mt-1">
                                    <Check size={16} strokeWidth={3} />
                                </div>
                                <span className="font-medium text-gray-800 dark:text-gray-200">{tDetails(item)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-center">

                    {/* 3. Information Needed Card */}
                    <div className="bg-primary-50 dark:bg-gray-700 rounded-2xl p-8 shadow-lg border-2 border-primary-200 dark:border-primary-900 max-w-3xl w-full">
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                            <Info className="text-primary" />
                            {tPricing('reqTitle')}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 mb-6 font-medium">
                            {tPricing('reqSubtitle')}
                        </p>

                        <ul className="space-y-4">
                            {reqList.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <div className="bg-white dark:bg-gray-600 p-1.5 rounded text-secondary shadow-sm mt-0.5">
                                        <Check size={16} />
                                    </div>
                                    <span className="text-gray-700 dark:text-gray-200 text-lg">{tPricing(item)}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-8 pt-6 border-t border-primary-200 dark:border-gray-600">
                            <Link
                                href={`/${locale}/angebot`}
                                className="block w-full text-center bg-primary hover:bg-primary-600 text-white font-bold py-3 px-6 rounded-xl transition shadow hover:shadow-lg"
                            >
                                {tPricing('reqTitle')}
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
