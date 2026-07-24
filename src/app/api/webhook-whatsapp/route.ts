import { NextResponse } from "next/server";
import { sendWhatsAppNotification, sendWhatsAppMessageToCustomer } from "@/lib/whatsapp";
import { calculateMovePrice } from "@/lib/pricing";
import connectDB from "@/lib/mongodb";
import WhatsAppSession from "@/models/WhatsAppSession";

// ============================================================================
// 1. WEBHOOK VERIFICATION (GET)
// ============================================================================
// Facebook calls this endpoint to verify that the Webhook URL is valid.
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    // We can use the same verify token or create a new one in .env
    const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN; 

    if (mode && token) {
        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            console.log("WHATSAPP_WEBHOOK_VERIFIED");
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

        // Check if this is an event from WhatsApp API
        if (body.object === "whatsapp_business_account") {
            for (const entry of body.entry) {
                for (const change of entry.changes) {
                    if (change.value && change.value.messages) {
                        const messageItem = change.value.messages[0];
                        
                        // We only process text messages
                        if (messageItem && messageItem.type === "text") {
                            const senderPhone = messageItem.from;
                            const receivedText = messageItem.text.body;
                            
                            console.log(`[WhatsApp Webhook] Message from ${senderPhone}: ${receivedText}`);

                            // Process the message asynchronously so we can return 200 OK to Meta quickly
                            processIncomingWhatsAppMessage(senderPhone, receivedText).catch(console.error);
                        }
                    }
                }
            }
            return new NextResponse("EVENT_RECEIVED", { status: 200 });
        } else {
            return new NextResponse("Not Found", { status: 404 });
        }
    } catch (error) {
        console.error("Error processing WhatsApp Webhook POST:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

// ============================================================================
// HELPER: Process incoming message and manage session
// ============================================================================
async function processIncomingWhatsAppMessage(senderPhone: string, text: string) {
    await connectDB();
    
    // Find or create session
    let session = await WhatsAppSession.findOne({ phoneNumber: senderPhone });
    if (!session) {
        session = new WhatsAppSession({ phoneNumber: senderPhone, history: [] });
    }

    // Add user message to history
    session.history.push({ role: 'user', content: text });

    // Ensure we don't exceed token limits, keep last 20 messages
    if (session.history.length > 20) {
        session.history = session.history.slice(-20);
    }

    // Call Gemini
    const aiReply = await getGeminiReply(session.history);

    // Process Lead Data if present
    const { cleanReply, leadDataString } = await processLeadDataAndCalculatePrice(aiReply, senderPhone, text);

    // Add model reply to history (using clean reply so it doesn't feed the tag back into itself)
    session.history.push({ role: 'model', content: cleanReply });
    session.lastUpdated = new Date();
    await session.save();

    // Send reply to customer on WhatsApp
    await sendWhatsAppMessageToCustomer(senderPhone, cleanReply);

    // Send notification to owner if a lead was generated
    if (leadDataString) {
       // Logic moved inside processLeadDataAndCalculatePrice to avoid double-processing
    }
}

// ============================================================================
// HELPER: Get Reply from Gemini AI
// ============================================================================
async function getGeminiReply(history: any[]): Promise<string> {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        return "Entschuldigung, unser System wird gerade gewartet. Bitte rufen Sie uns direkt an.";
    }

    const systemPrompt = `Du bist ein PRÄZISER Sales-Profi für die Firma 'Zusammen Umzüge' (WhatsApp Bot).
DEINE MISSIONSREGELN:
1. SPRACHE: Immer Deutsch.
2. STIL: Extrem kurz, knackig und freundlich (WhatsApp-Stil). 
3. DATEN-SAMMLUNG: Frage nach Name, Von (Stadt/PLZ), Nach (Stadt/PLZ) und grob was transportiert wird.
4. PREIS: Nenne NIEMALS selbst einen Preis. Sag immer, du berechnest ihn sofort, wenn du alle Daten hast.
5. ABSCHLUSS & LEAD-TAG (WICHTIGSTE REGEL):
   Sobald der User dir Auszugsort (Von) und Einzugsort (Nach) nennt, MUSST du am ENDE deiner Antwort diesen Tag einfügen: 
   [LEAD_DATA: Name=..., Phone=..., From=..., To=...]
   Ersetze '...' durch die echten Daten. Wenn Name fehlt, schreibe 'Kunde'. Phone kannst du leer lassen, das haben wir schon.

Aktueller Kontext: `;

    // Format history for Gemini
    const formattedHistory = history.slice(0, -1).map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
    }));
    const lastUserMessage = history[history.length - 1].content;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: [
                    ...formattedHistory,
                    { role: "user", parts: [{ text: lastUserMessage }] }
                ],
                generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
            })
        });

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        return text || "Ich konnte leider keine passende Antwort finden.";
    } catch (error) {
        console.error("Gemini API Error in WhatsApp Webhook:", error);
        return "Entschuldigung, es gab ein technisches Problem bei der Verarbeitung.";
    }
}

