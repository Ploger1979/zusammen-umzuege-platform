'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';
import { requestPasswordReset } from '@/app/actions/auth';
import { Loader2, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
    const t = useTranslations('Auth');
    const locale = useLocale();
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const result = await requestPasswordReset(formData);

        if (result.success) {
            setSent(true);
        } else {
            setError('serverError');
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden p-8"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary mb-4">
                        {sent ? <CheckCircle size={32} className="text-green-500" /> : <Mail size={32} />}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                        {sent ? t('linkSent') : t('forgotTitle')}
                    </h1>
                    {!sent && (
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                            {t('forgotDesc')}
                        </p>
                    )}
                </div>

                {sent ? (
                    <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Wir haben Ihnen eine E-Mail mit Anweisungen zum Zurücksetzen Ihres Passworts gesendet.
                        </p>
                        <Link
                            href={`/${locale}/login`}
                            className="inline-block bg-primary hover:bg-primary-600 text-white font-bold py-3 px-6 rounded-lg transition"
                        >
                            {t('backToLogin')}
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('email')}</label>
                            <input
                                type="email"
                                name="email"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                placeholder="name@example.com"
                            />
                        </div>

                        {error && <div className="p-3 bg-red-100 text-red-700 rounded text-sm text-center">{t('serverError')}</div>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary-600 text-white font-bold py-3 px-4 rounded-lg flex justify-center items-center shadow-lg transition"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : t('sendLink')}
                        </button>

                        <div className="text-center">
                            <Link href={`/${locale}/login`} className="inline-flex items-center text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
                                <ArrowLeft size={14} className="mr-1" />
                                {t('backToLogin')}
                            </Link>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
