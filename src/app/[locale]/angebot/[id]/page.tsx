import { notFound } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Offer from '@/models/Offer';
import ClientOfferPage from './ClientOfferPage';

export default async function PublicOfferPage({ params }: { params: Promise<{ id: string, locale: string }> }) {
    await dbConnect();
    const { id, locale } = await params;
    
    let offer = null;
    try {
        const doc = await Offer.findById(id).lean();
        if (doc) offer = JSON.parse(JSON.stringify(doc));
    } catch (error) {
        return notFound();
    }

    if (!offer) {
        return notFound();
    }

    return <ClientOfferPage offer={offer} locale={locale} />;
}
