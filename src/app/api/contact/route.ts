import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import nodemailer from 'nodemailer';
import { sendWhatsAppNotification } from '@/lib/whatsapp';
export async function POST(req: NextRequest) {
    try {
        const rateLimitResult = rateLimit(req, 5, 60000); // 5 requests per minute
        if (!rateLimitResult.success) {
            return NextResponse.json({ error: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.' }, { status: 429 });
        }

        const body = await req.json();
        const { firstName, lastName, phone, message } = body;

        // Size Limits
        if (
            (firstName && firstName.length > 100) ||
            (lastName && lastName.length > 100) ||
            (phone && phone.length > 50) ||
            (message && message.length > 3000)
        ) {
            return NextResponse.json({ error: 'Eingabe zu lang.' }, { status: 400 });
        }

        // Simple Input Sanitization (Escaping HTML tags)
        const escapeHtml = (text: string) => {
            if (!text) return '';
            return text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        };

        const safeFirstName = escapeHtml(firstName);
        const safeLastName = escapeHtml(lastName);
        const safePhone = escapeHtml(phone);
        const safeMessage = escapeHtml(message);

        // Validation
        if (!safeFirstName || !safeLastName || !safeMessage) {
            return NextResponse.json(
                { error: 'Bitte alle Pflichtfelder ausfüllen.' },
                { status: 400 }
            );
        }

        // Hostinger SMTP Transporter
        const transporter = nodemailer.createTransport({
            host: 'smtp.hostinger.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            }
        });

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8" />
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f9; }
                .wrapper { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.10); }
                .header { background: linear-gradient(135deg, #1a2d5a 0%, #d97706 100%); padding: 32px 40px; text-align: center; }
                .logo-text { font-size: 22px; font-weight: 900; color: #fcd34d; display: block; margin-bottom: 8px; letter-spacing: 0.5px; }
                .header h1 { color: #fff; font-size: 22px; font-weight: 700; }
                .header p { color: rgba(255,255,255,0.80); font-size: 13px; margin-top: 6px; }
                .body { padding: 36px 40px; }
                .badge { display: inline-block; background: #fef3c7; color: #d97706; font-size: 12px; font-weight: 700; padding: 4px 14px; border-radius: 20px; margin-bottom: 24px; }
                .grid-2 { display: flex; gap: 16px; margin-bottom: 20px; }
                .grid-2 > div { flex: 1; }
                .field { margin-bottom: 20px; }
                .field-label { font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
                .field-value { font-size: 15px; color: #1f2937; font-weight: 500; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 14px; }
                .message-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0; padding: 16px 18px; font-size: 15px; color: #1f2937; line-height: 1.75; white-space: pre-wrap; }
                .divider { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
                .timestamp { font-size: 12px; color: #9ca3af; }
                .timestamp strong { color: #6b7280; }
                .footer { background: #1a2d5a; padding: 22px 40px; text-align: center; }
                .footer p { color: rgba(255,255,255,0.60); font-size: 12px; line-height: 1.7; }
                .footer a { color: #fcd34d; text-decoration: none; font-weight: 600; }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="header">
                    <span class="logo-text">Zusammen Umzüge</span>
                    <h1>📬 Neue Kontaktanfrage</h1>
                    <p>Eine neue Nachricht wurde über das Kontaktformular gesendet.</p>
                </div>
                <div class="body">
                    <div class="badge">📩 Eingehende Nachricht</div>
                    <div class="grid-2">
                        <div>
                            <div class="field-label">Vorname</div>
                            <div class="field-value">${safeFirstName}</div>
                        </div>
                        <div>
                            <div class="field-label">Nachname</div>
                            <div class="field-value">${safeLastName}</div>
                        </div>
                    </div>
                    <div class="field">
                        <div class="field-label">📞 Telefon</div>
                        <div class="field-value">${safePhone || '— Nicht angegeben'}</div>
                    </div>
                    <hr class="divider" />
                    <div class="field">
                        <div class="field-label">💬 Nachricht</div>
                        <div class="message-box">${safeMessage.replace(/\n/g, '<br/>')}</div>
                    </div>
                    <hr class="divider" />
                    <p class="timestamp">📅 Empfangen am: <strong>${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} Uhr</strong></p>
                </div>
                <div class="footer">
                    <p>
                        <a href="https://zusammenumzuege.de">zusammenumzuege.de</a>
                        &nbsp;·&nbsp;
                        <a href="tel:+491782722300">01782 722 300</a>
                    </p>
                    <p style="margin-top:6px;">Zehnthofstraße 55, 55252 Mainz-Kastel</p>
                </div>
            </div>
        </body>
        </html>
        `;

        await transporter.sendMail({
            from: `"Zusammen Umzüge" <${process.env.SMTP_USER}>`,
            to: 'info@zusammenumzuege.de',
            subject: `📬 Neue Anfrage von ${safeFirstName} ${safeLastName}`,
            html: htmlContent,
            text: `Neue Kontaktanfrage\n\nName: ${safeFirstName} ${safeLastName}\nTelefon: ${safePhone || 'Nicht angegeben'}\n\nNachricht:\n${safeMessage}`,
        });

        const whatsappMsg = `📬 *Neue Kontaktanfrage!*\n\n👤 *Name:* ${safeFirstName} ${safeLastName}\n📞 *Telefon:* ${safePhone || 'Nicht angegeben'}\n\n💬 *Nachricht:*\n_${safeMessage}_`;
        await sendWhatsAppNotification(whatsappMsg);

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (err) {
        console.error('[Contact API Error]:', err);
        return NextResponse.json(
            { error: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.' },
            { status: 500 }
        );
    }
}
