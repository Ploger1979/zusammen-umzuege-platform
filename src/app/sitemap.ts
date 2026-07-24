import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://zusammenumzuege.de'
    const locales = ['de']
    const routes = [
        '',
        '/services',
        '/kontakt',
        '/impressum',
        '/datenschutz',
        '/agb',
        '/widerruf',
        '/angebot',
    ]

    const sitemapList: MetadataRoute.Sitemap = []

    for (const locale of locales) {
        for (const route of routes) {
            sitemapList.push({
                url: `${baseUrl}/${locale}${route}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: route === '' ? 1.0 : 0.8,
            })
        }
    }

    // Add root URL explicitly
    sitemapList.push({
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1.0,
    })

    return sitemapList
}
