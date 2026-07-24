import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function DatenschutzPage() {
    const t = useTranslations('Legal');

    return (
        <div className="relative min-h-screen font-sans text-gray-100 selection:bg-blue-500/30">
            {/* Fixed Fullscreen Background Image */}
            <div className="fixed inset-0 w-full h-full -z-10">
                <Image 
                    src="/datenschutz-hero.png" 
                    alt="Datenschutz Zusammen Umzüge" 
                    fill 
                    className="object-cover object-center scale-105"
                    quality={100}
                    priority
                />
                {/* Deep Overlay */}
                <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-[5px]"></div>
            </div>

            {/* Scrollable Content Area */}
            <main className="relative z-10 container mx-auto px-4 max-w-4xl py-24 md:py-32">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl uppercase tracking-[0.2em] font-light text-white drop-shadow-[0_0_15px_rgba(96,165,250,0.3)]">
                        {t('privacyTitle')}
                    </h1>
                    <div className="w-20 h-1 bg-blue-400 mx-auto mt-8 opacity-70"></div>
                </div>

                <p className="text-gray-400 mb-10 italic text-center text-sm md:text-base font-light tracking-wide max-w-2xl mx-auto">
                    {t('contentNotice')}
                </p>

                {/* Glassmorphism Content Box */}
                <div className="bg-black/40 backdrop-blur-2xl p-8 md:p-12 rounded-3xl shadow-2xl border border-white/5 space-y-10 text-gray-300">

                    <section className="group">
                        <h2 className="text-xl font-medium mb-4 text-white uppercase tracking-wider group-hover:text-blue-400 transition-colors">1. Datenschutz auf einen Blick</h2>
                        <h3 className="text-lg text-gray-200 mb-2 font-light">Allgemeine Hinweise</h3>
                        <p className="leading-relaxed font-light text-lg">
                            Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
                        </p>
                    </section>

                    <section className="group">
                        <h3 className="text-lg text-gray-200 mb-4 font-light">Datenerfassung auf dieser Website</h3>
                        <p className="leading-relaxed font-light text-lg mb-4">
                            <strong className="text-white font-normal block mb-1">Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong>
                            Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.
                        </p>
                        <p className="leading-relaxed font-light text-lg">
                            <strong className="text-white font-normal block mb-1">Wie erfassen wir Ihre Daten?</strong>
                            Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z. B. um Daten handeln, die Sie in ein Kontaktformular oder Anfrageformular eingeben.
                        </p>
                    </section>

                    <section className="group">
                        <h2 className="text-xl font-medium mb-4 text-white uppercase tracking-wider group-hover:text-blue-400 transition-colors">2. Hosting</h2>
                        <p className="leading-relaxed font-light text-lg">
                            Wir hosten die Inhalte unserer Website bei folgendem Anbieter:<br />
                            <span className="text-white">Netlify, Inc.</span><br />
                            44 Montgomery Street, Suite 300, San Francisco, California 94104.
                        </p>
                    </section>

                    <section className="group">
                        <h2 className="text-xl font-medium mb-4 text-white uppercase tracking-wider group-hover:text-blue-400 transition-colors">3. Allgemeine Hinweise und Pflichtinformationen</h2>
                        <h3 className="text-lg text-gray-200 mb-2 font-light">Datenschutz</h3>
                        <p className="leading-relaxed font-light text-lg">
                            Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
                        </p>
                    </section>

                    <section className="group">
                        <h3 className="text-lg text-gray-200 mb-2 font-light">Hinweis zur verantwortlichen Stelle</h3>
                        <p className="leading-relaxed font-light text-lg border-l-2 border-blue-400/30 pl-4 py-2 mt-4">
                            Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:<br /><br />
                            <strong className="text-white font-normal">Zusammen Umzüge</strong><br />
                            Inhaber: Mustapha Benlaaouni<br />
                            Zehnthofstraße 55<br />
                            55252 Mainz-Kastel<br /><br />
                            E-Mail: <span className="text-blue-400">info@zusammenumzuege.de</span>
                        </p>
                    </section>

                </div>
            </main>
        </div>
    );
}
