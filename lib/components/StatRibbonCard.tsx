import Image from 'next/image';
import React from 'react';

interface StatRibbonCardProps {
  color: string;
  imageSrc?: string;
  imageAlt?: string;
  children: React.ReactNode;
}

export function StatRibbonCard({ color, imageSrc, imageAlt, children }: StatRibbonCardProps) {
  return (
    <div className="relative overflow-hidden rounded-r-2xl rounded-l-none border border-slate-800 bg-slate-900/50 shadow-inner shadow-black/30 px-5 py-5">
      <div className="absolute left-0 top-0 h-full w-1.5" style={{ backgroundColor: color }} />
      <div
        className="absolute inset-y-0 left-0 w-28"
        style={{ background: `linear-gradient(90deg, ${color}33 0%, rgba(15,23,42,0) 100%)` }}
      />

      {imageSrc ? (
        <div className="pointer-events-none absolute right-[-28px] bottom-[-16px] opacity-15" aria-hidden="true">
          <Image src={imageSrc} alt={imageAlt || 'decorative'} width={200} height={200} className="object-contain" />
        </div>
      ) : null}

      <div className="relative space-y-2">
        {children}
      </div>
    </div>
  );
}
