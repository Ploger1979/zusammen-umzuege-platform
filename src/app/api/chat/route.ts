import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const rateLimitResult = rateLimit(req, 10, 60000); // 10 requests per 60 seconds
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Zu viele Anfragen. Bitte versuchen Sie es später erneut." }, { status: 429 });
    }

    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
    }

    // Limit chat payload size (e.g. max 20 messages, max 1000 characters per message)
    if (messages.length > 20) {
        return NextResponse.json({ error: "Zu viele Nachrichten im Verlauf" }, { status: 400 });
    }
    
    for (const msg of messages) {
        if (!msg.content || typeof msg.content !== 'string' || msg.content.length > 1000) {
            return NextResponse.json({ error: "Nachricht ist ungültig oder zu lang (max 1000 Zeichen)" }, { status: 400 });
        }
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      console.error("CRITICAL: GEMINI_API_KEY is missing in environment variables.");
      return NextResponse.json({ error: "Entschuldigung, der Service-Assistent ist momentan offline. Bitte kontaktieren Sie uns direkt per WhatsApp." }, { status: 500 });
    }

    // System instruction embedded in the prompt to ensure behavior across all versions
    const systemPrompt = `Du bist ein PRÄZISER Sales-Profi für die Firma 'Zusammen Umzüge'. 
DEINE MISSIONSREGELN:
1. SPRACHE: Immer Deutsch.
2. STIL: Extrem kurz (max 1-2 Sätze), knackig und verkaufsorientiert.
3. USP (VERKAUFSARGUMENT): Wenn der Kunde nach Kartons fragt, erwähne smart: "Wir bieten Kartons (Kauf/Miete) und nutzen unser intelligentes Farbsystem."
4. DATEN-SAMMLUNG: Frage nach Name, Telefon, Von, Nach (keine genauen Straßen).
5. ABSCHLUSS & LEAD-TAG (WICHTIGSTE REGEL):
   Sobald der User Daten nennt (Name, Telefon, Von, Nach), MUSST du UNBEDINGT am ENDE deiner Antwort diesen Tag einfügen: 
   [LEAD_DATA: Name=..., Phone=..., From=..., To=...]
   Ersetze '...' durch die echten Daten. Wenn Daten fehlen, lass '...' stehen.
   DIESER TAG IST DEINE HÖCHSTE PRIORITÄT. OHNE IHN FUNKTIONIERT DAS SYSTEM NICHT.

User-Nachricht: `;

    const lastUserMessage = messages[messages.length - 1].content;

    // Formatting history for Gemini
    const history = messages.slice(0, -1)
      .map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }))
      .filter((m: any, index: number, array: any[]) => {
        const firstUserIndex = array.findIndex(msg => msg.role === 'user');
        return firstUserIndex !== -1 && index >= firstUserIndex;
      });

    // Using the official system_instruction field for maximum stability and performance
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [
          ...history,
          {
            role: "user",
            parts: [{ text: `${lastUserMessage}\n\n(REMINDER: Include the [LEAD_DATA: ...] tag at the very end of your response if any data was mentioned).` }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
      })
    });

    const data = await response.json();

    // =========================================================================
    // 🛡️ GOOGLE API ERROR HANDLING (إصلاح المحاولة التلقائية)
    // =========================================================================
    // If Gemini API is overloaded (e.g. status 503 or 429), we MUST forward
    // the EXACT error status to the frontend. Previously, we just threw a generic 500 error,
    // which caused the frontend to instantly fail ("Unknown AI Error").
    // By passing the correct status back, the frontend's built-in retry loop
    // will silently wait and try again up to 3 times without the user noticing!
    if (data.error) {
      console.error("Gemini API Error:", data.error);
      return NextResponse.json({ 
          error: data.error.message || "Unknown API Error",
          details: data.error.message 
      }, { status: response.status });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("Keine Antwort von der KI erhalten");
    }

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("REST API ERROR:", error);
    return NextResponse.json({
      error: "Verbindung fehlgeschlagen",
      details: error.message
    }, { status: 500 });
  }
}
