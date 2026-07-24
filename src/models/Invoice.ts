import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInvoiceItem {
    id: string;
    description: string;
    qty: number;
    price: number;
}

export interface IInvoice extends Document {
    requestId: string;
    invoiceNr: string;
    invoiceDate: Date;
    customerName: string;
    customerAddress: string;
    customerPhone: string;
    customerEmail: string;
    source: string;
    companyOwner: string;
    companyAddress: string;
    companyCity: string;
    companyTaxId: string;
    fromAddress: string;
    toAddress: string;
    distance: string;
    floor: string;
    elevator: string;
    items: IInvoiceItem[];
    subtotal: number;
    tax: number;
    total: number;
    createdAt: Date;
    updatedAt: Date;
}

const InvoiceItemSchema = new Schema({
    id: { type: String, required: true },
    description: { type: String, required: true },
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
});

const InvoiceSchema: Schema = new Schema({
    requestId: { type: String, required: true, unique: true },
    invoiceNr: { type: String, required: true },
    invoiceDate: { type: Date, required: true },
    customerName: { type: String, default: '' },
    customerAddress: { type: String, default: '' },
    customerPhone: { type: String, default: '' },
    customerEmail: { type: String, default: '' },
    source: { type: String, enum: ['Website', 'WhatsApp', 'Kleinanzeigen', 'Facebook', 'Andere'], default: 'Website' },
    companyOwner: { type: String, default: '' },
    companyAddress: { type: String, default: '' },
    companyCity: { type: String, default: '' },
    companyTaxId: { type: String, default: '' },
    fromAddress: { type: String, default: '' },
    toAddress: { type: String, default: '' },
    distance: { type: String, default: '' },
    floor: { type: String, default: '' },
    elevator: { type: String, default: '' },
    items: [InvoiceItemSchema],
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
}, { timestamps: true });

const Invoice: Model<IInvoice> = mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);

export default Invoice;
