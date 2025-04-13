/** @type {import('tailwindcss').Config} */

import { heroui } from "@heroui/react";
import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                background: 'var(--background)',
                foreground: 'var(--foreground)',
            },
            fontFamily: {
                sans: ['var(--font-sans)'],
                mono: ['var(--font-mono)'],
            },
        },
    },
    darkMode: "class",
    plugins: [heroui()],
};

export default config;
