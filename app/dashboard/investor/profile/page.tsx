'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { userAPI } from '@/lib/api/user';

interface UserProfile {
    id?: string;
    full_name?: string;
    email: string;
    username?: string;
    phone?: string;
    nik_masked?: string;
    created_at: string;
    role?: string;
    is_verified?: boolean;
    profile_completed?: boolean;
    balance_idr?: number;
}

interface BankAccount {
    bank_name: string;
    account_number: string;
    account_name: string;
    is_verified: boolean;
}

export default function InvestorProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, bankRes] = await Promise.all([
                    userAPI.getProfile(),
                    userAPI.getBankAccount(),
                ]);

                if (profileRes.success && profileRes.data) {
                    setProfile(profileRes.data as unknown as UserProfile);
                }
                if (bankRes.success && bankRes.data) {
                    setBankAccount(bankRes.data as unknown as BankAccount);
                }
            } catch (error) {
                console.error('Failed to fetch profile data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-cyan-500/30">
            {/* Navigation Bar (Simplified) */}
            <nav className="border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-2">
                            <Link href="/dashboard/investor" className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-teal-400 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                                    VESSEL
                                </span>
                            </Link>
                        </div>
                        <div>
                            <Link
                                href="/dashboard/investor"
                                className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
                            >
                                Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">My Profile</h1>
                    <p className="text-slate-400">Manage your personal information and bank account details.</p>
                </div>

                <div className="grid gap-8">
                    {/* Identity Section */}
                    <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Personal Identity</h2>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                        Verified
                                    </span>
                                    <span className="text-slate-500 text-sm">KYC Completed</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Full Name</label>
                                <div className="text-lg text-slate-200 font-medium">{profile?.full_name || '-'}</div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Email</label>
                                <div className="text-lg text-slate-200 font-medium">{profile?.email || '-'}</div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Phone Number</label>
                                <div className="text-lg text-slate-200 font-medium">{profile?.phone || '-'}</div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">NIK (National ID)</label>
                                <div className="text-lg text-slate-200 font-medium tracking-wider font-mono">{profile?.nik_masked || '-'}</div>
                            </div>
                        </div>
                    </section>

                    {/* Bank Account Section */}
                    <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-12 h-12 bg-teal-500/10 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Bank Account</h2>
                                <p className="text-slate-400 text-sm">Primary account for withdrawals and deposits</p>
                            </div>
                        </div>

                        {bankAccount ? (
                            <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M4 10h16v10H4z" fillOpacity="0.5" />
                                        <path d="M2 8h20v2H2z" />
                                    </svg>
                                </div>

                                <div className="relative z-10 grid gap-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-sm text-slate-400 mb-1">Bank Name</div>
                                            <div className="text-2xl font-bold text-white tracking-tight">{bankAccount.bank_name}</div>
                                        </div>
                                        {bankAccount.is_verified && (
                                            <div className="bg-teal-500/20 text-teal-300 text-xs px-2 py-1 rounded border border-teal-500/30">Verified</div>
                                        )}
                                    </div>

                                    <div>
                                        <div className="text-sm text-slate-400 mb-1">Account Number</div>
                                        <div className="text-xl font-mono text-cyan-300 tracking-wider">{bankAccount.account_number}</div>
                                    </div>

                                    <div>
                                        <div className="text-sm text-slate-400 mb-1">Account Holder</div>
                                        <div className="text-lg text-white font-medium uppercase">{bankAccount.account_name}</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                No bank account linked.
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}
