'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Printer, Download, Plus, Trash2, RotateCcw, FileText, Layers, Save, ArrowLeft, Shield, Truck, Navigation } from 'lucide-react';
import { logout } from '@/app/actions/auth';
import Cookies from 'js-cookie';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AddressAutocomplete from './AddressAutocomplete';
import { formatGermanAddress } from '@/lib/address-formatter';
import { calculateSubtotal, calculateTax, calculateTotal, InvoiceItem } from '@/lib/invoice-calculations';

export default function InvoiceGenerator() {
    const t = useTranslations('Invoice');
    const locale = useLocale();
    const router = useRouter();

    const [customerName, setCustomerName] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [invoiceNr, setInvoiceNr] = useState('RE-' + new Date().getFullYear() + '-001');

    const searchParams = useSearchParams();
    const requestId = searchParams.get('request_id');

    useEffect(() => {
        if (requestId) {
            loadRequestData(requestId);
        }
    }, [requestId]);

    async function loadRequestData(id: string) {
        if (id === 'demo-request') {
            setCustomerName('Max Mustermann');
            setCustomerAddress(formatGermanAddress('Musterstraße 12, 10115 Berlin'));
            setFromAddress(formatGermanAddress('Musterstraße 12, 10115 Berlin'));
            setToAddress(formatGermanAddress('Beispielweg 99, 20095 Hamburg'));
            setDistance('290');
            setFloor('2');
            setElevator('No');
            setCustomerPhone('+49 123 456789');
            setCustomerEmail('max.mustermann@example.com');

            setItems([
                { id: '1', description: t('movingService'), qty: 5, price: 50 },
                { id: '2', description: t('cartons'), qty: 20, price: 2.5 },
                { id: '3', description: 'Waschmaschine Transport', qty: 1, price: 50 }
            ]);
            return;
        }

        async function loadRequest() {
            if (!id || id === 'demo-request') return;

            // 1. Try to load existing invoice first
            try {
                const invRes = await fetch(`/api/invoices/${id}`);
                const invData = await invRes.ok ? await invRes.json() : { success: false };
                if (invData.success && invData.invoice) {
                    const inv = invData.invoice;
                    setCustomerName(inv.customerName);
                    setCustomerAddress(formatGermanAddress(inv.customerAddress));
                    setFromAddress(formatGermanAddress(inv.fromAddress));
                    setToAddress(formatGermanAddress(inv.toAddress));
                    setFloor(inv.floor);
                    setElevator(inv.elevator);
                    setDistance(inv.distance);
                    setCustomerPhone(inv.customerPhone || '');
                    setCustomerEmail(inv.customerEmail || '');
                    setSource(inv.source || 'Website');
                    setCompanyCity(inv.companyCity || '');
                    setCompanyTaxId(inv.companyTaxId || '040 805 3416 8');
                    setInvoiceNr(inv.invoiceNr);
                    setInvoiceDate(new Date(inv.invoiceDate).toISOString().split('T')[0]);
                    setItems(inv.items);
                    if (inv.tax === 0) setHasTax(false);
                    return; // Exit early if we loaded an existing invoice
                }
            } catch (err) {
                console.error('Error fetching invoice', err);
            }

            // 2. If no existing invoice, generate from request
            try {
                const res = await fetch(`/api/requests/${id}`);
                const data = await res.ok ? await res.json() : { success: false };
                
                if (data.success && data.request) {
                    const r = data.request;
                    setCustomerName(`${r.customer.firstName} ${r.customer.lastName}`);
                    setCustomerAddress(formatGermanAddress(r.addresses.from || '')); // Default billing to 'From'
                    setFromAddress(formatGermanAddress(r.addresses.from));
                    setToAddress(formatGermanAddress(r.addresses.to));
                    setFloor(r.details.floorsFrom ? String(r.details.floorsFrom) : '');
                    setElevator(r.details.elevatorFrom ? 'Yes' : 'No');
                    setCustomerPhone(r.customer.phone || '');
                    setCustomerEmail(r.customer.email || '');

                    // Initialize default item
                    const newItems: InvoiceItem[] = [
                        { id: Date.now().toString(), description: t('movingService') || 'Umzug Service', qty: 1, price: 0 }
                    ];

                    // Map cartons if they exist
                    const cartonsItem = r.items?.find((i: any) => i.key === 'cartons');
                    if (cartonsItem) {
                        newItems.push({
                            id: (Date.now() + 1).toString(),
                            description: t('cartons') || 'Umzugskartons',
                            qty: cartonsItem.qty || 10,
                            price: 0
                        });
                    }

                    setItems(newItems);
                }
            } catch (error) {
                console.error('Error loading request', error);
            }
        }
        loadRequest();
    }

    // New Fields
    const [fromAddress, setFromAddress] = useState('');
    const [toAddress, setToAddress] = useState('');
    const [distance, setDistance] = useState('');
    const [floor, setFloor] = useState('');
    const [elevator, setElevator] = useState('No');

    // Customer Contact & Source
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [source, setSource] = useState('Website');
    const [companyCity, setCompanyCity] = useState('');
    const [companyTaxId, setCompanyTaxId] = useState('040 805 3416 8');

    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const [items, setItems] = useState<InvoiceItem[]>([
        { id: '1', description: t('movingService'), qty: 1, price: 0 }
    ]);

    const addItem = () => {
        setItems([...items, { id: Date.now().toString(), description: '', qty: 1, price: 0 }]);
    };

    const removeItem = (id: string) => {
        setItems(items.filter(i => i.id !== id));
    };

    const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
        setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    const [hasTax, setHasTax] = useState(true);

    const calcSub = () => calculateSubtotal(items);
    const calcTax = () => calculateTax(items, hasTax);
    const calcTotal = () => calculateTotal(items, hasTax);

    const handleSave = async () => {
        if (requestId === 'demo-request') {
            alert('Demo Request - Cannot save');
            return;
        }

        const targetRequestId = requestId || `manual-${Date.now()}`;

        try {
            const res = await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestId: targetRequestId,
                    invoiceNr,
                    invoiceDate: new Date(invoiceDate),
                    customerName,
                    customerAddress,
                    customerPhone,
                    customerEmail,
                    source,
                    companyTaxId,
                    fromAddress,
                    toAddress,
                    distance,
                    floor,
                    elevator,
                    items,
                    subtotal: calcSub(),
                    tax: calcTax(),
                    total: calcTotal()
                })
            });
            const data = await res.json();
            if (data.success) {
                if (data.newInvoiceNr) {
                    setInvoiceNr(data.newInvoiceNr);
                }
                // If it was a new manual invoice, update the URL so we are now editing it
                if (!requestId) {
                    router.replace(`/${locale}/invoice?request_id=${targetRequestId}`);
                }
                setToastMessage('Rechnung erfolgreich gespeichert!');
                setTimeout(() => setToastMessage(null), 3000);
            } else {
                setToastMessage(t('saveError') || 'Fehler beim Speichern: ' + data.error);
                setTimeout(() => setToastMessage(null), 5000);
            }
        } catch (error) {
            console.error('Error saving invoice', error);
            alert('Error saving invoice');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const resetForm = () => {
        if (confirm('Reset form?')) {
            setCustomerName('');
            setCustomerAddress('');
            setCustomerPhone('');
            setCustomerEmail('');
            setSource('Website');
            setCompanyTaxId('040 805 3416 8');
            setCompanyCity('');
            setFromAddress('');
            setToAddress('');
            setDistance('');
            setFloor('');
            setItems([{ id: '1', description: t('movingService'), qty: 1, price: 0 }]);
        }
    };

    const handleLogout = async () => {
        await logout();
        Cookies.remove('admin_session');
        router.refresh();
        router.push('/');
    };

    // Auto-fill templates
    const applyTemplate = (type: string) => {
        let desc = '';
        switch (type) {
            case 'moving': desc = t('movingService'); break;
            case 'clearance': desc = t('clearanceService'); break;
            case 'transport': desc = t('furnitureTransport'); break;
            case 'kitchen': desc = t('kitchenAssembly'); break;
        }
        if (desc) {
            setItems([...items, { id: Date.now().toString(), description: desc, qty: 1, price: 0 }]);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] p-4 font-sans print:p-0 print:bg-white text-gray-900 dark:text-white transition-colors duration-300">

            {/* Header / Navigation */}
            <div className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-[#FFC107] flex items-center gap-2">
                    <Printer className="text-[#FFC107]" />
                    {requestId ? t('editInvoice') || 'Rechnung bearbeiten' : t('title')}
                </h1>
                <div className="flex flex-wrap justify-center gap-3 w-full sm:w-auto">
                    {/* Back to Dashboard Button for Admins */}
                    <Link
                        href={`/${locale}/admin/requests`}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2 transition font-medium shadow-sm border border-gray-300 dark:border-gray-700"
                        title={t('backToDashboard') || "Back to Dashboard"}
                    >
                        <ArrowLeft size={18} />
                        <span>{t('backToDashboard') || "Dashboard"}</span>
                    </Link>
                    
                    {/* Action Buttons */}
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg flex items-center gap-2 transition transform hover:scale-105"
                    >
                        <Save size={18} />
                        <span className="hidden sm:inline">Speichern</span>
                    </button>
                    <button
                        onClick={handlePrint}
                        className="px-6 py-2 bg-[#FFC107] hover:bg-[#ffb300] text-black font-bold rounded-lg shadow-lg flex items-center gap-2 transition transform hover:scale-105"
                    >
                        <Printer size={18} />
                        <span className="hidden sm:inline">Drucken / PDF</span>
                        <span className="sm:hidden">Drucken</span>
                    </button>
                </div>
            </div>

            {/* Split View Container - Premium Side-by-Side Layout */}
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12 print:block print:max-w-none">

                {/* 1. INPUT FORM (Hidden in Print) */}
                <div className="w-full lg:w-[45%] bg-white dark:bg-[#1e293b]/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700/50 h-fit print:hidden transition-colors duration-300">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-[#16a34a] mb-4 border-b border-gray-200 dark:border-gray-600/50 pb-3 flex items-center gap-2">
                        <Layers size={20} className="text-[#16a34a]" />
                        {requestId ? t('editInvoice') || 'Rechnung bearbeiten' : t('createTitle')}
                    </h2>

                    <div className="space-y-6">
                        {/* Meta Data */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{t('invoiceDate')}</label>
                                <input
                                    type="date"
                                    value={invoiceDate}
                                    onChange={(e) => setInvoiceDate(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-600 rounded p-2 text-sm text-gray-900 dark:text-white focus:border-[#FFC107] focus:outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{t('invoiceNr')}</label>
                                <input
                                    type="text"
                                    value={invoiceNr}
                                    onChange={(e) => setInvoiceNr(e.target.value)}
                                    placeholder={!requestId ? "Wird automatisch generiert" : ""}
                                    disabled={!requestId}
                                    className="w-full bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-600 rounded p-2 text-sm text-gray-900 dark:text-white focus:border-[#FFC107] focus:outline-none transition-colors disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Steuer-Nr.</label>
                                <input
                                    type="text"
                                    value={companyTaxId}
                                    onChange={(e) => setCompanyTaxId(e.target.value)}
                                    placeholder="z.B. 123/456/789"
                                    className="w-full bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-gray-600 rounded p-2 text-sm text-gray-900 dark:text-white focus:border-[#FFC107] focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        {/* Customer Info & Source */}
                        <div className="space-y-3 p-4 bg-gray-50 dark:bg-[#0f172a] rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-semibold">
                                    <Shield size={16} /> {t('customerInfo')}
                                </div>
                                {/* Source Dropdown */}
                                <select 
                                    value={source} 
                                    onChange={(e) => setSource(e.target.value)}
                                    className="bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-600 text-xs rounded p-1 text-gray-700 dark:text-gray-300 focus:outline-none"
                                >
                                    <option value="Website">Website</option>
                                    <option value="WhatsApp">WhatsApp</option>
                                    <option value="Kleinanzeigen">Kleinanzeigen</option>
                                    <option value="Facebook">Facebook</option>
                                    <option value="Andere">Andere</option>
                                </select>
                            </div>
                            <input
                                type="text"
                                value={customerName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerName(e.target.value)}
                                className="w-full bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-600 rounded p-2 text-sm text-gray-900 dark:text-white focus:border-[#FFC107] focus:outline-none transition-colors"
                                placeholder={t('customerName')}
                            />
                            <AddressAutocomplete
                                placeholder={t('customerAddress')}
                                value={customerAddress}
                                onChange={(val: string) => setCustomerAddress(val)}
                                rows={2}
                                className="w-full bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-600 rounded p-2 text-sm text-gray-900 dark:text-white focus:border-[#FFC107] focus:outline-none transition-colors"
                            />
                            <div className="grid grid-cols-2 gap-3 mt-3">
                                <input
                                    type="text"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    className="w-full bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-600 rounded p-2 text-sm text-gray-900 dark:text-white focus:border-[#FFC107] focus:outline-none transition-colors"
                                    placeholder={t('phone') || 'Telefon'}
                                />
                                <input
                                    type="email"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    className="w-full bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-600 rounded p-2 text-sm text-gray-900 dark:text-white focus:border-[#FFC107] focus:outline-none transition-colors"
                                    placeholder={t('email') || 'E-Mail'}
                                />
                            </div>
                        </div>

                        {/* Move Details */}
                        <div className="space-y-3 p-4 bg-gray-50 dark:bg-[#0f172a] rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
                            <div className="flex items-center gap-2 mb-2 text-[#FFC107] font-semibold">
                                <Truck size={16} /> Details
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <AddressAutocomplete placeholder={t('from')} value={fromAddress} onChange={(val: string) => setFromAddress(val)} rows={2} className="w-full text-sm border-gray-200 dark:border-gray-600 rounded p-2 bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white focus:border-[#FFC107] focus:outline-none transition-colors" />
                                <AddressAutocomplete placeholder={t('to')} value={toAddress} onChange={(val: string) => setToAddress(val)} rows={2} className="w-full text-sm border-gray-200 dark:border-gray-600 rounded p-2 bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white focus:border-[#FFC107] focus:outline-none transition-colors" />
                                <div className="relative">
                                    <input type="number" placeholder={t('distance')} value={distance} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDistance(e.target.value)} className="w-full text-sm border-gray-200 dark:border-gray-600 rounded p-2 ps-8 bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white focus:border-[#FFC107] focus:outline-none transition-colors" />
                                    <Navigation size={14} className="absolute top-3 start-2.5 text-gray-400" />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="text" placeholder={t('floor')} value={floor} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFloor(e.target.value)} className="w-full text-sm border-gray-200 dark:border-gray-600 rounded p-2 bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white focus:border-[#FFC107] focus:outline-none transition-colors" />
                                    <select value={elevator} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setElevator(e.target.value)} className="w-full text-sm border-gray-200 dark:border-gray-600 rounded p-2 bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white focus:border-[#FFC107] focus:outline-none transition-colors">
                                        <option value="No" className="text-black dark:text-white">{t('noElevator')}</option>
                                        <option value="Yes" className="text-black dark:text-white">{t('elevator')}</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Items Manager */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 flex justify-between items-center">
                                <span>{t('items')}</span>
                                <button onClick={addItem} className="text-[#FFC107] hover:text-[#ffb300] text-xs flex items-center gap-1 font-bold transition">
                                    <Plus size={14} /> {t('addItem')}
                                </button>
                            </h3>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-2 items-start bg-gray-50 dark:bg-[#0f172a] p-2 rounded border border-gray-200 dark:border-gray-700 group hover:border-[#FFC107] transition transition-colors">
                                        <input
                                            type="text"
                                            value={item.description}
                                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                            className="flex-grow min-w-0 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-[#FFC107] outline-none text-sm py-1 text-gray-900 dark:text-white transition-colors"
                                            placeholder={t('desc')}
                                        />
                                        <input
                                            type="number"
                                            value={item.price}
                                            onChange={(e) => updateItem(item.id, 'price', Number(e.target.value))}
                                            className="w-24 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-[#FFC107] outline-none text-sm py-1 text-end text-gray-900 dark:text-white transition-colors"
                                            placeholder={t('total')}
                                        />
                                        <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Totals Manager (Left Sidebar) */}
                        <div className="bg-gray-50 dark:bg-[#0f172a] p-4 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
                            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                                Rechnungsbetrag
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>{t('subtotal')}</span>
                                    <span>{calcSub().toFixed(2)} €</span>
                                </div>
                                <label className="flex items-center justify-between cursor-pointer text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={hasTax}
                                            onChange={(e) => setHasTax(e.target.checked)}
                                            className="w-4 h-4 text-[#FFC107] bg-white border-gray-300 rounded focus:ring-[#FFC107] dark:focus:ring-[#FFC107] dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <span>19% MwSt. berechnen</span>
                                    </div>
                                    <span>{calcTax().toFixed(2)} €</span>
                                </label>
                                <div className="border-t border-gray-300 dark:border-gray-600 pt-2 flex justify-between items-center font-extrabold text-lg text-[#16a34a]">
                                    <span>{t('grandTotal')}</span>
                                    <span>{calcTotal().toFixed(2)} €</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* 2. LIVE PREVIEW (The Paper) */}
                <div className="relative w-full lg:w-[55%] flex justify-center print:block">
                    {/* Floating Mobile Action Buttons */}
                    <div className="lg:hidden fixed bottom-6 right-6 z-50 print:hidden flex flex-col gap-3">
                        <button 
                            onClick={handlePrint} 
                            className="bg-[#FFC107] p-4 rounded-full shadow-xl flex items-center justify-center text-black transform hover:scale-110 transition-transform"
                        >
                            <Printer size={24} />
                        </button>
                        <button 
                            onClick={handleSave} 
                            className="bg-green-600 p-4 rounded-full shadow-xl flex items-center justify-center text-white transform hover:scale-110 transition-transform"
                        >
                            <Save size={24} />
                        </button>
                    </div>

                    {/* Responsive Zoom Style for Preview */}
                    <style dangerouslySetInnerHTML={{ __html: `
                        .a4-paper { zoom: 1; }
                        @media (max-width: 1536px) { .a4-paper { zoom: 0.85; } }
                        @media (max-width: 1280px) { .a4-paper { zoom: 0.65; } }
                        @media (max-width: 1024px) { .a4-paper { zoom: 0.9; } }
                        @media (max-width: 768px) { .a4-paper { zoom: 0.75; } }
                        @media (max-width: 640px) { .a4-paper { zoom: 0.55; } }
                        @media (max-width: 480px) { .a4-paper { zoom: 0.45; } }
                        @media print { 
                            @page { margin: 0; size: A4; }
                            body { margin: 0; padding: 0; }
                            .a4-paper { zoom: 1 !important; min-height: 100vh !important; } 
                        }
                    ` }} />

                    <div
                        id="invoice"
                        className="a4-paper bg-white text-black shadow-2xl print:shadow-none print:m-0 relative overflow-hidden"
                        style={{
                            width: '210mm',
                            minHeight: 'auto',
                            fontFamily: 'Arial, sans-serif'
                        }}
                    >
                        {/* Print-specific padding injected via nested style to keep inline styles clean */}
                        <style dangerouslySetInnerHTML={{ __html: `
                            #invoice { padding: 40px; }
                            @media print {
                                #invoice { padding: 15mm 10mm !important; }
                                .avoid-break-inside { page-break-inside: avoid; break-inside: avoid; }
                            }
                        `}} />
                        {/* ---------------- WATERMARK ---------------- */}
                        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
                            <img
                                src="/logo-new-Circle-Ohne-bg.png"
                                alt="Watermark"
                                style={{
                                    width: '62%',
                                    opacity: 0.07,
                                    filter: 'grayscale(20%)',
                                    transform: 'translateY(12%)',
                                }}
                            />
                        </div>
                        {/* ------------------------------------------- */}

                        <div className="relative z-10 flex flex-col min-h-full">

                            {/* TOP SECTION */}
                            <div className="flex-grow">
                                {/* Header: Logo & Company */}
                                <div className="relative flex justify-between items-start border-b-4 border-[#16a34a] pb-6 mb-8 print:pb-2 print:mb-4">
                                    {/* Left: Company Details */}
                                    <div className="flex flex-col justify-start mt-2 z-10">
                                        <p className="text-xs text-gray-600 leading-tight">
                                            <strong className="text-sm text-[#16a34a]">Zusammen Umzüge</strong><br />
                                            Ihr zuverlässiger Partner.<br />
                                            Zehnthofstrasse 55<br />
                                            55252 Wiesbaden
                                        </p>
                                    </div>
                                    {/* Center: Logo (Absolute to prevent affecting side widths) */}
                                    <div className="absolute left-1/2 -translate-x-1/2 top-0 flex justify-center items-start">
                                        <img src="/Logo-Mit-Webseite-Circle.png" alt="Zusammen Umzüge" className="h-28 w-auto object-contain drop-shadow-sm" />
                                    </div>
                                    {/* Right: Invoice Info */}
                                    <div className="text-end z-10">
                                        <h1 className="text-3xl font-extrabold text-[#16a34a] uppercase tracking-widest mb-2 whitespace-nowrap">{t('invoiceTitle')}</h1>
                                        <p className="text-sm font-bold text-gray-600 whitespace-nowrap"><span className="text-[#16a34a]">{t('invoiceNr')}</span> <span className="text-black text-lg">{invoiceNr || <span className="text-gray-400 italic font-normal text-sm">Wird generiert</span>}</span></p>
                                        {companyTaxId && <p className="text-sm font-bold text-[#16a34a] whitespace-nowrap">Steuer-Nr.: <span className="text-black">{companyTaxId}</span></p>}
                                        <p className="text-sm font-bold text-gray-600 whitespace-nowrap"><span className="text-[#16a34a]">{t('date')}:</span> <span className="text-black">{new Date(invoiceDate).toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-US')}</span></p>
                                    </div>
                                </div>

                                {/* Address Section */}
                                <div className="mb-12 print:mb-4">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-1 print:mb-0.5">{t('customerInfo')}</h3>
                                    <div className="flex justify-between items-center bg-transparent p-4 print:p-2 rounded-lg border border-gray-100">
                                        {/* Receiver */}
                                        <div className="text-base font-bold text-gray-900 leading-relaxed">
                                            {customerName || 'Musterkunde Name'}<br />
                                            <span className="font-normal whitespace-pre-line text-gray-700">
                                                {customerAddress || 'Musterstraße 123\n12345 Musterstadt'}
                                            </span>
                                        </div>

                                        {/* Contact Info */}
                                        <div className="text-end text-sm text-gray-600 space-y-1">
                                            {customerPhone && <p className="whitespace-nowrap"><span className="text-gray-400 mr-2">Tel:</span> <span className="font-bold text-gray-900">{customerPhone}</span></p>}
                                            {customerEmail && <p className="whitespace-nowrap"><span className="text-gray-400 mr-2">E-Mail:</span> <span className="font-bold text-gray-900">{customerEmail}</span></p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Move Details (Yellow Bar) */}
                                <div className="bg-transparent border-s-4 border-[#FFC107] p-4 print:p-2 mb-8 print:mb-4 rounded-e-lg">
                                    <h3 className="text-xs font-bold text-[#b45309] uppercase mb-2 print:mb-1 flex items-center gap-2">
                                        <Truck size={14} /> {t('moveDetails')}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 print:gap-y-1 text-sm print:text-[13px] text-gray-800">
                                        <div className="flex justify-between border-b border-[#FFC107]/20 pb-1 items-start">
                                            <span className="text-gray-500 mt-0.5">{t('from')}:</span>
                                            <span className="font-medium ms-2 text-end whitespace-pre-line">{fromAddress || '-'}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-[#FFC107]/20 pb-1 items-start">
                                            <span className="text-gray-500 mt-0.5">{t('to')}:</span>
                                            <span className="font-medium ms-2 text-end whitespace-pre-line">{toAddress || '-'}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-[#FFC107]/20 pb-1">
                                            <span className="text-gray-500">{t('date')}:</span>
                                            <span className="font-medium text-end">{new Date(invoiceDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-[#FFC107]/20 pb-1">
                                            <span className="text-gray-500">{t('info')}:</span>
                                            <span className="font-medium text-end">
                                                {distance ? `${distance} km` : ''}
                                                {floor ? ` | ${t('floor')} ${floor}` : ''}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Items Table */}
                                <table className="w-full mb-8 print:mb-2">
                                    <thead>
                                        <tr className="bg-transparent text-gray-400 font-bold text-sm print:text-xs uppercase border-b border-gray-200">
                                            <th className="py-3 px-4 print:py-1 text-start rounded-s-md w-16 text-center">Nr.</th>
                                            <th className="py-3 px-4 print:py-1 text-start">Leistungsbeschreibung</th>
                                            <th className="py-3 px-4 print:py-1 text-end rounded-e-md w-32">{t('total')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-700 text-sm">
                                        {items.map((item, index) => (
                                            <tr key={item.id} className="border-b border-gray-100 transition-colors bg-transparent print:text-xs avoid-break-inside">
                                                <td className="py-3 px-4 print:py-1.5 text-center text-gray-400 font-medium">{index + 1}</td>
                                                <td className="py-3 px-4 print:py-1.5 font-medium">{item.description}</td>
                                                <td className="py-3 px-4 print:py-1.5 text-end font-bold text-gray-900">
                                                    {(item.qty * item.price).toFixed(2)} €
                                                </td>
                                            </tr>
                                        ))}
                                        {/* Filler/Empty Rows for visual balance if short */}
                                        {items.length < 3 && Array(3 - items.length).fill(null).map((_, i) => (
                                            <tr key={`empty-${i}`} className="h-12 print:h-6 border-b border-gray-50">
                                                <td colSpan={3}></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* BOTTOM SECTION */}
                            <div className="avoid-break-inside mt-6 print:mt-2">
                                {/* Totals */}
                                <div className="flex justify-end mb-8 print:mb-2">
                                    <div className="bg-transparent p-4 print:p-2 rounded-lg border border-gray-200" style={{ minWidth: '260px', width: '45%' }}>
                                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                                            <span>{t('subtotal')}</span>
                                            <span>{calcSub().toFixed(2)} €</span>
                                        </div>
                                        {hasTax && (
                                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                                <span>{t('tax')}</span>
                                                <span>{calcTax().toFixed(2)} €</span>
                                            </div>
                                        )}
                                        <div className="border-t border-gray-300 my-2 pt-2 flex justify-between items-center gap-4 font-extrabold text-lg text-[#16a34a]">
                                            <span className="whitespace-nowrap">{t('grandTotal')}</span>
                                            <span className="whitespace-nowrap">{calcTotal().toFixed(2)} €</span>
                                        </div>
                                        {!hasTax && (
                                            <div className="text-[10px] text-gray-500 mt-2 text-end italic">
                                                Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer Info */}
                                <div className="mt-6 pt-6 print:mt-1 print:pt-2 border-t border-gray-200">
                                    <div className="flex justify-between items-center bg-transparent p-4 print:p-2 print:py-1.5 rounded-lg border border-gray-200 text-xs print:text-[12px] text-gray-500">
                                        <div>
                                            <h4 className="font-extrabold text-[#16a34a] uppercase mb-2 text-sm">Bankverbindung</h4>
                                            <p className="font-bold text-gray-900 text-sm">Mustapha Benlaaouni</p>
                                            <p className="font-bold text-gray-900 text-sm mb-2">Commerzbank AG</p>
                                            <div className="font-mono bg-white border border-[#16a34a]/30 py-2 px-3 rounded text-black font-extrabold inline-block whitespace-nowrap text-xs tracking-wider shadow-sm">
                                                IBAN: DE25 5504 0022 0231 4730 00
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <h4 className="font-extrabold text-gray-700 uppercase mb-2 print:mb-0.5 text-sm print:text-[14px]">{t('contact')}</h4>
                                            <p>{t('phone')}: <span className="text-[#16a34a] font-extrabold">+49 178 2722300</span></p>
                                            <p>{t('email')}: <span className="text-[#16a34a] font-extrabold">info@zusammen-umzuege.de</span></p>
                                            <p>{t('web')}: <span className="text-[#16a34a] font-extrabold">www.zusammen-umzuege.de</span></p>
                                            <p className="mt-4 print:mt-1 text-lg print:text-sm font-bold text-[#16a34a] italic">{t('footerNote') || 'Vielen Dank für Ihren Auftrag!'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
