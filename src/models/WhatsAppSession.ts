import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    role: { type: String, required: true, enum: ['user', 'model'] },
    content: { type: String, required: true }
}, { _id: false });

const WhatsAppSessionSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    history: [MessageSchema],
    lastUpdated: {
        type: Date,
        default: Date.now,
        expires: '48h' // Automatically delete session after 48 hours of inactivity
    }
});

export default mongoose.models.WhatsAppSession || mongoose.model('WhatsAppSession', WhatsAppSessionSchema);
