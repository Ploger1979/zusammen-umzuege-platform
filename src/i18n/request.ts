import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
    // This typically corresponds to the `[locale]` segment
    let locale = await requestLocale;

    // Force German locale
    if (!locale || locale !== 'de') {
        locale = 'de';
    }

    return {
        locale,
        messages: (await import(`../messages/de.json`)).default
    };
});
