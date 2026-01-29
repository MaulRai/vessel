'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/lib/components/DashboardLayout';
import { adminAPI, FundingPool } from '@/lib/api/admin';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function AdminPoolDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const { t, language } = useLanguage();
    const locale = language === 'en' ? 'en-US' : 'id-ID';
    const [pool, setPool] = useState<FundingPool | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPool = async () => {
            try {
                const token = localStorage.getItem('vessel_access_token');
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/pools/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const data = await res.json();
                if (data.success) {
                    setPool(data.data.pool);
                    if (data.data.pool) {
                        setPool({
                            ...data.data.pool,
                            invoice: data.data.invoice,
                            // calculate percentages locally or use response
                            priority_percentage_funded: data.data.priority_percentage_funded,
                            catalyst_percentage_funded: data.data.catalyst_percentage_funded
                        });
                    }
                } else {
                    setError(data.error?.message || t('common.errorOccurred'));
                }
            } catch (err) {
                console.error('Failed to load pool', err);
                setError(t('common.errorOccurred'));
            } finally {
                setLoading(false);
            }
        };
        fetchPool();
    }, [id, t]);

    if (loading) {
        return (
            <DashboardLayout role="admin">
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout role="admin">
                <div className="text-center py-20 space-y-4">
                    <h2 className="text-xl text-slate-300">{error}</h2>
                    <Link href="/admin/dashboard/pools" className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        {t('admin.pools.detail.viewList')}
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    if (!pool) {
        return (
            <DashboardLayout role="admin">
                <div className="text-center py-20">
                    <h2 className="text-xl text-slate-300">{t('admin.pools.detail.notFound')}</h2>
                    <Link href="/admin/dashboard/pools" className="text-cyan-400 hover:text-cyan-300 mt-4 inline-block">
                        {t('admin.pools.detail.viewList')}
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    const priorityPct = pool.priority_target > 0 ? (pool.priority_funded / pool.priority_target) * 100 : 0;
    const catalystPct = pool.catalyst_target > 0 ? (pool.catalyst_funded / pool.catalyst_target) * 100 : 0;
    const totalPct = pool.target_amount > 0 ? (pool.funded_amount / pool.target_amount) * 100 : 0;

    const statusLabelMap: Record<string, string> = {
        open: t('admin.pools.status.open'),
        filled: t('admin.pools.status.filled'),
        disbursed: t('admin.pools.status.disbursed'),
        closed: t('admin.pools.status.closed')
    };

    const formatCurrency = (amount: number, currency?: string) => {
        if (!amount && amount !== 0) return '-';
        try {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency || 'IDR',
                maximumFractionDigits: 0
            }).format(amount);
        } catch {
            return `${currency || ''} ${amount.toLocaleString(locale)}`.trim();
        }
    };

    return (
        <DashboardLayout role="admin">
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/admin/dashboard/pools" className="text-slate-400 hover:text-slate-200 text-sm mb-2 inline-flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            {t('admin.pools.detail.back')}
                        </Link>
                        <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3">
                            Funding Pool #{pool.id.slice(0, 8)}
                            <span className={`text-base px-3 py-1 rounded-full border ${pool.status === 'open' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                                pool.status === 'filled' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                                    'bg-slate-700/50 text-slate-400 border-slate-600'
                                }`}>
                                {statusLabelMap[pool.status] || pool.status}
                            </span>
                        </h1>
                    </div>

                    <div className="flex gap-3">
                        {pool.status === 'filled' && (
                            <button
                                onClick={() => { if (confirm(t('admin.pools.detail.confirm.disburse'))) adminAPI.disbursePool(pool.id).then(() => window.location.reload()); }}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
                            >
                                {t('admin.pools.detail.buttons.disburse')}
                            </button>
                        )}
                        {pool.status === 'open' && (
                            <button
                                onClick={() => { if (confirm(t('admin.pools.detail.confirm.close'))) adminAPI.closePool(pool.id).then(() => window.location.reload()); }}
                                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-medium transition-colors"
                            >
                                {t('admin.pools.detail.buttons.close')}
                            </button>
                        )}
                    </div>
                </div>

                {/* Progress Overview */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-6">{t('admin.pools.detail.progress.title')}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-300">{t('admin.pools.detail.progress.totalFunded')}</span>
                                <span className="text-emerald-400 font-mono">{totalPct.toFixed(1)}%</span>
                            </div>
                            <p className="text-3xl font-bold text-slate-50 font-mono">
                                {formatCurrency(pool.funded_amount, pool.pool_currency)}
                                <span className="text-sm text-slate-500 font-normal ml-2">{t('admin.pools.detail.progress.of')} {formatCurrency(pool.target_amount, pool.pool_currency)}</span>
                            </p>
                            <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
                                <div className="bg-emerald-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${totalPct}%` }} />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-cyan-300">{t('admin.pools.detail.progress.priority')}</span>
                                <span className="text-cyan-400 font-mono">{priorityPct.toFixed(1)}%</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-200 font-mono">
                                {formatCurrency(pool.priority_funded, pool.pool_currency)}
                                <span className="text-xs text-slate-500 font-normal ml-2">/ {formatCurrency(pool.priority_target, pool.pool_currency)}</span>
                            </p>
                            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
                                <div className="bg-cyan-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${priorityPct}%` }} />
                            </div>
                            <p className="text-xs text-slate-500 mt-2">{t('admin.pools.detail.progress.interest')}: {pool.priority_interest_rate}% p.a.</p>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-violet-300">{t('admin.pools.detail.progress.catalyst')}</span>
                                <span className="text-violet-400 font-mono">{catalystPct.toFixed(1)}%</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-200 font-mono">
                                {formatCurrency(pool.catalyst_funded, pool.pool_currency)}
                                <span className="text-xs text-slate-500 font-normal ml-2">/ {formatCurrency(pool.catalyst_target, pool.pool_currency)}</span>
                            </p>
                            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
                                <div className="bg-violet-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${catalystPct}%` }} />
                            </div>
                            <p className="text-xs text-slate-500 mt-2">{t('admin.pools.detail.progress.interest')}: {pool.catalyst_interest_rate}% p.a.</p>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">{t('admin.pools.detail.details.title')}</h3>
                        <dl className="space-y-4">
                            <div className="flex justify-between py-2 border-b border-slate-800/50">
                                <dt className="text-slate-400">{t('admin.pools.detail.details.createdAt')}</dt>
                                <dd className="text-slate-200">{new Date(pool.created_at).toLocaleString(locale)}</dd>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-800/50">
                                <dt className="text-slate-400">{t('admin.pools.detail.details.openedAt')}</dt>
                                <dd className="text-slate-200">{pool.opened_at ? new Date(pool.opened_at).toLocaleString(locale) : '-'}</dd>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-800/50">
                                <dt className="text-slate-400">{t('admin.pools.detail.details.deadline')}</dt>
                                <dd className="text-slate-200">{pool.deadline ? new Date(pool.deadline).toLocaleDateString(locale) : '-'}</dd>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-800/50">
                                <dt className="text-slate-400">{t('admin.pools.detail.details.investorCount')}</dt>
                                <dd className="text-slate-200">{pool.investor_count}</dd>
                            </div>
                        </dl>
                    </div>

                    {pool.invoice && (
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 h-fit">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">{t('admin.pools.detail.invoice.title')}</h3>
                                <Link href={`/admin/dashboard/invoices/${pool.invoice_id}`} className="text-xs text-cyan-400 hover:underline">
                                    {t('admin.pools.detail.invoice.view')}
                                </Link>
                            </div>
                            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                                <div>
                                    <p className="text-lg font-bold text-slate-200">{pool.invoice.invoice_number}</p>
                                    <p className="text-sm text-slate-400">{pool.invoice.buyer_name}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/50">
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{t('admin.invoiceDetail.info.originalAmount')}</p>
                                        <p className="text-sm font-semibold text-slate-300">{formatCurrency(pool.invoice.amount, pool.invoice.currency)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Advance Percentage</p>
                                        <p className="text-sm font-semibold text-cyan-400">{(pool.invoice as any).advance_percentage || 80}%</p>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Target Funding</p>
                                    <p className="text-base font-bold text-emerald-400">{formatCurrency(pool.target_amount, pool.pool_currency)}</p>
                                </div>

                                <div className="pt-2">
                                    <span className="px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-400">
                                        {t('admin.pools.detail.invoice.due')}: {new Date(pool.invoice.due_date).toLocaleDateString(locale)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
