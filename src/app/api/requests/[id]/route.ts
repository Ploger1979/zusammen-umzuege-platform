import { NextResponse, NextRequest } from 'next/server';
import { getAdminSession } from '@/app/actions/auth';
import dbConnect from '@/lib/mongodb';
import RequestModel from '@/models/Request';
import Offer from '@/models/Offer';
import Invoice from '@/models/Invoice';

export async function GET(
    _req: Request | NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        await dbConnect();
        const { id } = await params;
        const request = await RequestModel.findById(id);

        if (!request) {
            return NextResponse.json({ error: 'Anfrage nicht gefunden' }, { status: 404 });
        }

        return NextResponse.json({ success: true, request });
    } catch (error) {
        return NextResponse.json({ error: 'Fehler beim Laden', msg: String(error) }, { status: 500 });
    }
}

export async function DELETE(
    _req: Request | NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getAdminSession();
        if (!session || session.role !== 'superadmin') {
            return NextResponse.json({ success: false, error: 'Nur der SuperAdmin darf Anfragen löschen' }, { status: 403 });
        }

        await dbConnect();
        const { id } = await params;

        const deleted = await RequestModel.findByIdAndDelete(id);
        if (!deleted) {
            return NextResponse.json({ success: false, error: 'Anfrage nicht gefunden' }, { status: 404 });
        }

        // Cascade delete any related offer or invoice for this requestId
        try {
            await Offer.deleteMany({ requestId: id });
            await Invoice.deleteMany({ requestId: id });
        } catch (cleanupErr) {
            console.warn('Cascade cleanup warning:', cleanupErr);
        }

        return NextResponse.json({ success: true, message: 'Anfrage und zugehörige Daten erfolgreich gelöscht' });
    } catch (error: any) {
        console.error('Delete Request Error:', error);
        return NextResponse.json({ success: false, error: 'Interner Serverfehler' }, { status: 500 });
    }
}
