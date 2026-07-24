import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOffer extends Document {
    requestId: string;
    offerNr: string;
    offerDate: Date;
    validUntil: Date;
    
    customerName: string;
    customerAddress: string;
    customerCity: string;
    customerPhone: string;
    customerEmail: string;

    viewingType: 'besichtigung_vor_ort' | 'online_besichtigung' | 'telefonische_beratung';
    greetingText: string;
    
    includedServices: string[];
    inventoryList: string[];
    
    pricing: {
        fixedPrice: number;
        taxMode: 'inkl_mwst' | 'zzgl_mwst';
    };

    legalNote: string;
    changeCondition: string;

    createdAt: Date;
    updatedAt: Date;
}

const OfferSchema: Schema = new Schema({
    requestId: { type: String, required: true },
    offerNr: { type: String, required: true, unique: true },
    offerDate: { type: Date, required: true, default: Date.now },
    validUntil: { type: Date, required: true },
    
    customerName: { type: String, required: true },
    customerAddress: { type: String, default: '' },
    customerCity: { type: String, default: '' },
    customerPhone: { type: String, default: '' },
    customerEmail: { type: String, default: '' },

    viewingType: { 
        type: String, 
        required: true,
        enum: ['besichtigung_vor_ort', 'online_besichtigung', 'telefonische_beratung']
    },
    
    greetingText: { type: String, default: '' },
    
    includedServices: [{ type: String }],
    inventoryList: [{ type: String }],
    
    pricing: {
        fixedPrice: { type: Number, default: 0 },
        taxMode: { 
            type: String, 
            enum: ['inkl_mwst', 'zzgl_mwst'], 
            default: 'inkl_mwst' 
        }
    },

    legalNote: { 
        type: String, 
        default: 'Dieses Angebot ist freibleibend und wird erst nach schriftlicher Auftragsbestätigung verbindlich.' 
    },
    changeCondition: { 
        type: String, 
        default: 'Preisänderungen sind möglich, falls sich Leistungsumfang, Umzugsgut oder Rahmenbedingungen nachträglich ändern.' 
    }
}, { timestamps: true });

const Offer: Model<IOffer> = mongoose.models.Offer || mongoose.model<IOffer>('Offer', OfferSchema);

export default Offer;
