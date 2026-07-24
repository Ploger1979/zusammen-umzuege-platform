'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, register } from '@/app/actions/auth';
import { Lock, ArrowLeft, Loader2, UserPlus, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthPage() {
    const t = useTranslations('Auth');
    const locale = useLocale();
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Register
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Password visibility states
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Reset visibility when switching modes
    const switchMode = (mode: boolean) => {
        setIsLogin(mode);
        setError('');
        setShowPassword(false);
        setShowConfirmPassword(false);
    };

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const result = await login(formData);

        if (result.success) {
            router.push(`/${locale}/admin/requests`);
            router.refresh();
        } else {
            setError(result.error || 'error'); // Use actual server error if available
            setLoading(false);
        }
    }

    async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const result = await register(formData);

        if (result.success) {
            router.push(`/${locale}/admin/requests`); // Login immediately after register
            router.refresh();
        } else {
            setError(result.error || 'serverError');
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 p-4 transition-colors duration-300">
            <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden relative">

                {/* Header Switcher */}
                <div className="flex border-b border-gray-100 dark:border-gray-800">
                    <button
                        onClick={() => switchMode(true)}
                        className={`flex-1 py-4 text-center font-bold text-sm transition-colors ${isLogin ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                    >
                        {t('tabLogin')}
                    </button>
                    <button
                        onClick={() => switchMode(false)}
                        className={`flex-1 py-4 text-center font-bold text-sm transition-colors ${!isLogin ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                    >
                        {t('tabRegister')}
                    </button>
                </div>

                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {isLogin ? (
                            <motion.div
                                key="login"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary mb-4">
                                        <Lock size={32} />
                                    </div>
                                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('loginTitle')}</h1>
                                </div>

                                <form onSubmit={handleLogin} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('email')}</label>
                                        <input type="email" name="email" className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none" placeholder="name@example.com" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('password')}</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                required
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none pr-10"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                            >
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <input
                                                id="remember-me"
                                                name="remember-me"
                                                type="checkbox"
                                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                            />
                                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                                {t('rememberMe')}
                                            </label>
                                        </div>
                                    </div>

                                    {error && <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm text-center">{t(error as any)}</div>}

                                    <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary-600 text-white font-bold py-3 px-4 rounded-lg flex justify-center items-center shadow-lg transition-transform transform active:scale-95">
                                        {loading ? <Loader2 className="animate-spin" /> : t('loginBtn')}
                                    </button>
                                </form>

                                <div className="mt-6 text-center">
                                    <Link href={`/${locale}/forgot-password`} className="text-sm text-primary hover:underline">{t('forgotPass')}</Link>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="register"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 mb-4">
                                        <UserPlus size={32} />
                                    </div>
                                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('registerTitle')}</h1>
                                </div>

                                <form onSubmit={handleRegister} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('name')}</label>
                                        <input name="name" required className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('email')}</label>
                                        <input type="email" name="email" required className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('password')}</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    name="password"
                                                    required
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                >
                                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('passwordConfirm')}</label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    name="confirmPassword"
                                                    required
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                >
                                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {error && <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm text-center">{t(error as any)}</div>}

                                    <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary-600 text-white font-bold py-3 px-4 rounded-lg flex justify-center items-center shadow-lg transition-transform transform active:scale-95">
                                        {loading ? <Loader2 className="animate-spin" /> : t('registerBtn')}
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
                        <button onClick={() => switchMode(!isLogin)} className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                            {isLogin ? t('switchToRegister') : t('switchToLogin')}
                        </button>
                        <div className="mt-4">
                            <Link href={`/${locale}`} className="inline-flex items-center text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                <ArrowLeft size={14} className="mr-1 rtl:ml-1 rtl:mr-0" />
                                {t('back')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
