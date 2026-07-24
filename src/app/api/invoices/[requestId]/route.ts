import { NextResponse } from 'next/server';
import { getAdminSession } from '@/app/actions/auth';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ requestId: string }> }
) {
    try {
        const session = await getAdminSession();
        if (!session || (session.role !== 'admin' && session.role !== 'superadmin')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        await dbConnect();
        const { requestId } = await params;
        
        const invoice = await Invoice.findOne({ requestId });
        
        if (!invoice) {
            return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, invoice });
    } catch (error: any) {
        console.error('Fetch Invoice Error:', error);
        return NextResponse.json({ success: false, error: 'Interner Serverfehler' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ requestId: string }> }
) {
    try {
        const session = await getAdminSession();
        if (!session || (session.role !== 'admin' && session.role !== 'superadmin')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        await dbConnect();
        const { requestId } = await params;
        
        const deletedInvoice = await Invoice.findOneAndDelete({ requestId });
        
        if (!deletedInvoice) {
            return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Rechnung erfolgreich gelöscht' });
    } catch (error: any) {
        console.error('Delete Invoice Error:', error);
        return NextResponse.json({ success: false, error: 'Interner Serverfehler' }, { status: 500 });
    }
}
