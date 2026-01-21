'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useInvestorWallet } from '@/lib/context/InvestorWalletContext';

export default function InvestorConnectPage() {
    const router = useRouter();
    const {
        isConnected,
        isConnecting,
        isMetaMaskInstalled,
        error,
        chainId,
        connectWallet,
        switchToCorrectChain,
    } = useInvestorWallet();

    const [isRedirecting, setIsRedirecting] = useState(false);
    const expectedChainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '31337', 10);
    const isWrongChain = chainId !== null && chainId !== expectedChainId;

    // Redirect if already connected
    useEffect(() => {
        if (isConnected && !isWrongChain) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsRedirecting(true);
            router.push('/pendana/dashboard');
        }
    }, [isConnected, isWrongChain, router]);

    const handleConnect = async () => {
        const success = await connectWallet();
        if (success) {
            router.push('/pendana/dashboard');
        }
    };

    const handleSwitchChain = async () => {
        await switchToCorrectChain();
    };

    if (isRedirecting) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                    <p className="text-slate-400">Mengalihkan ke dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-teal-500/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 w-full max-w-lg">
                {/* Card */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 shadow-2xl">
                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <Image
                            src="/vessel-logo.png"
                            alt="VESSEL Logo"
                            width={150}
                            height={40}
                            className="h-14 w-auto object-contain"
                            priority
                        />
                    </div>

                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-white mb-2">
                            Hubungkan Wallet Anda
                        </h1>
                        <p className="text-slate-400 text-sm">
                            Sebagai pendana, Anda dapat langsung mengakses platform dengan menghubungkan wallet MetaMask Anda.
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
                            <p className="text-red-400 text-sm text-center">{error}</p>
                        </div>
                    )}

                    {/* Wrong Chain Warning */}
                    {isWrongChain && (
                        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/50 rounded-xl">
                            <p className="text-amber-400 text-sm text-center mb-3">
                                Anda terhubung ke jaringan yang salah. Silakan berganti ke jaringan yang benar.
                            </p>
                            <button
                                onClick={handleSwitchChain}
                                className="w-full px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-100 rounded-lg text-sm font-medium transition-all"
                            >
                                Ganti Jaringan
                            </button>
                        </div>
                    )}

                    {/* Connect Button */}
                    {!isMetaMaskInstalled ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl text-center">
                                <p className="text-slate-300 text-sm mb-4">
                                    MetaMask tidak terdeteksi. Silakan install MetaMask untuk melanjutkan.
                                </p>
                                <a
                                    href="https://metamask.io/download/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 rounded-xl font-semibold text-white transition-all"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M22.5 11.5L19.5 4.5L12 2L4.5 4.5L1.5 11.5L4.5 19.5L12 22L19.5 19.5L22.5 11.5Z" />
                                    </svg>
                                    <span>Install MetaMask</span>
                                </a>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={handleConnect}
                            disabled={isConnecting}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 disabled:from-slate-600 disabled:to-slate-600 rounded-xl font-bold text-lg text-white transition-all shadow-lg shadow-cyan-500/25"
                        >
                            {isConnecting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Menghubungkan...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                    <span>Hubungkan MetaMask</span>
                                </>
                            )}
                        </button>
                    )}

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-3 bg-slate-800/50 text-slate-500 text-xs">atau</span>
                        </div>
                    </div>

                    {/* Alternative Links */}
                    <div className="space-y-3">
                        <Link
                            href="/register"
                            className="block w-full text-center px-4 py-3 bg-slate-900/50 hover:bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-xl text-slate-300 hover:text-white transition-all text-sm"
                        >
                            Daftar sebagai Eksportir/Mitra
                        </Link>
                        <Link
                            href="/login"
                            className="block w-full text-center px-4 py-3 text-slate-400 hover:text-cyan-400 transition-colors text-sm"
                        >
                            Sudah punya akun mitra? Masuk
                        </Link>
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-8 pt-6 border-t border-slate-700/50">
                        <div className="flex items-center justify-center space-x-6 text-xs text-slate-500">
                            <div className="flex items-center space-x-1">
                                <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                                <span>Non-Custodial</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>On-Chain Verified</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back Link */}
                <div className="mt-6 text-center">
                    <Link href="/" className="text-slate-400 hover:text-white transition-colors text-sm">
                        ← Kembali ke Beranda
                    </Link>
                </div>
            </div>
        </div>
    );
}
