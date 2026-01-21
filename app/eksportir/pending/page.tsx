'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/context/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function PendingApprovalPage() {
    const router = useRouter();
    const { user, logout, isAuthenticated, isLoading } = useAuth();
    const { t } = useLanguage();
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        // Wait for auth to load
        if (isLoading) return;

        // If not authenticated, redirect to login
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        // If user is not mitra, redirect appropriately
        if (user?.role === 'investor') {
            router.push('/pendana/dashboard');
            return;
        }

        if (user?.role === 'admin') {
            router.push('/dashboard/admin');
            return;
        }

        // Check mitra application status
        // If approved, redirect to dashboard
        if (user?.member_status === 'member_mitra') {
            router.push('/eksportir/dashboard');
            return;
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCheckingAuth(false);
    }, [isAuthenticated, isLoading, user, router]);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    if (isLoading || checkingAuth) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
            <div className="max-w-lg w-full bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50 p-8 text-center">
                {/* Logo */}
                <div className="mb-6 flex justify-center">
                    <Image
                        src="/vessel-logo.png"
                        alt="VESSEL Logo"
                        width={140}
                        height={40}
                        className="h-12 w-auto object-contain"
                        priority
                    />
                </div>

                {/* Status Icon */}
                <div className="mb-6 flex justify-center">
                    <div className="w-20 h-20 bg-amber-500/20 border-2 border-amber-500/50 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-slate-100 mb-2">
                    {t('mitra.pendingTitle') || 'Application Submitted'}
                </h1>

                {/* Description */}
                <p className="text-slate-400 mb-6">
                    {t('mitra.pendingDescription') || 'Your mitra application is being reviewed by our team. We will notify you once your application has been approved.'}
                </p>

                {/* Status Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-sm font-medium mb-6">
                    <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                    {t('mitra.statusPending') || 'Pending Review'}
                </div>

                {/* Info Box */}
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 mb-6 text-left">
                    <h3 className="text-sm font-medium text-slate-300 mb-2">
                        {t('mitra.whatHappensNext') || 'What happens next?'}
                    </h3>
                    <ul className="text-sm text-slate-400 space-y-2">
                        <li className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {t('mitra.step1') || 'Our team will verify your company information'}
                        </li>
                        <li className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {t('mitra.step2') || 'You will receive an email notification'}
                        </li>
                        <li className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {t('mitra.step3') || 'Once approved, you can access the mitra dashboard'}
                        </li>
                    </ul>
                </div>

                {/* Contact Info */}
                <p className="text-sm text-slate-500 mb-6">
                    {t('mitra.contactInfo') || 'Need help?'}{' '}
                    <a href="mailto:support@vessel.io" className="text-cyan-400 hover:text-cyan-300">
                        support@vessel.io
                    </a>
                </p>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-slate-100 font-medium rounded-lg transition-all text-sm"
                >
                    {t('common.logout') || 'Logout'}
                </button>
            </div>
        </div>
    );
}
