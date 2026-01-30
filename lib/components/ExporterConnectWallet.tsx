'use client';

import { useState } from 'react';
import { useAccount, useSignMessage, useConnect, useDisconnect } from 'wagmi';
import { authAPI } from '@/lib/api/auth';
import { userAPI } from '@/lib/api/user';
import { WalletSelectionModal } from '@/lib/components/WalletSelectionModal';

interface ExporterConnectWalletProps {
    currentWallet?: string;
    onSuccess: (address: string) => void;
}

export function ExporterConnectWallet({ currentWallet, onSuccess }: ExporterConnectWalletProps) {
    const { address, isConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();
    const [isLinking, setIsLinking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleConnectMetaMask = () => {
        setIsModalOpen(false);
        setError(null);
        // Look for MetaMask specific connectors first
        const connector = connectors.find(c => c.id === 'metaMaskSDK') ||
            connectors.find(c => c.id === 'io.metamask') ||
            connectors.find(c => c.id === 'injected');

        if (connector) {
            connect({ connector });
        } else {
            setError('MetaMask tidak ditemukan. Silakan instal MetaMask terlebih dahulu.');
        }
    };

    const handleConnectCoinbase = () => {
        setIsModalOpen(false);
        setError(null);
        const connector = connectors.find(c => c.id === 'coinbaseWalletSDK');
        if (connector) {
            connect({ connector });
        } else {
            window.open('https://www.coinbase.com/wallet', '_blank');
        }
    };

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
            <WalletSelectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelectCoinbase={handleConnectCoinbase}
                onSelectMetaMask={handleConnectMetaMask}
                isLoading={false} // Wagmi doesn't expose a simple loading state for 'connect' initiation easily here without checking specific status
            />
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
                {!isConnected ? (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full relative group overflow-hidden rounded-xl bg-[#0052FF] p-4 transition-all hover:bg-[#0045D8] shadow-lg shadow-blue-900/20 flex items-center justify-center gap-3"
                    >
                        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32ZM16 25C20.9706 25 25 20.9706 25 16C25 11.0294 20.9706 7 16 7C11.0294 7 7 11.0294 7 16C7 20.9706 11.0294 25 16 25Z" fill="#0052FF" />
                                <path d="M16 21C18.7614 21 21 18.7614 21 16C21 13.2386 18.7614 11 16 11C13.2386 11 11 13.2386 11 16C11 18.7614 13.2386 21 16 21Z" fill="white" />
                            </svg>
                        </div>
                        <span className="font-semibold text-white">Connect Wallet</span>
                    </button>
                ) : (
                    <button
                        onClick={() => disconnect()}
                        className="w-full py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-400 border border-slate-700 rounded-lg text-xs font-medium transition-all"
                    >
                        Putuskan Koneksi (Disconnect)
                    </button>
                )}

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

