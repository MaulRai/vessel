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
        <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 md:p-6 overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-linear-to-br from-cyan-500/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-linear-to-tl from-teal-500/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 w-full max-w-7xl">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                    {/* Left Column - Education & Benefits */}
                    <div className="space-y-8 hidden lg:block">
                        {/* Logo */}
                        <Link href="/" className="inline-block">
                            <Image
                                src="/vessel-logo.png"
                                alt="VESSEL Logo"
                                width={150}
                                height={40}
                                className="h-14 w-auto object-contain transition-transform hover:scale-105"
                                priority
                            />
                        </Link>

                        {/* Value Proposition */}
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent mb-4">
                                Your Gateway to Export Financing
                            </h1>
                            <p className="text-slate-400 text-lg mb-8">
                                Connect your wallet in seconds and start earning up to 15% APY by investing in verified export invoices.
                            </p>

                            {/* Benefits */}
                            <div className="space-y-4">
                                {[
                                    { icon: '⚡', title: 'Instant Access', desc: 'No registration forms or verification wait times' },
                                    { icon: '🔒', title: 'Your Keys, Your Control', desc: 'Non-custodial. We never hold your funds' },
                                    { icon: '🌐', title: '100% On-Chain', desc: 'All transactions verified on Base blockchain' }
                                ].map((benefit, idx) => (
                                    <div key={idx} className="flex items-start gap-4 p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:bg-slate-800/50 transition-colors">
                                        <span className="text-2xl">{benefit.icon}</span>
                                        <div>
                                            <h3 className="text-white font-semibold mb-1">{benefit.title}</h3>
                                            <p className="text-slate-400 text-sm">{benefit.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* What Happens Next */}
                        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                What Happens Next?
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { step: '1', text: 'Connect your wallet (30 seconds)' },
                                    { step: '2', text: 'Take 2-minute risk assessment' },
                                    { step: '3', text: 'Browse investment pools' },
                                    { step: '4', text: 'Start earning returns' }
                                ].map((item) => (
                                    <div key={item.step} className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold">
                                            {item.step}
                                        </div>
                                        <span className="text-slate-300 text-sm">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Trust Seals */}
                        <div className="flex items-center gap-6 pt-4 border-t border-slate-700/50">
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                                Non-Custodial
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                On-Chain Verified
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <span className="text-xs font-bold px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">BASE</span>
                                Powered by Base
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Connection Interface */}
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 shadow-2xl">
                        {/* Mobile Logo */}
                        <div className="flex justify-center mb-6 lg:hidden">
                            <Image
                                src="/vessel-logo.png"
                                alt="VESSEL Logo"
                                width={120}
                                height={32}
                                className="h-12 w-auto object-contain"
                                priority
                            />
                        </div>

                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
                            <p className="text-slate-400 text-sm">
                                Choose your preferred wallet to get started
                            </p>
                        </div>

                        {isWrongChain && (
                            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/50 rounded-xl text-sm text-amber-100 space-y-3">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <div>
                                        <p className="font-medium mb-1">Wrong Network Detected</p>
                                        <p className="text-xs text-amber-200/80">You're connected to the wrong network. Please switch to {ONCHAINKIT_CONFIG.chain.name} to continue.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => switchChain({ chainId: expectedChainId })}
                                    disabled={isSwitching}
                                    className="w-full px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-100 rounded-lg text-sm font-medium transition-all disabled:opacity-60"
                                >
                                    {isSwitching ? 'Switching Network...' : `Switch to ${ONCHAINKIT_CONFIG.chain.name}`}
                                </button>
                                {switchError && <p className="text-xs text-amber-200/80">{switchError.message}</p>}
                            </div>
                        )}

                        <Wallet>
                            <ConnectWallet className="w-full justify-center px-6 py-4 bg-linear-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 rounded-xl font-bold text-lg text-white transition-all shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 hover:-translate-y-0.5" />
                        </Wallet>

                        {/* Don't have a wallet? */}
                        <div className="mt-6 p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl">
                            <p className="text-slate-400 text-sm text-center mb-3">
                                Don't have a wallet yet?
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                <a
                                    href="https://metamask.io/download/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs text-slate-300 transition-colors"
                                >
                                    Get MetaMask
                                </a>
                                <a
                                    href="https://www.coinbase.com/wallet"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs text-slate-300 transition-colors"
                                >
                                    Get Coinbase Wallet
                                </a>
                            </div>
                        </div>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-700" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-3 bg-slate-800/50 text-slate-500 text-xs">Are you an exporter?</span>
                            </div>
                        </div>

                        <Link
                            href="/register"
                            className="block w-full text-center px-4 py-3 bg-slate-900/50 hover:bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-xl text-slate-300 hover:text-white transition-all text-sm"
                        >
                            Register as Exporter/Mitra
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
