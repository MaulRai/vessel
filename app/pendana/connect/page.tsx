'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/context/AuthContext';
import { authAPI } from '@/lib/api/auth';
import { createBaseAccountSDK } from '@base-org/account';
import { SignInWithBaseButton } from '@base-org/account-ui/react';

export default function InvestorConnectPage() {
    const router = useRouter();
    const { walletLogin } = useAuth();
    const { t, language, setLanguage } = useLanguage();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignIn = async () => {
        setError('');
        setIsLoading(true);
        try {
            // Initialize Base SDK
            const sdk = createBaseAccountSDK({
                appName: 'Vessel Finance',
            });
            const provider = sdk.getProvider();

            // 1. Get nonce from backend
            // We use a temporary address or just request a nonce generically?
            // AuthAPI expects basic request, but usually nonce is generated for a specific address.
            // Documentation says: "get a fresh nonce (generate locally or prefetch from backend)"
            // BUT backend expects nonce to be stored associated with wallet if we use `get_wallet_nonce`.
            // Wait, backend `get_wallet_nonce` stores it keyed by wallet address. 
            // So we need the address FIRST?
            // The Base Auth flow (SIWE cap) sends nonce IN the connection request. 
            // This implies we need the nonce BEFORE we know the address (or at least we send it blindly).
            // IF we use SIWE capability, the wallet signs it.

            // Backend `get_wallet_nonce` requires `wallet_address`.
            // This creates a chicken-and-egg problem if we strictly follow the backend's current flow
            // which assumes: Connect Wallet -> Get Address -> Request Nonce -> Sign Message.

            // The Base "Sign In with Base" (SIWE capability) flow is: 
            //   Connect(with SIWE params including nonce) -> Returns Address + Signature.

            // If we generate a nonce locally (random UUID), the backend won't know about it 
            // UNLESS we send it during verification and the backend validates it stateless (checking format/time) 
            // OR we registered it somehow.

            // Looking at backend `verify_wallet_signature`:
            // It expects `wallet_nonces` to have the nonce stored for that wallet.

            // HACK/ADJUSTMENT: 
            // We cannot use `authAPI.walletNonce` (which requires address) BEFORE connecting.
            // So we must use the standard Connect -> Sign flow if we want to use existing backend logic perfectly,
            // OR we change the backend to accept any nonce (stateless SIWE) which it doesn't seem to do.

            // However, `createBaseAccountSDK` documentation says:
            // "const nonce = window.crypto.randomUUID().replace(/-/g, "");"
            // This nonce is client-side generated? 
            // If backend validates it, it must be stored or stateless (replay protection).
            // Backend `wallet_login` checks: `if stored_nonce != &req.nonce`.
            // So backend MUST have stored it.

            // STRATEGY:
            // 1. Connect first (without SIWE capability or just basic connect) to get Address.
            // 2. Request Nonce from Backend for that Address.
            // 3. Request Signature (using `personal_sign` or SIWE).

            // BUT Base Account SDK emphasizes "Sign In with Ethereum" capability in `wallet_connect`.

            // Let's try to do it in two steps if possible, or use a "Pre-request" to backend to get a "session nonce"?
            // Current backend: `get_wallet_nonce` takes `wallet_address`.

            // Workaround: 
            // 1. `eth_requestAccounts` to get address.
            // 2. `authAPI.walletNonce` to get key.
            // 3. `personal_sign` (or SIWE) to sign.

            // Let's use the provider from SDK but do standard flow to ensure backend compatibility.

            const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[];
            const address = accounts[0];

            if (!address) throw new Error("No account found");

            // 2. Get Nonce from Backend
            const nonceRes = await authAPI.walletNonce({ wallet_address: address });
            if (!nonceRes.success || !nonceRes.data) {
                throw new Error(nonceRes.error?.message || "Failed to generate nonce");
            }
            const { nonce, message } = nonceRes.data;

            // 3. Sign Message
            const signature = await provider.request({
                method: 'personal_sign',
                params: [message, address],
            }) as string;

            // 4. Verify & Login
            const loginRes = await walletLogin({
                wallet_address: address,
                signature,
                message,
                nonce
            });

            if (loginRes.success) {
                router.push('/pendana/dashboard');
            } else {
                setError(loginRes.error?.message || "Login failed");
            }

        } catch (err: unknown) {
            console.error("Sign In Error:", err);
            setError(err instanceof Error ? err.message : "Failed to sign in");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
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

                            <div className="flex items-center gap-3">
                                <div className="flex-1" aria-hidden />
                                {/* Use Base UI Button but override click to handle flow manually to ensure backend compat */}
                                {/* Or acts as a trigger */}
                                <div className="w-full">
                                    <SignInWithBaseButton
                                        colorScheme="dark"
                                        onClick={isLoading ? undefined : handleSignIn}
                                    />
                                </div>
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
