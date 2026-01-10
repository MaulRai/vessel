'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/lib/components/DashboardLayout';
import { userAPI, UserProfileResponse } from '@/lib/api/user';

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfileResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await userAPI.getProfile();
            if (res.success && res.data) {
                setProfile(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch profile', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout role="mitra">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
                </div>
            </DashboardLayout>
        );
    }

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <DashboardLayout role="mitra">
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Profil Pengguna</h1>
                    <p className="text-slate-400 mt-1">Informasi akun dan personal Anda</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Profile Card */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">
                                    {profile?.username?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">{profile?.username}</h2>
                                    <p className="text-slate-400">{profile?.email}</p>
                                </div>
                                <div className="ml-auto">
                                    {profile?.is_verified ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Verified
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-600/50 text-slate-300">
                                            Unverified
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Username</label>
                                    <p className="text-white mt-1 font-medium">{profile?.username}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Email</label>
                                    <p className="text-white mt-1 font-medium">{profile?.email}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Role</label>
                                    <p className="text-white mt-1 font-medium capitalize">{profile?.role}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Bergabung Sejak</label>
                                    <p className="text-white mt-1 font-medium">{profile?.created_at ? formatDate(profile.created_at) : '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Verification Status */}
                        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
                            <h3 className="text-lg font-semibold text-white mb-4">Status Verifikasi</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-700/20 rounded-lg border border-slate-600/30">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-full ${profile?.email_verified ? 'bg-green-500/10 text-green-400' : 'bg-slate-600/30 text-slate-400'}`}>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">Verifikasi Email</p>
                                            <p className="text-xs text-slate-400">{profile?.email_verified ? 'Email Anda telah terverifikasi' : 'Silakan verifikasi email Anda'}</p>
                                        </div>
                                    </div>
                                    {profile?.email_verified && (
                                        <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-700/20 rounded-lg border border-slate-600/30">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-full ${profile?.profile_completed ? 'bg-green-500/10 text-green-400' : 'bg-slate-600/30 text-slate-400'}`}>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">Kelengkapan Profil (KYC)</p>
                                            <p className="text-xs text-slate-400">{profile?.profile_completed ? 'Data diri Anda lengkap' : 'Lengkapi data diri Anda'}</p>
                                        </div>
                                    </div>
                                    {profile?.profile_completed && (
                                        <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Wallet & Balance */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl p-6 shadow-lg shadow-black/20">
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Saldo Anda</h3>
                            <div className="flex items-baseline space-x-1">
                                <span className="text-3xl font-bold text-white">{profile ? formatCurrency(profile.balance_idr) : 'Rp 0'}</span>
                            </div>
                            <div className="mt-6 pt-6 border-t border-slate-700/50">
                                <button className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-all">
                                    Riwayat Transaksi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
