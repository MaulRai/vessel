'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AuthGuard } from '@/lib/components/AuthGuard';
import { DashboardLayout } from '@/lib/components/DashboardLayout';
import { adminAPI, FundingPool } from '@/lib/api/admin';
import { useLanguage } from '@/lib/i18n/LanguageContext';

function PoolListContent() {
  const { t, language } = useLanguage();
  const locale = language === 'en' ? 'en-US' : 'id-ID';
  const [pools, setPools] = useState<FundingPool[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadPools = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAllPools(page, 10);
      if (res.success && res.data) {
        setPools(res.data.pools || []);
        setTotalPages(res.data.total_pages || 1);
      }
    } catch (err) {
      console.error('Failed to load pools', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPools();
  }, [page]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return 'IDRX 0';
    return `IDRX ${amount.toLocaleString(locale)}`;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
      open: {
        label: t('admin.pools.status.open'),
        className: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
        icon: (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      filled: {
        label: t('admin.pools.status.filled'),
        className: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
        icon: (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
      },
      disbursed: {
        label: t('admin.pools.status.disbursed'),
        className: 'bg-violet-500/10 text-violet-400 border border-violet-500/30',
        icon: (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        ),
      },
      closed: {
        label: t('admin.pools.status.closed'),
        className: 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/30',
        icon: (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ),
      },
    };
    const c = config[status] || {
      label: status,
      className: 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/30',
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${c.className}`}>
        {c.icon}
        {c.label}
      </span>
    );
  };

  const handleDisburse = async (poolId: string) => {
    if (!confirm(t('admin.pools.list.buttons.confirmDisburse'))) return;

    setActionLoading(poolId);
    try {
      const res = await adminAPI.disbursePool(poolId);
      if (res.success) {
        alert(t('admin.pools.list.buttons.disburse'));
        loadPools();
      } else {
        alert(res.error?.message || t('common.errorOccurred'));
      }
    } catch (err) {
      console.error('Failed to disburse', err);
      alert(t('common.errorOccurred'));
    } finally {
      setActionLoading(null);
    }
  };

  const getProgress = (pool: FundingPool) => {
    if (pool.target_amount === 0) return 0;
    return (pool.funded_amount / pool.target_amount) * 100;
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/10 via-cyan-600/10 to-transparent border border-blue-500/20 p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.1),rgba(255,255,255,0))]" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{t('admin.invoiceList.heroTitle')}</h1>
                <p className="text-blue-200/70 mt-1">{t('admin.invoiceList.heroSubtitle')}</p>
              </div>
            </div>
            <Link
              href="/admin/dashboard/pools/create"
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 rounded-xl font-semibold text-white transition-all shadow-lg shadow-violet-500/25"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>{t('admin.invoiceDetail.pools.list.createCta')}</span>
            </Link>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <div className="absolute inset-0 rounded-full border-2 border-blue-500/20"></div>
              </div>
            </div>
          ) : pools.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-500/10 mb-4">
                <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-zinc-400 text-lg mb-2">{t('admin.pools.list.empty.title')}</p>
              <p className="text-zinc-500 text-sm mb-6">{t('admin.pools.list.empty.subtitle')}</p>
              <Link
                href="/admin/dashboard/pools/create"
                className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 rounded-xl text-sm font-semibold text-white transition-all shadow-lg shadow-violet-500/25"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>{t('admin.pools.list.empty.cta')}</span>
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-zinc-200 text-xs font-semibold uppercase tracking-wider border-b border-white/10 bg-white/5 backdrop-blur">
                      <th className="px-6 py-4">{t('admin.pools.list.table.invoice')}</th>
                      <th className="px-6 py-4">{t('admin.pools.list.table.target')}</th>
                      <th className="px-6 py-4">{t('admin.pools.list.table.progress')}</th>
                      <th className="px-6 py-4">{t('admin.pools.list.table.investors')}</th>
                      <th className="px-6 py-4">{t('admin.pools.list.table.status')}</th>
                      <th className="px-6 py-4">{t('admin.pools.list.table.deadline')}</th>
                      <th className="px-6 py-4">{t('admin.pools.list.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pools.map((pool, index) => {
                      const progress = getProgress(pool);
                      return (
                        <tr key={pool.id || `pool-${index}`} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-5">
                            <div>
                              <p className="text-violet-400 font-semibold text-sm">{pool.invoice?.invoice_number || '-'}</p>
                              <p className="text-zinc-500 text-xs mt-1">{pool.invoice?.buyer_name || '-'}</p>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div>
                              <p className="text-white font-semibold">{formatCurrency(pool.target_amount)}</p>
                              <p className="text-zinc-500 text-xs mt-1">{t('admin.pools.list.table.funded')}: {formatCurrency(pool.funded_amount)}</p>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="w-36">
                              <div className="flex items-center justify-between text-xs mb-2">
                                <span className="text-zinc-400 font-medium">{progress.toFixed(1)}%</span>
                                <span className="text-zinc-500">{formatCurrency(pool.funded_amount)}</span>
                              </div>
                              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all shadow-lg shadow-violet-500/50"
                                  style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-blue-500/10">
                                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                              </div>
                              <span className="text-white font-semibold">{pool.investor_count}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">{getStatusBadge(pool.status)}</td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2 text-zinc-400 text-sm">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{formatDate(pool.deadline)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              {pool.status === 'filled' && (
                                <button
                                  onClick={() => handleDisburse(pool.id)}
                                  disabled={actionLoading === pool.id}
                                  className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-xs font-semibold text-emerald-400 transition-all disabled:opacity-50"
                                >
                                  {actionLoading === pool.id ? t('admin.common.processing') : t('admin.pools.list.buttons.disburse')}
                                </button>
                              )}
                              <Link
                                href={`/admin/dashboard/pools/${pool.id}`}
                                className="px-3 py-2 bg-white/5 backdrop-blur hover:bg-white/10 border border-white/15 rounded-lg text-xs font-semibold text-zinc-100 transition-all"
                              >
                                {t('admin.pools.list.buttons.viewDetails')}
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
                  <p className="text-sm text-slate-200">
                    {t('admin.pools.list.pagination.label')} {page} {t('admin.pools.list.pagination.of')} {totalPages}
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 bg-white/5 backdrop-blur hover:bg-white/10 disabled:bg-white/5 disabled:text-slate-600 rounded text-sm text-slate-100 transition-colors"
                    >
                      {t('admin.pools.list.pagination.prev')}
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1 bg-white/5 backdrop-blur hover:bg-white/10 disabled:bg-white/5 disabled:text-slate-600 rounded text-sm text-slate-100 transition-colors"
                    >
                      {t('admin.pools.list.pagination.next')}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function PoolListPage() {
  return (
    <AuthGuard allowedRoles={['admin']}>
      <PoolListContent />
    </AuthGuard>
  );
}
