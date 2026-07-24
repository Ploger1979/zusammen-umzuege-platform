import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, HeartHandshake, ShieldCheck, Clock, TrendingUp, Users } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Über uns | Zusammen Umzüge',
    description: 'Lernen Sie Zusammen Umzüge und den Gründer kennen. Persönlicher Service, professionelle Umzüge und zuverlässige Unterstützung für private und gewerbliche Kunden.',
};

export default function UeberUnsPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
            {/* 1. Hero Section */}
            <section className="relative pt-24 pb-12 lg:pt-32 lg:pb-16 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-white dark:from-gray-900 dark:to-gray-950 opacity-90"></div>
                    {/* Decorative blurred circles for modern look */}
                    <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/30 dark:bg-primary-900/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/10 dark:bg-secondary/5 rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 animate-fade-in-up">
                        Über <span className="text-primary-600 dark:text-primary-400">Zusammen Umzüge</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto animate-fade-in-up animation-delay-100">
                        Professionelle Umzüge, Transporte und Entrümpelungen mit persönlichem Service und höchster Sorgfalt.
                    </p>
                </div>
            </section>

            {/* 2. Wer wir sind */}
            <section className="py-20 bg-white dark:bg-gray-900">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-6">Wer wir sind</h2>
                        <div className="w-20 h-1 bg-secondary mx-auto mb-8 rounded-full"></div>
                        <div className="space-y-6 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                            <p>
                                Für uns bedeutet ein Umzug weit mehr als nur den Transport von Möbeln.
                            </p>
                            <p>
                                Ein erfolgreicher Umzug basiert auf Vertrauen, sorgfältiger Planung und einer zuverlässigen Durchführung. Genau dafür steht <strong>Zusammen Umzüge</strong>.
                            </p>
                            <p>
                                Unser Ziel ist es, Privat- und Geschäftskunden einen professionellen, transparenten und stressfreien Umzugsservice anzubieten. Von der ersten Anfrage bis zur erfolgreichen Durchführung begleiten wir unsere Kunden persönlich und sorgen für einen reibungslosen Ablauf.
                            </p>
                            <p>
                                Dabei legen wir besonderen Wert auf Zuverlässigkeit, klare Kommunikation, Termintreue und einen respektvollen Umgang mit dem Eigentum unserer Kunden.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Unsere Werte */}
            <section className="py-20 bg-gray-50 dark:bg-gray-950">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-6">Unsere Werte</h2>
                        <div className="w-20 h-1 bg-primary-500 mx-auto rounded-full"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {[
                            { title: 'Zuverlässigkeit', icon: ShieldCheck, desc: 'Wir halten unsere Zusagen und Termine strikt ein.' },
                            { title: 'Sorgfalt', icon: HeartHandshake, desc: 'Ihr Eigentum behandeln wir mit höchster Vorsicht und Respekt.' },
                            { title: 'Transparenz', icon: CheckCircle2, desc: 'Klare Kommunikation und faire, ehrliche Preisgestaltung.' },
                            { title: 'Pünktlichkeit', icon: Clock, desc: 'Zeitgenaue Ausführung für Ihre Planungssicherheit.' },
                            { title: 'Erfahrung', icon: TrendingUp, desc: 'Strukturierte Abläufe durch fundiertes logistisches Wissen.' },
                            { title: 'Persönlicher Service', icon: Users, desc: 'Individuelle Betreuung von der Planung bis zum Ziel.' }
                        ].map((value, idx) => (
                            <div key={idx} className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
                                <div className="w-14 h-14 bg-primary-50 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-6 text-primary-600 dark:text-primary-400">
                                    <value.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Gründer & Inhaber */}
            <section className="py-20 bg-white dark:bg-gray-900">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                            <div className="relative w-56 md:w-72 aspect-[4/5] flex-shrink-0">
                                <div className="absolute inset-0 bg-primary-200 dark:bg-primary-900 rounded-2xl blur-xl opacity-50 transform translate-x-3 translate-y-3"></div>
                                <div className="relative w-full h-full bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-xl z-10 border-4 border-white dark:border-gray-700 overflow-hidden">
                                    <Image 
                                        src="/founder.png" 
                                        alt="Mustapha Benlaaouni" 
                                        fill 
                                        className="object-cover object-top hover:scale-105 transition-transform duration-500 bg-white dark:bg-gray-800"
                                        sizes="(max-width: 768px) 224px, 288px"
                                        priority
                                    />
                                </div>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-3xl font-bold mb-2">Mustapha Benlaaouni</h2>
                                <p className="text-secondary font-semibold text-lg mb-6">Gründer und Inhaber</p>
                                <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                                    <p>
                                        Hinter <strong>Zusammen Umzüge</strong> steht Mustapha Benlaaouni.
                                    </p>
                                    <p>
                                        Durch seine langjährige praktische Erfahrung im Bereich Umzüge, Transporte und Kundenbetreuung kennt er die Anforderungen eines erfolgreichen Umzugs aus erster Hand.
                                    </p>
                                    <p>
                                        Mit der Gründung von Zusammen Umzüge verfolgt er das Ziel, Kunden einen zuverlässigen, transparenten und professionellen Service anzubieten – mit persönlicher Betreuung vom ersten Kontakt bis zum erfolgreichen Abschluss.
                                    </p>
                                    <p>
                                        Sein Anspruch ist es, jeden Auftrag sorgfältig zu planen, individuelle Lösungen zu finden und höchste Kundenzufriedenheit zu gewährleisten.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Warum Kunden uns wählen */}
            <section className="py-20 bg-primary-900 text-white relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute inset-0 opacity-10">
                    <svg className="absolute left-0 top-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <polygon fill="currentColor" points="0,100 100,0 100,100" />
                    </svg>
                </div>
                
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Warum Kunden uns wählen</h2>
                        <div className="w-20 h-1 bg-secondary mx-auto rounded-full"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {[
                            'Strukturierte Planung und Durchführung',
                            'Faire und ehrliche Kommunikation',
                            'Sorgfältiger Umgang mit Möbeln',
                            'Flexible und maßgeschneiderte Lösungen',
                            'Persönliche Betreuung durch den Inhaber',
                            'Hohe Sicherheitsstandards und Ladungssicherung'
                        ].map((benefit, idx) => (
                            <div key={idx} className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/20 transition-colors">
                                <CheckCircle2 className="w-6 h-6 text-secondary flex-shrink-0" />
                                <p className="font-medium">{benefit}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. Unsere Stärken */}
            <section className="py-20 bg-gray-50 dark:bg-gray-900">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-6">Unsere Stärken</h2>
                        <div className="w-20 h-1 bg-secondary mx-auto rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {[
                            { title: 'Persönliche Beratung', desc: 'Jeder Umzug wird individuell geplant und auf die Bedürfnisse unserer Kunden abgestimmt.' },
                            { title: 'Transparente Preise', desc: 'Klare Angebote ohne versteckte Kosten und mit nachvollziehbarer Preisstruktur.' },
                            { title: 'Zuverlässige Terminplanung', desc: 'Pünktliche Durchführung und strukturierte Organisation für maximale Planungssicherheit.' },
                            { title: 'Professionelle Durchführung', desc: 'Sorgfältiger Umgang mit Möbeln, Kartons und persönlichen Gegenständen.' }
                        ].map((strength, idx) => (
                            <div key={idx} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow flex flex-col items-center text-center">
                                <h3 className="text-xl font-bold mb-4 text-primary-600 dark:text-primary-400">{strength.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{strength.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 7. Final CTA */}
            <section className="py-24 bg-white dark:bg-gray-950 text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Bereit für Ihren nächsten Umzug?</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
                        Lassen Sie uns Ihren Umzug professionell planen und zuverlässig durchführen. Fordern Sie jetzt unverbindlich Ihr persönliches Angebot an.
                    </p>
                    <div className="flex flex-col items-center">
                        <Link 
                            href="/de/angebot" 
                            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-10 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                        >
                            Kostenloses Angebot anfordern
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <p className="mt-5 text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide">
                            Unverbindlich • Kostenlos • Schnelle Rückmeldung
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
