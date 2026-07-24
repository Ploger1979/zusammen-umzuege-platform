import { NextResponse } from 'next/server';
import { getAdminSession } from '@/app/actions/auth';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';

export async function GET() {
    try {
        const session = await getAdminSession();
        if (!session || (session.role !== 'admin' && session.role !== 'superadmin')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        await dbConnect();
        
        // Return basic info plus customer data to override request name
        const invoices = await Invoice.find({}, { requestId: 1, invoiceNr: 1, total: 1, customerName: 1, customerPhone: 1, customerEmail: 1, invoiceDate: 1, createdAt: 1 }).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, invoices });
    } catch (error: any) {
        console.error('Fetch All Invoices Error:', error);
        return NextResponse.json({ success: false, error: 'Interner Serverfehler' }, { status: 500 });
    }
}
