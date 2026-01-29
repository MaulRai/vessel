'use client';

import { useEffect, useMemo, useState } from 'react';
import { AuthGuard } from '@/lib/components/AuthGuard';
import { DashboardLayout } from '@/lib/components/DashboardLayout';
import { investmentAPI, InvestorPortfolio, ActiveInvestment } from '@/lib/api/user';

const numberId = new Intl.NumberFormat('id-ID');

import { useAuth } from '@/lib/context/AuthContext';
import {
  Identity,
  Name,
  Address,
  Avatar,
  EthBalance
} from '@coinbase/onchainkit/identity';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { base } from 'wagmi/chains';
/* eslint-disable @typescript-eslint/no-unused-vars */
// Removed invalid color import

// Re-implementing logic
function InvestorDashboardContent() {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<InvestorPortfolio | null>(null);
  const [investments, setInvestments] = useState<ActiveInvestment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [portfolioRes, investmentsRes] = await Promise.all([
          investmentAPI.getPortfolio(),
          investmentAPI.getActiveInvestments(1, 10),
        ]);

        if (portfolioRes.success && portfolioRes.data) {
          setPortfolio(portfolioRes.data);
        }

        if (investmentsRes.success && investmentsRes.data) {
          setInvestments(investmentsRes.data.investments || []);
        }
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const totalPembiayaanBerjalan = useMemo(() => {
    if (!portfolio) return 0;
    return (portfolio.available_balance || 0) + (portfolio.total_funding || 0);
  }, [portfolio]);

  const priorityPct = useMemo(() => {
    if (!portfolio) return 50;
    const total = (portfolio.priority_allocation || 0) + (portfolio.catalyst_allocation || 0) + (portfolio.available_balance || 0);
    if (total === 0) return 33;
    return Math.round((portfolio.priority_allocation / total) * 100);
  }, [portfolio]);

  const catalystPct = useMemo(() => {
    if (!portfolio) return 25;
    const total = (portfolio.priority_allocation || 0) + (portfolio.catalyst_allocation || 0) + (portfolio.available_balance || 0);
    if (total === 0) return 33;
    return Math.round((portfolio.catalyst_allocation / total) * 100);
  }, [portfolio]);

  const cashPct = 100 - priorityPct - catalystPct;

  const donutSegments = useMemo(
    () => [
      { label: 'Saldo Tunai', value: cashPct / 100, color: '#16a34a' },
      { label: 'Prioritas', value: priorityPct / 100, color: '#2563eb' },
      { label: 'Katalis', value: catalystPct / 100, color: '#ea580c' },
    ],
    [cashPct, priorityPct, catalystPct]
  );

  const conicGradient = useMemo(() => {
    const parts: string[] = [];
    let start = 0;
    donutSegments.forEach(({ value, color }) => {
      const end = Math.round((start + value) * 360);
      parts.push(`${color} ${Math.round(start * 360)}deg ${end}deg`);
      start += value;
    });
    return `conic-gradient(${parts.join(', ')})`;
  }, [donutSegments]);

  if (loading) {
    return (
      <DashboardLayout role="investor">
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="investor">
      <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <p className="text-sm font-semibold tracking-wide text-cyan-300/80">Pendana &bull; Dashboard</p>
              <h1 className="text-3xl font-bold text-slate-50">Ringkasan Aset</h1>
              <p className="max-w-3xl text-sm text-slate-400">
                Pantau Nilai Pembiayaan Berjalan, realisasi imbal hasil, dan distribusi aset lintas prioritas.
              </p>
            </div>

            {/* User Profile & Basename Identity */}
            <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              {user?.wallet_address && (
                <Identity
                  address={user.wallet_address as `0x${string}`}
                  schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
                >
                  <Avatar className="h-10 w-10" />
                  <div className="flex flex-col">
                    <Name className="text-sm font-semibold text-slate-100" />
                    <Address className="text-xs text-slate-400" />
                  </div>
                </Identity>
              )}
              <div className="h-8 w-[1px] bg-slate-700 mx-2 hidden md:block" />
              <div className="flex flex-col">
                <span className="text-xs text-slate-400">Akun Vessel</span>
                <span className="text-sm font-medium text-slate-200">{user?.profile?.full_name || user?.username}</span>
              </div>
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="Total Simpanan & Pembiayaan"
              value={`Rp ${numberId.format(totalPembiayaanBerjalan)}`}
              subtitle={`Saldo Tersedia Rp ${numberId.format(portfolio?.available_balance || 0)} \u2022 Dana Sedang Disalurkan Rp ${numberId.format(portfolio?.total_funding || 0)}`}
            />
            <StatCard
              title="Total Imbal Hasil Diterima"
              value={`Rp ${numberId.format(portfolio?.total_realized_gain || 0)}`}
              subtitle={`Estimasi: Rp ${numberId.format(portfolio?.total_expected_gain || 0)}`}
            />
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
              <p className="text-sm font-semibold text-slate-200">Sebaran Aset</p>
              <p className="text-xs text-slate-500">Tunai, Prioritas (Senior), Katalis (Junior)</p>
              <div className="mt-4 flex items-center gap-6">
                <div
                  className="h-32 w-32 rounded-full border border-slate-800 bg-slate-900 shadow-inner shadow-black/30"
                  style={{ background: conicGradient }}
                  aria-label="Sebaran aset"
                />
                <div className="space-y-2 text-sm text-slate-300">
                  {donutSegments.map((seg) => (
                    <div key={seg.label} className="flex items-center gap-3">
                      <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: seg.color }} />
                      <span className="flex-1">{seg.label}</span>
                      <span className="text-slate-400">{Math.round(seg.value * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-inner shadow-black/30">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-100">List Pembiayaan Aktif</h2>
                <p className="text-sm text-slate-400">Nilai Pembiayaan Berjalan per proyek</p>
              </div>
            </div>

            {investments.length === 0 ? (
              <div className="mt-5 p-8 text-center text-slate-500">
                <p>Belum ada pembiayaan aktif.</p>
              </div>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800">
                  <thead className="bg-slate-900/60">
                    <tr>
                      <Th>Nama Proyek</Th>
                      <Th>Tipe</Th>
                      <Th>Modal Disalurkan</Th>
                      <Th>Estimasi Hasil</Th>
                      <Th>Status</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {investments.map((row) => (
                      <tr key={row.investment_id} className="hover:bg-slate-900/40">
                        <Td>
                          <p className="font-semibold text-slate-100">{row.project_name}</p>
                          <p className="text-xs text-slate-500">{row.buyer_flag} {row.buyer_name}</p>
                        </Td>
                        <Td>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${row.tranche === 'priority'
                              ? 'bg-blue-500/15 text-blue-200 border border-blue-500/40'
                              : 'bg-amber-500/15 text-amber-200 border border-amber-500/40'
                              }`}
                          >
                            {row.tranche_display}
                          </span>
                        </Td>
                        <Td className="text-slate-200">Rp {numberId.format(row.principal)}</Td>
                        <Td className="text-slate-200">Rp {numberId.format(row.estimated_return)}</Td>
                        <Td>
                          <StatusBadge status={row.status} label={row.status_display} color={row.status_color} />
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
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

function StatCard({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-inner shadow-black/20">
      <p className="text-sm font-semibold text-slate-200">{title}</p>
      <p className="mt-2 text-2xl font-bold text-slate-50">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-slate-500 leading-relaxed">{subtitle}</p>}
    </div>
  );
}

function StatusBadge({ status, label, color }: { status: string; label: string; color: string }) {
  const colorMap: Record<string, { bg: string; text: string }> = {
    green: { bg: 'bg-emerald-500/15', text: 'text-emerald-200' },
    yellow: { bg: 'bg-amber-500/15', text: 'text-amber-200' },
    red: { bg: 'bg-rose-500/20', text: 'text-rose-200' },
  };

  const cls = colorMap[color] || { bg: 'bg-slate-500/15', text: 'text-slate-200' };

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${cls.bg} ${cls.text}`}>
      {label || status}
    </span>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
      {children}
    </th>
  );
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`px-4 py-3 align-top text-sm text-slate-300${className ? ` ${className}` : ''}`}>
      {children}
    </td>
  );
}
