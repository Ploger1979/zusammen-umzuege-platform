'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { ArrowLeft, CheckCircle2, Printer, Save, Trash2, Mail, MessageCircle, Plus } from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useRouter, useSearchParams } from 'next/navigation';
import AddressAutocomplete from './AddressAutocomplete';
import { formatGermanAddress } from '@/lib/address-formatter';

const defaultServices = [
    { name: 'Umzugskartons', included: true },
    { name: 'Kleiderboxen', included: true },
    { name: 'Einpackservice', included: false },
    { name: 'Auspackservice', included: false },
    { name: 'Möbelabbau', included: true },
    { name: 'Möbelaufbau', included: true },
    { name: 'Lampendemontage', included: false },
    { name: 'Lampenmontage', included: false },
    { name: 'Transport', included: true },
    { name: 'Platzierung der Möbel am Zielort', included: true }
];

export default function OfferGenerator() {
    const locale = useLocale();
    const searchParams = useSearchParams();
    const requestId = searchParams.get('request_id');

    // States
    const [customerName, setCustomerName] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [customerCity, setCustomerCity] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    
    const [offerDate, setOfferDate] = useState(new Date().toISOString().split('T')[0]);
    
    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + 14);
    const [validUntil, setValidUntil] = useState(validUntilDate.toISOString().split('T')[0]);
    
    const [offerNr, setOfferNr] = useState('');
    const [offerId, setOfferId] = useState('');
    const [viewingType, setViewingType] = useState('besichtigung_vor_ort');
    const [greetingText, setGreetingText] = useState('Sehr geehrte Damen und Herren,\n\nvielen Dank für Ihr Vertrauen in Zusammen Umzüge. Basierend auf unseren Besprechungen erhalten Sie hiermit Ihr persönliches Umzugsangebot.');

    const [includedServices, setIncludedServices] = useState(defaultServices);

    const [inventoryList, setInventoryList] = useState([
        'Schrank', 'Bett', 'Tisch', 'Sofa', 'Waschmaschine', 'Trockner', 'Kühlschrank', 'Kartons', 'Küche optional'
    ]);
    const [newInventoryItem, setNewInventoryItem] = useState('');

    const [fixedPrice, setFixedPrice] = useState(0);
    const [taxMode, setTaxMode] = useState('inkl_mwst');

    const [legalNote, setLegalNote] = useState('Dieses Angebot ist freibleibend und wird erst nach schriftlicher Auftragsbestätigung verbindlich.');
    const [changeCondition, setChangeCondition] = useState('Preisänderungen sind möglich, falls sich Leistungsumfang, Umzugsgut oder Rahmenbedingungen nachträglich ändern.');

    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [showEmailConfirm, setShowEmailConfirm] = useState(false);

    // Initial Load
    useEffect(() => {
        async function loadRequestData(id: string) {
            try {
                // First check if offer already exists
                const offRes = await fetch(`/api/offers/request/${id}`);
                const offData = await offRes.ok ? await offRes.json() : { success: false };
                
                if (offData.success && offData.offer) {
                    const off = offData.offer;
                    setOfferId(off._id);
                    setCustomerName(off.customerName || '');
                    setCustomerAddress(off.customerAddress || '');
                    setCustomerCity(off.customerCity || '');
                    setCustomerPhone(off.customerPhone || '');
                    setCustomerEmail(off.customerEmail || '');
                    setOfferDate(new Date(off.offerDate).toISOString().split('T')[0]);
                    setValidUntil(new Date(off.validUntil).toISOString().split('T')[0]);
                    setOfferNr(off.offerNr);
                    setViewingType(off.viewingType || 'besichtigung_vor_ort');
                    setGreetingText(off.greetingText || '');
                    if (off.includedServices?.length > 0) {
                        setIncludedServices(defaultServices.map(ds => ({
                            name: ds.name,
                            included: off.includedServices.includes(ds.name)
                        })));
                    }
                    if (off.inventoryList?.length > 0) setInventoryList(off.inventoryList);
                    if (off.pricing) {
                        setFixedPrice(off.pricing.fixedPrice || 0);
                        setTaxMode(off.pricing.taxMode || 'inkl_mwst');
                    }
                    setLegalNote(off.legalNote);
                    setChangeCondition(off.changeCondition);
                    return;
                }

                // Load Request details if no offer exists
                const reqRes = await fetch(`/api/requests/${id}`);
                const reqData = await reqRes.ok ? await reqRes.json() : { success: false };
                
                if (reqData.success && reqData.request) {
                    const r = reqData.request;
                    setCustomerName(`${r.customer.firstName} ${r.customer.lastName}`);
                    const formattedAddress = formatGermanAddress(r.addresses.from || '');
                    const addrParts = formattedAddress.split('\n');
                    setCustomerAddress(addrParts[0] || '');
                    setCustomerCity(addrParts[1] || '');
                    setCustomerPhone(r.customer.phone || '');
                    setCustomerEmail(r.customer.email || '');
                }
            } catch (error) {
                console.error('Error loading request data', error);
            }
        }

        if (requestId) {
            loadRequestData(requestId);
        }
    }, [requestId]);

    const toggleService = (index: number) => {
        const newServices = [...includedServices];
        newServices[index].included = !newServices[index].included;
        setIncludedServices(newServices);
    };

    const addInventoryItem = () => {
        if (newInventoryItem.trim()) {
            setInventoryList([...inventoryList, newInventoryItem.trim()]);
            setNewInventoryItem('');
        }
    };

    const removeInventoryItem = (index: number) => {
        setInventoryList(inventoryList.filter((_, i) => i !== index));
    };

    const handlePrint = () => {
        window.print();
    };

    const handleSave = async () => {
        try {
            const activeServices = includedServices.filter(s => s.included).map(s => s.name);
            const payload = {
                requestId: requestId || 'manual',
                offerDate,
                validUntil,
                customerName,
                customerAddress,
                customerCity,
                customerPhone,
                customerEmail,
                viewingType,
                greetingText,
                includedServices: activeServices,
                inventoryList,
                pricing: { fixedPrice, taxMode },
                legalNote,
                changeCondition
            };

            const res = await fetch('/api/offers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                setOfferNr(data.newOfferNr || offerNr);
                setOfferId(data.offer?._id || '');
                setToastMessage('Angebot erfolgreich gespeichert!');
                setTimeout(() => setToastMessage(null), 3000);
            } else {
                setToastMessage('Fehler beim Speichern: ' + data.error);
                setTimeout(() => setToastMessage(null), 5000);
            }
        } catch (error) {
            console.error('Error saving offer', error);
            setToastMessage('Ein Fehler ist aufgetreten.');
        }
    };

    const getSubtitle = () => {
        switch(viewingType) {
            case 'besichtigung_vor_ort': return 'Festpreisangebot nach Besichtigung vor Ort';
            case 'online_besichtigung': return 'Festpreisangebot nach Online-Besichtigung';
            case 'telefonische_beratung': return 'Festpreisangebot nach telefonischer Beratung';
            default: return 'Festpreisangebot nach Besichtigung';
        }
    };

    const handleWhatsAppShare = () => {
        if (!offerId) {
            setToastMessage('Bitte speichern Sie das Angebot zuerst!');
            setTimeout(() => setToastMessage(null), 3000);
            return;
        }
        
        const LIVE_DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.zusammenumzuege.de';
        const publicLink = `${LIVE_DOMAIN}/${locale}/angebot/${offerId}`;
        const msg = `Guten Tag ${customerName},\n\nvielen Dank für Ihr Vertrauen. Hier ist Ihr persönliches Festpreis-Umzugsangebot (Nr. ${offerNr}).\nSie können es unter folgendem Link sicher online ansehen und als PDF herunterladen:\n${publicLink}\n\nBei Fragen stehen wir Ihnen gerne zur Verfügung!\n\nIhr Team von Zusammen Umzüge`;
        
        let targetPhone = customerPhone.replace(/[^0-9+]/g, '');
        if (targetPhone.startsWith('0')) {
            targetPhone = '+49' + targetPhone.substring(1);
        }
        
        const waLink = `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`;
        window.open(waLink, '_blank');
    };

    const handleEmailShare = () => {
        if (!offerId) {
            setToastMessage('Bitte speichern Sie das Angebot zuerst!');
            setTimeout(() => setToastMessage(null), 3000);
            return;
        }
        if (!customerEmail) {
            setToastMessage('Bitte geben Sie eine E-Mail-Adresse für den Kunden ein.');
            setTimeout(() => setToastMessage(null), 3000);
            return;
        }

        setShowEmailConfirm(true);
    };

    const executeEmailShare = async () => {
        setShowEmailConfirm(false);
        setIsSendingEmail(true);
        try {
            const res = await fetch('/api/offers/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ offerId, email: customerEmail })
            });
            const data = await res.json();
            if (data.success) {
                setToastMessage('E-Mail erfolgreich gesendet!');
            } else {
                setToastMessage('Fehler: ' + data.error);
            }
        } catch (error) {
            setToastMessage('Ein Fehler ist aufgetreten beim Senden.');
        }
        setIsSendingEmail(false);
        setTimeout(() => setToastMessage(null), 3000);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] p-4 font-sans print:p-0 print:bg-white text-gray-900 dark:text-white transition-colors duration-300">
            {toastMessage && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded shadow-xl font-medium animate-in fade-in slide-in-from-top-4 print:hidden">
                    {toastMessage}
                </div>
            )}

            {/* Modern Email Confirmation Modal */}
            {showEmailConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm print:hidden animate-in fade-in">
                    <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-100 dark:border-gray-700 animate-in zoom-in-95">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 mb-4 mx-auto">
                            <Mail className="text-blue-600 dark:text-blue-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">Angebot per E-Mail senden</h3>
                        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                            Möchten Sie das Angebot <strong className="text-gray-900 dark:text-white">{offerNr}</strong> jetzt an die E-Mail-Adresse <strong className="text-blue-600 dark:text-blue-400">{customerEmail}</strong> senden?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowEmailConfirm(false)}
                                className="flex-1 py-2.5 rounded-xl font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                            >
                                Abbrechen
                            </button>
                            <button
                                onClick={executeEmailShare}
                                className="flex-1 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-lg shadow-blue-600/30"
                            >
                                Jetzt Senden
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header / Navigation */}
            <div className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-[#16a34a] flex items-center gap-2">
                    <Printer className="text-[#16a34a]" />
                    Umzugsangebot erstellen
                </h1>
                <div className="flex flex-wrap justify-center gap-3 w-full sm:w-auto">
                    {/* Back to Dashboard Button for Admins */}
                    <Link
                        href={`/${locale}/admin/requests`}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2 transition font-medium shadow-sm border border-gray-300 dark:border-gray-700"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft size={18} />
                        <span>Zurück</span>
                    </Link>
                    
                    {/* Action Buttons */}
                    <button
                        onClick={handleWhatsAppShare}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg shadow-sm flex items-center gap-2 transition"
                        title="Teilen via WhatsApp"
                    >
                        <MessageCircle size={18} />
                    </button>
                    <button
                        onClick={handleEmailShare}
                        disabled={isSendingEmail}
                        className={`px-4 py-2 text-white font-bold rounded-lg shadow-sm flex items-center gap-2 transition ${isSendingEmail ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                        title="Teilen via E-Mail"
                    >
                        <Mail size={18} />
                        {isSendingEmail && <span className="text-sm">...</span>}
                    </button>
                    
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-[#16a34a] hover:bg-green-700 text-white font-bold rounded-lg shadow-lg flex items-center gap-2 transition transform hover:scale-105 ml-2"
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

            {/* Split View Container */}
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12 print:block print:max-w-none">
                
                {/* 1. CONTROL PANEL (Left Sidebar) */}
                <div className="w-full lg:w-[45%] flex flex-col gap-6 print:hidden">

                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-3 p-4 bg-gray-50 dark:bg-[#0f172a] rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Basisdaten</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Angebotsdatum</label>
                                <input type="date" value={offerDate} onChange={e => setOfferDate(e.target.value)} className="w-full bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-600 rounded p-2 text-sm text-gray-900 dark:text-white focus:outline-none" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Gültig bis</label>
                                <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} className="w-full bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-600 rounded p-2 text-sm text-gray-900 dark:text-white focus:outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Besichtigungsart</label>
                            <select value={viewingType} onChange={e => setViewingType(e.target.value)} className="w-full bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-600 rounded p-2 text-sm text-gray-900 dark:text-white focus:outline-none">
                                <option value="besichtigung_vor_ort">Besichtigung vor Ort</option>
                                <option value="online_besichtigung">Online-Besichtigung</option>
                                <option value="telefonische_beratung">Telefonische Beratung</option>
                            </select>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-3 p-4 bg-gray-50 dark:bg-[#0f172a] rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Kunde</h3>
                        <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Name des Kunden" className="w-full bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-600 rounded p-2 text-sm text-gray-900 dark:text-white focus:outline-none" />
                        <AddressAutocomplete 
                            placeholder="Straße und Hausnummer" 
                            value={customerAddress} 
                            onChange={(val: string) => {
                                if (val.includes('\n')) {
                                    const parts = val.split('\n');
                                    setCustomerAddress(parts[0]);
                                    setCustomerCity(parts[1] || '');
                                } else {
                                    setCustomerAddress(val);
                                }
                            }} 
                            rows={1} 
                            className="w-full bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-600 rounded p-2 text-sm text-gray-900 dark:text-white focus:outline-none" 
                        />
                        <input type="text" value={customerCity} onChange={e => setCustomerCity(e.target.value)} placeholder="PLZ und Ort" className="w-full bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-600 rounded p-2 text-sm text-gray-900 dark:text-white focus:outline-none" />
                        <div className="grid grid-cols-2 gap-3">
                            <input type="text" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Telefon" className="w-full bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-600 rounded p-2 text-sm text-gray-900 dark:text-white focus:outline-none" />
                            <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="E-Mail" className="w-full bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-600 rounded p-2 text-sm text-gray-900 dark:text-white focus:outline-none" />
                        </div>
                    </div>

                    {/* Texts */}
                    <div className="space-y-3 p-4 bg-gray-50 dark:bg-[#0f172a] rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Texte</h3>
                        <textarea value={greetingText} onChange={e => setGreetingText(e.target.value)} placeholder="Begrüßungstext" rows={3} className="w-full bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-600 rounded p-2 text-sm text-gray-900 dark:text-white focus:outline-none" />
                    </div>

                    {/* Services */}
                    <div className="space-y-3 p-4 bg-gray-50 dark:bg-[#0f172a] rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Inkludierte Leistungen</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {includedServices.map((service, idx) => (
                                <label key={idx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                    <input type="checkbox" checked={service.included} onChange={() => toggleService(idx)} className="w-4 h-4 text-[#16a34a] rounded focus:ring-[#16a34a]" />
                                    {service.name}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Inventory */}
                    <div className="space-y-3 p-4 bg-gray-50 dark:bg-[#0f172a] rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Inventarliste</h3>
                        <div className="flex flex-wrap gap-2">
                            {inventoryList.map((item, idx) => (
                                <div key={idx} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2 py-1 rounded text-sm flex items-center gap-2 text-gray-800 dark:text-white">
                                    {item}
                                    <button onClick={() => removeInventoryItem(idx)} className="text-red-500 hover:text-red-700"><Trash2 size={14}/></button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input type="text" value={newInventoryItem} onChange={e => setNewInventoryItem(e.target.value)} onKeyPress={e => e.key === 'Enter' && addInventoryItem()} placeholder="Neues Element..." className="flex-1 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-600 rounded p-1 text-sm focus:outline-none text-gray-900 dark:text-white" />
                            <button onClick={addInventoryItem} className="bg-[#16a34a] text-white px-2 rounded"><Plus size={16}/></button>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-4 p-4 bg-gray-50 dark:bg-[#0f172a] rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Preise & Optionen</h3>
                        
                        <div className="space-y-2 border-l-2 border-[#16a34a] pl-3 mb-4">
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Festpreis</h4>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Preis (€):</span>
                                <input type="number" value={fixedPrice} onChange={e => setFixedPrice(Number(e.target.value))} className="w-40 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-600 rounded p-2 text-sm text-gray-900 dark:text-white font-bold" />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">MwSt-Modus</label>
                            <select value={taxMode} onChange={e => setTaxMode(e.target.value)} className="w-full bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-600 rounded p-2 text-sm text-gray-900 dark:text-white focus:outline-none">
                                <option value="inkl_mwst">inkl. MwSt.</option>
                                <option value="zzgl_mwst">zzgl. MwSt.</option>
                            </select>
                        </div>
                    </div>

                    {/* Legal */}
                    <div className="space-y-3 p-4 bg-gray-50 dark:bg-[#0f172a] rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Hinweise & Bedingungen</h3>
                        <textarea value={legalNote} onChange={e => setLegalNote(e.target.value)} rows={2} className="w-full bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-600 rounded p-2 text-sm text-gray-900 dark:text-white focus:outline-none" />
                        <textarea value={changeCondition} onChange={e => setChangeCondition(e.target.value)} rows={2} className="w-full bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-600 rounded p-2 text-sm text-gray-900 dark:text-white focus:outline-none" />
                    </div>

                    </div>

                </div>

                {/* 2. LIVE PREVIEW (The Paper) */}
                <div className="relative w-full lg:w-[55%] flex justify-center print:block">
                    {/* Floating Mobile Action Buttons */}
                    <div className="lg:hidden fixed bottom-6 right-6 z-50 print:hidden flex flex-col gap-3">
                        <button 
                            onClick={handleWhatsAppShare} 
                            className="bg-green-500 p-4 rounded-full shadow-xl flex items-center justify-center text-white transform hover:scale-110 transition-transform"
                            title="Teilen via WhatsApp"
                        >
                            <MessageCircle size={24} />
                        </button>
                        <button 
                            onClick={handleEmailShare} 
                            disabled={isSendingEmail}
                            className={`${isSendingEmail ? 'bg-gray-400' : 'bg-blue-600'} p-4 rounded-full shadow-xl flex items-center justify-center text-white transform hover:scale-110 transition-transform`}
                            title="Teilen via E-Mail"
                        >
                            <Mail size={24} />
                        </button>
                        <button 
                            onClick={handlePrint} 
                            className="bg-[#FFC107] p-4 rounded-full shadow-xl flex items-center justify-center text-black transform hover:scale-110 transition-transform"
                        >
                            <Printer size={24} />
                        </button>
                        <button 
                            onClick={handleSave} 
                            className="bg-[#16a34a] p-4 rounded-full shadow-xl flex items-center justify-center text-white transform hover:scale-110 transition-transform"
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
                        body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        .a4-paper { zoom: 0.93 !important; height: auto !important; min-height: auto !important; overflow: visible !important; } 
                    }
                ` }} />

                <div
                    id="offer-paper"
                    className="a4-paper bg-white text-black shadow-2xl print:shadow-none print:m-0 relative overflow-hidden print:overflow-visible"
                    style={{
                        width: '210mm',
                        minHeight: 'auto',
                        fontFamily: 'Arial, sans-serif'
                    }}
                >
                    {/* Print-specific padding injected via nested style */}
                    <style dangerouslySetInnerHTML={{ __html: `
                        #offer-paper { padding: 40px; }
                        @media print {
                            #offer-paper { padding: 10mm 10mm !important; }
                            .avoid-break-inside { page-break-inside: avoid; break-inside: avoid; }
                        }
                    `}} />
                    
                    {/* WATERMARK */}
                    <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden print:overflow-visible">
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

                    {/* Wrap content in flex-col for screen (to push footer down), but block for print (for natural page breaks) */}
                    <div className="relative z-10 flex flex-col h-full print:block">
                        {/* Header: Logo & Company */}
                        <div className="relative flex justify-between items-start border-b-4 border-[#16a34a] pb-6 mb-8 print:pb-2 print:mb-4">
                            <div className="flex flex-col justify-start mt-2 z-10">
                                <p className="text-xs text-gray-600 leading-tight">
                                    <strong className="text-sm text-[#16a34a]">Zusammen Umzüge</strong><br />
                                    Ihr zuverlässiger Partner.<br />
                                    Zehnthofstrasse 55<br />
                                    55252 Wiesbaden
                                </p>
                            </div>
                            <div className="absolute left-1/2 -translate-x-1/2 top-0 flex justify-center items-start">
                                <img src="/Logo-Mit-Webseite-Circle.png" alt="Zusammen Umzüge" className="h-28 w-auto object-contain drop-shadow-sm" />
                            </div>
                            <div className="text-end z-10">
                                <h1 className="text-xl font-extrabold text-[#16a34a] uppercase tracking-wider mb-2 whitespace-nowrap">UMZUGSANGEBOT</h1>
                                <p className="text-sm font-bold text-gray-600 whitespace-nowrap"><span className="text-[#16a34a]">Angebots-Nr.:</span> <span className="text-black text-lg">{offerNr || <span className="text-gray-400 italic font-normal text-sm">Wird generiert</span>}</span></p>
                                <p className="text-sm font-bold text-gray-600 whitespace-nowrap"><span className="text-[#16a34a]">Datum:</span> <span className="text-black">{new Date(offerDate).toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-US')}</span></p>
                                <p className="text-sm font-bold text-gray-600 whitespace-nowrap"><span className="text-[#16a34a]">Gültig bis:</span> <span className="text-black">{new Date(validUntil).toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-US')}</span></p>
                            </div>
                        </div>

                        {/* Customer & Document Titles */}
                        <div className="mb-8 print:mb-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase mb-1 print:mb-0.5">Kundeninformation</h3>
                            <div className="flex justify-between items-start bg-transparent p-4 print:p-2 rounded-lg border border-gray-100">
                                <div className="text-base font-bold text-gray-900 leading-relaxed">
                                    {customerName || 'Musterkunde Name'}<br />
                                    <span className="font-normal whitespace-pre-line text-gray-700">
                                        {customerAddress || 'Musterstraße 123'}
                                        {customerCity && <><br />{customerCity}</>}
                                    </span>
                                </div>
                                <div className="text-end text-sm text-gray-600 space-y-1">
                                    {customerPhone && <p className="whitespace-nowrap"><span className="text-gray-400 mr-2">Tel:</span> <span className="font-bold text-gray-900">{customerPhone}</span></p>}
                                    {customerEmail && <p className="whitespace-nowrap"><span className="text-gray-400 mr-2">E-Mail:</span> <span className="font-bold text-gray-900">{customerEmail}</span></p>}
                                </div>
                            </div>
                        </div>

                        <div className="mb-6 print:mb-3 text-center">
                            <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">Ihr persönliches Umzugsangebot</h2>
                            <p className="text-[#16a34a] font-semibold">{getSubtitle()}</p>
                        </div>

                        <div className="mb-6 print:mb-3 text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                            {greetingText}
                        </div>

                        {/* Two Column Layout for Services and Inventory */}
                        <div className="grid grid-cols-2 gap-8 print:gap-4 mb-8 print:mb-4">
                            <div>
                                <h4 className="font-bold text-[#16a34a] uppercase text-sm mb-3 border-b-2 border-gray-200 pb-1">Inkludierte Leistungen</h4>
                                <ul className="text-sm text-gray-700 space-y-2">
                                    {includedServices.filter(s => s.included).map((service, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <CheckCircle2 size={16} className="text-[#16a34a] flex-shrink-0 mt-0.5" />
                                            <span>{service.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-[#16a34a] uppercase text-sm mb-3 border-b-2 border-gray-200 pb-1">Inventarliste (Auszug)</h4>
                                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                                    {inventoryList.map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Pricing Box */}
                        <div className="flex justify-end mb-8 print:mb-2 avoid-break-inside">
                            <div className="border border-[#16a34a] rounded-lg p-3 bg-green-50/40 w-full max-w-[280px] shadow-sm">
                                <h5 className="font-bold text-lg text-[#16a34a] mb-2">Ihr Festpreis</h5>
                                <div className="pt-2 border-t border-[#16a34a]/20">
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-xs text-gray-600 font-bold uppercase tracking-widest">Gesamt</span>
                                        <div className="text-end">
                                            <span className="text-2xl font-black text-gray-900">{fixedPrice.toFixed(2)} €</span>
                                            <p className="text-[10px] text-gray-500 mt-0.5 font-medium">{taxMode === 'inkl_mwst' ? 'inkl. 19% MwSt.' : 'zzgl. 19% MwSt.'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer & Conditions */}
                        {/* Footer & Conditions - mt-auto pushes to bottom on screen */}
                        <div className="mt-auto pt-6 print:mt-0 print:pt-0">
                            <div className="bg-gray-50 p-4 print:p-2 rounded text-xs text-gray-600 space-y-2 print:space-y-1 border border-gray-100 mb-6 print:mb-2">
                                <p><strong>Hinweis:</strong> {legalNote}</p>
                                <p><strong>Bedingung:</strong> {changeCondition}</p>
                                <p className="pt-2 font-medium text-gray-800">
                                    Zur Bestätigung des Angebots oder bei Fragen antworten Sie einfach auf diese Nachricht oder kontaktieren Sie uns telefonisch.
                                </p>
                            </div>

                            {/* Footer Info matches InvoiceGenerator */}
                            <div className="mt-6 pt-6 print:mt-1 print:pt-1 border-t border-gray-200">
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
                                        <h4 className="font-extrabold text-gray-700 uppercase mb-2 print:mb-0.5 text-sm print:text-[14px]">Kontakt</h4>
                                        <p>Telefon: <span className="text-[#16a34a] font-extrabold">+49 178 2722300</span></p>
                                        <p>E-Mail: <span className="text-[#16a34a] font-extrabold">info@zusammen-umzuege.de</span></p>
                                        <p>Webseite: <span className="text-[#16a34a] font-extrabold">www.zusammen-umzuege.de</span></p>
                                        <p className="mt-4 print:mt-1 text-lg print:text-sm font-bold text-[#16a34a] italic">Wir freuen uns auf Ihren Auftrag!</p>
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
