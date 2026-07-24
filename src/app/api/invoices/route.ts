import { NextResponse } from 'next/server';
import { getAdminSession } from '@/app/actions/auth';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import { getNextInvoiceNumber } from '@/lib/invoice-number';

export async function POST(req: Request) {
    try {
        const session = await getAdminSession();
        if (!session || (session.role !== 'admin' && session.role !== 'superadmin')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        await dbConnect();
        const data = await req.json();
        
        // Find if invoice already exists for this request
        let invoice = await Invoice.findOne({ requestId: data.requestId });
        
        if (invoice) {
            // Update existing
            invoice = await Invoice.findOneAndUpdate(
                { requestId: data.requestId },
                data,
                { new: true }
            );
        } else {
            // Create new: Auto-generate invoiceNr based on current year
            const currentYear = new Date().getFullYear();
            const prefix = `RE-${currentYear}-`;
            
            // Fetch ALL invoice numbers for this year to find the true max
            // This is safer than just sort({ invoiceNr: -1 }) which can fail on string sorting "RE-2026-10" vs "RE-2026-2"
            const yearInvoices = await Invoice.find({ 
                invoiceNr: { $regex: `^${prefix}` } 
            }, 'invoiceNr').lean();

            const existingNumbers = yearInvoices.map((inv: any) => inv.invoiceNr);
            
            data.invoiceNr = getNextInvoiceNumber(existingNumbers, currentYear);

            invoice = await Invoice.create(data);
        }

        return NextResponse.json({ success: true, invoice, newInvoiceNr: data.invoiceNr });
    } catch (error: any) {
        console.error('Invoice API Error:', error);
        return NextResponse.json({ success: false, error: 'Interner Serverfehler' }, { status: 500 });
    }
}
