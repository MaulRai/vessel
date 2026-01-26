'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/lib/components/AuthGuard';
import { DashboardLayout } from '@/lib/components/DashboardLayout';
import { MarketplacePool, MarketplaceFilters } from '@/lib/api/user';
import { fundingAPI, FundingPool } from '@/lib/api/funding';
import { useInvestorWallet } from '@/lib/context/InvestorWalletContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// Helper to map backend pool to UI model
const mapPoolToUI = (pool: FundingPool): MarketplacePool => {
  const fundingProgress = pool.target_amount > 0 ? (pool.funded_amount / pool.target_amount) * 100 : 0;
  const priorityProgress = pool.priority_target > 0 ? (pool.priority_funded / pool.priority_target) * 100 : 0;
  const catalystProgress = pool.catalyst_target > 0 ? (pool.catalyst_funded / pool.catalyst_target) * 100 : 0;
  const yieldRange = `${pool.priority_interest_rate}% - ${pool.catalyst_interest_rate}%`;

  return {
    pool_id: pool.id,
    invoice_id: pool.invoice_number,
    project_title: pool.project_title || `Project ${pool.invoice_number}`,
    grade: pool.grade || 'B',
    min_yield: pool.priority_interest_rate,
    max_yield: pool.catalyst_interest_rate,
    tenor_days: pool.tenor_days,
    tenor_display: `${pool.tenor_days} Hari`,
    funding_progress: Math.min(fundingProgress, 100),
    target_amount: pool.target_amount,
    funded_amount: pool.funded_amount,
    remaining_amount: pool.target_amount - pool.funded_amount,
    priority_interest_rate: pool.priority_interest_rate,
    catalyst_interest_rate: pool.catalyst_interest_rate,
    priority_progress: Math.min(priorityProgress, 100),
    catalyst_progress: Math.min(catalystProgress, 100),
    priority_target: pool.priority_target,
    priority_funded: pool.priority_funded,
    catalyst_target: pool.catalyst_target,
    catalyst_funded: pool.catalyst_funded,
    buyer_country_flag: '🌍',
    buyer_country: pool.buyer_country,
    buyer_country_risk: 'Medium',
    buyer_company_name: pool.buyer_company_name,
    yield_range: yieldRange,
    is_insured: true,
    remaining_time: '7 hari tersisa',
    is_fully_funded: pool.status === 'filled' || pool.status === 'closed',
  };
};

