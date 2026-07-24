import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/invoice/', '/private/'],
        },
        sitemap: 'https://zusammenumzuege.de/sitemap.xml',
    }
}
