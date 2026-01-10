'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/lib/components/AuthGuard';
import { DashboardLayout } from '@/lib/components/DashboardLayout';
import { MarketplacePool, MarketplaceFilters } from '@/lib/api/user';
import { useWallet } from '@/lib/context/WalletContext';

function PoolInvestmentContent() {
  const router = useRouter();
  const { walletAddress, isConnecting, isMetaMaskInstalled, error: walletError, connectWallet } = useWallet();
  const demoPools: MarketplacePool[] = [
    {
      pool_id: 'demo-1',
      invoice_id: 'INV-DEMO-001',
      project_title: 'Kopi Arabika Gayo Batch #12',
      grade: 'A',
      min_yield: 10,
      max_yield: 15,
      tenor_days: 60,
      tenor_display: '60 Hari',
      funding_progress: 75,
      target_amount: 500_000_000,
      funded_amount: 375_000_000,
      remaining_amount: 125_000_000,
      priority_interest_rate: 10,
      catalyst_interest_rate: 15,
      priority_progress: 80,
      catalyst_progress: 65,
      priority_target: 300_000_000,
      priority_funded: 240_000_000,
      catalyst_target: 200_000_000,
      catalyst_funded: 130_000_000,
      buyer_country_flag: '🇩🇪',
      buyer_country: 'Jerman',
      buyer_country_risk: 'Low',
      buyer_company_name: 'Buyer Jerman',
      yield_range: '10% - 15%',
      is_insured: true,
      remaining_time: '12 hari tersisa',
      is_fully_funded: false,
    },
    {
      pool_id: 'demo-2',
      invoice_id: 'INV-DEMO-002',
      project_title: 'Udang Vaname Sulawesi #03',
      grade: 'B',
      min_yield: 12,
      max_yield: 16,
      tenor_days: 45,
      tenor_display: '45 Hari',
      funding_progress: 52,
      target_amount: 320_000_000,
      funded_amount: 166_400_000,
      remaining_amount: 153_600_000,
      priority_interest_rate: 12,
      catalyst_interest_rate: 16,
      priority_progress: 55,
      catalyst_progress: 48,
      priority_target: 200_000_000,
      priority_funded: 110_000_000,
      catalyst_target: 120_000_000,
      catalyst_funded: 57_600_000,
      buyer_country_flag: '🇸🇬',
      buyer_country: 'Singapura',
      buyer_country_risk: 'Medium',
      buyer_company_name: 'Harbour Foods SG',
      yield_range: '12% - 16%',
      is_insured: false,
      remaining_time: '9 hari tersisa',
      is_fully_funded: false,
    },
    {
      pool_id: 'demo-3',
      invoice_id: 'INV-DEMO-003',
      project_title: 'Rempah Maluku Batch #07',
      grade: 'C',
      min_yield: 14,
      max_yield: 18,
      tenor_days: 75,
      tenor_display: '75 Hari',
      funding_progress: 100,
      target_amount: 410_000_000,
      funded_amount: 410_000_000,
      remaining_amount: 0,
      priority_interest_rate: 14,
      catalyst_interest_rate: 18,
      priority_progress: 100,
      catalyst_progress: 100,
      priority_target: 250_000_000,
      priority_funded: 250_000_000,
      catalyst_target: 160_000_000,
      catalyst_funded: 160_000_000,
      buyer_country_flag: '🇳🇱',
      buyer_country: 'Belanda',
      buyer_country_risk: 'Low',
      buyer_company_name: 'Dutch Spice BV',
      yield_range: '14% - 18%',
      is_insured: true,
      remaining_time: 'Selesai',
      is_fully_funded: true,
    },
  ];

  const [pools] = useState<MarketplacePool[]>(demoPools);
  const [error] = useState<string | null>(null);
  const [filters, setFilters] = useState<MarketplaceFilters>({
    sort_by: 'newest',
    page: 1,
    per_page: 10,
  });
  const totalPages = 1;
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'open' | 'done'>('open');

  const loading = false;

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

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleInvestClick = (pool: MarketplacePool) => {
    if (!walletAddress) {
      connectWallet();
      return;
    }
    console.log('Invest in pool:', pool.pool_id);
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
            <h1 className="text-2xl font-bold text-white">Marketplace</h1>
            <p className="text-slate-400 mt-1">
              Temukan pool pendanaan yang tersedia untuk investasi
            </p>
          </div>
        </div>

        {!walletAddress ? (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-amber-400 font-medium">Wallet Belum Terhubung</p>
                  <p className="text-sm text-slate-400">
                    {isMetaMaskInstalled
                      ? 'Hubungkan wallet MetaMask Anda untuk mulai berinvestasi'
                      : 'Install MetaMask untuk menghubungkan wallet'}
                  </p>
                </div>
              </div>
              {isMetaMaskInstalled ? (
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50"
                >
                  {isConnecting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Menghubungkan...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" viewBox="0 0 35 33" fill="none">
                        <path d="M32.958 1L19.514 10.862l2.487-5.862L32.958 1z" fill="#E17726" stroke="#E17726" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2.042 1l13.314 9.942-2.357-5.942L2.042 1zM28.025 23.582l-3.575 5.472 7.651 2.105 2.195-7.454-6.271-.123zM.708 23.705l2.185 7.454 7.642-2.105-3.566-5.472-6.261.123z" fill="#E27625" stroke="#E27625" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10.134 14.457l-2.134 3.232 7.601.347-.26-8.175-5.207 4.596zM24.866 14.457l-5.277-4.675-.17 8.254 7.591-.347-2.144-3.232zM10.535 29.054l4.586-2.234-3.965-3.095-.621 5.329zM19.879 26.82l4.586 2.234-.621-5.329-3.965 3.095z" fill="#E27625" stroke="#E27625" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M24.465 29.054l-4.586-2.234.367 2.994-.04 1.262 4.259-2.022zM10.535 29.054l4.259 2.022-.03-1.262.357-2.994-4.586 2.234z" fill="#D5BFB2" stroke="#D5BFB2" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14.884 22.042l-3.825-1.123 2.7-1.242 1.125 2.365zM20.116 22.042l1.125-2.365 2.71 1.242-3.835 1.123z" fill="#233447" stroke="#233447" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10.535 29.054l.641-5.472-4.207.123 3.566 5.349zM23.824 23.582l.641 5.472 3.566-5.349-4.207-.123zM27.01 17.689l-7.591.347.706 3.906 1.125-2.365 2.71 1.242 3.05-3.13zM11.059 20.919l2.71-1.242 1.115 2.365.716-3.906-7.6-.347 3.059 3.13z" fill="#CC6228" stroke="#CC6228" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 17.689l3.179 6.2-.11-3.07L8 17.69zM23.94 20.819l-.12 3.07 3.19-6.2-3.07 3.13zM15.6 18.036l-.716 3.906.896 4.625.2-6.094-.38-2.437zM19.419 18.036l-.37 2.427.18 6.104.906-4.625-.716-3.906z" fill="#E27525" stroke="#E27525" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M20.125 21.942l-.906 4.625.65.457 3.964-3.095.12-3.07-3.828 1.083zM11.059 20.86l.11 3.069 3.964 3.095.65-.457-.896-4.625-3.828-1.082z" fill="#F5841F" stroke="#F5841F" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M20.195 31.076l.04-1.262-.347-.297h-5.076l-.337.297.03 1.262-4.26-2.022 1.49 1.222 3.018 2.093h5.154l3.028-2.093 1.48-1.222-4.22 2.022z" fill="#C0AC9D" stroke="#C0AC9D" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M19.879 26.82l-.65-.456h-3.758l-.65.457-.357 2.993.337-.297h5.076l.347.297-.345-2.993z" fill="#161616" stroke="#161616" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M33.517 11.353l1.14-5.503L32.957 1l-13.078 9.693 5.027 4.254 7.102 2.074 1.57-1.831-.681-.493 1.085-.99-.831-.642 1.085-.826-.716-.536zM.342 5.85l1.15 5.503-.736.546 1.095.826-.821.642 1.085.99-.691.493 1.56 1.831 7.102-2.074 5.027-4.254L2.042 1 .342 5.85z" fill="#763E1A" stroke="#763E1A" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M32.008 17.02l-7.102-2.073 2.144 3.232-3.19 6.2 4.216-.054h6.271l-2.339-7.306zM10.134 14.948L3.032 17.02.703 24.327h6.261l4.207.054-3.18-6.2 2.143-3.233zM19.419 18.036l.454-7.872 2.063-5.579H13.063l2.054 5.58.463 7.87.17 2.448.01 6.084h3.758l.02-6.084.18-2.447z" fill="#F5841F" stroke="#F5841F" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Connect Wallet
                    </span>
                  )}
                </button>
              ) : (
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-lg text-sm font-medium text-white transition-all"
                >
                  Install MetaMask
                </a>
              )}
            </div>
            {walletError && (
              <p className="mt-2 text-sm text-red-400">{walletError}</p>
            )}
          </div>
        ) : (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-green-400 font-medium">Wallet Terhubung</p>
                <p className="text-sm text-slate-400 font-mono">{formatWalletAddress(walletAddress)}</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-300">Connected</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3 p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('open')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                activeTab === 'open'
                  ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-200'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:text-white'
              }`}
            >
              Terbuka
            </button>
            <button
              onClick={() => setActiveTab('done')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                activeTab === 'done'
                  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-200'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:text-white'
              }`}
            >
              Selesai
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="relative">
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari proyek, buyer, atau grade"
                  className="w-full px-4 py-3 pl-11 rounded-xl bg-slate-800/40 border border-slate-700/60 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
                <svg className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-sm text-slate-400">Urutkan:</span>
              <select
                value={filters.sort_by || 'newest'}
                onChange={(e) => handleFilterChange('sort_by', e.target.value as MarketplaceFilters['sort_by'])}
                className="px-3 py-2 bg-slate-800/40 border border-slate-700/60 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              >
                <option value="yield_desc">Yield Tertinggi</option>
                <option value="tenor_asc">Tenor Tercepat</option>
                <option value="newest">Paling Baru</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
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
        </div>

        {error ? (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
            <p className="text-red-400">{error}</p>
            <div className="mt-4 text-sm text-slate-500">Segarkan halaman untuk mencoba lagi.</div>
          </div>
        ) : visiblePools.length === 0 ? (
          <div className="p-12 bg-slate-800/30 border border-slate-700/50 rounded-xl text-center">
            <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-lg font-semibold text-slate-300 mb-2">Tidak Ada Pool Tersedia</h3>
            <p className="text-slate-500">Belum ada pool pendanaan yang tersedia saat ini.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visiblePools.map((pool) => {
              const isFullyFunded = (pool.funding_progress || 0) >= 100 || pool.is_fully_funded;
              const minYield = pool.min_yield ?? pool.priority_interest_rate ?? 0;
              const maxYield = pool.max_yield ?? pool.catalyst_interest_rate ?? pool.min_yield ?? 0;
              const tenorText = pool.tenor_display || (pool.tenor_days ? `${pool.tenor_days} hari` : 'Tenor n/a');
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
                      Fully Funded
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
                      <span className="text-slate-400">Imbal Hasil</span>
                      <span className="text-cyan-300 font-semibold">{yieldRange} p.a</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Target</span>
                      <span className="text-slate-200 font-medium">
                        Rp {pool.target_amount?.toLocaleString('id-ID') || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Tenor</span>
                      <span className="text-slate-200">{tenorText}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-cyan-400 font-medium">{(pool.funding_progress || 0).toFixed(1)}%</span>
                    </div>

                    <div className="pt-3 border-t border-slate-700/50">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-400">Progress Pendanaan</span>
                        <span className="text-cyan-400 font-medium">{(pool.funding_progress || 0).toFixed(1)}%</span>
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInvestClick(pool);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          isFullyFunded
                            ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                            : walletAddress
                            ? 'bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white shadow-lg shadow-cyan-500/25'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white'
                        }`}
                        disabled={isFullyFunded}
                      >
                        {isFullyFunded ? 'Terdanai' : walletAddress ? 'Investasi' : 'Connect Wallet'}
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