function PoolInvestmentContent() {
  const router = useRouter();
  const { t } = useLanguage();

  const [pools, setPools] = useState<MarketplacePool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPools() {
      try {
        const res = await fundingAPI.listPools(1, 10);
        if (res.success && res.data) {
          const mapped = res.data.pools.map(mapPoolToUI);
          setPools(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch pools', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPools();
  }, []);

  const [error] = useState<string | null>(null);
  const [filters, setFilters] = useState<MarketplaceFilters>({
    sort_by: 'newest',
    page: 1,
    per_page: 10,
  });
  const totalPages = 1;
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'open' | 'done'>('open');



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

  const handleInvestClick = (pool: MarketplacePool) => {
    router.push(`/pendana/marketplace/${pool.pool_id}`);
  };

  const filterBySearch = (items: MarketplacePool[]) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return items;
    return items.filter((pool) => {
      const haystack = `${pool.project_title || ''} ${pool.buyer_company_name || ''} ${pool.grade || ''}`.toLowerCase();
      return haystack.includes(term);
    });
  };

  const sortPools = (items: MarketplacePool[]) => {
    const { sort_by } = filters;
    return [...items].sort((a, b) => {
      if (sort_by === 'yield_desc') {
        const maxA = a.max_yield ?? a.catalyst_interest_rate ?? a.priority_interest_rate ?? 0;
        const maxB = b.max_yield ?? b.catalyst_interest_rate ?? b.priority_interest_rate ?? 0;
        return maxB - maxA;
      }
      if (sort_by === 'tenor_asc') {
        const tenorA = a.tenor_days ?? Number.MAX_SAFE_INTEGER;
        const tenorB = b.tenor_days ?? Number.MAX_SAFE_INTEGER;
        return tenorA - tenorB;
      }
      return (b.funding_progress || 0) - (a.funding_progress || 0);
    });
  };

  const segmentedPools = () => {
    const funded = pools.filter((pool) => (pool.funding_progress || 0) >= 100 || pool.is_fully_funded);
    const open = pools.filter((pool) => (pool.funding_progress || 0) < 100 && !pool.is_fully_funded);
    return { funded, open };
  };

  const { funded, open } = segmentedPools();
  const tabPools = activeTab === 'open' ? open : funded;
  const visiblePools = sortPools(filterBySearch(tabPools));

  return (
    <DashboardLayout role="investor">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{t('marketplace.title')}</h1>
            <p className="text-slate-400 mt-1">
              {t('marketplace.subtitle')}
            </p>
          </div>
        </div>

        <div className="space-y-3 p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('open')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${activeTab === 'open'
                ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-200'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:text-white'
                }`}
            >
              {t('marketplace.tabOpen')}
            </button>
            <button
              onClick={() => setActiveTab('done')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${activeTab === 'done'
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-200'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:text-white'
                }`}
            >
              {t('marketplace.tabDone')}
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="relative">
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('marketplace.searchPlaceholder')}
                  className="w-full px-4 py-3 pl-11 rounded-xl bg-slate-800/40 border border-slate-700/60 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
                <svg className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-sm text-slate-400">{t('marketplace.sortBy')}:</span>
              <select
                value={filters.sort_by || 'newest'}
                onChange={(e) => handleFilterChange('sort_by', e.target.value as MarketplaceFilters['sort_by'])}
                className="px-3 py-2 bg-slate-800/40 border border-slate-700/60 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              >
                <option value="yield_desc">{t('marketplace.sortYield')}</option>
                <option value="tenor_asc">{t('marketplace.sortTenor')}</option>
                <option value="newest">{t('marketplace.sortNewest')}</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-400">{t('marketplace.filterGrade')}</label>
              <select
                value={filters.grade || ''}
                onChange={(e) => handleFilterChange('grade', e.target.value || undefined)}
                className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
              >
                <option value="">{t('marketplace.filterAll')}</option>
                <option value="A">Grade A</option>
                <option value="B">Grade B</option>
                <option value="C">Grade C</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-400">{t('marketplace.filterInsurance')}</label>
              <select
                value={filters.is_insured === undefined ? '' : filters.is_insured ? 'true' : 'false'}
                onChange={(e) => {
                  const val = e.target.value;
                  handleFilterChange('is_insured', val === '' ? undefined : val === 'true');
                }}
                className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
              >
                <option value="">{t('marketplace.filterAll')}</option>
                <option value="true">{t('marketplace.filterInsured')}</option>
                <option value="false">{t('marketplace.filterNotInsured')}</option>
              </select>
            </div>
          </div>
        </div>

        {error ? (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
            <p className="text-red-400">{error}</p>
            <div className="mt-4 text-sm text-slate-500">{t('common.refreshToRetry')}</div>
          </div>
        ) : visiblePools.length === 0 ? (
          <div className="p-12 bg-slate-800/30 border border-slate-700/50 rounded-xl text-center">
            <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-lg font-semibold text-slate-300 mb-2">{t('marketplace.noPoolsTitle')}</h3>
            <p className="text-slate-500">{t('marketplace.noPoolsDesc')}</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visiblePools.map((pool) => {
              const isFullyFunded = (pool.funding_progress || 0) >= 100 || pool.is_fully_funded;
              const minYield = pool.min_yield ?? pool.priority_interest_rate ?? 0;
              const maxYield = pool.max_yield ?? pool.catalyst_interest_rate ?? pool.min_yield ?? 0;
              const tenorText = pool.tenor_display || (pool.tenor_days ? `${pool.tenor_days} ${t('common.days')}` : 'Tenor n/a');
              const buyerLabel = `${pool.buyer_country_flag || ''} ${pool.buyer_country || pool.buyer_company_name || 'Buyer'}`.trim();
              const yieldRange = pool.yield_range || `${minYield}% - ${maxYield}%`;
              return (
                <div
                  key={pool.pool_id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/pendana/marketplace/${pool.pool_id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      router.push(`/pendana/marketplace/${pool.pool_id}`);
                    }
                  }}
                  className="relative p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl backdrop-blur-sm hover:border-cyan-500/30 transition-all group overflow-hidden cursor-pointer"
                >
                  {isFullyFunded && (
                    <div className="absolute inset-0 bg-slate-900/70 border border-cyan-500/30 backdrop-blur-sm flex items-center justify-center text-cyan-300 font-semibold uppercase tracking-wide">
                      {t('marketplace.fullyFunded')}
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
                        {pool.project_title || 'Kopi Arabika Gayo Batch #12'}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg" aria-hidden>{pool.buyer_country_flag || '🇮🇩'}</span>
                        <span className="text-sm text-slate-400 truncate">{buyerLabel || 'Buyer'}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getGradeColor(pool.grade)}`}>
                      {pool.grade}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">{t('marketplace.yield')}</span>
                      <span className="text-cyan-300 font-semibold">{yieldRange} p.a</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">{t('marketplace.target')}</span>
                      <span className="text-slate-200 font-medium">
                        IDRX {pool.target_amount?.toLocaleString('id-ID') || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">{t('marketplace.tenor')}</span>
                      <span className="text-slate-200">{tenorText}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">{t('marketplace.progress')}</span>
                      <span className="text-cyan-400 font-medium">{(pool.funding_progress || 0).toFixed(1)}%</span>
                    </div>

                    <div className="pt-3 border-t border-slate-700/50">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-400">{t('marketplace.fundingProgress')}</span>
                        <span className="text-cyan-400 font-medium">{(pool.funding_progress || 0).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-linear-to-r from-cyan-500 to-teal-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(pool.funding_progress || 0, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="p-2 bg-cyan-500/10 rounded-lg">
                        <p className="text-xs text-slate-400">{t('marketplace.priority')}</p>
                        <p className="text-sm font-medium text-cyan-400">{pool.priority_interest_rate || pool.min_yield}% p.a</p>
                        <div className="w-full bg-slate-700 rounded-full h-1 mt-1">
                          <div
                            className="bg-cyan-400 h-1 rounded-full"
                            style={{ width: `${Math.min(pool.priority_progress || 0, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="p-2 bg-teal-500/10 rounded-lg">
                        <p className="text-xs text-slate-400">{t('marketplace.catalyst')}</p>
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
                            {t('marketplace.filterInsured')}
                          </span>
                        )}
                        {pool.remaining_time && (
                          <span className="text-xs text-slate-500">
                            {pool.remaining_time}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInvestClick(pool);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isFullyFunded
                          ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                          : 'bg-linear-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white shadow-lg shadow-cyan-500/25'
                          }`}
                        disabled={isFullyFunded}
                      >
                        {isFullyFunded ? t('marketplace.funded') : t('marketplace.invest')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && !error && visiblePools.length > 0 && totalPages > 1 && (
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