// ============================================================================
// HELPER: Process Lead Data & Calculate Price
// ============================================================================
async function processLeadDataAndCalculatePrice(aiReply: string, senderPhone: string, originalMessage: string): Promise<{cleanReply: string, leadDataString: string | null}> {
    const tagRegex = /\[LEAD_DATA:\s*(.*?)\]/;
    const match = aiReply.match(tagRegex);

    if (match) {
        const leadDataString = match[1];
        console.log("🎯 Lead Data Detected in WhatsApp:", leadDataString);
        
        // Parse the data manually
        const nameMatch = leadDataString.match(/Name=([^,]+)/);
        const fromMatch = leadDataString.match(/From=([^,]+)/);
        const toMatch = leadDataString.match(/To=([^,\]]+)/);
        
        const name = nameMatch ? nameMatch[1].trim() : 'Kunde';
        const from = fromMatch ? fromMatch[1].trim() : '';
        const to = toMatch ? toMatch[1].trim() : '';
          
        let customPriceMessage = "\n\n🎉 *Vielen Dank!* Ich habe Ihre Umzugsdetails erfasst und an unser Team weitergeleitet. Ein Mitarbeiter wird sich in Kürze bei Ihnen melden, um Ihr persönliches Angebot zu besprechen.";
        let ownerNotified = false;
        
        // Calculate price using Google Maps
        if (from && to && from !== '...' && to !== '...') {
             const apiKey = process.env.GOOGLE_MAPS_API_KEY;
             if (apiKey) {
                  const pricing = await calculateMovePrice(from, to, apiKey);
                  if (pricing && pricing.totalCustomerPrice > 0) {
                      // Alert the owner with financial details
                      const ownerMsg = `🚨 *Neuer Lead über WhatsApp Chatbot!* 🚨\n\n` +
                           `👤 *Name:* ${name}\n` +
                           `📞 *Telefon:* ${senderPhone}\n` +
                           `🏠 *Von:* ${from}\n` +
                           `🏢 *Nach:* ${to}\n\n` +
                           `📊 *KI-Finanzanalyse:*\n` +
                           `🗺️ *Distanz:* ${pricing.distanceText} (${pricing.durationText})\n` +
                           `💶 *Kundenangebot:* ${pricing.totalCustomerPrice.toFixed(2)} €\n` +
                           `📉 *Eigenkosten:* ${pricing.totalOwnerCost.toFixed(2)} €\n` +
                           `✅ *Gewinn:* +${pricing.estimatedProfit.toFixed(2)} €\n\n` +
                           `💬 *Letzte Nachricht:*\n_${originalMessage}_`;
                           
                      await sendWhatsAppNotification(ownerMsg);
                      ownerNotified = true;
                  }
              }
        }
        
        // If calculation failed but we still caught a lead, notify owner anyway
        if (!ownerNotified) {
            const ownerMsgFallback = `🚨 *Neuer Lead über WhatsApp Chatbot (Ohne Preis-Kalkulation)!* 🚨\n\n` +
                `👤 *Name:* ${name}\n` +
                `📞 *Telefon:* ${senderPhone}\n` +
                `🏠 *Von:* ${from || 'N/A'}\n` +
                `🏢 *Nach:* ${to || 'N/A'}\n\n` +
                `💬 *Letzte Nachricht:*\n_${originalMessage}_`;
            await sendWhatsAppNotification(ownerMsgFallback);
        }

        // Clean the reply from the tag and append the custom confirmation message
        const cleanReply = aiReply.replace(tagRegex, '').trim() + customPriceMessage;
        return { cleanReply, leadDataString };
    }

    return { cleanReply: aiReply, leadDataString: null };
}
