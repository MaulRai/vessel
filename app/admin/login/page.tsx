'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
            router.push('/dashboard/admin');
        } else if (response.success) {
            setError('Akun ini bukan akun admin.');
        } else {
            setError(response.error?.message || 'Login gagal. Silakan coba lagi.');
        }
    };

    return (
        <div className="min-h-screen h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 overflow-hidden">
            <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50 p-8">
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-1">
                        Admin Panel
                    </h1>
                    <p className="text-slate-300 text-sm">
                        Vessel Finance Backoffice
                    </p>
                </div>

                <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-amber-400 font-semibold text-sm">Kredensial Admin (MVP)</span>
                    </div>
                    <div className="space-y-1 text-sm">
                        <p className="text-slate-300">
                            <span className="text-slate-400">Username:</span>{' '}
                            <code className="bg-slate-700/50 px-2 py-0.5 rounded text-amber-300">admin</code>
                        </p>
                        <p className="text-slate-300">
                            <span className="text-slate-400">Password:</span>{' '}
                            <code className="bg-slate-700/50 px-2 py-0.5 rounded text-amber-300">admin123</code>
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <div>
                        <label htmlFor="emailOrUsername" className="block text-sm font-medium text-slate-300 mb-1.5">
                            Email atau Username
                        </label>
                        <input
                            type="text"
                            id="emailOrUsername"
                            value={emailOrUsername}
                            onChange={(e) => setEmailOrUsername(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-slate-100 text-sm placeholder:text-slate-500"
                            placeholder="admin"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-slate-100 text-sm placeholder:text-slate-500"
                            placeholder="admin123"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:from-slate-600 disabled:to-slate-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all text-sm shadow-lg shadow-amber-900/50"
                    >
                        {isLoading ? 'Memproses...' : 'Masuk ke Admin Panel'}
                    </button>
                </form>

                <div className="mt-6 pt-4 border-t border-slate-700">
                    <div className="flex items-center justify-center text-xs text-slate-400">
                        <svg className="w-4 h-4 text-amber-400 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <span>Akses Terbatas - Hanya Admin</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
