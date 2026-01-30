import React from 'react';
import Image from 'next/image';

interface WalletSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectCoinbase: () => void;
    onSelectMetaMask: () => void;
    isLoading: boolean;
}

export function WalletSelectionModal({
    isOpen,
    onClose,
    onSelectCoinbase,
    onSelectMetaMask,
    isLoading
}: WalletSelectionModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Connect Wallet</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Coinbase Wallet - Primary */}
                    <button
                        onClick={onSelectCoinbase}
                        disabled={isLoading}
                        className="w-full relative group overflow-hidden rounded-xl bg-[#0052FF] p-4 transition-all hover:bg-[#0045D8] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20 text-left"
                    >
                        <div className="relative flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                                <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32ZM16 25C20.9706 25 25 20.9706 25 16C25 11.0294 20.9706 7 16 7C11.0294 7 7 11.0294 7 16C7 20.9706 11.0294 25 16 25Z" fill="#0052FF" />
                                    <path d="M16 21C18.7614 21 21 18.7614 21 16C21 13.2386 18.7614 11 16 11C13.2386 11 11 13.2386 11 16C11 18.7614 13.2386 21 16 21Z" fill="white" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-base">Coinbase Wallet</h4>
                                <p className="text-blue-200 text-xs">Recommended</p>
                            </div>
                        </div>
                        <div className="absolute top-3 right-3">
                            <div className="bg-white/20 text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm backdrop-blur-sm">
                                Primary
                            </div>
                        </div>
                    </button>

                    <div className="relative flex items-center py-2">
                        <div className="grow border-t border-slate-800"></div>
                        <span className="shrink-0 px-2 text-xs text-slate-500 uppercase">Alternative</span>
                        <div className="grow border-t border-slate-800"></div>
                    </div>

                    {/* MetaMask - Secondary */}
                    <button
                        onClick={onSelectMetaMask}
                        disabled={isLoading}
                        className="w-full flex items-center gap-4 p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed group text-left"
                    >
                        <div className="w-10 h-10 flex items-center justify-center shrink-0 grayscale group-hover:grayscale-0 transition-all duration-300">
                            <div className="text-2xl">🦊</div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-200 group-hover:text-white">MetaMask</h4>
                            <p className="text-slate-500 text-xs group-hover:text-slate-400">Connect using browser wallet</p>
                        </div>
                    </button>

                    {/* Other wallet connectors can act similarly if added later */}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 text-center">
                    <p className="text-xs text-slate-500">
                        By connecting, you agree to our <span className="text-cyan-500 hover:text-cyan-400 cursor-pointer">Terms of Service</span>.
                    </p>
                </div>
            </div>
        </div>
    );
}
