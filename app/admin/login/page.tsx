'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';

export default function AdminLoginPage() {
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const response = await login({
            email_or_username: emailOrUsername,
            password: password,
        });

        setIsLoading(false);

        if (response.success && response.data?.user.role === 'admin') {
            router.push('/admin/dashboard');
        } else if (response.success) {
            setError('Akun ini bukan akun admin.');
        } else {
            setError(response.error?.message || 'Login gagal. Silakan coba lagi.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 overflow-hidden">
            <div className="w-full max-w-5xl h-[calc(100vh-2rem)] max-h-[720px] bg-slate-900/60 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50">
                <div className="grid md:grid-cols-2 h-full">
                    {/* Left Panel */}
                    <div className="p-6 md:p-8 lg:p-10 flex flex-col justify-center overflow-y-auto scrollbar-hide">
                        <div className="max-w-sm w-full mx-auto space-y-6">
                            {/* Brand */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Image
                                        src="/vessel-logo.png"
                                        alt="VESSEL Logo"
                                        width={130}
                                        height={36}
                                        className="h-10 w-auto object-contain"
                                        priority
                                    />
                                </div>
                                <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-violet-500/10 border border-violet-400/30 text-violet-200 uppercase tracking-wide">Admin</span>
                            </div>

                            {/* Header */}
                            <div className="space-y-2">
                                <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">Masuk ke Admin Panel</h1>
                                <p className="text-slate-400 text-sm">Kelola platform, tinjau invoice, dan atur funding pools.</p>
                            </div>

                            {/* Credential hint */}
                            <div className="p-4 rounded-xl border border-violet-500/30 bg-violet-500/10 shadow-inner">
                                <div className="flex items-center gap-2 mb-2 text-violet-200 font-semibold text-sm">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Kredensial Admin (MVP)</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-slate-200">
                                    <div className="flex flex-col rounded-lg bg-slate-900/60 border border-violet-500/20 px-3 py-2">
                                        <span className="text-slate-400">Username</span>
                                        <span className="font-mono text-violet-200">admin</span>
                                    </div>
                                    <div className="flex flex-col rounded-lg bg-slate-900/60 border border-violet-500/20 px-3 py-2">
                                        <span className="text-slate-400">Password</span>
                                        <span className="font-mono text-violet-200">admin123</span>
                                    </div>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="p-3 rounded-lg border border-red-500/50 bg-red-500/10 text-red-200 text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label htmlFor="emailOrUsername" className="text-sm font-medium text-slate-200">Email atau Username</label>
                                    <input
                                        type="text"
                                        id="emailOrUsername"
                                        value={emailOrUsername}
                                        onChange={(e) => setEmailOrUsername(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-lg bg-slate-900/70 border border-slate-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/40 text-slate-100 text-sm placeholder:text-slate-500 transition"
                                        placeholder="admin"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="password" className="text-sm font-medium text-slate-200">Password</label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-lg bg-slate-900/70 border border-slate-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/40 text-slate-100 text-sm placeholder:text-slate-500 transition"
                                        placeholder="admin123"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-400 hover:via-purple-400 hover:to-fuchsia-400 text-white font-semibold shadow-lg shadow-violet-900/40 transition disabled:opacity-60"
                                >
                                    {isLoading ? 'Memproses...' : 'Masuk ke Admin Panel'}
                                </button>
                            </form>

                            <div className="pt-3 border-t border-slate-800 text-xs text-slate-500 flex items-center gap-2">
                                <svg className="w-4 h-4 text-violet-300" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                                <span>Akses terbatas hanya untuk admin.</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Visual */}
                    <div className="hidden md:block relative bg-gradient-to-br from-violet-700 via-purple-700 to-slate-900">
                        <div className="absolute inset-0">
                            <Image
                                src="/assets/auth/auth-image-4.png"
                                alt="VESSEL Admin"
                                fill
                                className="object-cover object-left"
                                priority
                            />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/70 via-purple-900/40 to-transparent" />
                        <div className="relative h-full flex items-end p-8 text-violet-100">
                            <div className="max-w-md space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-200/80">Vessel Admin</p>
                                <h3 className="text-2xl font-bold">Kontrol penuh atas ekosistem pembiayaan ekspor.</h3>
                                <p className="text-sm text-violet-100/80">Kelola pengguna, tinjau invoice, dan pantau pool pendanaan secara real-time.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
