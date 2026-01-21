'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import en from './translations/en.json';
import id from './translations/id.json';

type Language = 'en' | 'id';
type TranslationKeys = typeof en;

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations: Record<Language, TranslationKeys> = { en, id };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_KEY = 'vessel_language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');

    // Load saved language on mount
    useEffect(() => {
        const saved = localStorage.getItem(LANGUAGE_KEY) as Language | null;
        if (saved && (saved === 'en' || saved === 'id')) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLanguageState(saved);
        }
    }, []);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem(LANGUAGE_KEY, lang);
    }, []);

    // Translation function - supports nested keys like "nav.dashboard"
    const t = useCallback((key: string): string => {
        const keys = key.split('.');
        let value: unknown = translations[language];

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = (value as Record<string, unknown>)[k];
            } else {
                // Fallback to English if key not found in current language
                let fallback: unknown = translations['en'];
                for (const fk of keys) {
                    if (fallback && typeof fallback === 'object' && fk in fallback) {
                        fallback = (fallback as Record<string, unknown>)[fk];
                    } else {
                        return key; // Return key if not found in fallback either
                    }
                }
                return typeof fallback === 'string' ? fallback : key;
            }
        }

        return typeof value === 'string' ? value : key;
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
