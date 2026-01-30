'use client';
/* eslint-disable @next/next/no-img-element */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/context/AuthContext';
import { authAPI } from '@/lib/api/auth';
import { createBaseAccountSDK } from '@base-org/account';
import { baseSepolia } from 'wagmi/chains';
import { riskQuestionnaireAPI } from '@/lib/api/user';
import { WalletSelectionModal } from '@/lib/components/WalletSelectionModal';

export default function InvestorConnectPage() {
    const router = useRouter();
    const { walletLogin } = useAuth();
    const { t, language, setLanguage } = useLanguage();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSignIn = async () => {
        setError('');
        setIsLoading(true);
        try {
            // Initialize Base Account SDK
            const sdk = createBaseAccountSDK({
                appName: 'Vessel Finance',
                appChainIds: [baseSepolia.id] // Base Sepolia Testnet
            });

            const provider = sdk.getProvider();

            // 1. Connect
            const accounts = await provider.request({ method: 'eth_requestAccounts' });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (!accounts || (accounts as any).length === 0) {
                throw new Error('No accounts found');
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const address = (accounts as any)[0];

            // 2. Get Nonce
            const nonceRes = await authAPI.walletNonce({ wallet_address: address });
            if (!nonceRes.success || !nonceRes.data) {
                throw new Error(nonceRes.error?.message || "Failed to generate nonce");
            }
            const { nonce, message } = nonceRes.data;

            // 3. Sign message
            const signature = await provider.request({
                method: 'personal_sign',
                params: [message, address]
            });

            // 4. Login
            const loginRes = await walletLogin({
                wallet_address: address,
                signature: signature as string,
                message,
                nonce
            });
            if (loginRes?.success) {
                // Check risk assessment status
                try {
                    const statusRes = await riskQuestionnaireAPI.getStatus();
                    if (statusRes.success && statusRes.data && statusRes.data.completed) {
                        router.push('/pendana/dashboard');
                    } else {
                        router.push('/pendana/risk-assessment');
                    }
                } catch {
                    // Fallback if status check fails
                    router.push('/pendana/risk-assessment');
                }
            } else {
                throw new Error(loginRes?.error?.message || "Login failed");
            }

        } catch (err: unknown) {
            console.error("Sign In Error:", err);
            setError(err instanceof Error ? err.message : "Failed to sign in");
        } finally {
            setIsLoading(false);
        }
    };

    const handleMetaMaskSignIn = async () => {
        setIsModalOpen(false);
        setError('');
        setIsLoading(true);
        try {
            if (!window.ethereum) {
                window.open('https://metamask.io/download/', '_blank');
                return;
            }

            // Handle multiple providers (e.g., if Coinbase Wallet is also installed)
            let provider = window.ethereum;
            if (window.ethereum.providers?.length) {
                provider = window.ethereum.providers.find((p: { isMetaMask?: boolean }) => p.isMetaMask) || window.ethereum;
            }

            if (!provider.isMetaMask) {
                window.open('https://metamask.io/download/', '_blank');
                return;
            }

            await connectAndSign(provider);
        } catch (err: unknown) {
            console.error("MetaMask Sign In Error:", err);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((err as any).code === 4001) {
                setError('Connection rejected');
            } else {
                setError(err instanceof Error ? err.message : "Failed to sign in with MetaMask");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCoinbaseSignIn = async () => {
        setIsModalOpen(false);
        setError('');
        setIsLoading(true);
        try {
            if (!window.ethereum) {
                window.open('https://www.coinbase.com/wallet', '_blank');
                return;
            }

            // Handle multiple providers
            let provider = window.ethereum;
            if (window.ethereum.providers?.length) {
                provider = window.ethereum.providers.find((p: { isCoinbaseWallet?: boolean }) => p.isCoinbaseWallet) || window.ethereum;
            }

            // If Coinbase Wallet extension is not detected via isCoinbaseWallet flag, 
            // but we want to force it or fallback, we might need to rely on the user having it.
            // However, typically Coinbase Wallet injects itself. 
            // If strictly not found, we could try to prompt installation.

            // Note: If using SDK, we might need a different approach, but for injected:
            if (!provider.isCoinbaseWallet) {
                // Try looking for 'coinbaseWalletExtension' object if present
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if ((window as any).coinbaseWalletExtension) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    provider = (window as any).coinbaseWalletExtension;
                } else {
                    window.open('https://www.coinbase.com/wallet', '_blank');
                    return;
                }
            }

            await connectAndSign(provider);

        } catch (err: unknown) {
            console.error("Coinbase Wallet Sign In Error:", err);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((err as any).code === 4001) {
                setError('Connection rejected');
            } else {
                setError(err instanceof Error ? err.message : "Failed to sign in with Coinbase Wallet");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Shared connection logic
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const connectAndSign = async (provider: any) => {
        // 1. Connect
        const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[];
        if (!accounts || accounts.length === 0) {
            throw new Error('No accounts found');
        }
        const address = accounts[0];

        // 2. Get Nonce
        const nonceRes = await authAPI.walletNonce({ wallet_address: address });
        if (!nonceRes.success || !nonceRes.data) {
            throw new Error(nonceRes.error?.message || "Failed to generate nonce");
        }
        const { nonce, message } = nonceRes.data;

        // 3. Sign message
        const signature = await provider.request({
            method: 'personal_sign',
            params: [message, address]
        }) as string;

        // 4. Login
        const loginRes = await walletLogin({
            wallet_address: address,
            signature,
            message,
            nonce
        });

        if (loginRes?.success) {
            // Check risk assessment status
            try {
                const statusRes = await riskQuestionnaireAPI.getStatus();
                if (statusRes.success && statusRes.data && statusRes.data.completed) {
                    router.push('/pendana/dashboard');
                } else {
                    router.push('/pendana/risk-assessment');
                }
            } catch {
                // Fallback if status check fails
                router.push('/pendana/risk-assessment');
            }
        } else {
            throw new Error(loginRes?.error?.message || "Login failed");
        }
    }

    return (
        <div className="min-h-screen h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
            <WalletSelectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelectCoinbase={handleCoinbaseSignIn}
                onSelectMetaMask={handleMetaMaskSignIn}
                isLoading={isLoading}
            />
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

                            {/* Error Message */}
                            {error && (
                                <div className="p-3 mb-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                                    <p className="text-red-400 text-sm">{error}</p>
                                </div>
                            )}

                            <div className="flex flex-col gap-3">
                                {/* Single Connect Wallet Button */}
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    disabled={isLoading}
                                    className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 p-4 transition-all hover:from-cyan-400 hover:to-teal-400 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-cyan-900/20"
                                >
                                    <div className="relative flex items-center justify-center gap-3">
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <span className="font-bold text-white text-lg">Connect Wallet</span>
                                    </div>
                                </button>
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
                    <div className="hidden md:block relative bg-linear-to-br from-slate-800 via-cyan-900 to-teal-900">
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
        </div>
    );
}