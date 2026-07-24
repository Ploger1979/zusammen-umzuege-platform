'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Shield, ArrowLeft, Loader2, Calendar, FileText, ArrowRight, LogOut, Receipt } from 'lucide-react';
import { getAdminSession } from '@/app/actions/auth';
import Link from 'next/link';

interface RequestData {
    _id: string;
    customer: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    };
    moveType: string;
    createdAt: string;
    status: string;
    items: Array<{ key: string; qty: number }>;
    hasInvoice?: boolean;
}

export default function AdminRequestsPage() {
    const t = useTranslations('AdminManagement'); // Using same namespace for now
    const locale = useLocale();
    const router = useRouter();

    const [requests, setRequests] = useState<RequestData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    useEffect(() => {
        loadRequests();
        // Check role securely using server action
        getAdminSession().then(session => {
            setIsSuperAdmin(session?.role === 'superadmin');
        });
    }, []);

    async function loadRequests() {
        setLoading(true);
        try {
            const res = await fetch('/api/requests');
            const data = await res.json();
            if (data.success) {
                // Fetch invoices to see which requests have invoices
                const invRes = await fetch('/api/invoices/all');
                const invData = await invRes.ok ? await invRes.json() : { invoices: [] };
                const invoiceMap = new Map<string, any>(invData.invoices?.map((i: any) => [i.requestId, i]) || []);

                const enrichedRequests = data.requests.map((req: RequestData) => {
                    const invoice = invoiceMap.get(req._id);
                    if (invoice && invoice.customerName) {
                        const parts = invoice.customerName.trim().split(' ');
                        const fName = parts[0];
                        const lName = parts.slice(1).join(' ') || '';
                        return {
                            ...req,
                            hasInvoice: true,
                            customer: {
                                ...req.customer,
                                firstName: fName,
                                lastName: lName,
                                email: invoice.customerEmail || req.customer.email,
                                phone: invoice.customerPhone || req.customer.phone
                            }
                        };
                    }
                    return {
                        ...req,
                        hasInvoice: !!invoice
                    };
                });
                
                setRequests(enrichedRequests);
            }
        } catch (error) {
            console.error('Failed to load requests', error);
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] p-4 md:p-8 font-sans text-gray-900 dark:text-white transition-colors duration-300">

            {/* Header */}
            <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-[#FFC107] flex items-center gap-3 transition-colors">
                    <FileText size={32} className="text-[#FFC107]" />
                    {t('activeRequests')}
                </h1>
                <div className="flex flex-wrap gap-4 items-center">
                    <Link href={`/${locale}/admin/offer`} className="px-4 py-2 bg-white dark:bg-gray-800 text-[#16a34a] border-2 border-[#16a34a] hover:bg-green-50 dark:hover:bg-gray-700 font-bold rounded transition flex items-center gap-2 shadow-lg">
                        <FileText size={18} />
                        Angebot erstellen
                    </Link>
                    <Link href={`/${locale}/invoice`} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded transition flex items-center gap-2 shadow-lg">
                        <FileText size={18} />
                        Neue leere Rechnung
                    </Link>
                    <Link href={`/${locale}/admin/invoices`} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded transition flex items-center gap-2 shadow-lg">
                        <Receipt size={18} />
                        Rechnungen
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
                        <FileText size={24} className="text-[#FFC107]" />
                        {t('requestsList')}
                    </h2>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="animate-spin text-[#FFC107]" size={32} />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {requests.map((req) => (
                                <div key={req._id} className="bg-gray-50 dark:bg-[#334155] p-4 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4 border border-gray-200 dark:border-gray-600 hover:border-[#FFC107] dark:hover:border-[#FFC107] transition group">
                                    <div className="flex-grow">
                                        <div className="flex justify-between md:justify-start gap-4 items-center mb-2 md:mb-0">
                                            <p className="font-bold text-gray-900 dark:text-white text-lg transition-colors">
                                                {req.customer.firstName} {req.customer.lastName}
                                            </p>
                                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs uppercase font-bold border border-blue-200 dark:border-blue-700 transition-colors">
                                                {req.moveType}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm flex gap-4 transition-colors">
                                            <span>{req.customer.email}</span>
                                            <span className="ltr:ml-2 rtl:mr-2">{req.customer.phone}</span>
                                        </p>
                                        <div className="text-gray-500 dark:text-gray-500 text-xs mt-2 flex items-center gap-4 transition-colors">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                {new Date(req.createdAt).toLocaleDateString()}
                                            </span>
                                            <span>
                                                {req.items.length} {t('itemsCount')}
                                                {req.items.some(i => i.key === 'cartons') && (
                                                    <span className="text-[#FFC107] ltr:ml-1 rtl:mr-1">{t('includesCartons')}</span>
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                                        <Link
                                            href={`/${locale}/admin/offer?request_id=${req._id}`}
                                            className="flex-1 md:flex-none px-4 py-2 bg-white dark:bg-[#1e293b] text-[#16a34a] border border-[#16a34a] font-bold rounded hover:bg-green-50 dark:hover:bg-gray-800 transition flex justify-center items-center gap-2"
                                        >
                                            Angebot erstellen
                                        </Link>
                                        {req.hasInvoice ? (
                                            <Link
                                                href={`/${locale}/invoice?request_id=${req._id}`}
                                                className="flex-1 md:flex-none px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded border border-blue-300 hover:bg-blue-200 transition flex justify-center items-center gap-2"
                                            >
                                                {t('editInvoice') || 'Rechnung bearbeiten'}
                                            </Link>
                                        ) : (
                                            <Link
                                                href={`/${locale}/invoice?request_id=${req._id}`}
                                                className="flex-1 md:flex-none px-4 py-2 bg-[#FFC107] text-black font-bold rounded hover:bg-[#ffb300] transition flex justify-center items-center gap-2"
                                            >
                                                {t('createInvoice')} <ArrowRight size={16} className="rtl:rotate-180" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {requests.length === 0 && (
                                <div className="text-center py-8 space-y-4">
                                    <p className="text-gray-400">{t('noRequests')}</p>

                                    <div className="max-w-md mx-auto bg-white dark:bg-[#1e293b] p-8 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 shadow-sm transition">
                                        <div className="flex justify-center mb-4 text-gray-300 dark:text-gray-600">
                                            <FileText size={48} />
                                        </div>
                                        <h3 className="text-xl text-gray-800 dark:text-white font-bold mb-3">Keine Anfragen gefunden</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                            Neue Kundenanfragen erscheinen hier automatisch, sobald ein Kunde das Anfrageformular absendet.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
