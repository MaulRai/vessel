'use client';

import { useState } from 'react';
import { ConnectWallet, Wallet } from '@coinbase/onchainkit/wallet';
import { useAccount, useSignMessage } from 'wagmi';
import { authAPI } from '@/lib/api/auth';
import { userAPI } from '@/lib/api/user';

interface ExporterConnectWalletProps {
    currentWallet?: string;
    onSuccess: (address: string) => void;
}

export function ExporterConnectWallet({ currentWallet, onSuccess }: ExporterConnectWalletProps) {
    const { address, isConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const [isLinking, setIsLinking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLinkWallet = async () => {
        if (!address) return;
        setIsLinking(true);
        setError(null);

        try {
            // 1. Get nonce
            const nonceRes = await authAPI.walletNonce({ wallet_address: address });
            if (!nonceRes.success || !nonceRes.data) throw new Error(nonceRes.error?.message);

            const { nonce, message } = nonceRes.data;

            // 2. Sign message
            const signature = await signMessageAsync({ message });

            // 3. Link wallet
            const linkRes = await userAPI.updateWallet({
                wallet_address: address,
                message,
                signature,
                nonce
            });

            if (!linkRes.success) throw new Error(linkRes.error?.message);

            onSuccess(address);
        } catch (err: unknown) {
            console.error('Wallet link error:', err);
            const message = err instanceof Error ? err.message : 'Gagal menghubungkan wallet';
            setError(message);
        } finally {
            setIsLinking(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <h3 className="text-sm font-medium text-slate-300 mb-2">Dompet Kripto (Wallet)</h3>
                {currentWallet ? (
                    <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-md border border-slate-700/50">
                        <div className="overflow-hidden">
                            <p className="text-xs text-slate-400 mb-1">Terhubung:</p>
                            <p className="text-sm font-mono text-cyan-400 truncate w-full">{currentWallet}</p>
                        </div>
                        <span className="ml-2 px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/20 shrink-0">
                            Terverifikasi
                        </span>
                    </div>
                ) : (
                    <p className="text-sm text-slate-400">
                        Belum ada wallet terhubung. Hubungkan wallet untuk menerima pencairan dana dari investor.
                    </p>
                )}
            </div>

            <div className="flex flex-col gap-3">
                <Wallet>
                    <ConnectWallet className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-600" />
                </Wallet>

                {isConnected && address && address.toLowerCase() !== currentWallet?.toLowerCase() && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                        <button
                            onClick={handleLinkWallet}
                            disabled={isLinking}
                            className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-all shadow-lg shadow-cyan-900/20"
                        >
                            {isLinking ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Memverifikasi...
                                </span>
                            ) : (
                                'Verifikasi & Simpan Wallet Ini'
                            )}
                        </button>
                        <p className="text-xs text-slate-500 mt-2 text-center">
                            Anda perlu menandatangani pesan untuk memverifikasi kepemilikan.
                        </p>
                    </div>
                )}

                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-xs text-red-400">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
