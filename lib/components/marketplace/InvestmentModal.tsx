'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits, erc20Abi } from 'viem';
import { FundingPool, fundingAPI } from '../../api/funding';
import { useLanguage } from '../../i18n/LanguageContext';

interface InvestmentModalProps {
    pool: FundingPool;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialTab?: 'priority' | 'catalyst';
}

const IDRX_ADDRESS = process.env.NEXT_PUBLIC_IDRX_TOKEN_ADDRESS as `0x${string}`;
const PLATFORM_WALLET = process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS as `0x${string}`;

export function InvestmentModal({ pool, isOpen, onClose, onSuccess, initialTab = 'priority' }: InvestmentModalProps) {
    const { address } = useAccount();
    const { t } = useLanguage();
    const [amount, setAmount] = useState('');
    const [tab, setTab] = useState<'priority' | 'catalyst'>(initialTab);
    const [step, setStep] = useState<'input' | 'approving' | 'transferring' | 'confirming' | 'success'>('input');

    // Risk checkboxes for Catalyst
    const [riskChecks, setRiskChecks] = useState({
        riskAck: false,
        lossAccept: false,
        nonBank: false
    });

    const { data: balanceData } = useReadContract({
        address: IDRX_ADDRESS,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
    });

    const { data: decimals } = useReadContract({
        address: IDRX_ADDRESS,
        abi: erc20Abi,
        functionName: 'decimals',
    });

    const { data: allowance } = useReadContract({
        address: IDRX_ADDRESS,
        abi: erc20Abi,
        functionName: 'allowance',
        args: address && PLATFORM_WALLET ? [address, PLATFORM_WALLET] : undefined,
    });

    const { writeContractAsync: writeApprove } = useWriteContract();
    const { writeContractAsync: writeTransfer } = useWriteContract();

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setStep('input');
            setAmount('');
            setRiskChecks({ riskAck: false, lossAccept: false, nonBank: false });
        }
    }, [isOpen]);

    const numericAmount = useMemo(() => {
        const val = parseFloat(amount.replace(/,/g, ''));
        return isNaN(val) ? 0 : val;
    }, [amount]);

    const limits = useMemo(() => {
        // Limits based on TRANCHE target (Backend Logic Match)
        const isCatalyst = tab === 'catalyst';
        const target = isCatalyst ? pool.catalyst_target : pool.priority_target;
        const funded = isCatalyst ? pool.catalyst_funded : pool.priority_funded;
        const remaining = target - funded;

        // Logic: 
        // If remaining < 10% of tranche target, we allow exact fill or remaining
        // Otherwise min is 10%, max is 90% of tranche target
        const minPct = target * 0.1;
        const maxPct = target * 0.9;

        let min = minPct;
        let max = maxPct;

        if (remaining < minPct) {
            min = remaining; // Must fill the rest if it's small
            max = remaining;
        } else {
            // Standard case
            // Max cannot exceed remaining
            max = Math.min(maxPct, remaining);
        }

        return { min, max, remaining };
    }, [pool, tab]);

    const validationError = useMemo(() => {
        if (numericAmount <= 0) return null;
        if (numericAmount < limits.min) return `Minimum investment is ${limits.min.toLocaleString('id-ID')} IDRX`;
        if (numericAmount > limits.max) return `Maximum investment is ${limits.max.toLocaleString('id-ID')} IDRX`;
        if (tab === 'catalyst') {
            const catRemaining = pool.catalyst_target - pool.catalyst_funded;
            if (numericAmount > catRemaining) return `Only ${catRemaining.toLocaleString('id-ID')} available in Catalyst tranche`;
        } else {
            const priRemaining = pool.priority_target - pool.priority_funded;
            if (numericAmount > priRemaining) return `Only ${priRemaining.toLocaleString('id-ID')} available in Priority tranche`;
        }

        if (balanceData && decimals) {
            const bal = parseFloat(formatUnits(balanceData, decimals));
            if (numericAmount > bal) return 'Insufficient IDRX balance';
        }

        return null;
    }, [numericAmount, limits, tab, pool, balanceData, decimals]);

    const handleInvest = async () => {
        if (validationError || !decimals || !address) return;

        try {
            const amountBigInt = parseUnits(numericAmount.toString(), decimals);

            // 1. Approval
            if (!allowance || allowance < amountBigInt) {
                setStep('approving');
                await writeApprove({
                    address: IDRX_ADDRESS,
                    abi: erc20Abi,
                    functionName: 'approve',
                    args: [PLATFORM_WALLET, amountBigInt],
                    // @ts-expect-error - capabilities is part of wagmi/viem AA support
                    capabilities: {
                        paymasterService: {
                            url: `https://api.developer.coinbase.com/rpc/v1/base-sepolia/${process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}`
                        }
                    }
                });
            }

            // 2. Transfer
            setStep('transferring');
            const txHash = await writeTransfer({
                address: IDRX_ADDRESS,
                abi: erc20Abi,
                functionName: 'transfer',
                args: [PLATFORM_WALLET, amountBigInt],
                // @ts-expect-error - capabilities is part of wagmi/viem AA support
                capabilities: {
                    paymasterService: {
                        url: `https://api.developer.coinbase.com/rpc/v1/base-sepolia/${process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}`
                    }
                }
            });

            // 3. Confirm with Backend
            setStep('confirming');

            // Wait a bit or verify tx receipt if needed, but backend also verifies.
            // We pass the hash to backend.

            const res = await fundingAPI.invest({
                pool_id: pool.id,
                amount: numericAmount,
                tranche: tab,
                tx_hash: txHash,
                tnc_accepted: true,
                catalyst_consents: tab === 'catalyst' ? {
                    risk_acknowledgment: riskChecks.riskAck,
                    loss_acceptance: riskChecks.lossAccept,
                    non_bank_product: riskChecks.nonBank
                } : undefined
            });

            if (res.success) {
                setStep('success');
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 2000);
            } else {
                throw new Error(res.error?.message || 'Backend verification failed');
            }

        } catch (err) {
            console.error(err);
            alert('Investment failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
            setStep('input');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">Invest in Project</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">

                    {/* Tranche Tabs */}
                    <div className="flex bg-slate-800/50 p-1 rounded-xl">
                        <button
                            onClick={() => setTab('priority')}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'priority' ? 'bg-cyan-500/20 text-cyan-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            Priority ({pool.priority_interest_rate}%)
                        </button>
                        <button
                            onClick={() => setTab('catalyst')}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'catalyst' ? 'bg-orange-500/20 text-orange-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            Catalyst ({pool.catalyst_interest_rate}%)
                        </button>
                    </div>

                    {/* Input */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">Amount (IDRX)</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={amount}
                                    onChange={(e) => {
                                        // Allow numeric only
                                        const val = e.target.value.replace(/[^0-9.]/g, '');
                                        setAmount(val);
                                    }}
                                    disabled={step !== 'input'}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors font-mono text-lg"
                                    placeholder="0.00"
                                />
                                <button
                                    onClick={() => setAmount(balanceData && decimals ? formatUnits(balanceData, decimals) : '')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-cyan-400 hover:text-cyan-300"
                                >
                                    MAX
                                </button>
                            </div>

                            {/* Validation / Helper Text */}
                            <div className="mt-2 flex justify-between text-xs">
                                {validationError ? (
                                    <span className="text-red-400">{validationError}</span>
                                ) : (
                                    <span className="text-slate-500">Min: {limits.min.toLocaleString()} · Max: {limits.max.toLocaleString()}</span>
                                )}
                                <span className="text-slate-400">Balance: {balanceData && decimals ? parseFloat(formatUnits(balanceData, decimals)).toLocaleString() : '0'}</span>
                            </div>
                        </div>

                        {/* Catalyst Warnings */}
                        {tab === 'catalyst' && (
                            <div className="bg-orange-900/20 border border-orange-500/30 rounded-xl p-4 space-y-3">
                                <p className="text-sm text-orange-200 font-semibold">High Risk Warning</p>
                                <label className="flex items-start gap-3 text-xs text-orange-100/80 cursor-pointer">
                                    <input type="checkbox" checked={riskChecks.riskAck} onChange={e => setRiskChecks(p => ({ ...p, riskAck: e.target.checked }))} className="mt-0.5" />
                                    <span>I acknowledge this tranche takes first loss in default events.</span>
                                </label>
                                <label className="flex items-start gap-3 text-xs text-orange-100/80 cursor-pointer">
                                    <input type="checkbox" checked={riskChecks.lossAccept} onChange={e => setRiskChecks(p => ({ ...p, lossAccept: e.target.checked }))} className="mt-0.5" />
                                    <span>I accept the potential for 100% capital loss.</span>
                                </label>
                                <label className="flex items-start gap-3 text-xs text-orange-100/80 cursor-pointer">
                                    <input type="checkbox" checked={riskChecks.nonBank} onChange={e => setRiskChecks(p => ({ ...p, nonBank: e.target.checked }))} className="mt-0.5" />
                                    <span>I understand this is not a bank product/deposit.</span>
                                </label>
                            </div>
                        )}

                        {/* Step Status */}
                        {step !== 'input' && step !== 'success' && (
                            <div className="flex items-center justify-center gap-3 py-4 text-cyan-400 animate-pulse">
                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                <span className="font-medium">
                                    {step === 'approving' && 'Approving IDRX spend...'}
                                    {step === 'transferring' && 'Confirming Transfer...'}
                                    {step === 'confirming' && 'Finalizing Investment...'}
                                </span>
                            </div>
                        )}
                        {step === 'success' && (
                            <div className="flex items-center justify-center gap-3 py-4 text-emerald-400">
                                <span className="text-xl">✓</span>
                                <span className="font-medium">Investment Successful!</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={step !== 'input'}
                        className="flex-1 py-3 px-4 rounded-xl text-slate-400 font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleInvest}
                        disabled={step !== 'input' || !!validationError || (tab === 'catalyst' && (!riskChecks.riskAck || !riskChecks.lossAccept || !riskChecks.nonBank))}
                        className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold hover:shadow-lg hover:shadow-cyan-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {step === 'input' ? 'Confirm Investment' : 'Processing...'}
                    </button>
                </div>

            </div>
        </div>
    );
}
