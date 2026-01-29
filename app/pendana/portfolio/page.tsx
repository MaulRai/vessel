'use client';

import { useEffect, useState } from 'react';
import { AuthGuard } from '@/lib/components/AuthGuard';
import { DashboardLayout } from '@/lib/components/DashboardLayout';
import { MarketplaceHero } from '@/lib/components/MarketplaceHero';
import { investmentAPI, InvestorPortfolio, ActiveInvestment } from '@/lib/api/user';
import Link from 'next/link';

function PortfolioContent() {
  const [portfolio, setPortfolio] = useState<InvestorPortfolio | null>(null);
  const [investments, setInvestments] = useState<ActiveInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [portfolioRes, investmentsRes] = await Promise.all([
          investmentAPI.getPortfolio(),
          investmentAPI.getActiveInvestments(page, 10),
        ]);

        if (portfolioRes.success && portfolioRes.data) {
          setPortfolio(portfolioRes.data);
        }

        if (investmentsRes.success && investmentsRes.data) {
          setInvestments(investmentsRes.data.investments || []);
          setTotalPages(investmentsRes.data.total_pages || 1);
        }
      } catch {
        setError('Gagal memuat data portfolio');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [page]);

  const getStatusColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'yellow':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'red':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getTrancheColor = (tranche: string) => {
    return tranche === 'priority'
      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
      : 'bg-teal-500/10 text-teal-400 border-teal-500/20';
  };

  if (loading) {
    return (
      <DashboardLayout role="investor">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="investor">
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-all"
          >
            Coba Lagi
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const priorityPercent = portfolio
    ? ((portfolio.priority_allocation / (portfolio.priority_allocation + portfolio.catalyst_allocation || 1)) * 100) || 0
    : 0;
  const catalystPercent = 100 - priorityPercent;

  return (
    <DashboardLayout role="investor">
      <div className="space-y-6">
        <MarketplaceHero
          imageSrc="/assets/general/portofolio.png"
          title="Portfolio"
          subtitle="Ringkasan investasi dan pendanaan aktif Anda"
          cta={(
            <Link
              href="/pendana/marketplace"
              className="inline-flex px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 rounded-lg font-medium text-sm text-white transition-all shadow-lg shadow-cyan-500/25"
            >
              Investasi Baru
            </Link>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-slate-400 text-sm">Total Pendanaan Aktif</p>
            <p className="text-xl font-bold text-white mt-1">
              Rp {(portfolio?.total_funding || 0).toLocaleString('id-ID')}
            </p>
          </div>

          <div className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <p className="text-slate-400 text-sm">Estimasi Imbal Hasil</p>
            <p className="text-xl font-bold text-green-400 mt-1">
              Rp {(portfolio?.total_expected_gain || 0).toLocaleString('id-ID')}
            </p>
          </div>

          <div className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-teal-500/10 rounded-lg text-teal-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-slate-400 text-sm">Profit Terealisasi</p>
            <p className="text-xl font-bold text-teal-400 mt-1">
              Rp {(portfolio?.total_realized_gain || 0).toLocaleString('id-ID')}
            </p>
          </div>

          <div className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-slate-400 text-sm">Saldo Tersedia</p>
            <p className="text-xl font-bold text-white mt-1">
              Rp {(portfolio?.available_balance || 0).toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-white mb-4">Alokasi Dana</h2>
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="12"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="12"
                    strokeDasharray={`${priorityPercent * 2.51} 251`}
                    strokeLinecap="round"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#14b8a6"
                    strokeWidth="12"
                    strokeDasharray={`${catalystPercent * 2.51} 251`}
                    strokeDashoffset={`${-priorityPercent * 2.51}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{portfolio?.active_investments || 0}</p>
                    <p className="text-xs text-slate-400">Aktif</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full" />
                  <span className="text-sm text-slate-300">Priority</span>
                </div>
                <span className="text-sm font-medium text-white">
                  Rp {(portfolio?.priority_allocation || 0).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-teal-400 rounded-full" />
                  <span className="text-sm text-slate-300">Catalyst</span>
                </div>
                <span className="text-sm font-medium text-white">
                  Rp {(portfolio?.catalyst_allocation || 0).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-white mb-4">Statistik</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-slate-400">Investasi Aktif</span>
                <span className="text-xl font-bold text-cyan-400">{portfolio?.active_investments || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-slate-400">Deal Selesai</span>
                <span className="text-xl font-bold text-green-400">{portfolio?.completed_deals || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-slate-400">Total Investasi</span>
                <span className="text-xl font-bold text-white">
                  {(portfolio?.active_investments || 0) + (portfolio?.completed_deals || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-white mb-4">Ringkasan</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-400 mb-1">Total Modal Disalurkan</p>
                <p className="text-lg font-bold text-white">
                  Rp {(portfolio?.total_funding || 0).toLocaleString('id-ID')}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Estimasi Total Return</p>
                <p className="text-lg font-bold text-green-400">
                  Rp {((portfolio?.total_funding || 0) + (portfolio?.total_expected_gain || 0)).toLocaleString('id-ID')}
                </p>
              </div>
              <div className="pt-3 border-t border-slate-700/50">
                <p className="text-sm text-slate-400 mb-1">Yield Rata-rata</p>
                <p className="text-lg font-bold text-cyan-400">
                  {portfolio?.total_funding && portfolio.total_expected_gain
                    ? ((portfolio.total_expected_gain / portfolio.total_funding) * 100).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl backdrop-blur-sm overflow-hidden">
          <div className="p-6 border-b border-slate-700/50">
            <h2 className="text-lg font-semibold text-white">Investasi Aktif</h2>
          </div>

          {investments.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-lg font-semibold text-slate-300 mb-2">Belum Ada Investasi</h3>
              <p className="text-slate-500 mb-4">Mulai investasi pertama Anda untuk melihat portfolio.</p>
              <Link
                href="/pendana/marketplace"
                className="inline-flex px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 rounded-lg font-medium text-sm text-white transition-all"
              >
                Mulai Investasi
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-slate-400 text-sm border-b border-slate-700/50">
                      <th className="px-6 py-4 font-medium">Proyek</th>
                      <th className="px-6 py-4 font-medium">Tranche</th>
                      <th className="px-6 py-4 font-medium">Modal</th>
                      <th className="px-6 py-4 font-medium">Return</th>
                      <th className="px-6 py-4 font-medium">Jatuh Tempo</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {investments.map((inv) => (
                      <tr key={inv.investment_id} className="hover:bg-slate-800/30">
                        <td className="px-6 py-4">
                          <p className="text-white font-medium">{inv.project_name}</p>
                          <div className="flex items-center gap-1 text-sm text-slate-400 mt-1">
                            <span>{inv.buyer_flag}</span>
                            <span>{inv.buyer_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getTrancheColor(inv.tranche)}`}>
                            {inv.tranche_display}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white font-medium">Rp {inv.principal.toLocaleString('id-ID')}</p>
                          <p className="text-xs text-slate-400">{inv.interest_rate}% p.a</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-green-400 font-medium">+Rp {inv.estimated_return.toLocaleString('id-ID')}</p>
                          <p className="text-xs text-slate-400">Total: Rp {inv.total_expected.toLocaleString('id-ID')}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white">{new Date(inv.due_date).toLocaleDateString('id-ID')}</p>
                          <p className="text-xs text-slate-400">{inv.days_remaining} hari lagi</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(inv.status_color)}`}>
                            {inv.status_display}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 p-4 border-t border-slate-700/50">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    className="p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="px-4 py-2 text-sm text-slate-400">
                    Halaman {page} dari {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                    className="p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function PortfolioPage() {
  return (
    <AuthGuard allowedRoles={['investor']}>
      <PortfolioContent />
    </AuthGuard>
  );
}
