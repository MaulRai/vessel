'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface GrantResult {
    success: boolean;
    message: string;
    newBalance?: number;
}

export default function AdminBalancePage() {
    const { t, language } = useLanguage();
    const locale = language === 'en' ? 'en-US' : 'id-ID';

    const [userIdentifier, setUserIdentifier] = useState('');
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<GrantResult | null>(null);
    const [searchResults, setSearchResults] = useState<Array<{ id: string; email: string; username: string; balance: number }>>([]);
    const [selectedUser, setSelectedUser] = useState<{ id: string; email: string; username: string; balance: number } | null>(null);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

    const getAuthToken = () => {
        return typeof window !== 'undefined' ? localStorage.getItem('vessel_access_token') : null;
    };

    const handleGrantBalance = async () => {
        if (!selectedUser || !amount) {
            setResult({ success: false, message: t('admin.balance.messages.selectUser') });
            return;
        }

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            setResult({ success: false, message: t('admin.balance.messages.invalidAmount') });
            return;
        }

        setIsLoading(true);
        setResult(null);

        try {
            const response = await fetch(`${API_BASE_URL}/admin/balance/grant`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getAuthToken()}`,
                },
                body: JSON.stringify({
                    user_id: selectedUser.id,
                    amount: amountNum,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setResult({
                    success: true,
                    message: `${t('admin.balance.messages.successPrefix')} IDRX ${amountNum.toLocaleString(locale)} ${t('admin.balance.messages.successSuffix')} ${selectedUser.email}`,
                    newBalance: data.data?.new_balance,
                });
                setAmount('');
                setSelectedUser(null);
            } else {
                setResult({
                    success: false,
                    message: data.error?.message || t('admin.balance.messages.fail'),
                });
            }
        } catch (error) {
            setResult({
                success: false,
                message: t('admin.balance.messages.connection'),
            });
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (value: string) => {
        const num = value.replace(/\D/g, '');
        return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <Link
                        href="/admin/dashboard-verifikasi"
                        className="inline-flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        {t('admin.balance.back')}
                    </Link>
                </div>

                <header className="mb-8">
                    <p className="text-sm text-amber-300/80 font-semibold tracking-wide">{t('admin.balance.tag')}</p>
                    <h1 className="text-3xl font-bold text-slate-50">{t('admin.balance.title')}</h1>
                    <p className="text-slate-400 mt-2">{t('admin.balance.subtitle')}</p>
                </header>

                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                {t('admin.balance.userIdLabel')}
                            </label>
                            <input
                                type="text"
                                value={userIdentifier}
                                onChange={(e) => setUserIdentifier(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-100"
                                placeholder={t('admin.balance.userIdPlaceholder')}
                            />
                            <p className="mt-1 text-xs text-slate-500">{t('admin.balance.userIdHint')}</p>
                        </div>

                        {userIdentifier && (
                            <button
                                onClick={() => {
                                    setSelectedUser({
                                        id: userIdentifier,
                                        email: 'user@example.com',
                                        username: 'user',
                                        balance: 0,
                                    });
                                }}
                                className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
                            >
                                {t('admin.balance.selectUser')}
                            </button>
                        )}

                        {selectedUser && (
                            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                            <p className="text-slate-200 font-medium">User ID: {selectedUser.id}</p>
                                            <p className="text-sm text-slate-400">{t('admin.balance.selectedUserSubtitle')}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    {t('admin.balance.amountLabel')}
                                </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">Rp</span>
                                <input
                                    type="text"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-100"
                                        placeholder={t('admin.balance.amountPlaceholder')}
                                />
                            </div>
                            {amount && (
                                <p className="mt-1 text-sm text-slate-400">
                                        IDRX {parseInt(amount, 10).toLocaleString(locale)}
                                </p>
                            )}
                        </div>

                        {result && (
                            <div
                                className={`p-4 rounded-lg ${result.success
                                        ? 'bg-green-500/10 border border-green-500/50'
                                        : 'bg-red-500/10 border border-red-500/50'
                                    }`}
                            >
                                <p className={result.success ? 'text-green-400' : 'text-red-400'}>
                                    {result.message}
                                </p>
                                {result.newBalance !== undefined && (
                                    <p className="text-green-400 text-sm mt-1">
                                        {t('admin.balance.resultNewBalance')}: IDRX {result.newBalance.toLocaleString(locale)}
                                    </p>
                                )}
                            </div>
                        )}

                        <button
                            onClick={handleGrantBalance}
                            disabled={isLoading || !selectedUser || !amount}
                            className="w-full px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:from-slate-600 disabled:to-slate-600 text-white font-medium rounded-lg transition-all shadow-lg"
                        >
                            {isLoading ? t('admin.balance.processing') : t('admin.balance.cta')}
                        </button>
                    </div>
                </div>

                <div className="mt-8 p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                    <h3 className="text-lg font-semibold text-slate-200 mb-3">{t('admin.balance.notesTitle')}</h3>
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{t('admin.balance.note1')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{t('admin.balance.note2')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{t('admin.balance.note3')}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
