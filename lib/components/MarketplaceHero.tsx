import Image from 'next/image';
import type { ReactNode } from 'react';

export function MarketplaceHero({
    imageSrc,
    title,
    subtitle,
    cta,
}: {
    imageSrc: string;
    title: string;
    subtitle: string;
    cta?: ReactNode;
}) {
    return (
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-900/50 via-sky-800/40 to-transparent p-6 sm:p-8">
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(56,189,248,0.18),rgba(8,47,73,0))]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(14,165,233,0.12),rgba(8,47,73,0))]" />
                <div
                    className="pointer-events-none absolute inset-[-40%] bg-[linear-gradient(120deg,transparent_10%,rgba(255,255,255,0.12)_50%,transparent_90%)]"
                    style={{ animation: 'shine 7s ease-in-out infinite' }}
                />
            </div>
            <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-stretch gap-4">
                    <div className="relative h-24 w-24 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg shadow-sky-900/40">
                        <Image src={imageSrc} alt={title} fill className="object-cover" priority />
                    </div>
                    <div className="flex flex-col justify-center">
                        <h1 className="text-3xl font-bold text-white">{title}</h1>
                        <p className="mt-1 max-w-3xl text-sm text-slate-200/80">{subtitle}</p>
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