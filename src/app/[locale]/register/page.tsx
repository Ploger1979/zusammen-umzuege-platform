'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '@/app/actions/auth';
import { UserPlus, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
    const t = useTranslations('Auth');
    const router = useRouter();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const result = await register(formData);

        if (result.success) {
            router.push('/invoice');
            router.refresh();
        } else {
            setError(result.error || 'serverError');
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 p-4 transition-colors duration-300">
            <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 mb-4">
                            <UserPlus size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('registerTitle')}</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('name')}
                            </label>
                            <input
                                name="name"
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('email')}
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {t('password')}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {t('passwordConfirm')}
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                        </div>

                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <label className="block text-sm font-medium text-yellow-800 dark:text-yellow-400 mb-1 flex items-center gap-2">
                                <ShieldCheck size={16} /> {t('secretKey')}
                            </label>
                            <input
                                type="password"
                                name="secretKey"
                                required
                                placeholder="zusammen2026"
                                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm text-center">
                                {t(error as any)}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center shadow-lg"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : t('registerBtn')}
                        </button>
                    </form>

                    <div className="mt-6 text-center space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t('haveAccount')} <Link href="/login" className="text-primary font-bold hover:underline">{t('loginLink')}</Link>
                        </p>

                        <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <ArrowLeft size={16} className="mr-2 rtl:ml-2 rtl:mr-0" />
                            {t('back')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
