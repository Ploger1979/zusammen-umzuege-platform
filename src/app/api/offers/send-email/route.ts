import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/app/actions/auth';
import nodemailer from 'nodemailer';
import dbConnect from '@/lib/mongodb';
import Offer from '@/models/Offer';

export async function POST(req: NextRequest) {
    try {
        const session = await getAdminSession();
        if (!session || (session.role !== 'admin' && session.role !== 'superadmin')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { offerId, email } = body;

        if (!offerId || !email) {
            return NextResponse.json({ success: false, error: 'Fehlende Daten.' }, { status: 400 });
        }

        await dbConnect();
        const offer = await Offer.findById(offerId);

        if (!offer) {
            return NextResponse.json({ success: false, error: 'Angebot nicht gefunden.' }, { status: 404 });
        }

        // Hostinger SMTP Transporter using info@zusammen-umzuege.de (or SMTP_USER)
        const transporter = nodemailer.createTransport({
            host: 'smtp.hostinger.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            }
        });

        // Force the live domain so that emails sent during local testing 
        // still contain the professional live URLs for the customer.
        const LIVE_DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.zusammenumzuege.de';
        
        const publicLink = `${LIVE_DOMAIN}/de/angebot/${offer._id}`;
        const logoUrl = `${LIVE_DOMAIN}/Logo-Mit-Webseite-Circle.png`;

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; color: #333; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; border-top: 5px solid #16a34a; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                .logo { text-align: center; margin-bottom: 30px; }
                .logo img { height: 80px; }
                h1 { color: #16a34a; font-size: 22px; margin-bottom: 15px; }
                p { line-height: 1.6; font-size: 15px; }
                .button-container { text-align: center; margin: 35px 0; }
                .btn { background-color: #16a34a; color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block; }
                .footer { margin-top: 40px; font-size: 12px; color: #777; text-align: center; border-top: 1px solid #eee; padding-top: 16px; }
                .details-box { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">
                    <img src="${logoUrl}" alt="Zusammen Umzüge Logo">
                </div>
                
                <h1>Ihr Umzugsangebot ist da!</h1>
                
                <p>Guten Tag ${offer.customerName},</p>
                
                <p>vielen Dank für Ihr Vertrauen in Zusammen Umzüge. Basierend auf unseren Besprechungen haben wir Ihr persönliches Festpreis-Angebot (Nr. <strong>${offer.offerNr}</strong>) für Sie erstellt.</p>
                
                <div class="details-box">
                    <strong>Angebotsdetails:</strong><br>
                    Datum: ${new Date(offer.offerDate).toLocaleDateString('de-DE')}<br>
                    Gültig bis: ${new Date(offer.validUntil).toLocaleDateString('de-DE')}
                </div>

                <div class="button-container">
                    <a href="${publicLink}" class="btn">Angebot jetzt ansehen</a>
                </div>
                
                <p>Sie können Ihr Angebot über den oben stehenden Link sicher online ansehen und bei Bedarf als PDF herunterladen.</p>
                
                <p>Für Rückfragen stehen wir Ihnen jederzeit gerne zur Verfügung. Antworten Sie einfach auf diese E-Mail oder rufen Sie uns an.</p>
                
                <p>Mit freundlichen Grüßen,<br>
                <strong>Ihr Team von Zusammen Umzüge</strong></p>

                <div class="footer">
                    Zusammen Umzüge | Mustapha Benlaaouni<br>
                    Zehnthofstrasse 55, 55252 Wiesbaden<br>
                    Tel: +49 178 2722300 | E-Mail: info@zusammen-umzuege.de
                </div>
            </div>
        </body>
        </html>
        `;

        await transporter.sendMail({
            from: `"Zusammen Umzüge" <${process.env.SMTP_USER || 'info@zusammen-umzuege.de'}>`,
            to: email,
            subject: `Ihr Umzugsangebot von Zusammen Umzüge (Nr. ${offer.offerNr})`,
            html: htmlContent,
            replyTo: process.env.SMTP_USER || 'info@zusammen-umzuege.de'
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Email sending error:', error);
        return NextResponse.json({ success: false, error: 'Interner Serverfehler beim Senden der E-Mail.' }, { status: 500 });
    }
}
