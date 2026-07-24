import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { sendWhatsAppNotification } from '@/lib/whatsapp';

export async function POST(req: Request) {
  try {
    const rateLimitResult = rateLimit(req, 5, 60000); // 5 requests per 60 seconds
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.' }, { status: 429 });
    }

    const { name, phone, from, to, message } = await req.json();

    if (
        (name && name.length > 100) ||
        (phone && phone.length > 50) ||
        (from && from.length > 200) ||
        (to && to.length > 200) ||
        (message && message.length > 5000)
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

    const safeName = escapeHtml(name);
    const safePhone = escapeHtml(phone);
    const safeFrom = escapeHtml(from);
    const safeTo = escapeHtml(to);
    const safeMsg = escapeHtml(message);

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

    let distanceText = "Nicht angegeben";
    let durationText = "";
    let kalkulationHtml = "";
    let totalCustomerPrice = 0;
    let totalOwnerCost = 0;
    let estimatedProfit = 0;

    // 1. Google Maps Calculation (only if addresses are present)
    if (safeFrom && safeTo && safeFrom !== '...' && safeTo !== '...' && GOOGLE_MAPS_API_KEY) {
      const { calculateMovePrice } = await import('@/lib/pricing');
      const pricing = await calculateMovePrice(safeFrom, safeTo, GOOGLE_MAPS_API_KEY);
      
      if (pricing) {
        distanceText = pricing.distanceText;
        durationText = pricing.durationText;
        kalkulationHtml = pricing.kalkulationHtml;
        totalCustomerPrice = pricing.totalCustomerPrice;
        totalOwnerCost = pricing.totalOwnerCost;
        estimatedProfit = pricing.estimatedProfit;
      }
    }

    if (!RESEND_API_KEY) {
      console.error("Email service not configured");
      return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
    }

    // 2. Send Email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Zusammen Umzüge AI <onboarding@resend.dev>',
        to: ['info@zusammenumzuege.de'], 
        subject: `🚚 Neuer Lead: ${safeName} (${distanceText})`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
            <h1 style="color: #333;">Neuer Umzugs-Lead (Chatbot)</h1>
            <p><strong>Name:</strong> ${safeName}</p>
            <p><strong>Telefon:</strong> ${safePhone}</p>
            <p><strong>Von:</strong> ${safeFrom || '...'}</p>
            <p><strong>Nach:</strong> ${safeTo || '...'}</p>
            
            ${kalkulationHtml}

            <hr style="margin-top: 30px;" />
            <p><strong>Vollständiger Nachrichtenverlauf:</strong></p>
            <div style="background: #f9f9f9; padding: 10px; border-radius: 5px;">
              <pre style="white-space: pre-wrap;">${safeMsg}</pre>
            </div>
            <p style="color: #999; font-size: 12px; margin-top: 20px;">Gesendet von Ihrem Zusammen Umzüge KI-Assistentات.</p>
          </div>
        `,
      }),
    });

    const resendData = await response.json();
    if (response.ok) {
      // --- WhatsApp Notification with Financial Breakdown ---
      const whatsappMsg = `🚨 *Neuer Lead (Chatbot)!* 🚨\n\n` +
                          `👤 *Name:* ${safeName}\n` +
                          `📞 *Telefon:* ${safePhone}\n` +
                          `🏠 *Von:* ${safeFrom || 'N/A'}\n` +
                          `🏢 *Nach:* ${safeTo || 'N/A'}\n\n` +
                          `📊 *KI-Finanzanalyse:*\n` +
                          `🗺️ *Distanz:* ${distanceText} (${durationText})\n` +
                          `💶 *Kundenangebot:* ${totalCustomerPrice > 0 ? totalCustomerPrice.toFixed(2) : '0.00'} €\n` +
                          `📉 *Eigenkosten:* ${totalOwnerCost > 0 ? totalOwnerCost.toFixed(2) : '0.00'} €\n` +
                          `✅ *Gewinn:* +${estimatedProfit > 0 ? estimatedProfit.toFixed(2) : '0.00'} €\n\n` +
                          `💬 *Nachricht:*\n_${safeMsg}_`;

      await sendWhatsAppNotification(whatsappMsg);

      return NextResponse.json({ success: true, id: resendData.id });
    } else {
      console.error("Resend API Error", resendData);
      return NextResponse.json({ error: "Fehler beim Senden" }, { status: response.status });
    }
  } catch (error: any) {
    console.error("Send-Lead Error", error);
    return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
  }
}
