'use client';

import React from 'react';
import { CheckCircle2, Printer } from 'lucide-react';

export default function ClientOfferPage({ offer, locale }: { offer: any, locale: string }) {
    
    const getSubtitle = () => {
        if (offer.viewingType === 'online_besichtigung') return 'Nach Online-Besichtigung';
        if (offer.viewingType === 'telefonische_beratung') return 'Nach telefonischer Beratung';
        return 'Nach Besichtigung vor Ort';
    };

    const handlePrint = () => {
        window.print();
    };

    const fixedPrice = offer.pricing?.fixedPrice || 0;
    const taxMode = offer.pricing?.taxMode || 'inkl_mwst';

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 flex flex-col items-center print:bg-white print:p-0 print:m-0">
            {/* Action Bar (Hidden on Print) */}
            <div className="w-full max-w-[210mm] flex justify-between items-center mb-6 print:hidden">
                <div className="text-gray-500 text-sm">
                    Sicheres Angebot für <strong className="text-gray-900">{offer.customerName}</strong>
                </div>
                <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-[#16a34a] hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-colors"
                >
                    <Printer size={18} />
                    Als PDF speichern / Drucken
                </button>
            </div>

            {/* Responsive Zoom Style for Preview */}
            <style dangerouslySetInnerHTML={{ __html: `
                .a4-paper { zoom: 1; }
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
                            <p className="text-sm font-bold text-gray-600 whitespace-nowrap"><span className="text-[#16a34a]">Angebots-Nr.:</span> <span className="text-black text-lg">{offer.offerNr}</span></p>
                            <p className="text-sm font-bold text-gray-600 whitespace-nowrap"><span className="text-[#16a34a]">Datum:</span> <span className="text-black">{new Date(offer.offerDate).toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-US')}</span></p>
                            <p className="text-sm font-bold text-gray-600 whitespace-nowrap"><span className="text-[#16a34a]">Gültig bis:</span> <span className="text-black">{new Date(offer.validUntil).toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-US')}</span></p>
                        </div>
                    </div>

                    {/* Customer & Document Titles */}
                    <div className="mb-8 print:mb-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-1 print:mb-0.5">Kundeninformation</h3>
                        <div className="flex justify-between items-start bg-transparent p-4 print:p-2 rounded-lg border border-gray-100">
                            <div className="text-base font-bold text-gray-900 leading-relaxed">
                                {offer.customerName}<br />
                                <span className="font-normal whitespace-pre-line text-gray-700">
                                    {offer.customerAddress}
                                    {offer.customerCity && <><br />{offer.customerCity}</>}
                                </span>
                            </div>
                            <div className="text-end text-sm text-gray-600 space-y-1">
                                {offer.customerPhone && <p className="whitespace-nowrap"><span className="text-gray-400 mr-2">Tel:</span> <span className="font-bold text-gray-900">{offer.customerPhone}</span></p>}
                                {offer.customerEmail && <p className="whitespace-nowrap"><span className="text-gray-400 mr-2">E-Mail:</span> <span className="font-bold text-gray-900">{offer.customerEmail}</span></p>}
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 print:mb-3 text-center">
                        <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">Ihr persönliches Umzugsangebot</h2>
                        <p className="text-[#16a34a] font-semibold">{getSubtitle()}</p>
                    </div>

                    <div className="mb-6 print:mb-3 text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                        {offer.greetingText}
                    </div>

                    {/* Two Column Layout for Services and Inventory */}
                    <div className="grid grid-cols-2 gap-8 print:gap-4 mb-8 print:mb-4">
                        <div>
                            <h4 className="font-bold text-[#16a34a] uppercase text-sm mb-3 border-b-2 border-gray-200 pb-1">Inkludierte Leistungen</h4>
                            <ul className="text-sm text-gray-700 space-y-2">
                                {offer.includedServices?.map((service: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <CheckCircle2 size={16} className="text-[#16a34a] flex-shrink-0 mt-0.5" />
                                        <span>{service}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-[#16a34a] uppercase text-sm mb-3 border-b-2 border-gray-200 pb-1">Inventarliste (Auszug)</h4>
                            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                                {offer.inventoryList?.map((item: string, idx: number) => (
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
                            <p><strong>Hinweis:</strong> {offer.legalNote}</p>
                            <p><strong>Bedingung:</strong> {offer.changeCondition}</p>
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
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
