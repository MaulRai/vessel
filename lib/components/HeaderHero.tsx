import Image from 'next/image';
import type { ReactNode } from 'react';

export function HeaderHero({
    imageSrc,
    title,
    subtitle,
    cta,
    color = 'sky',
}: {
    imageSrc: string;
    title: string;
    subtitle: string;
    cta?: ReactNode;
    color?: 'sky' | 'violet' | 'cyan' | 'teal' | 'emerald' | 'blue' | 'indigo' | 'rose';
}) {
    const colorVariants: Record<string, { bg: string; radial1: string; radial2: string; shadow: string }> = {
        sky: {
            bg: 'from-sky-900/50 via-sky-800/40',
            radial1: 'from-sky-400/20',
            radial2: 'from-sky-500/10',
            shadow: 'shadow-sky-900/40'
        },
        violet: {
            bg: 'from-violet-900/50 via-violet-800/40',
            radial1: 'from-violet-400/20',
            radial2: 'from-violet-500/10',
            shadow: 'shadow-violet-900/40'
        },
        cyan: {
            bg: 'from-cyan-900/50 via-cyan-800/40',
            radial1: 'from-cyan-400/20',
            radial2: 'from-cyan-500/10',
            shadow: 'shadow-cyan-900/40'
        },
        teal: {
            bg: 'from-teal-900/50 via-teal-800/40',
            radial1: 'from-teal-400/20',
            radial2: 'from-teal-500/10',
            shadow: 'shadow-teal-900/40'
        },
        emerald: {
            bg: 'from-emerald-900/50 via-emerald-800/40',
            radial1: 'from-emerald-400/20',
            radial2: 'from-emerald-500/10',
            shadow: 'shadow-emerald-900/40'
        },
        blue: {
            bg: 'from-blue-900/50 via-blue-800/40',
            radial1: 'from-blue-400/20',
            radial2: 'from-blue-500/10',
            shadow: 'shadow-blue-900/40'
        },
        indigo: {
            bg: 'from-indigo-900/50 via-indigo-800/40',
            radial1: 'from-indigo-400/20',
            radial2: 'from-indigo-500/10',
            shadow: 'shadow-indigo-900/40'
        },
        rose: {
            bg: 'from-rose-900/50 via-rose-800/40',
            radial1: 'from-rose-400/20',
            radial2: 'from-rose-500/10',
            shadow: 'shadow-rose-900/40'
        }
    };

    const variant = colorVariants[color] || colorVariants.sky;

    return (
        <header className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${variant.bg} to-transparent p-6 sm:p-8`}>
            <div className="absolute inset-0">
                <div className={`absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,_var(--tw-gradient-stops))] ${variant.radial1} to-transparent`} />
                <div className={`absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,_var(--tw-gradient-stops))] ${variant.radial2} to-transparent`} />
                <div
                    className="pointer-events-none absolute inset-[-40%] bg-[linear-gradient(120deg,transparent_10%,rgba(255,255,255,0.12)_50%,transparent_90%)]"
                    style={{ animation: 'shine 7s ease-in-out infinite' }}
                />
            </div>
            <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 sm:flex sm:items-stretch sm:gap-4">
                    <div className={`relative h-24 w-24 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg ${variant.shadow}`}>
                        <Image src={imageSrc} alt={title} fill className="object-cover" priority />
                    </div>
                    <div className="contents sm:flex sm:flex-col sm:justify-center">
                        <h1 className="text-2xl md:text-3xl font-bold text-white">{title}</h1>
                        <p className="col-span-2 mt-1 max-w-3xl text-xs md:text-sm text-slate-200/80">{subtitle}</p>
                    </div>
                </div>
                {cta ? <div className="self-start sm:self-center">{cta}</div> : null}
            </div>
            <style jsx>{`
                @keyframes shine {
                    0% { transform: translateX(-20%); }
                    100% { transform: translateX(20%); }
                }
            `}</style>
        </header>
    );
}