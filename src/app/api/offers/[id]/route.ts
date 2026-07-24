import { NextResponse } from 'next/server';
import { getAdminSession } from '@/app/actions/auth';
import dbConnect from '@/lib/mongodb';
import Offer from '@/models/Offer';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getAdminSession();
        if (!session || (session.role !== 'admin' && session.role !== 'superadmin')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        await dbConnect();
        const { id } = await params;
        const offer = await Offer.findById(id);

        if (!offer) {
            return NextResponse.json({ success: false, error: 'Offer not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, offer });
    } catch (error: any) {
        console.error('Offer API GET by ID Error:', error);
        return NextResponse.json({ success: false, error: 'Interner Serverfehler' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getAdminSession();
        if (!session || (session.role !== 'admin' && session.role !== 'superadmin')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        await dbConnect();
        const { id } = await params;
        const data = await req.json();

        const offer = await Offer.findByIdAndUpdate(id, data, { new: true });

        if (!offer) {
            return NextResponse.json({ success: false, error: 'Offer not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, offer });
    } catch (error: any) {
        console.error('Offer API PUT Error:', error);
        return NextResponse.json({ success: false, error: 'Interner Serverfehler' }, { status: 500 });
    }
}
