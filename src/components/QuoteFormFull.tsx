'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Loader2, Plus, MessageCircle, Armchair } from 'lucide-react';
import SplitAddressAutocomplete from './SplitAddressAutocomplete';

type ItemKey = 'cartons';

interface ItemState {
    active: boolean;
    qty: number;
}

const FURNITURE_CHIPS = [
    'Bett',
    'Schrank',
    'Sofa',
    'Esstisch & Stühle',
    'Waschmaschine',
    'Trockner',
    'Küche',
    'Kühlschrank',
    'Herd',
    'Schreibtisch',
    'TV / Fernseher',
    'Kommode'
];

export default function QuoteFormFull() {
    const t = useTranslations('QuoteFormFull');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [inventoryText, setInventoryText] = useState('');
    const [whatsappUrl, setWhatsappUrl] = useState('');

    // Item States
    const [items, setItems] = useState<Record<ItemKey, ItemState>>({
        cartons: { active: false, qty: 10 },
    });

    const handleAddChip = (item: string) => {
        setInventoryText(prev => {
            const trimmed = prev.trim();
            if (!trimmed) return `• 1x ${item}`;
            return `${trimmed}\n• 1x ${item}`;
        });
    };

    const updateItem = (key: ItemKey, updates: Partial<ItemState>) => {
        setItems(prev => ({ ...prev, [key]: { ...prev[key], ...updates } }));
    };

    const toggleItem = (key: ItemKey) => {
        updateItem(key, { active: !items[key].active });
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const fd = new FormData(e.currentTarget);

        // Prepare Items Array
        const itemsList = [];
        if (items.cartons.active) {
            itemsList.push({ key: 'cartons', qty: items.cartons.qty, label: 'Umzugskartons', size: {} });
        }

        const payload = {
            customer: {
                firstName: fd.get('firstName'),
                lastName: fd.get('lastName'),
                phone: fd.get('phone'),
                email: fd.get('email'),
            },
            moveType: fd.get('moveType'),
            services: fd.getAll('services'),
            addresses: {
                from: `${fd.get('addressFromStreet')}\n${fd.get('addressFromCity')}`,
                to: `${fd.get('addressToStreet')}\n${fd.get('addressToCity')}`,
            },
            details: {
                floorsFrom: Number(fd.get('floorsFrom')),
                floorsTo: Number(fd.get('floorsTo')),
                elevatorFrom: fd.get('elevatorFrom') === 'on',
                elevatorTo: fd.get('elevatorTo') === 'on',
                parking: fd.get('parking') === 'on',
                assembly: fd.get('assembly') === 'on',
                date: fd.get('date'),
            },
            items: itemsList,
            message: fd.get('message'),
            inventoryText,
        };

        const firstName = String(fd.get('firstName') || '');
        const lastName = String(fd.get('lastName') || '');
        const phone = String(fd.get('phone') || '');
        const fromStreet = String(fd.get('addressFromStreet') || '');
        const fromCity = String(fd.get('addressFromCity') || '');
        const toStreet = String(fd.get('addressToStreet') || '');
        const toCity = String(fd.get('addressToCity') || '');
        const floorsFrom = fd.get('floorsFrom') || '0';
        const elevatorFrom = fd.get('elevatorFrom') === 'on' ? 'Ja' : 'Nein';
        const floorsTo = fd.get('floorsTo') || '0';
        const elevatorTo = fd.get('elevatorTo') === 'on' ? 'Ja' : 'Nein';
        const rawDate = fd.get('date');
        const moveDate = rawDate ? new Date(String(rawDate)).toLocaleDateString('de-DE') : 'Nach Absprache';
        const cartonsInfo = items.cartons.active ? `ca. ${items.cartons.qty} Stück` : 'Keine';

        const waMessage = `Hallo Zusammen Umzüge,\n` +
            `ich habe soeben eine Umzugsanfrage über Ihre Webseite gestellt:\n\n` +
            `✦ *Kunde:* ${firstName} ${lastName}\n` +
            `✆ *Telefon:* ${phone}\n\n` +
            `⦿ *Auszug (Von):* ${fromStreet}, ${fromCity}\n` +
            `  Etage: ${floorsFrom}. OG | Aufzug: ${elevatorFrom}\n\n` +
            `⚑ *Einzug (Nach):* ${toStreet}, ${toCity}\n` +
            `  Etage: ${floorsTo}. OG | Aufzug: ${elevatorTo}\n\n` +
            (inventoryText.trim() ? `❖ *Möbelliste / Inventar:*\n${inventoryText.trim()}\n\n` : '') +
            `◆ *Kartons:* ${cartonsInfo}\n` +
            `✦ *Wunschtermin:* ${moveDate}\n\n` +
            `✓ Bitte senden Sie mir ein unverbindliches Angebot. Vielen Dank!`;

        const waUrl = `https://api.whatsapp.com/send?phone=491782722300&text=${encodeURIComponent(waMessage)}`;
        setWhatsappUrl(waUrl);

        // Auto-open WhatsApp immediately in user gesture context so popup blocker allows it
        try {
            window.open(waUrl, '_blank');
        } catch (e) {
            console.error('Auto open WhatsApp failed:', e);
        }

        try {
            const res = await fetch('/api/requests', {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) setSuccess(true);
            else alert('Fehler bei der Übermittlung. Bitte prüfen Sie Ihre Eingaben.');
        } catch (error) {
            console.error(error);
            alert('Ein Fehler ist aufgetreten.');
        } finally {
            setLoading(false);
        }
    }

    if (success) {
        return (
            <div className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-2xl shadow-xl text-center transition-colors duration-300 max-w-2xl mx-auto border border-gray-100 dark:border-gray-700">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <span className="text-4xl font-bold">✓</span>
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Vielen Dank!</h2>
                <p className="text-base text-gray-600 dark:text-gray-300 max-w-lg mx-auto mb-8 leading-relaxed">
                    Ihre Anfrage wurde erfolgreich gespeichert und gleichzeitig an unser WhatsApp-Team weitergeleitet.
                </p>

                {/* Direct WhatsApp Call to Action / Fallback */}
                {whatsappUrl && (
                    <div className="p-6 bg-green-50/80 dark:bg-green-900/20 border-2 border-green-500/40 rounded-2xl shadow-sm text-center">
                        <div className="inline-flex items-center gap-2 text-green-700 dark:text-green-400 font-bold text-xs uppercase tracking-wider mb-2 bg-green-100 dark:bg-green-900/40 px-3 py-1 rounded-full">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                            WhatsApp Chat geöffnet
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            WhatsApp Chat auf Ihrem Gerät
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mb-5 max-w-md mx-auto">
                            Falls sich WhatsApp nicht automatisch geöffnet hat, klicken Sie einfach hier:
                        </p>
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 text-base w-full sm:w-auto"
                        >
                            <MessageCircle size={22} className="fill-white" />
                            <span>WhatsApp Chat manuell öffnen</span>
                        </a>
                        <p className="text-[11px] text-gray-400 mt-3">
                            Direkt an: +49 178 2722300 (Zusammen Umzüge)
                        </p>
                    </div>
                )}
            </div>
        );
    }

    const SERVICES = [
        { id: 'Umzug', label: t('services.move') },
        { id: 'Entrümpelung', label: t('services.clearance') },
        { id: 'Transport', label: t('services.transport') },
        { id: 'Packservice', label: t('services.packing') },
    ];

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 md:p-10 rounded-2xl shadow-xl space-y-10 border border-gray-100 dark:border-gray-700 transition-colors duration-300">

            {/* Step 1: Basic Info */}
            <section className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2">{t('step1')}</h3>
                <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-900 dark:text-gray-200">
                        <input type="radio" name="moveType" value="privat" defaultChecked className="w-5 h-5 text-primary focus:ring-primary bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                        <span className="text-lg">{t('privateMove')}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-gray-900 dark:text-gray-200">
                        <input type="radio" name="moveType" value="firma" className="w-5 h-5 text-primary focus:ring-primary bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                        <span className="text-lg">{t('companyMove')}</span>
                    </label>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    {SERVICES.map(s => (
                        <label key={s.id} className="flex items-center gap-2 p-3 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-200 transition-colors">
                            <input type="checkbox" name="services" value={s.id} className="w-5 h-5 rounded text-primary focus:ring-primary bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                            <span>{s.label}</span>
                        </label>
                    ))}
                </div>
            </section>

            {/* Step 2: Addresses */}
            <section className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2">{t('step2')}</h3>
                <div className="grid md:grid-cols-2 gap-8">
                    {/* From */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-primary-700 dark:text-primary-400">{t('addressFrom')}</h4>
                        <SplitAddressAutocomplete 
                            nameStreet="addressFromStreet" 
                            nameCity="addressFromCity" 
                            placeholderStreet="Straße und Hausnummer" 
                            placeholderCity="PLZ und Ort" 
                            required 
                        />
                        <div className="flex gap-4">
                            <div className="w-1/2">
                                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">{t('floor')}</label>
                                <input type="number" name="floorsFrom" defaultValue={0} min={0} className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                            </div>
                            <div className="w-1/2 flex items-center pt-5">
                                <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-200">
                                    <input type="checkbox" name="elevatorFrom" className="h-4 w-4 text-primary bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                                    <span>{t('elevator')}</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* To */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-secondary dark:text-secondary-400">{t('addressTo')}</h4>
                        <SplitAddressAutocomplete 
                            nameStreet="addressToStreet" 
                            nameCity="addressToCity" 
                            placeholderStreet="Straße und Hausnummer" 
                            placeholderCity="PLZ und Ort" 
                            required 
                        />
                        <div className="flex gap-4">
                            <div className="w-1/2">
                                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">{t('floor')}</label>
                                <input type="number" name="floorsTo" defaultValue={0} min={0} className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                            </div>
                            <div className="w-1/2 flex items-center pt-5">
                                <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-200">
                                    <input type="checkbox" name="elevatorTo" className="h-4 w-4 text-primary bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                                    <span>{t('elevator')}</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-200">
                        <input type="checkbox" name="parking" className="w-5 h-5 text-primary bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                        <span>{t('parking')}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-200">
                        <input type="checkbox" name="assembly" className="w-5 h-5 text-primary bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                        <span>{t('assembly')}</span>
                    </label>
                </div>

                {/* Cartons */}
                <div className="pt-4 border-t dark:border-gray-700 mt-4">
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-4">Umzugskartons vermieten oder kaufen</h4>
                    <div className={`p-4 border rounded-lg transition ${items.cartons.active ? 'border-primary bg-primary-50 dark:bg-primary-900/20 dark:border-primary-500' : 'bg-white dark:bg-gray-700 dark:border-gray-600'}`}>
                        <label className="flex items-center gap-3 cursor-pointer text-gray-900 dark:text-gray-200">
                            <input type="checkbox" checked={items.cartons.active} onChange={() => toggleItem('cartons')} className="w-5 h-5 text-primary bg-gray-50 dark:bg-gray-600 border-gray-300 dark:border-gray-500" />
                            <span className="font-semibold">{t('cartons') || 'Umzugskartons'}</span>
                        </label>
                        {items.cartons.active && (
                            <div className="mt-2 ml-8 flex flex-wrap gap-4 items-center text-gray-700 dark:text-gray-300">
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => updateItem('cartons', { qty: Math.max(1, items.cartons.qty - 1) })}
                                        className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center justify-center text-lg font-bold transition"
                                    >
                                        −
                                    </button>
                                    <input
                                        type="number"
                                        min="1"
                                        value={items.cartons.qty}
                                        onChange={(e) => updateItem('cartons', { qty: Math.max(1, Number(e.target.value)) })}
                                        className="w-20 p-2 text-center border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white font-bold text-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => updateItem('cartons', { qty: items.cartons.qty + 1 })}
                                        className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center justify-center text-lg font-bold transition"
                                    >
                                        +
                                    </button>
                                </div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    (ca. {items.cartons.qty} Stück)
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Auflistung des Umzugsguts (Möbelliste) */}
                <div className="pt-6 border-t dark:border-gray-700 mt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                                <Armchair size={18} className="text-[#16a34a]" />
                                Auflistung des Umzugsguts (Möbelliste)
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Klicken Sie auf die Schnellauswahl oder tragen Sie Ihre Möbel und Gegenstände ein:
                            </p>
                        </div>
                        {inventoryText && (
                            <button
                                type="button"
                                onClick={() => setInventoryText('')}
                                className="text-xs text-red-500 hover:text-red-700 self-start sm:self-auto font-medium hover:underline"
                            >
                                Liste leeren
                            </button>
                        )}
                    </div>

                    {/* Quick-Click Chips */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        {FURNITURE_CHIPS.map((item) => (
                            <button
                                key={item}
                                type="button"
                                onClick={() => handleAddChip(item)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 hover:bg-green-100 text-gray-800 hover:text-green-800 dark:bg-gray-700 dark:hover:bg-green-900/40 dark:text-gray-200 dark:hover:text-green-300 border border-gray-200 dark:border-gray-600 transition-all active:scale-95 shadow-sm"
                            >
                                <Plus size={13} className="text-[#16a34a]" />
                                {item}
                            </button>
                        ))}
                    </div>

                    {/* Textarea */}
                    <textarea
                        name="inventoryText"
                        value={inventoryText}
                        onChange={(e) => setInventoryText(e.target.value)}
                        rows={4}
                        placeholder="Ihre Möbelliste (z.B. 1x Bett, 1x Kleiderschrank, 1x Sofa, 1x Esstisch mit 4 Stühlen, 1x Waschmaschine, 1x Herd, 1x Schreibtisch...)"
                        className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm font-sans"
                    />
                </div>
            </section>

            {/* Step 3: Date */}
            <section className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2">3. Wunschtermin</h3>
                <div className="flex flex-col md:flex-row gap-4">
                    <input type="datetime-local" name="date" className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg md:w-1/2 focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400" />
                </div>
            </section>

            {/* Step 4: Contact */}
            <section className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2">4. Kontaktdaten</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <input required name="firstName" placeholder={t('firstName')} className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400" />
                    <input required name="lastName" placeholder={t('lastName')} className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <input required name="email" type="email" placeholder={t('email')} className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400" />
                    <input required name="phone" type="tel" placeholder={t('phone')} className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400" />
                </div>
                <textarea name="message" placeholder={t('msgPlaceholder')} className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg h-32 focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"></textarea>
            </section>

            <button 
                disabled={loading} 
                type="submit" 
                className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white text-lg font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
                {loading ? (
                    <Loader2 className="animate-spin" size={24} />
                ) : (
                    <>
                        <MessageCircle size={24} className="fill-white" />
                        <span>Jetzt Angebot anfordern & per WhatsApp senden</span>
                    </>
                )}
            </button>

        </form>
    );
}
