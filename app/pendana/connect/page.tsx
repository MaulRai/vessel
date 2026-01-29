'use client';
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ConnectWallet, Wallet } from '@coinbase/onchainkit/wallet';
import { useAccount, useChainId, useSwitchChain, useSignMessage } from 'wagmi';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ONCHAINKIT_CONFIG } from '@/lib/config/onchainkit';
import { authAPI } from '@/lib/api/auth';
import { useInvestorWallet } from '@/lib/context/InvestorWalletContext';

const INVESTOR_WALLET_KEY = 'vessel_investor_wallet';

export default function InvestorConnectPage() {
    const router = useRouter();
    const { isConnected: wagmiConnected, address } = useAccount();
    const chainId = useChainId();
    const { switchChain, isPending: isSwitching, error: switchErrorRaw } = useSwitchChain();
    const { signMessageAsync } = useSignMessage();
    const { t, language, setLanguage } = useLanguage();
    const { isConnected: investorConnected, loginInvestor, isLoading: isInvestorLoading } = useInvestorWallet();
    const expectedChainId = ONCHAINKIT_CONFIG.chain.id;
    const switchError = switchErrorRaw instanceof Error ? switchErrorRaw : null;
    const isWrongChain = wagmiConnected && chainId !== expectedChainId;

    // Backend authentication state
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const [hasAuthenticated, setHasAuthenticated] = useState(false);
    const authAttemptedRef = useRef(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (investorConnected) {
            router.push('/pendana/dashboard');
        }
    }, [investorConnected, router]);

    // Backend authentication after wallet connects
    const authenticateWithBackend = useCallback(async (walletAddress: string) => {
        // Prevent multiple attempts
        if (isAuthenticating || hasAuthenticated || authAttemptedRef.current) return;
        authAttemptedRef.current = true;

        setIsAuthenticating(true);
        setAuthError(null);

        try {
            // Step 1: Get nonce from backend
            const nonceResponse = await authAPI.walletNonce({ wallet_address: walletAddress });
            if (!nonceResponse.success || !nonceResponse.data) {
                throw new Error(nonceResponse.error?.message || 'Failed to get nonce');
            }

            const { nonce, message } = nonceResponse.data;

            // Step 2: Sign the message with wallet
            const signature = await signMessageAsync({ message });

            // Step 3: Login/Register with backend
            const loginResponse = await authAPI.walletLogin({
                wallet_address: walletAddress,
                signature,
                message,
                nonce,
            });

            if (!loginResponse.success || !loginResponse.data) {
                throw new Error(loginResponse.error?.message || 'Failed to authenticate');
            }

            // Step 4: Store tokens for authenticated API calls
            localStorage.setItem('vessel_access_token', loginResponse.data.access_token);
            localStorage.setItem('vessel_refresh_token', loginResponse.data.refresh_token);
            localStorage.setItem('vessel_user', JSON.stringify(loginResponse.data.user));

            // Step 5: Update InvestorWalletContext state directly
            loginInvestor(walletAddress);

            setHasAuthenticated(true);

            // Redirect to dashboard
            router.push('/pendana/dashboard');
        } catch (error: unknown) {
            console.error('Backend authentication failed:', error);
            const message = error instanceof Error ? error.message : 'Authentication failed. Please try again.';
            setAuthError(message);
            setIsAuthenticating(false);
            authAttemptedRef.current = false; // Allow retry on error
        }
    }, [isAuthenticating, hasAuthenticated, signMessageAsync, router, loginInvestor]);

    useEffect(() => {
        // Only attempt auth if wagmi connected, correct chain, address exists, and not already authenticated
        // AND investor wallet context is done loading (to ensure we don't re-auth if already connected)
        if (!isInvestorLoading && wagmiConnected && !isWrongChain && address && !hasAuthenticated && !isAuthenticating && !authAttemptedRef.current) {
            authenticateWithBackend(address);
        }
    }, [isInvestorLoading, wagmiConnected, isWrongChain, address, hasAuthenticated, isAuthenticating, authenticateWithBackend]);

    return (
        <div className="min-h-screen h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 overflow-hidden">
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

                            {/* Authentication Error */}
                            {authError && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                                    <p className="text-red-400 text-sm">{authError}</p>
                                </div>
                            )}

                            {/* Authenticating State */}
                            {isAuthenticating && (
                                <div className="mb-4 p-3 bg-cyan-500/10 border border-cyan-500/50 rounded-lg">
                                    <p className="text-cyan-400 text-sm flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        {t('investorConnect.authenticating') || 'Authenticating... Please sign the message in your wallet.'}
                                    </p>
                                </div>
                            )}

                            {isWrongChain && (
                                <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/50 rounded-lg text-sm text-amber-100 space-y-2">
                                    <div className="flex items-start gap-2">
                                        <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <div>
                                            <p className="font-medium text-xs mb-1">{t('investorConnect.wrongNetworkTitle')}</p>
                                            <p className="text-xs text-amber-200/80">{t('investorConnect.wrongNetworkBody')} {ONCHAINKIT_CONFIG.chain.name}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => switchChain({ chainId: expectedChainId })}
                                        disabled={isSwitching}
                                        className="w-full px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-100 rounded-lg text-xs font-medium transition-all disabled:opacity-60"
                                    >
                                        {isSwitching ? t('investorConnect.switching') : `${t('investorConnect.switchTo')} ${ONCHAINKIT_CONFIG.chain.name}`}
                                    </button>
                                    {switchError && <p className="text-xs text-amber-200/80">{switchError.message}</p>}
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <div className="flex-1" aria-hidden />
                                <Wallet>
                                    <ConnectWallet className="min-w-[220px] justify-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 rounded-lg font-bold text-base text-white transition-all shadow-lg shadow-cyan-900/50" />
                                </Wallet>
                                <div className="flex-1" aria-hidden />
                            </div>

                            {/* Don't have a wallet? */}
                            <div className="mt-4 p-3 bg-slate-900/50 border border-slate-700/50 rounded-lg">
                                <p className="text-slate-400 text-xs text-center mb-2">
                                    {t('investorConnect.noWalletTitle')}
                                </p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    <a
                                        href="https://metamask.io/download/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs text-slate-300 transition-colors"
                                    >
                                        {t('investorConnect.getMetaMask')}
                                    </a>
                                    <a
                                        href="https://www.coinbase.com/wallet"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs text-slate-300 transition-colors"
                                    >
                                        {t('investorConnect.getCoinbase')}
                                    </a>
                                </div>
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
        </div>
    );
}
