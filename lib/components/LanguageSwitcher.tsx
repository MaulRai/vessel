'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (lang: 'en' | 'id') => {
        setLanguage(lang);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between gap-1.5 w-[84px] px-3 py-1.5 bg-slate-800/60 hover:bg-slate-700/60 rounded-lg border border-slate-700/50 transition-all group"
            >
                <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <span className="text-sm font-medium text-slate-200">
                    {language.toUpperCase()}
                </span>
                <svg className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                    <button
                        onClick={() => handleSelect('en')}
                        className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors ${language === 'en'
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : 'text-slate-300 hover:bg-slate-700'
                            }`}
                    >
                        <span className="text-base">🇺🇸</span>
                        English
                    </button>
                    <button
                        onClick={() => handleSelect('id')}
                        className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors ${language === 'id'
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : 'text-slate-300 hover:bg-slate-700'
                            }`}
                    >
                        <span className="text-base">🇮🇩</span>
                        Indonesia
                    </button>
                </div>
            )}
        </div>
    );
}
