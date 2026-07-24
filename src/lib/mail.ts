import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';

export async function sendPasswordResetEmail(email: string, token: string) {
    const resetLink = `${SITE_URL}/de/reset-password?token=${token}`; // Default to German or dynamic

    // 1. If no SMTP credentials or mock is enabled, log to console (Development/Test Mode)
    if (!SMTP_HOST || !SMTP_USER || process.env.MOCK_EXTERNAL_SERVICES === 'true') {
        console.log('================================================');
        console.log('📧 MOCK EMAIL SERVICE (No SMTP Configured) 📧');
        console.log(`To: ${email}`);
        console.log(`Subject: Password Reset Request`);
        console.log(`Link: ${resetLink}`);
        console.log('================================================');
        return true;
    }

    // 2. Real Email Sending
    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465, // true for 465, false for other ports
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });

    try {
        await transporter.sendMail({
            from: `"Zusammen Umzüge" <${SMTP_USER}>`,
            to: email,
            subject: 'Zusammen Umzüge - Passwort zurücksetzen',
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Passwort zurücksetzen</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td align="center" style="background-color: #111827; padding: 30px;">
                            <h1 style="color: #FFC107; margin: 0; font-size: 24px; font-weight: bold;">Zusammen Umzüge</h1>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #1f2937; margin-top: 0; font-size: 20px;">Passwort zurücksetzen</h2>
                            <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
                                Hallo,
                                <br><br>
                                Wir haben eine Anfrage zum Zurücksetzen Ihres Passworts erhalten. Klicken Sie auf den Button unten, um ein neues Passwort festzulegen.
                            </p>
                            
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center" style="padding-bottom: 24px;">
                                        <a href="${resetLink}" style="background-color: #10B981; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
                                            Neues Passwort erstellen
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
                                Wenn Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail einfach ignorieren.
                                <br>
                                Dieser Link ist 1 Stunde lang gültig.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                                &copy; ${new Date().getFullYear()} Zusammen Umzüge. Alle Rechte vorbehalten.
                                <br>
                                Dies ist eine automatisch generierte E-Mail.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
            `,
        });
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}
