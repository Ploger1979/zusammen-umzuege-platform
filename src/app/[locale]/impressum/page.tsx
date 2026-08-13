import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function ImpressumPage() {
    const t = useTranslations('Legal');

    return (
        <div className="relative min-h-screen font-sans text-gray-100 selection:bg-blue-500/30">
            {/* Fixed Fullscreen Background Image */}
            <div className="fixed inset-0 w-full h-full -z-10">
                <Image 
                    src="/impressum-hero.png" 
                    alt="Impressum Zusammen Umzüge" 
                    fill 
                    className="object-cover object-center scale-105"
                    quality={100}
                    priority
                />
                {/* Deep Overlay to keep it professional and not 'in your face' */}
                <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-[4px]"></div>
            </div>

            {/* Scrollable Content Area */}
            <main className="relative z-10 container mx-auto px-4 max-w-4xl py-24 md:py-32">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl uppercase tracking-[0.2em] font-light text-white drop-shadow-2xl">
                        {t('imprintTitle')}
                    </h1>
                    <div className="w-20 h-1 bg-blue-500 mx-auto mt-8 opacity-70"></div>
                </div>

                <p className="text-gray-400 mb-10 italic text-center text-sm md:text-base font-light tracking-wide max-w-2xl mx-auto">
                    {t('contentNotice')}
                </p>

                {/* Glassmorphism Content Box */}
                <div className="bg-black/40 backdrop-blur-2xl p-8 md:p-12 rounded-3xl shadow-2xl border border-white/10 space-y-10 text-gray-300">

                    <section className="group">
                        <h2 className="text-xl font-medium mb-3 text-white uppercase tracking-wider group-hover:text-blue-400 transition-colors">Angaben gemäß § 5 TMG</h2>
                        <p className="leading-relaxed font-light text-lg">
                            <strong className="text-white font-normal">Zusammen Umzüge</strong><br />
                            Inhaber: Mustapha Benlaaouni<br />
                            Zehnthofstraße 55<br />
                            55252 Mainz-Kastel
                        </p>
                    </section>

                    <section className="group">
                        <h2 className="text-xl font-medium mb-3 text-white uppercase tracking-wider group-hover:text-blue-400 transition-colors">Kontakt</h2>
                        <p className="leading-relaxed font-light text-lg">
                            Telefon: 01782722300<br />
                            E-Mail: info@zusammenumzuege.de
                        </p>
                    </section>

                    <section className="group">
                        <h2 className="text-xl font-medium mb-3 text-white uppercase tracking-wider group-hover:text-blue-400 transition-colors">Aufsichtsbehörde</h2>
                        <p className="leading-relaxed font-light text-lg">
                            Gewerbeamt der Landeshauptstadt Wiesbaden
                        </p>
                    </section>

                    <section className="group">
                        <h2 className="text-xl font-medium mb-3 text-white uppercase tracking-wider group-hover:text-blue-400 transition-colors">Angemeldete Tätigkeit</h2>
                        <p className="leading-relaxed font-light text-lg">
                            Umzüge und Transporte bis 3,5 t zulässigem Gesamtgewicht; Entrümpelungen
                        </p>
                    </section>

                    <section className="group">
                        <h2 className="text-xl font-medium mb-3 text-white uppercase tracking-wider group-hover:text-blue-400 transition-colors">Steuernummer</h2>
                        <p className="leading-relaxed font-light text-lg">
                            <span className="text-white">040 805 34168</span>
                        </p>
                    </section>

                    <section className="group">
                        <h2 className="text-xl font-medium mb-3 text-white uppercase tracking-wider group-hover:text-blue-400 transition-colors">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
                        <p className="leading-relaxed font-light text-lg">
                            Mustapha Benlaaouni<br />
                            Zehnthofstraße 55<br />
                            55252 Mainz-Kastel
                        </p>
                    </section>

                    <section className="group">
                        <h2 className="text-xl font-medium mb-3 text-white uppercase tracking-wider group-hover:text-blue-400 transition-colors">Streitschlichtung</h2>
                        <p className="leading-relaxed font-light text-lg">
                            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
                            <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-400 hover:text-blue-300 hover:underline transition-colors">https://ec.europa.eu/consumers/odr</a>.<br />
                            Unsere E-Mail-Adresse finden Sie oben im Impressum.
                        </p>
                        <p className="leading-relaxed font-light text-lg mt-4 text-gray-400">
                            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
                        </p>
                    </section>

                </div>
            </main>
        </div>
    );
}
