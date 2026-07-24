import { NextResponse } from 'next/server';
import { getAdminSession } from '@/app/actions/auth';
import dbConnect from '@/lib/mongodb';
import Offer from '@/models/Offer';

export async function GET(req: Request, { params }: { params: Promise<{ requestId: string }> }) {
    try {
        const session = await getAdminSession();
        if (!session || (session.role !== 'admin' && session.role !== 'superadmin')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        await dbConnect();
        const { requestId } = await params;
        const offer = await Offer.findOne({ requestId });

        // If no offer exists yet for this request, it's not necessarily an error, just return null
        return NextResponse.json({ success: true, offer });
    } catch (error: any) {
        console.error('Offer API GET by RequestID Error:', error);
        return NextResponse.json({ success: false, error: 'Interner Serverfehler' }, { status: 500 });
    }
}
