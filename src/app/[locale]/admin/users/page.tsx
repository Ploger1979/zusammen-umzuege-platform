'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { getUsers, deleteUser, createAdminUser, getAdminSession } from '@/app/actions/auth';
import { Trash2, UserPlus, Shield, ArrowLeft, Loader2, Calendar, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

interface UserData {
    _id: string;
    name: string;
    email: string;
    createdAt: string;
    role: string;
}

export default function AdminUsersPage() {
    const t = useTranslations('AdminManagement');
    const locale = useLocale();
    const router = useRouter();

    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Form state
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Load users on mount
    useEffect(() => {
        getAdminSession().then(session => {
            if (session?.role !== 'superadmin') {
                router.push(`/${locale}/admin/requests`);
                return;
            }
            loadUsers();
        });
    }, []);

    async function loadUsers() {
        setLoading(true);
        const result = await getUsers();
        if (result.success && result.users) {
            setUsers(result.users);
        }
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm(t('confirmDelete'))) return;

        setActionLoading(true);
        const result = await deleteUser(id);
        if (result.success) {
            setSuccessMsg(t('successDelete'));
            loadUsers(); // Reload list
        } else {
            setError('serverError');
        }
        setActionLoading(false);
        setTimeout(() => setSuccessMsg(''), 3000);
    }

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setActionLoading(true);

        const formData = new FormData();
        formData.append('name', newName);
        formData.append('email', newEmail);
        formData.append('password', newPassword);

        const result = await createAdminUser(formData);

        if (result.success) {
            setSuccessMsg(t('successAdd'));
            setNewName('');
            setNewEmail('');
            setNewPassword('');
            loadUsers(); // Reload list
        } else {
            setError(result.error ? String(result.error) : 'serverError');
        }
        setActionLoading(false);
        setTimeout(() => setSuccessMsg(''), 3000);
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] p-4 md:p-8 font-sans text-gray-900 dark:text-white transition-all duration-300">

            {/* Header */}
            <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-[#FFC107] flex items-center gap-3 transition-colors">
                    <Shield size={32} className="text-[#FFC107]" />
                    {t('title')}
                </h1>
                <Link href={`/${locale}/admin/requests`} className="px-4 py-2 border border-gray-300 dark:border-[#FFC107] text-gray-700 dark:text-[#FFC107] rounded hover:bg-[#FFC107] hover:text-black transition flex items-center gap-2">
                    <ArrowLeft size={18} className="rtl:rotate-180" />
                    {t('backToDashboard')}
                </Link>
                <Link href={`/${locale}/admin/requests`} className="px-4 py-2 bg-[#FFC107] text-black font-bold rounded hover:bg-[#ffb300] transition flex items-center gap-2">
                    <Shield size={18} />
                    Anfragen verwalten
                </Link>
            </div>

            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">

                {/* List of Users */}
                <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 order-2 md:order-1 transition-colors">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-[#FFC107] mb-6 flex items-center gap-2">
                        <Shield size={24} className="text-[#FFC107]" />
                        {t('listTitle')}
                    </h2>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="animate-spin text-[#FFC107]" size={32} />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {users.map((user) => (
                                <div key={user._id} className="bg-gray-50 dark:bg-[#334155] p-4 rounded-lg flex justify-between items-center border border-gray-200 dark:border-gray-600 hover:border-[#FFC107] dark:hover:border-[#FFC107] transition group">
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-lg">{user.name}</p>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">{user.email}</p>
                                        <p className="text-gray-500 dark:text-gray-500 text-xs mt-1 flex items-center gap-1">
                                            <Calendar size={12} />
                                            {new Date(user.createdAt).toLocaleDateString()}
                                            <span className="ltr:ml-2 rtl:mr-2 px-2 py-0.5 bg-[#FFC107] text-black rounded text-[10px] font-bold uppercase">{user.role || 'admin'}</span>
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(user._id)}
                                        disabled={actionLoading}
                                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition opacity-100 md:opacity-0 group-hover:opacity-100"
                                        title={t('delete')}
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            ))}
                            {users.length === 0 && (
                                <p className="text-center text-gray-400 py-4">No users found.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Add New User Form */}
                <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 h-fit order-1 md:order-2 transition-colors">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-[#FFC107] mb-6 flex items-center gap-2">
                        <UserPlus size={24} className="text-[#FFC107]" />
                        {t('addTitle')}
                    </h2>

                    <form onSubmit={handleAdd} className="space-y-5">
                        <div>
                            <label className="block text-gray-600 dark:text-gray-300 mb-2 text-sm font-medium">{t('name')}</label>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                required
                                className="w-full bg-gray-50 dark:bg-[#0f172a] border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white focus:border-[#FFC107] focus:ring-1 focus:ring-[#FFC107] focus:outline-none transition"
                                placeholder="Name"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 dark:text-gray-300 mb-2 text-sm font-medium">{t('email')}</label>
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                required
                                className="w-full bg-gray-50 dark:bg-[#0f172a] border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white focus:border-[#FFC107] focus:ring-1 focus:ring-[#FFC107] focus:outline-none transition"
                                placeholder="name@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 dark:text-gray-300 mb-2 text-sm font-medium">{t('password')}</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full bg-gray-50 dark:bg-[#0f172a] border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white focus:border-[#FFC107] focus:ring-1 focus:ring-[#FFC107] focus:outline-none transition ltr:pr-10 rtl:pl-10"
                                    placeholder="••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute top-1/2 -translate-y-1/2 ltr:right-3 rtl:left-3 text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <p className="text-gray-500 text-xs mt-1 text-end">Min. 6 chars</p>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-500/50 text-red-600 dark:text-red-200 rounded text-sm text-center">
                                {/* Use t() to translate logic error keys if possible, or fallback relative to context */}
                                {['emailExists', 'passwordTooShort', 'serverError', 'passwordMismatch'].includes(error) ? t(error as any) : error}
                            </div>
                        )}

                        {successMsg && (
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-500/50 text-green-600 dark:text-green-200 rounded text-sm text-center">
                                {successMsg}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={actionLoading}
                            className="w-full bg-[#FFC107] hover:bg-[#ffb300] text-black font-bold py-3 rounded-lg transition shadow-lg flex justify-center items-center gap-2 mt-4"
                        >
                            {actionLoading ? <Loader2 className="animate-spin" size={20} /> : t('addBtn')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
