'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AuthGuard } from '@/lib/components/AuthGuard';
import { DashboardLayout } from '@/lib/components/DashboardLayout';
import { adminAPI, FundingPool } from '@/lib/api/admin';

function PoolListContent() {
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
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return 'Rp 0';
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      open: { label: 'Open', className: 'bg-blue-500/10 text-blue-400' },
      filled: { label: 'Filled', className: 'bg-green-500/10 text-green-400' },
      disbursed: { label: 'Disbursed', className: 'bg-purple-500/10 text-purple-400' },
      closed: { label: 'Closed', className: 'bg-slate-500/10 text-slate-400' },
    };
    const c = config[status] || { label: status, className: 'bg-slate-500/10 text-slate-400' };
    return <span className={`px-2 py-1 rounded text-xs font-medium ${c.className}`}>{c.label}</span>;
  };

  const handleDisburse = async (poolId: string) => {
    if (!confirm('Apakah Anda yakin ingin mencairkan dana ke mitra?')) return;

    setActionLoading(poolId);
    try {
      const res = await adminAPI.disbursePool(poolId);
      if (res.success) {
        alert('Dana berhasil dicairkan ke mitra');
        loadPools();
      } else {
        alert(res.error?.message || 'Gagal mencairkan dana');
      }
    } catch (err) {
      console.error('Failed to disburse', err);
      alert('Terjadi kesalahan');
    } finally {
      setActionLoading(null);
    }
  };

  const handleClosePool = async (poolId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghentikan pool funding ini? Investor tidak akan bisa funding lagi.')) return;

    setActionLoading(poolId);
    try {
      const res = await adminAPI.closePool(poolId);
      if (res.success) {
        alert('Pool berhasil dihentikan');
        loadPools();
      } else {
        alert(res.error?.message || 'Gagal menghentikan pool');
      }
    } catch (err) {
      console.error('Failed to close pool', err);
      alert('Terjadi kesalahan');
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Funding Pools</h1>
            <p className="text-slate-400 mt-1">Kelola pool pendanaan untuk investor</p>
          </div>
          <Link
            href="/dashboard/admin/pools/create"
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 rounded-lg font-medium text-sm transition-all shadow-lg shadow-purple-500/25 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Buat Pool Baru</span>
          </Link>
        </div>

        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-400"></div>
            </div>
          ) : pools.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-slate-400 mb-4">Belum ada funding pool</p>
              <Link
                href="/dashboard/admin/pools/create"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-sm font-medium text-purple-400 transition-all"
              >
                <span>Buat Pool Pertama</span>
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-slate-400 text-sm border-b border-slate-700/50 bg-slate-800/50">
                      <th className="px-6 py-4 font-medium">Invoice</th>
                      <th className="px-6 py-4 font-medium">Target</th>
                      <th className="px-6 py-4 font-medium">Progress</th>
                      <th className="px-6 py-4 font-medium">Investors</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Deadline</th>
                      <th className="px-6 py-4 font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {pools.map((pool, index) => {
                      const progress = getProgress(pool);
                      return (
                        <tr key={pool.id || `pool-${index}`} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-purple-400 font-medium">{pool.invoice?.invoice_number || '-'}</p>
                              <p className="text-slate-500 text-xs">{pool.invoice?.buyer_name || '-'}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-slate-200">{formatCurrency(pool.target_amount)}</p>
                              <p className="text-slate-500 text-xs">Funded: {formatCurrency(pool.funded_amount)}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="w-32">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-slate-400">{progress.toFixed(1)}%</span>
                              </div>
                              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                                  style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-300">{pool.investor_count}</td>
                          <td className="px-6 py-4">{getStatusBadge(pool.status)}</td>
                          <td className="px-6 py-4 text-slate-400 text-sm">{formatDate(pool.deadline)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              {pool.status === 'open' && (
                                <button
                                  onClick={() => handleClosePool(pool.id)}
                                  disabled={actionLoading === pool.id}
                                  className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-xs font-medium text-red-400 transition-all disabled:opacity-50"
                                >
                                  {actionLoading === pool.id ? 'Processing...' : 'Stop'}
                                </button>
                              )}
                              {pool.status === 'filled' && (
                                <button
                                  onClick={() => handleDisburse(pool.id)}
                                  disabled={actionLoading === pool.id}
                                  className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded text-xs font-medium text-green-400 transition-all disabled:opacity-50"
                                >
                                  {actionLoading === pool.id ? 'Processing...' : 'Disburse'}
                                </button>
                              )}
                              <Link
                                href={`/dashboard/admin/pools/${pool.id}`}
                                className="px-3 py-1 bg-slate-700/50 hover:bg-slate-700 rounded text-xs font-medium text-slate-300 transition-all"
                              >
                                Detail
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
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700/50">
                  <p className="text-sm text-slate-400">
                    Halaman {page} dari {totalPages}
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 bg-slate-700/50 hover:bg-slate-700 disabled:bg-slate-800 disabled:text-slate-600 rounded text-sm text-slate-300 transition-colors"
                    >
                      Sebelumnya
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1 bg-slate-700/50 hover:bg-slate-700 disabled:bg-slate-800 disabled:text-slate-600 rounded text-sm text-slate-300 transition-colors"
                    >
                      Selanjutnya
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
