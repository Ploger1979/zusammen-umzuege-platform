import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRequest extends Document {
    customer: {
        firstName: string;
        lastName: string;
        phone: string;
        email: string;
    };
    moveType: 'privat' | 'firma';
    services: string[];
    addresses: {
        from: string;
        to: string;
    };
    details: {
        floorsFrom: number;
        floorsTo: number;
        elevatorFrom: boolean;
        elevatorTo: boolean;
        parking: boolean;
        assembly: boolean;
        date: Date;
    };
    items: Array<{
        key: string;
        qty: number;
        size?: {
            length?: number;
            width?: number;
            height?: number;
            depth?: number;
        };
        label?: string;
    }>;
    message?: string;
    status: 'new' | 'contacted' | 'scheduled' | 'done';
    createdAt: Date;
}

const RequestSchema: Schema = new Schema({
    customer: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String, required: true },
    },
    moveType: { type: String, enum: ['privat', 'firma'], default: 'privat' },
    services: [{ type: String }],
    addresses: {
        from: { type: String, default: '' },
        to: { type: String, default: '' },
    },
    details: {
        floorsFrom: { type: Number, default: 0 },
        floorsTo: { type: Number, default: 0 },
        elevatorFrom: { type: Boolean, default: false },
        elevatorTo: { type: Boolean, default: false },
        parking: { type: Boolean, default: false },
        assembly: { type: Boolean, default: false },
        date: { type: Date },
    },
    items: [{
        key: String,
        qty: Number,
        size: {
            length: Number,
            width: Number,
            height: Number,
            depth: Number,
        },
        label: String
    }],
    message: String,
    status: { type: String, enum: ['new', 'contacted', 'scheduled', 'done'], default: 'new' },
}, { timestamps: true });

const Request: Model<IRequest> = mongoose.models.Request || mongoose.model<IRequest>('Request', RequestSchema);

export default Request;
