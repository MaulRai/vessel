'use client';

import { DashboardLayout } from '@/lib/components/DashboardLayout';

export default function RepaymentPage() {
    return (
        <DashboardLayout role="mitra">
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="p-4 bg-teal-500/10 rounded-full">
                    <svg className="w-12 h-12 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-white">Pembayaran</h1>
                <p className="text-slate-400 text-center max-w-md">
                    Fitur pembayaran dan pengelolaan hutang akan segera tersedia.
                </p>
            </div>
        </DashboardLayout>
    );
}
