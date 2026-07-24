'use client';

import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, FormEvent } from 'react';

type FormState = 'idle' | 'loading' | 'success' | 'error';

export default function KontaktPage() {
    const t = useTranslations('ContactPage');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        message: '',
    });
    const [formState, setFormState] = useState<FormState>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setFormState('loading');
        setErrorMsg('');

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Fehler beim Senden.');
            }

            setFormState('success');
            setFormData({ firstName: '', lastName: '', phone: '', message: '' });
        } catch (err: unknown) {
            setFormState('error');
            setErrorMsg(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <main className="container mx-auto px-4 py-12">
                <h1 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
                    {t('title')}
                </h1>

                <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    {/* Info Card */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">{t('subtitle')}</h2>
                        <div className="space-y-8">
                            {/* Phone */}
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{t('phone')}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-2">{t('phoneDesc')}</p>
                                    <a href="tel:+491782722300" className="text-xl font-bold text-secondary hover:text-secondary-hover block mb-3">
                                        01782722300
                                    </a>
                                    <a
                                        href="https://wa.me/491782722300"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-lg hover:bg-[#20bd5a] transition text-sm font-bold shadow-sm"
                                    >
                                        <span>{t('whatsapp')}</span>
                                    </a>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{t('email')}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-2">{t('emailDesc')}</p>
                                    <a href="mailto:info@zusammenumzuege.de" className="text-lg font-bold text-secondary hover:text-secondary-hover">
                                        info@zusammenumzuege.de
                                    </a>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{t('location')}</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Zehnthofstraße 55<br />55252 Mainz-Kastel
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">{t('sendMsg')}</h2>

                        {/* Success State */}
                        {formState === 'success' ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center animate-bounce-once">
                                    <CheckCircle className="text-green-500" size={36} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Nachricht gesendet!</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Vielen Dank! Wir werden uns so schnell wie möglich bei Ihnen melden.
                                </p>
                                <button
                                    onClick={() => setFormState('idle')}
                                    className="mt-4 text-secondary hover:text-secondary-hover font-semibold underline underline-offset-4 transition"
                                >
                                    Neue Nachricht senden
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                                {/* First & Last Name */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {t('firstName')} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                            placeholder="Ayman"
                                            className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 transition"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {t('lastName')} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                            placeholder="Plöger"
                                            className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 transition"
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t('phoneLabel')}
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+49 178 2722300"
                                        className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 transition"
                                    />
                                </div>

                                {/* Message */}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t('msgLabel')} <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={5}
                                        placeholder="Schreiben Sie uns Ihr Anliegen..."
                                        className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 transition resize-none"
                                    />
                                </div>

                                {/* Error Message */}
                                {formState === 'error' && (
                                    <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                                        <AlertCircle size={18} className="shrink-0" />
                                        <span>{errorMsg}</span>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={formState === 'loading'}
                                    className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-secondary-hover disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-lg transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    {formState === 'loading' ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            <span>Wird gesendet...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            <span>{t('submit')}</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
