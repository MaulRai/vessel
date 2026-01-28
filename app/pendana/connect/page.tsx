'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAccount, useChainId, useConnect } from 'wagmi';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ONCHAINKIT_CONFIG } from '@/lib/config/onchainkit';

export default function InvestorConnectPage() {
    const router = useRouter();
    const { isConnected } = useAccount();
    const chainId = useChainId();
    const { connect, connectors, isPending } = useConnect();
    const { t, language, setLanguage } = useLanguage();
    const expectedChainId = ONCHAINKIT_CONFIG.chain.id;
    const isWrongChain = isConnected && chainId !== expectedChainId;
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (isConnected && !isWrongChain) {
            router.push('/pendana/dashboard');
        }
    }, [isConnected, isWrongChain, router]);

    // Prioritize Coinbase Wallet, then others
    const sortedConnectors = [...connectors].sort((a, b) => {
        if (a.id === 'coinbaseWalletSDK') return -1;
        if (b.id === 'coinbaseWalletSDK') return 1;
        return 0;
    });

    const handleConnect = (connector: any) => {
        connect({ connector });
        setShowModal(false);
    };

    return (
        <div className="min-h-screen h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
            <div className="w-full max-w-5xl h-[calc(100vh-2rem)] max-h-[700px] bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50">
                <div className="grid md:grid-cols-2 h-full">
                    {/* Left Column - Connection Interface */}
                    <div className="p-6 md:p-8 lg:p-10 flex flex-col justify-center overflow-y-auto scrollbar-hide">
                        <div className="max-w-sm mx-auto w-full">
                            {/* Logo */}
                            <div className="mb-6 flex items-center justify-between gap-3">
                                <div className="flex items-center space-x-2">
                                    <Link href="/">
                                        <Image
                                            src="/vessel-logo.png"
                                            alt="VESSEL Logo"
                                            width={120}
                                            height={32}
                                            className="h-10 w-auto object-contain"
                                            priority
                                        />
                                    </Link>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
                                    className="inline-flex items-center rounded-full border border-cyan-500/50 bg-slate-900/50 p-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-100 shadow-sm hover:border-cyan-400 transition-colors"
                                    aria-label={language === 'en' ? t('common.switchToIndonesian') : t('common.switchToEnglish')}
                                >
                                    <span
                                        className={`px-2 py-1 rounded-full ${language === 'en' ? 'bg-cyan-400 text-slate-900 shadow' : 'text-cyan-100'}`}
                                    >
                                        {t('common.languageShort.en')}
                                    </span>
                                    <span
                                        className={`px-2 py-1 rounded-full ${language === 'id' ? 'bg-cyan-400 text-slate-900 shadow' : 'text-cyan-100'}`}
                                    >
                                        {t('common.languageShort.id')}
                                    </span>
                                </button>
                            </div>

                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-white mb-2">{t('investorConnect.title')}</h2>
                                <p className="text-slate-400 text-sm">
                                    {t('investorConnect.subtitle')}
                                </p>
                            </div>

                            {/* Benefits */}
                            <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {[
                                    { img: '/assets/auth/under-review.png', title: t('investorConnect.benefits.instantAccess') },
                                    { img: '/assets/auth/lock.png', title: t('investorConnect.benefits.keysControl') },
                                    { img: '/assets/auth/onchain.png', title: t('investorConnect.benefits.onChain') }
                                ].map((benefit) => (
                                    <div
                                        key={benefit.title}
                                        className="flex items-center gap-2 p-1 bg-slate-900/40 border border-slate-700/60 rounded-md"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center">
                                            <Image
                                                src={benefit.img}
                                                alt={benefit.title}
                                                width={32}
                                                height={32}
                                                className="w-12 h-12 object-contain"
                                                priority
                                            />
                                        </div>
                                        <div className="text-slate-200 text-xs font-semibold leading-tight">{benefit.title}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex-1" aria-hidden />
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="min-w-[220px] justify-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 rounded-lg font-bold text-base text-white transition-all shadow-lg shadow-cyan-900/50"
                                >
                                    Connect Wallet
                                </button>
                                <div className="flex-1" aria-hidden />
                            </div>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-700" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-slate-800/50 text-slate-400 text-xs">{t('investorConnect.exporterCta')}</span>
                                </div>
                            </div>

                            <Link
                                href="/register"
                                className="block w-full text-center px-4 py-2.5 bg-slate-900/50 hover:bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-lg text-slate-300 hover:text-white transition-all text-sm"
                            >
                                {t('investorConnect.registerExporter')}
                            </Link>

                            {/* Trust Indicators */}
                            <div className="mt-4 pt-4 border-t border-slate-700">
                                <div className="flex items-center justify-center space-x-6 text-xs text-slate-400">
                                    <div className="flex items-center space-x-1">
                                        <svg className="w-3.5 h-3.5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                        <span>{t('investorConnect.nonCustodial')}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <svg className="w-3.5 h-3.5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span>{t('investorConnect.onChain')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Image */}
                    <div className="hidden md:block relative bg-gradient-to-br from-slate-800 via-cyan-900 to-teal-900">
                        <div className="absolute inset-0">
                            <Image
                                src="/assets/auth/auth-image-4.png"
                                alt="Investor wallet connection"
                                fill
                                className="object-cover object-left"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Wallet Selection Modal */}
            {showModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-sm w-full p-6 relative">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <h3 className="text-xl font-bold text-white mb-6 text-center">Select Wallet</h3>

                        <div className="space-y-3">
                            {sortedConnectors.map((connector) => {
                                // icon logic
                                const getWalletIcon = (id: string) => {
                                    if (id === 'coinbaseWalletSDK') return 'https://avatars.githubusercontent.com/u/18060234?s=200&v=4';
                                    if (id === 'metaMask') return 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg';
                                    if (id === 'walletConnect') return 'https://explorer-api.walletconnect.com/v3/logo/lg/2b272c72-4682-4aa4-297c-9a4b3b3e2b02?format=png';
                                    return connector.icon;
                                };
                                const iconUrl = getWalletIcon(connector.id);

                                return (
                                    <button
                                        key={connector.uid}
                                        onClick={() => handleConnect(connector)}
                                        disabled={isPending}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${connector.id === 'coinbaseWalletSDK'
                                                ? 'bg-blue-600 hover:bg-blue-500 border-blue-500 text-white'
                                                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {iconUrl ? (
                                                <div className="w-8 h-8 rounded-full bg-white/10 p-1 flex items-center justify-center overflow-hidden">
                                                    <img
                                                        src={iconUrl}
                                                        alt={connector.name}
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                    </svg>
                                                </div>
                                            )}
                                            <span className="font-semibold text-lg">{connector.name}</span>
                                        </div>
                                        {connector.id === 'coinbaseWalletSDK' && (
                                            <span className="bg-white/20 text-xs px-2 py-1 rounded">Recommended</span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
