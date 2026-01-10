'use client';

import { useEffect, useState } from 'react';
import { AuthGuard } from '@/lib/components/AuthGuard';
import { DashboardLayout } from '@/lib/components/DashboardLayout';
import { useAuth } from '@/lib/context/AuthContext';
import { riskQuestionnaireAPI, RiskQuestionnaireStatusResponse } from '@/lib/api/user';
import Link from 'next/link';

function InvestorDashboardContent() {
  const { user } = useAuth();
  const [riskStatus, setRiskStatus] = useState<RiskQuestionnaireStatusResponse | null>(null);
  const [loadingRisk, setLoadingRisk] = useState(true);

  useEffect(() => {
    const loadRiskStatus = async () => {
      try {
        const res = await riskQuestionnaireAPI.getStatus();
        if (res.success && res.data) {
          setRiskStatus(res.data);
        }
      } catch (err) {
        console.error('Failed to load risk status', err);
      } finally {
        setLoadingRisk(false);
      }
    };
    loadRiskStatus();
  }, []);

  const stats = [
    {
      label: 'Total Investasi',
      value: `Rp ${(user?.balance_idr || 0).toLocaleString('id-ID')}`,
      change: '+12.5%',
      changeType: 'positive',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Pendapatan Bulan Ini',
      value: 'Rp 1.250.000',
      change: '+8.2%',
      changeType: 'positive',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      label: 'Investasi Aktif',
      value: '12',
      change: '+3',
      changeType: 'positive',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      label: 'Avg. Return',
      value: '12.5%',
      change: '+0.5%',
      changeType: 'positive',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
  ];

  const recentInvestments = [
    { id: 1, name: 'PT Export Nusantara', amount: 5000000, return: 12.5, status: 'active', grade: 'A' },
    { id: 2, name: 'CV Maju Bersama', amount: 3000000, return: 14.0, status: 'active', grade: 'B' },
    { id: 3, name: 'PT Seafood Indonesia', amount: 7500000, return: 11.5, status: 'matured', grade: 'A' },
    { id: 4, name: 'UD Kopi Arabika', amount: 2000000, return: 15.0, status: 'active', grade: 'C' },
  ];

  return (
    <DashboardLayout role="investor">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Selamat datang, {user?.username || 'Investor'}!
            </h1>
            <p className="text-slate-400 mt-1">
              Berikut ringkasan portfolio investasi Anda
            </p>
          </div>
          <Link
            href="/dashboard/investor/pool-investment"
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 rounded-lg font-medium text-sm transition-all shadow-lg shadow-cyan-500/25"
          >
            Investasi Baru
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                  {stat.icon}
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    stat.changeType === 'positive'
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <p className="text-slate-400 text-sm">{stat.label}</p>
              <p className="text-xl font-bold text-white mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Investments */}
          <div className="lg:col-span-2 p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Investasi Terbaru</h2>
              <Link
                href="/dashboard/investor/portfolio"
                className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
              >
                Lihat Semua
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-slate-400 text-sm border-b border-slate-700/50">
                    <th className="pb-3 font-medium">Eksportir</th>
                    <th className="pb-3 font-medium">Jumlah</th>
                    <th className="pb-3 font-medium">Return</th>
                    <th className="pb-3 font-medium">Grade</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {recentInvestments.map((inv) => (
                    <tr key={inv.id} className="text-sm">
                      <td className="py-3 text-slate-200 font-medium">{inv.name}</td>
                      <td className="py-3 text-slate-300">Rp {inv.amount.toLocaleString('id-ID')}</td>
                      <td className="py-3 text-green-400">{inv.return}%</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            inv.grade === 'A'
                              ? 'bg-green-500/10 text-green-400'
                              : inv.grade === 'B'
                              ? 'bg-yellow-500/10 text-yellow-400'
                              : 'bg-orange-500/10 text-orange-400'
                          }`}
                        >
                          {inv.grade}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            inv.status === 'active'
                              ? 'bg-cyan-500/10 text-cyan-400'
                              : 'bg-slate-500/10 text-slate-400'
                          }`}
                        >
                          {inv.status === 'active' ? 'Aktif' : 'Selesai'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            {/* Portfolio Allocation */}
            <div className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-white mb-4">Alokasi Portfolio</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full" />
                    <span className="text-sm text-slate-300">Priority Tranche</span>
                  </div>
                  <span className="text-sm font-medium text-white">65%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-cyan-400 h-2 rounded-full" style={{ width: '65%' }} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-teal-400 rounded-full" />
                    <span className="text-sm text-slate-300">Catalyst Tranche</span>
                  </div>
                  <span className="text-sm font-medium text-white">35%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-teal-400 h-2 rounded-full" style={{ width: '35%' }} />
                </div>
              </div>
            </div>

            {/* Risk Status */}
            <div className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-white mb-4">Status Risiko</h2>
              {loadingRisk ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-cyan-400"></div>
                </div>
              ) : riskStatus?.completed ? (
                <>
                  <div className={`flex items-center space-x-3 p-3 rounded-lg ${
                    riskStatus.catalyst_unlocked
                      ? 'bg-green-500/10 border border-green-500/20'
                      : 'bg-cyan-500/10 border border-cyan-500/20'
                  }`}>
                    <svg className={`w-6 h-6 ${riskStatus.catalyst_unlocked ? 'text-green-400' : 'text-cyan-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {riskStatus.catalyst_unlocked ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      )}
                    </svg>
                    <div>
                      <p className={`text-sm font-medium ${riskStatus.catalyst_unlocked ? 'text-green-400' : 'text-cyan-400'}`}>
                        {riskStatus.catalyst_unlocked ? 'Semua Tranche Terbuka' : 'Priority Tranche Aktif'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {riskStatus.catalyst_unlocked ? 'Priority & Catalyst' : 'Catalyst Terkunci'}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard/investor/risk-assessment"
                    className="mt-3 w-full flex items-center justify-center space-x-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm font-medium text-slate-200 transition-all"
                  >
                    <span>Lihat Detail</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-yellow-400">Catalyst Terkunci</p>
                      <p className="text-xs text-slate-400">Lengkapi assessment</p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard/investor/risk-assessment"
                    className="mt-3 w-full flex items-center justify-center space-x-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm font-medium text-slate-200 transition-all"
                  >
                    <span>Mulai Assessment</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function InvestorDashboardPage() {
  return (
    <AuthGuard allowedRoles={['investor']}>
      <InvestorDashboardContent />
    </AuthGuard>
  );
}
