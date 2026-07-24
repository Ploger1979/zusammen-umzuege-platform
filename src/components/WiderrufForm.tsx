'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Send, Printer, CheckCircle2, FileText, AlertCircle, ShieldCheck, Mail, User, MapPin, Calendar, Hash, Phone, Building, Download, Sparkles } from 'lucide-react';
import { formatGermanAddress } from '@/lib/address-formatter';

export default function WiderrufForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [street, setStreet] = useState('');
    const [plzCity, setPlzCity] = useState('');
    const [orderNr, setOrderNr] = useState('');
    const [contractDate, setContractDate] = useState('');
    const [cancellationDate, setCancellationDate] = useState(''); // Default empty for tt.mm.jjjj
    const [notes, setNotes] = useState('');
    const [agreed, setAgreed] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Google Maps Autocomplete State
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    // Close autocomplete suggestions dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch Google Maps Place Autocomplete Suggestions
    const fetchAddressSuggestions = async (input: string) => {
        const query = input.trim();
        if (!query || query.length < 3) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data.success && data.predictions) {
                setSuggestions(data.predictions);
                setIsOpen(true);
            }
        } catch (error) {
            console.error('Fehler beim Abrufen der Google Maps Adress-Vorschläge', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStreetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setStreet(val);

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        if (val.trim().length > 2) {
            debounceTimeout.current = setTimeout(() => {
                fetchAddressSuggestions(val);
            }, 300);
        } else {
            setSuggestions([]);
            setIsOpen(false);
        }
    };

    // Select address from Google Maps suggestion and parse street vs PLZ & Ort
    const handleSelectSuggestion = (description: string) => {
        const formatted = formatGermanAddress(description);
        const parts = formatted.split('\n');

        if (parts.length >= 2) {
            setStreet(parts[0]);
            setPlzCity(parts[1]);
        } else {
            // Fallback parsing if formatting yields single line
            const match = formatted.match(/^(.*?)(?:,\s*|\s+)(\d{5}\s+.*)$/);
            if (match) {
                setStreet(match[1]);
                setPlzCity(match[2]);
            } else {
                setStreet(formatted);
            }
        }
        setIsOpen(false);
        setSuggestions([]);
    };

    // Format YYYY-MM-DD to DD.MM.YYYY
    const formatDateDE = (dateStr: string) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return `${parts[2]}.${parts[1]}.${parts[0]}`;
        }
        return dateStr;
    };

    // Extract city name from PLZ & City (e.g., "10115 Berlin" -> "Berlin")
    const getCityName = (str: string) => {
        if (!str) return '';
        return str.replace(/^\d+\s*/, '').trim();
    };

    const cityName = getCityName(plzCity);
    const formattedContractDate = formatDateDE(contractDate);
    const formattedCancellationDate = formatDateDE(cancellationDate);
    const ortDatumText = cityName ? `${cityName}${formattedCancellationDate ? ', ' + formattedCancellationDate : ''}` : (formattedCancellationDate || '');

    const handleDigitalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !orderNr || !street || !plzCity || !agreed) {
            setErrorMsg('Bitte füllen Sie alle Pflichtfelder (*) aus und bestätigen Sie die Erklärung.');
            return;
        }

        setIsSubmitting(true);
        setErrorMsg('');

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    phone: phone || 'Nicht angegeben',
                    subject: `Formaler Widerruf zum Auftrag: ${orderNr}`,
                    message: `FORMALER WIDERRUF EINES VERTRAGS

Kundenname: ${name}
E-Mail: ${email}
Telefon: ${phone || 'Nicht angegeben'}
Straße & Hausnummer: ${street}
PLZ & Ort: ${plzCity}
Auftrags-/Angebotsnummer: ${orderNr}
Vertragsdatum: ${formattedContractDate || 'Nicht angegeben'}
Widerrufsdatum: ${formattedCancellationDate || 'Nicht angegeben'}
Ort / Datum: ${ortDatumText || 'Nicht angegeben'}

Anmerkungen / Gründe:
${notes || 'Keine zusätzlichen Anmerkungen.'}

Der Kunde hat bestätigt, den Vertrag hiermit fristgerecht und rechtsverbindlich zu widerrufen.`
                })
            });

            if (res.ok) {
                setSubmitted(true);
            } else {
                const data = await res.json().catch(() => ({}));
                setErrorMsg(data.error || 'Fehler beim Senden des Widerrufs. Bitte versuchen Sie es erneut oder rufen Sie uns an.');
            }
        } catch {
            setErrorMsg('Netzwerkfehler. Bitte prüfen Sie Ihre Verbindung oder senden Sie eine E-Mail an info@zusammenumzuege.de.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Load image as Base64 for jsPDF embedding
    const loadBase64Image = (url: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new window.Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = (err) => reject(err);
            img.src = url;
        });
    };

    // Direct instant PDF File Download without opening print window
    const handleDirectPDFDownload = async () => {
        try {
            setIsGeneratingPDF(true);
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF('p', 'mm', 'a4');

            // Load green circular logo
            const logoBase64 = await loadBase64Image('/logo-new-transparent.png').catch(() => null);

            if (logoBase64) {
                doc.addImage(logoBase64, 'PNG', 15, 12, 16, 16);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(16);
                doc.setTextColor(15, 23, 42);
                doc.text('ZUSAMMEN UMZÜGE', 34, 20);

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8.5);
                doc.setTextColor(71, 85, 105);
                doc.text('Ihr professioneller Partner für Umzüge & Logistik', 34, 25);
            } else {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(16);
                doc.setTextColor(15, 23, 42);
                doc.text('ZUSAMMEN UMZÜGE', 15, 20);

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8.5);
                doc.setTextColor(71, 85, 105);
                doc.text('Ihr professioneller Partner für Umzüge & Logistik', 15, 25);
            }

            // Right side Company Meta
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(71, 85, 105);
            doc.text('Zusammen Umzüge', 195, 18, { align: 'right' });
            doc.text('Inhaber: Mustapha Benlaaouni', 195, 22, { align: 'right' });
            doc.text('Zehnthofstraße 55, 55252 Mainz-Kastel', 195, 26, { align: 'right' });
            doc.text('Steuernummer: 4080538293', 195, 30, { align: 'right' });
            doc.text('E-Mail: info@zusammenumzuege.de | Tel: 01782722300', 195, 34, { align: 'right' });

            doc.setDrawColor(15, 23, 42);
            doc.setLineWidth(0.6);
            doc.line(15, 38, 195, 38);

            // Document Title Box
            doc.setFillColor(241, 245, 249);
            doc.rect(15, 43, 180, 14, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(13);
            doc.setTextColor(15, 23, 42);
            doc.text('FORMALE WIDERRUFSERKLÄRUNG', 105, 50, { align: 'center' });
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 116, 139);
            doc.text('Muster-Widerrufsformular gemäß § 312g BGB', 105, 54, { align: 'center' });

            // Section Title: Angaben zum Verbraucher
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9.5);
            doc.setTextColor(30, 41, 59);
            doc.text('ANGABEN ZUM AUFTRAGGEBER / VERBRAUCHER', 15, 66);
            doc.setDrawColor(203, 213, 225);
            doc.setLineWidth(0.3);
            doc.line(15, 68, 195, 68);

            // Details Table
            let y = 75;
            const addRow = (label: string, value: string) => {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8.5);
                doc.setTextColor(51, 65, 85);
                doc.text(label, 15, y);

                doc.setFont('helvetica', 'normal');
                doc.setTextColor(15, 23, 42);
                doc.text(value || '_____________________________________', 75, y);

                doc.setDrawColor(226, 232, 240);
                doc.line(15, y + 2.5, 195, y + 2.5);
                y += 8;
            };

            addRow('Name des Verbrauchers:', name);
            addRow('E-Mail-Adresse:', email);
            addRow('Telefonnummer:', phone);
            addRow('Straße & Hausnummer:', street);
            addRow('PLZ & Ort:', plzCity);
            addRow('Auftrags- / Angebots-Nr.:', orderNr);
            addRow('Vertragsdatum:', formattedContractDate);
            addRow('Datum der Ausübung:', formattedCancellationDate);

            // Declaration Box
            y += 4;
            doc.setFillColor(248, 250, 252);
            doc.rect(15, y, 180, 22, 'F');
            doc.setDrawColor(15, 23, 42);
            doc.setLineWidth(1.2);
            doc.line(15, y, 15, y + 22);

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(15, 23, 42);
            doc.text('Erklärung:', 19, y + 6);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(51, 65, 85);
            const text = 'Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über die Erbringung von Umzugsdienstleistungen, Möbeltransporten oder Entrümpelungen bei der Firma Zusammen Umzüge.';
            const splitText = doc.splitTextToSize(text, 172);
            doc.text(splitText, 19, y + 11);

            if (notes) {
                doc.setFont('helvetica', 'bold');
                doc.text('Anmerkungen:', 19, y + 18);
                doc.setFont('helvetica', 'normal');
                doc.text(notes, 42, y + 18);
            }

            // Signature & Date Block
            y += 34;
            doc.setDrawColor(148, 163, 184);
            doc.setLineWidth(0.4);

            // Ort, Datum line
            doc.line(15, y, 90, y);
            doc.setFontSize(8.5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(15, 23, 42);
            doc.text(ortDatumText || '____________________', 15, y - 2);
            doc.setFontSize(7);
            doc.setTextColor(100, 116, 139);
            doc.text('ORT, DATUM', 15, y + 4);

            // Signature line
            doc.line(120, y, 195, y);
            doc.setFontSize(8.5);
            doc.setTextColor(15, 23, 42);
            doc.text(name ? `${name} (Digitale Signatur)` : '____________________', 120, y - 2);
            doc.setFontSize(7);
            doc.setTextColor(100, 116, 139);
            doc.text('UNTERSCHRIFT DES VERBRAUCHERS', 120, y + 4);

            // Footer Notice
            doc.setDrawColor(226, 232, 240);
            doc.line(15, 274, 195, 274);
            doc.setFontSize(7);
            doc.setTextColor(148, 163, 184);
            doc.text('Zusammen Umzüge | Inhaber: Mustapha Benlaaouni | Zehnthofstraße 55, 55252 Mainz-Kastel | E-Mail: info@zusammenumzuege.de', 105, 279, { align: 'center' });
            doc.text('Dieses Dokument wurde offiziell generiert über das Online-Portal von zusammenumzuege.de', 105, 283, { align: 'center' });

            // Direct File Download Trigger
            doc.save(`Widerrufsbelehrung_Zusammen_Umzuege_${orderNr || 'Muster'}.pdf`);
        } catch (err) {
            console.error('PDF Generation Error:', err);
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    // Physical Paper Printer
    const handlePrintPaper = () => {
        window.print();
    };

    return (
        <div>
            {/* Screen View: Interactive Form */}
            <div className="print:hidden space-y-12">
                
                {/* Intro Card */}
                <div className="bg-black/40 backdrop-blur-3xl p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl space-y-6 text-gray-300">
                    <div className="flex items-center gap-4 pb-6 border-b border-white/10">
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold text-white">Gesetzliches Widerrufsrecht</h2>
                            <p className="text-sm text-gray-400">Verbraucherinformationen gemäß § 312g BGB & Art. 246a EGBGB</p>
                        </div>
                    </div>

                    <div className="space-y-4 font-light text-base md:text-lg leading-relaxed text-gray-300">
                        <p>
                            Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag über Umzugsdienstleistungen, Transporte oder Entrümpelungen zu widerrufen. Die Widerrufsfrist beträgt 14 Tage ab dem Tag des Vertragsabschlusses.
                        </p>
                        <div className="bg-white/5 p-5 rounded-2xl border border-white/10 text-sm space-y-1 text-gray-200">
                            <strong className="text-white block text-base font-normal">Widerruf zu richten an:</strong>
                            <span><strong>Zusammen Umzüge</strong> | Inhaber: Mustapha Benlaaouni</span><br />
                            <span>Zehnthofstraße 55, 55252 Mainz-Kastel</span><br />
                            <span>E-Mail: <a href="mailto:info@zusammenumzuege.de" className="text-blue-400 hover:underline">info@zusammenumzuege.de</a> | Telefon: 01782722300</span>
                        </div>
                        <p className="text-sm text-gray-400 italic">
                            Hinweis: Bei Dienstleistungen, die auf Ihren ausdrücklichen Wunsch bereits vor Ablauf der 14-Tage-Frist begonnen wurden, ist der Wert der bereits erbrachten Teilleistungen zu vergüten.
                        </p>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-black/50 backdrop-blur-3xl p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                    <div className="absolute -right-20 -top-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="mb-8 pb-6 border-b border-white/10">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                            <FileText className="w-6 h-6 text-blue-400" />
                            Interaktives Muster-Widerrufsformular
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">Füllen Sie das Formular aus, um den Widerruf digital einzureichen oder als offizielles PDF mit Firmen-Logo zu speichern.</p>
                    </div>

                    {submitted ? (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center space-y-4">
                            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h4 className="text-2xl font-bold text-white">Widerruf erfolgreich eingereicht!</h4>
                            <p className="text-gray-300 max-w-xl mx-auto">
                                Wir haben Ihre Widerrufserklärung für den Auftrag <strong className="text-white">{orderNr}</strong> erhalten. Eine Eingangsbestätigung wurde an <strong className="text-white">{email}</strong> übermittelt.
                            </p>
                            <div className="pt-4 flex justify-center gap-4">
                                <button
                                    type="button"
                                    disabled={isGeneratingPDF}
                                    onClick={handleDirectPDFDownload}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors text-sm"
                                >
                                    <Download className="w-4 h-4" />
                                    {isGeneratingPDF ? 'PDF wird erstellt...' : 'PDF Download'}
                                </button>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
                                >
                                    Neuen Widerruf ausfüllen
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleDigitalSubmit} suppressHydrationWarning className="space-y-6">
                            
                            {errorMsg && (
                                <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-center gap-3 text-rose-300 text-sm">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                        <User className="w-4 h-4 text-blue-400" />
                                        Name des Verbrauchers *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="z. B. Max Mustermann"
                                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-blue-400" />
                                        E-Mail-Adresse *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="z. B. max@beispiel.de"
                                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-blue-400" />
                                        Telefonnummer (optional)
                                    </label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="z. B. 0178 1234567"
                                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    />
                                </div>

                                {/* Order / Quote Nr */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                        <Hash className="w-4 h-4 text-blue-400" />
                                        Auftrags- / Angebotsnummer *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={orderNr}
                                        onChange={(e) => setOrderNr(e.target.value)}
                                        placeholder="z. B. ANG-2026-1042"
                                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    />
                                </div>

                                {/* German Address Split 1: Street & House Number with Google Maps Autocomplete */}
                                <div className="relative" ref={wrapperRef}>
                                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-blue-400" />
                                            Straße & Hausnummer *
                                        </span>
                                        <span className="text-[11px] text-blue-400 flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" /> Google Maps Suche
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={street}
                                        onChange={handleStreetChange}
                                        placeholder="z. B. Musterstraße 12"
                                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    />
                                    
                                    {/* Google Maps Dropdown Suggestions */}
                                    {isOpen && suggestions.length > 0 && (
                                        <div className="absolute left-0 right-0 top-full mt-2 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-white/5">
                                            {suggestions.map((item, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => handleSelectSuggestion(item.description)}
                                                    className="w-full px-4 py-3 text-left text-sm text-gray-200 hover:bg-blue-600/20 hover:text-white transition-colors flex items-center gap-3"
                                                >
                                                    <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                                    <span className="truncate">{item.description}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* German Address Split 2: PLZ & Ort */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                        <Building className="w-4 h-4 text-blue-400" />
                                        PLZ & Ort *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={plzCity}
                                        onChange={(e) => setPlzCity(e.target.value)}
                                        placeholder="z. B. 10115 Berlin"
                                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    />
                                </div>

                                {/* Contract Date - Default EMPTY */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-blue-400" />
                                        Datum des Vertragsabschlusses
                                    </label>
                                    <input
                                        type="date"
                                        value={contractDate}
                                        onChange={(e) => setContractDate(e.target.value)}
                                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    />
                                </div>

                                {/* Cancellation Date - Default EMPTY */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-blue-400" />
                                        Datum der Widerrufsausübung
                                    </label>
                                    <input
                                        type="date"
                                        value={cancellationDate}
                                        onChange={(e) => setCancellationDate(e.target.value)}
                                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Additional notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Anmerkungen / Grund (optional)
                                </label>
                                <textarea
                                    rows={3}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Zusätzliche Angaben oder Anmerkungen zum Widerruf..."
                                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                />
                            </div>

                            {/* Agreement Checkbox */}
                            <div className="pt-2">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        required
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        className="mt-1 w-5 h-5 rounded border-white/20 bg-black/50 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                                    />
                                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors leading-relaxed">
                                        Hiermit erkläre ich ausdrücklich den Widerruf des von mir abgeschlossenen Vertrags über die genannten Umzugs- / Transportdienstleistungen mit <strong>Zusammen Umzüge</strong>.
                                    </span>
                                </label>
                            </div>

                            {/* Action Buttons: 3 Distinct Action Buttons */}
                            <div className="flex flex-col lg:flex-row gap-4 pt-4">
                                {/* Button 1: Submit Online */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <span>Widerruf wird gesendet...</span>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            <span>Widerruf digital online absenden</span>
                                        </>
                                    )}
                                </button>

                                {/* Button 2: Instant Direct PDF File Download (No Print Window) */}
                                <button
                                    type="button"
                                    disabled={isGeneratingPDF}
                                    onClick={handleDirectPDFDownload}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all border border-emerald-400/30 disabled:opacity-50"
                                >
                                    <Download className="w-5 h-5" />
                                    <span>{isGeneratingPDF ? 'PDF wird erstellt...' : 'PDF Download'}</span>
                                </button>

                                {/* Button 3: Physical Paper Printer */}
                                <button
                                    type="button"
                                    onClick={handlePrintPaper}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl border border-white/10 transition-all"
                                >
                                    <Printer className="w-5 h-5 text-blue-400" />
                                    <span>Drucken</span>
                                </button>
                            </div>

                        </form>
                    )}
                </div>
            </div>

            {/* Print & PDF Export View: Official Branded Document for PDF / Printing (Fits 1 A4 Page) */}
            <div id="widerruf-document-container" className="hidden print:block font-sans text-black p-6 max-w-3xl mx-auto space-y-4 bg-white print:p-4 print:space-y-4">
                {/* Header with Logo */}
                <div className="flex justify-between items-start border-b-2 border-gray-900 pb-3">
                    <div>
                        <div className="relative w-40 h-12 mb-1">
                            <Image
                                src="/logo-new-transparent.png"
                                alt="Zusammen Umzüge"
                                fill
                                className="object-contain object-left"
                            />
                        </div>
                        <h1 className="text-lg font-bold uppercase tracking-wider text-gray-900">Zusammen Umzüge</h1>
                        <p className="text-[11px] text-gray-600">Ihr professioneller Partner für Umzüge & Logistik</p>
                    </div>
                    <div className="text-right text-[11px] text-gray-600 space-y-0.5">
                        <p className="font-bold text-gray-900 text-xs">Zusammen Umzüge</p>
                        <p>Inhaber: Mustapha Benlaaouni</p>
                        <p>Zehnthofstraße 55, 55252 Mainz-Kastel</p>
                        <p>Steuernummer: 4080538293</p>
                        <p>E-Mail: info@zusammenumzuege.de</p>
                        <p>Tel: 01782722300</p>
                    </div>
                </div>

                {/* Title */}
                <div className="text-center py-2 bg-gray-100 rounded-md border border-gray-300">
                    <h2 className="text-lg font-bold uppercase tracking-wide text-gray-900">FORMALE WIDERRUFSERKLÄRUNG</h2>
                    <p className="text-[11px] text-gray-600">Muster-Widerrufsformular gemäß § 312g BGB</p>
                </div>

                {/* Customer Details Table */}
                <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-0.5">Angaben zum Auftraggeber / Verbraucher</h3>
                    
                    <table className="w-full text-xs border-collapse">
                        <tbody>
                            <tr className="border-b border-gray-200">
                                <td className="py-1 font-bold w-1/3 text-gray-700">Name des Verbrauchers:</td>
                                <td className="py-1 text-gray-900 font-medium">{name || '_____________________________________'}</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-1 font-bold text-gray-700">E-Mail-Adresse:</td>
                                <td className="py-1 text-gray-900">{email || '_____________________________________'}</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-1 font-bold text-gray-700">Telefonnummer:</td>
                                <td className="py-1 text-gray-900">{phone || '_____________________________________'}</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-1 font-bold text-gray-700">Straße & Hausnummer:</td>
                                <td className="py-1 text-gray-900">{street || '_____________________________________'}</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-1 font-bold text-gray-700">PLZ & Ort:</td>
                                <td className="py-1 text-gray-900">{plzCity || '_____________________________________'}</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-1 font-bold text-gray-700">Auftrags- / Angebots-Nr.:</td>
                                <td className="py-1 text-gray-900 font-bold">{orderNr || '_____________________________________'}</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-1 font-bold text-gray-700">Vertragsdatum:</td>
                                <td className="py-1 text-gray-900">{formattedContractDate || '_______________________'}</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-1 font-bold text-gray-700">Datum der Ausübung:</td>
                                <td className="py-1 text-gray-900">{formattedCancellationDate || '_______________________'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Declaration Body */}
                <div className="space-y-1.5 text-[11px] leading-normal text-gray-800 border-l-4 border-gray-800 pl-3 py-1.5 bg-gray-50 rounded-r-md">
                    <p className="font-bold text-gray-900 text-xs">Erklärung:</p>
                    <p>
                        Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über die Erbringung von Umzugsdienstleistungen, Möbeltransporten oder Entrümpelungen bei der Firma <strong>Zusammen Umzüge</strong>.
                    </p>
                    {notes && (
                        <p>
                            <strong>Anmerkungen / Grund:</strong> {notes}
                        </p>
                    )}
                </div>

                {/* Signature & Date Block */}
                <div className="pt-6 grid grid-cols-2 gap-8">
                    <div>
                        <div className="border-b border-gray-400 pb-1 mb-1">
                            <span className="text-xs font-medium text-gray-900">{ortDatumText || '____________________'}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Ort, Datum</p>
                    </div>

                    <div>
                        <div className="border-b border-gray-400 pb-1 mb-1">
                            <span className="text-xs font-medium text-gray-900">
                                {name ? (
                                    <span className="inline-flex items-center gap-1.5">
                                        <span>{name}</span>
                                        <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-normal">Digitale Signatur</span>
                                    </span>
                                ) : '____________________'}
                            </span>
                        </div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Unterschrift des Verbrauchers</p>
                    </div>
                </div>

                {/* Footer Notice */}
                <div className="pt-4 border-t border-gray-300 text-center text-[9px] text-gray-500 space-y-0.5">
                    <p>Zusammen Umzüge | Inhaber: Mustapha Benlaaouni | Zehnthofstraße 55, 55252 Mainz-Kastel | E-Mail: info@zusammenumzuege.de</p>
                    <p>Dieses Dokument wurde offiziell generiert über das Online-Portal von zusammenumzuege.de</p>
                </div>
            </div>
        </div>
    );
}
