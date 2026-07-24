// Safe example of how to send a WhatsApp message using environment variables
// DO NOT hardcode real tokens or phone numbers in this file!

const token = process.env.WHATSAPP_ACCESS_TOKEN;
const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const toPhone = process.env.WHATSAPP_TO_PHONE_NUMBER;

if (!token || !phoneId || !toPhone) {
    console.error("Missing environment variables. Please set WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, and WHATSAPP_TO_PHONE_NUMBER.");
    process.exit(1);
}

fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
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
})
.then(res => res.json())
.then(data => console.log("RESPONSE:", JSON.stringify(data, null, 2)))
.catch(err => console.error("ERROR:", err));
