'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Shield, ArrowLeft, Loader2, Calendar, FileText, ArrowRight, LogOut, Receipt, Trash2 } from 'lucide-react';
import { getAdminSession } from '@/app/actions/auth';
import Link from 'next/link';

interface InvoiceData {
    _id: string;
    requestId: string;
    invoiceNr: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    total: number;
    invoiceDate: string;
    createdAt: string;
}

export default function AdminInvoicesPage() {
    const t = useTranslations('AdminManagement'); // Using same namespace for now
    const locale = useLocale();
    const router = useRouter();

    const [invoices, setInvoices] = useState<InvoiceData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        loadInvoices();
        // Check role securely using server action
        getAdminSession().then(session => {
            setIsSuperAdmin(session?.role === 'superadmin');
        });
    }, []);

    async function loadInvoices() {
        setLoading(true);
        try {
            const res = await fetch('/api/invoices/all');
            const data = await res.json();
            if (data.success) {
                setInvoices(data.invoices);
            }
        } catch (error) {
            console.error('Failed to load invoices', error);
        }
        setLoading(false);
    }

    // =========================================================================
    // 🗑️ DYNAMIC INVOICE DELETION (الحذف الديناميكي للفواتير)
    // =========================================================================
    // We replaced the ugly `window.confirm` with a beautiful custom Tailwind Modal.
    // When a user clicks 'Delete', we set the `invoiceToDelete` state which opens the modal.
    // If they confirm, `confirmDelete` is called to delete via API and update state dynamically
    // without requiring a full page refresh.
    async function confirmDelete() {
        if (!invoiceToDelete) return;
        setIsDeleting(true);

        try {
            const res = await fetch(`/api/invoices/${invoiceToDelete}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            
            if (data.success) {
                // Dynamically remove from state
                setInvoices(prev => prev.filter(inv => inv.requestId !== invoiceToDelete));
                setInvoiceToDelete(null);
            } else {
                alert('Fehler beim Löschen der Rechnung: ' + data.error);
            }
        } catch (error) {
            console.error(error);
            alert('Ein unerwarteter Fehler ist aufgetreten.');
        }
        setIsDeleting(false);
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] p-4 md:p-8 font-sans text-gray-900 dark:text-white transition-colors duration-300">

            {/* Header */}
            <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-[#FFC107] flex items-center gap-3 transition-colors">
                    <Receipt size={32} className="text-[#FFC107]" />
                    {t('invoicesList') || 'Rechnungen'}
                </h1>
                <div className="flex flex-wrap gap-4 items-center">
                    <Link href={`/${locale}/invoice`} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded transition flex items-center gap-2 shadow-lg">
                        <FileText size={18} />
                        Neue leere Rechnung
                    </Link>
                    <Link href={`/${locale}/admin/requests`} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded transition flex items-center gap-2 shadow-lg">
                        <FileText size={18} />
                        {t('activeRequests') || 'Anfragenliste'}
                    </Link>
                    {/* ONLY VISIBLE TO SUPER ADMIN */}
                    {isSuperAdmin && (
                        <Link href={`/${locale}/admin/users`} className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-500 hover:text-white transition flex items-center gap-2">
                            <Shield size={18} />
                            {t('admins')}
                        </Link>
                    )}
                    <button onClick={async () => {
                        const { logout } = await import('@/app/actions/auth');
                        await logout();
                        window.location.href = `/${locale}/login`;
                    }} className="px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition flex items-center gap-2">
                        <LogOut size={18} />
                        {t('logout') || 'Abmelden'}
                    </button>
                    <Link href={`/${locale}`} className="px-4 py-2 border border-gray-300 dark:border-[#FFC107] text-gray-700 dark:text-[#FFC107] rounded hover:bg-[#FFC107] hover:text-black transition flex items-center gap-2">
                        <ArrowLeft size={18} className="rtl:rotate-180" />
                        {t('back')}
                    </Link>
                </div>
            </div>

            <div className="max-w-6xl mx-auto">
                <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-[#FFC107] mb-6 flex items-center gap-2">
                        <Receipt size={24} className="text-[#FFC107]" />
                        Alle Rechnungen
                    </h2>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="animate-spin text-[#FFC107]" size={32} />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {invoices.map((inv) => (
                                <div key={inv._id} className="bg-gray-50 dark:bg-[#334155] p-4 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4 border border-gray-200 dark:border-gray-600 hover:border-[#FFC107] dark:hover:border-[#FFC107] transition group">
                                    <div className="flex-grow">
                                        <div className="flex justify-between md:justify-start gap-4 items-center mb-2 md:mb-0">
                                            <p className="font-bold text-gray-900 dark:text-white text-lg transition-colors">
                                                {inv.customerName || 'Unbekannter Kunde'}
                                            </p>
                                            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs uppercase font-bold border border-green-200 dark:border-green-700 transition-colors">
                                                {inv.invoiceNr}
                                            </span>
                                            {inv.requestId && inv.requestId.startsWith('manual-') && (
                                                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-xs uppercase font-bold border border-purple-200 dark:border-purple-700 transition-colors">
                                                    Manuell
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm flex gap-4 transition-colors">
                                            <span>{inv.customerEmail || '-'}</span>
                                            <span className="ltr:ml-2 rtl:mr-2">{inv.customerPhone || '-'}</span>
                                        </p>
                                        <div className="text-gray-500 dark:text-gray-500 text-xs mt-2 flex items-center gap-4 transition-colors">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                {inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : (inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '-')}
                                            </span>
                                            <span className="font-bold text-gray-900 dark:text-[#FFC107]">
                                                {inv.total ? `€${inv.total.toFixed(2)}` : '-'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                                        <Link
                                            href={`/${locale}/invoice?request_id=${inv.requestId || ''}`}
                                            className="flex-1 md:flex-none px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded border border-blue-300 hover:bg-blue-200 transition flex justify-center items-center gap-2"
                                        >
                                            Rechnung ansehen / bearbeiten
                                        </Link>
                                        <button
                                            onClick={() => setInvoiceToDelete(inv.requestId)}
                                            className="px-4 py-2 bg-red-100 text-red-700 font-bold rounded border border-red-300 hover:bg-red-200 transition flex justify-center items-center gap-2"
                                            title="Rechnung löschen"
                                        >
                                            <Trash2 size={18} />
                                            Löschen
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {invoices.length === 0 && (
                                <div className="text-center py-8 space-y-4">
                                    <p className="text-gray-400">Keine Rechnungen gefunden.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Professional Delete Confirmation Modal */}
            {invoiceToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-6 md:p-8 max-w-sm md:max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center mb-2 shadow-inner">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Rechnung löschen?
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm px-2">
                                Sind Sie sicher, dass Sie diese Rechnung endgültig löschen möchten? Diese Aktion kann <strong>nicht rückgängig</strong> gemacht werden.
                            </p>
                            <div className="flex gap-3 w-full mt-8">
                                <button
                                    onClick={() => setInvoiceToDelete(null)}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-xl transition-colors disabled:opacity-50 border border-gray-200 dark:border-gray-700 shadow-sm"
                                >
                                    Abbrechen
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors flex justify-center items-center gap-2 disabled:opacity-50 shadow-md hover:shadow-lg"
                                >
                                    {isDeleting ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                                    {isDeleting ? 'Wird gelöscht...' : 'Ja, löschen'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
