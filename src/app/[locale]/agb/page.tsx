import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function AgbPage() {
    const t = useTranslations('Legal');

    return (
        <div className="relative min-h-screen font-sans text-gray-100 selection:bg-blue-500/30">
            {/* Fixed Fullscreen Background Image */}
            <div className="fixed inset-0 w-full h-full -z-10">
                <Image 
                    src="/agb-hero.png" 
                    alt="AGB Zusammen Umzüge" 
                    fill 
                    className="object-cover object-center scale-105"
                    quality={100}
                    priority
                />
                {/* Deep Overlay */}
                <div className="absolute inset-0 bg-gray-950/85 backdrop-blur-[3px]"></div>
            </div>

            {/* Scrollable Content Area */}
            <main className="relative z-10 container mx-auto px-4 max-w-4xl py-24 md:py-32">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl uppercase tracking-[0.2em] font-light text-white drop-shadow-[0_0_15px_rgba(96,165,250,0.3)]">
                        {t('termsTitle')}
                    </h1>
                    <div className="w-20 h-1 bg-blue-400 mx-auto mt-8 opacity-70"></div>
                </div>

                <p className="text-gray-400 mb-10 italic text-center text-sm md:text-base font-light tracking-wide max-w-2xl mx-auto">
                    {t('contentNotice')}
                </p>

                {/* Glassmorphism Content Box */}
                <div className="bg-black/40 backdrop-blur-3xl p-8 md:p-12 rounded-3xl shadow-2xl border border-white/5 space-y-10 text-gray-300">

                    <section className="group">
                        <h2 className="text-xl font-medium mb-4 text-white uppercase tracking-wider group-hover:text-blue-400 transition-colors">§ 1 Geltungsbereich</h2>
                        <p className="leading-relaxed font-light text-lg space-y-2">
                            <span className="block">(1) Die nachstehenden Geschäftsbedingungen gelten für alle Verträge über Umzugsdienstleistungen und Transporte zwischen <span className="text-white font-normal">Zusammen Umzüge</span> (nachfolgend „Auftragnehmer“) und dem Kunden (nachfolgend „Auftraggeber“).</span>
                            <span className="block">(2) Abweichende Bedingungen des Auftraggebers werden nicht anerkannt, es sei denn, der Auftragnehmer stimmt ihrer Geltung ausdrücklich schriftlich zu.</span>
                        </p>
                    </section>

                    <section className="group">
                        <h2 className="text-xl font-medium mb-4 text-white uppercase tracking-wider group-hover:text-blue-400 transition-colors">§ 2 Vertragsabschluss</h2>
                        <p className="leading-relaxed font-light text-lg">
                            Der Vertrag kommt durch die Annahme des Angebots des Auftragnehmers durch den Auftraggeber zustande. Die Annahme kann schriftlich, per E-Mail oder durch schlüssiges Verhalten erfolgen.
                        </p>
                    </section>

                    <section className="group">
                        <h2 className="text-xl font-medium mb-4 text-white uppercase tracking-wider group-hover:text-blue-400 transition-colors">§ 3 Leistungen</h2>
                        <p className="leading-relaxed font-light text-lg">
                            Der Umfang der vertraglichen Leistungen ergibt sich aus dem schriftlichen Angebot bzw. der Auftragsbestätigung. Zusätzliche Leistungen, die nicht im Angebot enthalten sind, werden gesondert berechnet.
                        </p>
                    </section>

                    <section className="group">
                        <h2 className="text-xl font-medium mb-4 text-white uppercase tracking-wider group-hover:text-blue-400 transition-colors">§ 4 Preise und Zahlungsbedingungen</h2>
                        <p className="leading-relaxed font-light text-lg space-y-2">
                            <span className="block">(1) Alle Preise verstehen sich in Euro inkl. der gesetzlichen Mehrwertsteuer, sofern nicht anders ausgewiesen.</span>
                            <span className="block">(2) Die Vergütung ist, sofern nichts anderes vereinbart ist, unmittelbar nach Erbringung der Dienstleistung fällig und in bar oder per Überweisung zu zahlen.</span>
                        </p>
                    </section>

                    <section className="group">
                        <h2 className="text-xl font-medium mb-4 text-white uppercase tracking-wider group-hover:text-blue-400 transition-colors">§ 5 Haftung</h2>
                        <p className="leading-relaxed font-light text-lg border-l-2 border-blue-400/30 pl-4 py-2 mt-2">
                            Der Auftragnehmer haftet nach den gesetzlichen Bestimmungen (HGB) für Schäden, die durch Verlust oder Beschädigung des Umzugsgutes in der Zeit von der Übernahme zur Beförderung bis zur Ablieferung entstehen. Die Haftung ist auf den gesetzlichen Höchstbetrag von <strong className="text-white font-normal">620 Euro pro Kubikmeter Laderaum</strong> beschränkt.
                        </p>
                    </section>

                    <section className="group">
                        <h2 className="text-xl font-medium mb-4 text-white uppercase tracking-wider group-hover:text-blue-400 transition-colors">§ 6 Gerichtsstand</h2>
                        <p className="leading-relaxed font-light text-lg">
                            Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist der Sitz des Auftragnehmers, soweit der Auftraggeber Kaufmann ist.
                        </p>
                    </section>

                </div>
            </main>
        </div>
    );
}
