export async function sendWhatsAppNotification(message: string) {
    if (process.env.MOCK_EXTERNAL_SERVICES === 'true') {
        console.log('[MOCK] WhatsApp Notification Skipped. Content:\n', message);
        return true;
    }

    const token = process.env.WHATSAPP_API_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const toPhone = process.env.WHATSAPP_OWNER_PHONE_NUMBER;

    if (!token || !phoneId || !toPhone) {
        console.warn("WhatsApp API credentials missing in .env.local");
        return false;
    }

    try {
        const response = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: toPhone,
                type: "text",
                text: {
                    body: message
                }
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error("WhatsApp API Error:", data);
            
            // Wenn die Textnachricht wegen der 24-Stunden-Regel fehlschlägt, sende das Template 'hello_world' als Ping
            if (data.error && data.error.code === 131047) {
                 console.log("Attempting to send fallback template due to 24h window restriction...");
                 await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        messaging_product: "whatsapp",
                        to: toPhone,
                        type: "template",
                        template: {
                            name: "hello_world",
                            language: { code: "en_US" }
                        }
                    })
                 });
            }
            return false;
        }

        console.log("WhatsApp message sent successfully:", data);
        return true;
    } catch (err) {
        console.error("Failed to send WhatsApp message:", err);
        return false;
    }
}

export async function sendWhatsAppMessageToCustomer(toPhone: string, message: string) {
    if (process.env.MOCK_EXTERNAL_SERVICES === 'true') {
        console.log(`[MOCK] WhatsApp Message to Customer (${toPhone}) Skipped. Content:\n`, message);
        return true;
    }

    const token = process.env.WHATSAPP_API_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token || !phoneId) {
        console.warn("WhatsApp API credentials missing in .env.local");
        return false;
    }

    try {
        const response = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: toPhone,
                type: "text",
                text: {
                    body: message
                }
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error("WhatsApp API Error (Customer Message):", data);
            return false;
        }

        console.log(`WhatsApp message sent successfully to customer ${toPhone}`);
        return true;
    } catch (err) {
        console.error("Failed to send WhatsApp message to customer:", err);
        return false;
    }
}
