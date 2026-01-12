import { id, TranslationKeys } from './id';
import { en } from './en';

export type Language = 'id' | 'en';

const translations = {
    id,
    en,
} as const;

// Helper function to get nested translation value
export function getTranslation(lang: Language, key: string): string {
    const keys = key.split('.');
    let value: any = translations[lang];

    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            console.warn(`Translation key not found: ${key} for language: ${lang}`);
            return key; // Return key itself if translation not found
        }
    }

    return typeof value === 'string' ? value : key;
}

// Helper to replace placeholders like {name}, {percent}, etc.
export function interpolate(text: string, values: Record<string, string | number>): string {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
        return key in values ? String(values[key]) : match;
    });
}

export { id, en };
export type { TranslationKeys };
