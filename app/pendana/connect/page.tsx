'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ConnectWallet, Wallet } from '@coinbase/onchainkit/wallet';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { ONCHAINKIT_CONFIG } from '@/lib/config/onchainkit';

export default function InvestorConnectPage() {
    const router = useRouter();
    const { isConnected } = useAccount();
    const chainId = useChainId();
    const { switchChain, isPending: isSwitching, error: switchError } = useSwitchChain();
    const expectedChainId = ONCHAINKIT_CONFIG.chain.id;
    const isWrongChain = isConnected && chainId !== expectedChainId;

    useEffect(() => {
        if (isConnected && !isWrongChain) {
            router.push('/pendana/dashboard');
        }
    }, [isConnected, isWrongChain, router]);

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-linear-to-br from-cyan-500/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-linear-to-tl from-teal-500/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 w-full max-w-lg">
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 shadow-2xl">
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

                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-white mb-2">Hubungkan Wallet Anda</h1>
                        <p className="text-slate-400 text-sm">
                            Sebagai pendana, Anda dapat langsung mengakses platform dengan menghubungkan wallet Anda (MetaMask, Coinbase Wallet, atau WalletConnect).
                        </p>
                    </div>

                    {isWrongChain && (
                        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/50 rounded-xl text-sm text-amber-100 text-center space-y-3">
                            <div>Anda terhubung ke jaringan lain. Pilih jaringan {ONCHAINKIT_CONFIG.chain.name} untuk bertransaksi.</div>
                            <button
                                onClick={() => switchChain({ chainId: expectedChainId })}
                                disabled={isSwitching}
                                className="w-full px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-100 rounded-lg text-sm font-medium transition-all disabled:opacity-60"
                            >
                                {isSwitching ? 'Mengganti jaringan...' : `Ganti ke ${ONCHAINKIT_CONFIG.chain.name}`}
                            </button>
                            {switchError && <p className="text-xs text-amber-200/80">{switchError.message}</p>}
                        </div>
                    )}

                    <Wallet>
                        <ConnectWallet className="w-full justify-center px-6 py-4 bg-linear-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 rounded-xl font-bold text-lg text-white transition-all shadow-lg shadow-cyan-500/25" />
                    </Wallet>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-700" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-3 bg-slate-800/50 text-slate-500 text-xs">atau</span>
                        </div>
                    </div>

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

                <div className="mt-6 text-center">
                    <Link href="/" className="text-slate-400 hover:text-white transition-colors text-sm">
                        Kembali ke beranda
                    </Link>
                </div>
            </div>
        </div>
    );
}
