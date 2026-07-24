import { NextResponse } from 'next/server';
import { getAdminSession } from '@/app/actions/auth';
import dbConnect from '@/lib/mongodb';
import Offer from '@/models/Offer';
import { getNextOfferNumber } from '@/lib/offer-number';

export async function POST(req: Request) {
    try {
        const session = await getAdminSession();
        if (!session || (session.role !== 'admin' && session.role !== 'superadmin')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        await dbConnect();
        const data = await req.json();
        
        // Basic validation
        if (!data.requestId || !data.customerName || !data.viewingType || !data.validUntil) {
            return NextResponse.json({ success: false, error: 'Fehlende Pflichtfelder (requestId, customerName, viewingType, validUntil)' }, { status: 400 });
        }

        // Find if offer already exists for this request
        let offer = await Offer.findOne({ requestId: data.requestId });
        
        if (offer) {
            // Update existing
            offer = await Offer.findOneAndUpdate(
                { requestId: data.requestId },
                data,
                { new: true }
            );
        } else {
            // Create new: Auto-generate offerNr based on current year
            const currentYear = new Date().getFullYear();
            const prefix = `ANG-${currentYear}-`;
            
            // Fetch ALL offer numbers for this year to find the true max
            const yearOffers = await Offer.find({ 
                offerNr: { $regex: `^${prefix}` } 
            }, 'offerNr').lean();

            const existingNumbers = yearOffers.map((off: any) => off.offerNr);
            
            data.offerNr = getNextOfferNumber(existingNumbers, currentYear);

            offer = await Offer.create(data);
        }

        return NextResponse.json({ success: true, offer, newOfferNr: data.offerNr });
    } catch (error: any) {
        console.error('Offer API POST Error:', error);
        return NextResponse.json({ success: false, error: 'Interner Serverfehler' }, { status: 500 });
    }
}
