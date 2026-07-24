import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import type { Metadata } from 'next';
import Script from 'next/script';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    metadataBase: new URL('https://zusammenumzuege.de'),
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: 'https://zusammenumzuege.de',
      siteName: 'Zusammen Umzüge',
      images: [
        {
          url: 'https://zusammenumzuege.de/Final-Logo-Mit-Webseite-MintGreen.png',
          width: 1200,
          height: 1200,
          alt: 'Zusammen Umzüge Logo',
        },
      ],
      locale: locale,
      type: 'website',
    },
      twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['https://zusammenumzuege.de/Final-Logo-Mit-Webseite-MintGreen.png'],
    },
    verification: {
      google: '2IhAGtUCnfAXY5Wg_9tDrCqUw7TbpeUSHnD8Pd4lr0M',
    },
    icons: {
      icon: [
        { url: '/Final-Logo-Mit-Webseite-MintGreen.png' },
        { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      ],
      apple: 'https://zusammenumzuege.de/Final-Logo-Mit-Webseite-MintGreen.png',
    },
    manifest: '/manifest.json?v=3',
    appleWebApp: {
      capable: true,
      title: 'Zusammen',
      statusBarStyle: 'black-translucent',
    },
    other: {
      'structured-data': JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "Zusammen Umzüge",
        "image": [
          "https://zusammenumzuege.de/Logo-Mit-Webseite-Circle.png",
          "https://zusammenumzuege.de/Bilder-Unsere-Leistungen/07a5c069-c816-4739-b08c-05341ed2f182.jpg"
        ],
        "@id": "https://zusammenumzuege.de",
        "url": "https://zusammenumzuege.de",
        "telephone": "+491782722300",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Zehnthofstraße 55",
          "addressLocality": "Mainz-Kastel",
          "postalCode": "55252",
          "addressCountry": "DE"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 50.0076,
          "longitude": 8.2831
        },
        "openingHoursSpecification": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
          ],
          "opens": "08:00",
          "closes": "20:00"
        }
      })
    }
  };
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid - ONLY DE ALLOWED NOW
  if (locale !== 'de') {
    notFound();
  }

  // Providing all messages to the client
  const messages = await getMessages();

  return (
    <html lang="de" dir="ltr" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Zusammen Umzüge",
              "image": [
                "https://zusammenumzuege.de/Logo-Mit-Webseite-Circle.png",
                "https://zusammenumzuege.de/Bilder-Unsere-Leistungen/07a5c069-c816-4739-b08c-05341ed2f182.jpg"
              ],
              "url": "https://zusammenumzuege.de",
              "telephone": "+491782722300",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Zehnthofstraße 55",
                "addressLocality": "Mainz-Kastel",
                "postalCode": "55252",
                "addressCountry": "DE"
              }
            })
          }}
        />
      </head>
      <body
        className={`
            ${geistSans.variable} ${geistMono.variable}
            antialiased transition-colors duration-300
            font-sans
            bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100
        `}
      >
        <NextIntlClientProvider messages={messages}>
          <Script id="register-sw" strategy="afterInteractive">
            {`
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `}
          </Script>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
              <Chatbot />
            </div>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
