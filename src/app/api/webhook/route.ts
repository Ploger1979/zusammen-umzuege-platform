import { NextResponse } from "next/server";
import { sendWhatsAppNotification } from "@/lib/whatsapp";

// ============================================================================
// 1. WEBHOOK VERIFICATION (GET)
// ============================================================================
// Facebook calls this endpoint to verify that the Webhook URL is valid.
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN;

    if (mode && token) {
        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            console.log("WEBHOOK_VERIFIED");
            return new NextResponse(challenge, { status: 200 });
        } else {
            return new NextResponse("Forbidden", { status: 403 });
        }
    }
    
    return new NextResponse("Not Found", { status: 404 });
}

// ============================================================================
// 2. RECEIVE MESSAGES & GEMINI INTEGRATION (POST)
// ============================================================================
export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Check if this is an event from a Page subscription
        if (body.object === "page") {
            // Iterate over each entry - there may be multiple if batched
            for (const entry of body.entry) {
                // Get the message. entry.messaging is an array, but usually contains 1 message
                const webhookEvent = entry.messaging?.[0];
                if (!webhookEvent) continue;

                const senderPsid = webhookEvent.sender.id; // PSID = Page-Scoped ID

                // Check if the event is a message and contains text
                if (webhookEvent.message && webhookEvent.message.text) {
                    const receivedText = webhookEvent.message.text;
                    console.log(`[Webhook] Received message from ${senderPsid}: ${receivedText}`);

                    // 1. Send the message to Gemini AI
                    const aiReply = await getGeminiReply(receivedText);

                    // 2. Process Lead Data if Gemini generated the tag
                    const cleanReply = await processLeadData(aiReply);

                    // 3. Send the clean reply back to the user via Messenger
                    await sendMessengerReply(senderPsid, cleanReply);
                }
            }

            // Return a '200 OK' response to all requests
            return new NextResponse("EVENT_RECEIVED", { status: 200 });
        } else {
            // Return a '404 Not Found' if event is not from a page subscription
            return new NextResponse("Not Found", { status: 404 });
        }
    } catch (error) {
        console.error("Error processing Webhook POST:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

// ============================================================================
// HELPER: Get Reply from Gemini AI
// ============================================================================
async function getGeminiReply(userMessage: string): Promise<string> {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        console.error("GEMINI_API_KEY is missing.");
        return "Entschuldigung, unser KI-Assistent ist momentan offline. Bitte kontaktieren Sie uns direkt per WhatsApp.";
    }

    const systemPrompt = `Du bist ein PRÄZISER Sales-Profi für die Firma 'Zusammen Umzüge' (Messenger Bot).
DEINE MISSIONSREGELN:
1. SPRACHE: Immer Deutsch.
2. STIL: Extrem kurz (max 1-2 Sätze), knackig und freundlich (Messenger-Stil).
3. DATEN-SAMMLUNG: Frage nach Name, Telefon, Von, Nach (keine genauen Straßen).
4. ABSCHLUSS & LEAD-TAG (WICHTIGSTE REGEL):
   Sobald der User Daten nennt (Name, Telefon, Von, Nach), MUSST du am ENDE deiner Antwort diesen Tag einfügen: 
   [LEAD_DATA: Name=..., Phone=..., From=..., To=...]
   Ersetze '...' durch die echten Daten. Wenn Daten fehlen, lass '...' stehen.

User-Nachricht: `;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: [{ role: "user", parts: [{ text: userMessage }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
            })
        });

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        return text || "Ich konnte leider keine passende Antwort finden.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Entschuldigung, es gab ein technisches Problem.";
    }
}

// ============================================================================
// HELPER: Process Lead Data & Send WhatsApp Notification
// ============================================================================
async function processLeadData(aiReply: string): Promise<string> {
    const tagRegex = /\[LEAD_DATA:\s*(.*?)\]/;
    const match = aiReply.match(tagRegex);

    if (match) {
        // We found a lead!
        const leadDataString = match[1]; // e.g., "Name=Max, Phone=123, From=A, To=B"
        
        console.log("🎯 Lead Data Detected in Messenger:", leadDataString);

        // Send a WhatsApp notification to the company owner
        const notificationMessage = `🚨 *Neuer Lead über Facebook Messenger!* 🚨\n\nEin Kunde hat gerade seine Daten im Facebook Chat hinterlassen:\n\n${leadDataString.split(',').map(s => `🔹 ${s.trim()}`).join('\n')}\n\n🤖 _Gesendet vom automatischen Messenger-Assistenten._`;
        
        await sendWhatsAppNotification(notificationMessage);

        // Remove the [LEAD_DATA] tag from the reply so the customer doesn't see it
        return aiReply.replace(tagRegex, '').trim();
    }

    return aiReply;
}

// ============================================================================
// HELPER: Send Reply to Facebook Messenger
// ============================================================================
async function sendMessengerReply(senderPsid: string, responseText: string) {
    const PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    
    // During local development, we might not have the token yet.
    if (!PAGE_ACCESS_TOKEN) {
        console.warn("[Development Mode] FACEBOOK_PAGE_ACCESS_TOKEN not set.");
        console.log(`[Mock Send] To ${senderPsid}: ${responseText}`);
        return;
    }

    const requestBody = {
        recipient: { id: senderPsid },
        message: { text: responseText }
    };

    try {
        const response = await fetch(`https://graph.facebook.com/v20.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errData = await response.json();
            console.error('Error sending Messenger message:', errData);
        } else {
            console.log(`Message successfully sent to PSID ${senderPsid}`);
        }
    } catch (error) {
        console.error('Failed to send Messenger message API:', error);
    }
}
