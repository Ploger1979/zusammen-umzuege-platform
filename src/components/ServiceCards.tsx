import { useTranslations } from 'next-intl';
import { Home, Building2, Trash2, Warehouse, Truck, Package } from 'lucide-react';

interface ServiceCardsProps {
    showHeading?: boolean;
}

export default function ServiceCards({ showHeading = true }: ServiceCardsProps) {
    const t = useTranslations('ServiceCards');

    const services = [
        { icon: Home, title: t('private'), desc: t('privateDesc') },
        { icon: Building2, title: t('office'), desc: t('officeDesc') },
        { icon: Trash2, title: t('clearance'), desc: t('clearanceDesc') },
        { icon: Warehouse, title: t('cellar'), desc: t('cellarDesc') },
        { icon: Truck, title: t('transport'), desc: t('transportDesc') },
        { icon: Package, title: t('packing'), desc: t('packingDesc') },
    ];

    return (
        <section id="services" className="py-12 transition-colors duration-300">
            <div className="container mx-auto px-4">
                {showHeading && (
                    <div className="text-center mb-16">
                        <span className="text-secondary font-bold tracking-wider uppercase text-sm">{t('subtitle')}</span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mt-2 mb-4">{t('title')}</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            {t('desc')}
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <div key={index} className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:-translate-y-1">
                            <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-gradient-to-br group-hover:from-primary-600 group-hover:to-secondary group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-lg group-hover:scale-110">
                                <service.icon size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{service.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{service.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
