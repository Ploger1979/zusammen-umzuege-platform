import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/app/actions/auth';
import { rateLimit } from '@/lib/rate-limit';
import dbConnect from '@/lib/mongodb';
import Request from '@/models/Request';
import { z } from 'zod';
import { sendWhatsAppNotification } from '@/lib/whatsapp';
const requestSchema = z.object({
    customer: z.object({
        firstName: z.string().min(1, "Vorname ist erforderlich").max(100),
        lastName: z.string().min(1, "Nachname ist erforderlich").max(100),
        phone: z.string().min(1, "Telefonnummer ist erforderlich").max(50),
        email: z.string().email("Ungültige E-Mail-Adresse").max(150),
    }),
    moveType: z.enum(['privat', 'firma']).optional().default('privat'),
    services: z.array(z.string()).optional().default([]),
    addresses: z.object({
        from: z.string().optional().default(''),
        to: z.string().optional().default(''),
    }).optional().default({ from: '', to: '' }),
    details: z.object({
        floorsFrom: z.number().optional(),
        floorsTo: z.number().optional(),
        elevatorFrom: z.boolean().optional(),
        elevatorTo: z.boolean().optional(),
        parking: z.boolean().optional(),
        assembly: z.boolean().optional(),
        date: z.string().nullable().optional(),
    }).optional().default({}),
    items: z.array(z.object({
        key: z.string(),
        qty: z.number(),
        size: z.object({
            length: z.number().optional(),
            width: z.number().optional(),
            height: z.number().optional(),
            depth: z.number().optional(),
        }).optional(),
        label: z.string().optional()
    })).optional().default([]),
    message: z.string().max(5000).optional(),
});

export async function POST(req: NextRequest) {
    try {
        const rateLimitResult = rateLimit(req, 5, 60000);
        if (!rateLimitResult.success) {
            return NextResponse.json({ error: 'Zu viele Anfragen. Bitte später versuchen.' }, { status: 429 });
        }
        const body = await req.json();
        const result = requestSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: 'Validierungsfehler', details: result.error.format() }, { status: 400 });
        }

        await dbConnect();

        // Transform date string to Date object if present
        const details: any = { ...result.data.details };
        if (details.date) {
            details.date = new Date(details.date);
        }

        const newRequest = await Request.create({
            ...result.data,
            details
        });

        const whatsappMsg = `📦 *Neue große Umzugsanfrage!* 📦\n\n👤 *Kunde:* ${result.data.customer.firstName} ${result.data.customer.lastName}\n📞 *Telefon:* ${result.data.customer.phone}\n🏠 *Von:* ${result.data.addresses?.from || 'N/A'}\n🏢 *Nach:* ${result.data.addresses?.to || 'N/A'}\n\nBitte im Admin-Dashboard prüfen!`;
        await sendWhatsAppNotification(whatsappMsg);

        return NextResponse.json({ success: true, id: newRequest._id }, { status: 201 });
    } catch (error) {
        console.error('API Error', error);
        return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        // role check if needed, but any valid admin session can view requests based on instructions.

        await dbConnect();
        const requests = await Request.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, requests });
    } catch (error) {
        return NextResponse.json({ error: 'Fehler beim Laden', msg: String(error) }, { status: 500 });
    }
}
