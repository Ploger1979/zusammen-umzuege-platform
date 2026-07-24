import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: 'selector',
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui'],
                mono: ['var(--font-geist-mono)', 'ui-monospace'],
                cairo: ['var(--font-cairo)', 'sans-serif'],
            },
            colors: {
                primary: {
                    50: 'var(--color-primary-50)',
                    100: 'var(--color-primary-100)',
                    200: 'var(--color-primary-200)',
                    300: 'var(--color-primary-300)',
                    400: 'var(--color-primary-400)',
                    500: 'var(--color-primary-500)',
                    600: 'var(--color-primary-600)',
                    700: 'var(--color-primary-700)',
                    800: 'var(--color-primary-800)',
                    900: 'var(--color-primary-900)',
                    DEFAULT: 'var(--color-primary-700)',
                },
                secondary: {
                    DEFAULT: 'var(--color-secondary)',
                    hover: 'var(--color-secondary-hover)',
                    light: 'var(--color-secondary-light)',
                },
                // 🎨 الألوان الدلالية (Semantic Colors)
                // هذه الألوان تتغير تلقائيًا بناءً على الوضع (ليلي/نهاري)

                background: "var(--background)",
                foreground: "var(--foreground)",

                card: {
                    DEFAULT: "var(--card)",
                    foreground: "var(--card-foreground)",
                },
                muted: {
                    DEFAULT: "var(--muted)",
                    foreground: "var(--muted-foreground)",
                },
                border: "var(--border)",
                input: "var(--input)",
            },
        },
    },
    plugins: [],
};
export default config;
