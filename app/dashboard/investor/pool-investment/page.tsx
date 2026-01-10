'use client';

import { useEffect, useState } from 'react';
import { AuthGuard } from '@/lib/components/AuthGuard';
import { DashboardLayout } from '@/lib/components/DashboardLayout';
import { marketplaceAPI, MarketplacePool, MarketplaceFilters } from '@/lib/api/user';

function PoolInvestmentContent() {
  const [pools, setPools] = useState<MarketplacePool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MarketplaceFilters>({
    sort_by: 'newest',
    page: 1,
    per_page: 10,
  });
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadPools = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await marketplaceAPI.getPools(filters);
        if (res.success && res.data) {
          setPools(res.data.pools || []);
          setTotalPages(res.data.total_pages || 1);
        } else {
          setError(res.error?.message || 'Gagal memuat data pool');
        }
      } catch (err) {
        setError('Gagal memuat data pool');
      } finally {
        setLoading(false);
      }
    };
    loadPools();
  }, [filters]);

  const handleFilterChange = (key: keyof MarketplaceFilters, value: string | number | boolean | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'B':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'C':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <DashboardLayout role="investor">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Pool Investment</h1>
            <p className="text-slate-400 mt-1">
              Temukan pool pendanaan yang tersedia untuk investasi
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-400">Grade:</label>
            <select
              value={filters.grade || ''}
              onChange={(e) => handleFilterChange('grade', e.target.value || undefined)}
              className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="">Semua</option>
              <option value="A">Grade A</option>
              <option value="B">Grade B</option>
              <option value="C">Grade C</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-400">Urutkan:</label>
            <select
              value={filters.sort_by || 'newest'}
              onChange={(e) => handleFilterChange('sort_by', e.target.value as MarketplaceFilters['sort_by'])}
              className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="newest">Terbaru</option>
              <option value="yield_desc">Yield Tertinggi</option>
              <option value="tenor_asc">Tenor Terpendek</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-400">Asuransi:</label>
            <select
              value={filters.is_insured === undefined ? '' : filters.is_insured ? 'true' : 'false'}
              onChange={(e) => {
                const val = e.target.value;
                handleFilterChange('is_insured', val === '' ? undefined : val === 'true');
              }}
              className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="">Semua</option>
              <option value="true">Diasuransikan</option>
              <option value="false">Tidak Diasuransikan</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => setFilters({ ...filters })}
              className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-all"
            >
              Coba Lagi
            </button>
          </div>
        ) : pools.length === 0 ? (
          <div className="p-12 bg-slate-800/30 border border-slate-700/50 rounded-xl text-center">
            <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-lg font-semibold text-slate-300 mb-2">Tidak Ada Pool Tersedia</h3>
            <p className="text-slate-500">Belum ada pool pendanaan yang tersedia saat ini.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pools.map((pool) => (
              <div
                key={pool.pool_id}
                className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl backdrop-blur-sm hover:border-cyan-500/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
                      {pool.project_title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg">{pool.buyer_country_flag}</span>
                      <span className="text-sm text-slate-400 truncate">{pool.buyer_company_name}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getGradeColor(pool.grade)}`}>
                    {pool.grade}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Target</span>
                    <span className="text-slate-200 font-medium">
                      Rp {pool.target_amount?.toLocaleString('id-ID') || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Yield</span>
                    <span className="text-green-400 font-medium">{pool.yield_range || `${pool.min_yield}% - ${pool.max_yield}%`}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Tenor</span>
                    <span className="text-slate-200">{pool.tenor_display || `${pool.tenor_days} hari`}</span>
                  </div>

                  <div className="pt-3 border-t border-slate-700/50">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-400">Progress Pendanaan</span>
                      <span className="text-cyan-400 font-medium">{pool.funding_progress?.toFixed(1) || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-teal-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(pool.funding_progress || 0, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="p-2 bg-cyan-500/10 rounded-lg">
                      <p className="text-xs text-slate-400">Priority</p>
                      <p className="text-sm font-medium text-cyan-400">{pool.priority_interest_rate || pool.min_yield}% p.a</p>
                      <div className="w-full bg-slate-700 rounded-full h-1 mt-1">
                        <div
                          className="bg-cyan-400 h-1 rounded-full"
                          style={{ width: `${Math.min(pool.priority_progress || 0, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="p-2 bg-teal-500/10 rounded-lg">
                      <p className="text-xs text-slate-400">Catalyst</p>
                      <p className="text-sm font-medium text-teal-400">{pool.catalyst_interest_rate || pool.max_yield}% p.a</p>
                      <div className="w-full bg-slate-700 rounded-full h-1 mt-1">
                        <div
                          className="bg-teal-400 h-1 rounded-full"
                          style={{ width: `${Math.min(pool.catalyst_progress || 0, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      {pool.is_insured && (
                        <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium rounded border border-blue-500/20">
                          Diasuransikan
                        </span>
                      )}
                      {pool.remaining_time && (
                        <span className="text-xs text-slate-500">{pool.remaining_time}</span>
                      )}
                    </div>
                    <button
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 rounded-lg text-sm font-medium text-white transition-all shadow-lg shadow-cyan-500/25"
                      disabled={pool.is_fully_funded}
                    >
                      {pool.is_fully_funded ? 'Terdanai' : 'Investasi'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && pools.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => handlePageChange((filters.page || 1) - 1)}
              disabled={(filters.page || 1) <= 1}
              className="p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="px-4 py-2 text-sm text-slate-400">
              Halaman {filters.page || 1} dari {totalPages}
            </span>
            <button
              onClick={() => handlePageChange((filters.page || 1) + 1)}
              disabled={(filters.page || 1) >= totalPages}
              className="p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function PoolInvestmentPage() {
  return (
    <AuthGuard allowedRoles={['investor']}>
      <PoolInvestmentContent />
    </AuthGuard>
  );
}
