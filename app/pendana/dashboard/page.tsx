'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { AuthGuard } from '@/lib/components/AuthGuard';
import { DashboardLayout } from '@/lib/components/DashboardLayout';
import { StatRibbonCard } from '@/lib/components/StatRibbonCard';
import { investmentAPI, InvestorPortfolio, ActiveInvestment } from '@/lib/api/user';

const numberId = new Intl.NumberFormat('id-ID');

function InvestorDashboardContent() {
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

  const trancheTotal = useMemo(
    () => (portfolio?.priority_allocation || 0) + (portfolio?.catalyst_allocation || 0),
    [portfolio]
  );

  const hasTrancheData = trancheTotal > 0;

  const priorityPct = useMemo(() => {
    if (!portfolio) return 0;
    if (!hasTrancheData) return 0;
    return Math.round(((portfolio.priority_allocation || 0) / trancheTotal) * 100);
  }, [portfolio, hasTrancheData, trancheTotal]);

  const catalystPct = hasTrancheData ? 100 - priorityPct : 0;

  const donutSegments = useMemo(
    () =>
      hasTrancheData
        ? [
            { label: 'Prioritas', value: priorityPct / 100, color: '#2563eb' },
            { label: 'Katalis', value: catalystPct / 100, color: '#ea580c' },
          ]
        : [],
    [hasTrancheData, priorityPct, catalystPct]
  );

  const conicGradient = useMemo(() => {
    if (!hasTrancheData) {
      return 'conic-gradient(#0f172a 0deg 360deg)';
    }

    const parts: string[] = [];
    let start = 0;
    donutSegments.forEach(({ value, color }) => {
      const end = Math.round((start + value) * 360);
      parts.push(`${color} ${Math.round(start * 360)}deg ${end}deg`);
      start += value;
    });
    return `conic-gradient(${parts.join(', ')})`;
  }, [donutSegments, hasTrancheData]);

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
      <div className="min-h-screen bg-slate-950 px-4 text-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-900/50 via-sky-800/40 to-transparent p-6 sm:p-8">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(56,189,248,0.18),rgba(8,47,73,0))]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(14,165,233,0.12),rgba(8,47,73,0))]" />
            </div>
            <div className="relative flex items-center gap-4">
              <div className="relative h-24 w-24 rounded-2xl overflow-hidden shadow-lg shadow-sky-900/40">
                <Image
                  src="/assets/general/investor.png"
                  alt="Investor illustration"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Ringkasan Aset</h1>
                <p className="mt-1 max-w-3xl text-sm text-slate-200/80">
                  Pantau nilai pembiayaan berjalan, realisasi imbal hasil, dan distribusi aset lintas prioritas.
                </p>
              </div>
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-3">
            <StatRibbonCard
              color="#0f4c81"
              imageSrc="/assets/general/savings.png"
              imageAlt="Simpanan dan pembiayaan"
            >
              <p className="text-sm font-semibold text-slate-200">Total Simpanan & Pembiayaan</p>
              <p className="text-2xl font-bold text-slate-50">{`Rp ${numberId.format(totalPembiayaanBerjalan)}`}</p>
              <p className="text-xs font-semibold text-slate-200">Saldo Tersedia</p>
              <p className="text-xl font-bold text-slate-50">{`Rp ${numberId.format(portfolio?.available_balance || 0)}`}</p>
              <p className="text-xs font-semibold text-slate-200">Dana Sedang Disalurkan</p>
              <p className="text-xl font-bold text-slate-50">{`Rp ${numberId.format(portfolio?.total_funding || 0)}`}</p>
            </StatRibbonCard>
            <StatRibbonCard
              color="#1d5fa6"
              imageSrc="/assets/general/interest.png"
              imageAlt="Imbal hasil"
            >
              <p className="text-sm font-semibold text-slate-200">Total Imbal Hasil Diterima</p>
              <p className="text-2xl font-bold text-slate-50">{`Rp ${numberId.format(portfolio?.total_realized_gain || 0)}`}</p>
              <p className="text-xs font-semibold text-slate-200">Estimasi</p>
              <p className="text-xl font-bold text-slate-50">{`Rp ${numberId.format(portfolio?.total_expected_gain || 0)}`}</p>
            </StatRibbonCard>
            <div className="relative rounded-r-2xl rounded-l-none border border-slate-800 bg-slate-900/40 p-5 shadow-inner shadow-black/30 overflow-hidden">
              <div className="absolute left-0 top-0 h-full w-1.5 bg-[#0f4c81]" />
              <div className="absolute inset-y-0 left-0 w-28" style={{ background: 'linear-gradient(90deg, rgba(15,76,129,0.2) 0%, rgba(15,23,42,0) 100%)' }} />
              <div className="absolute right-[-28px] bottom-[-16px] opacity-15" aria-hidden="true">
                <Image src="/assets/general/tranche.png" alt="Tranche" width={200} height={200} className="object-contain" />
              </div>
              <div className="relative">
                <p className="text-sm font-semibold text-slate-200">Sebaran Tranche</p>
                <p className="text-xs text-slate-500">Prioritas (Senior) vs Katalis (Junior)</p>
                <div className="mt-4 flex items-center gap-6">
                  <div
                    className="h-32 w-32 rounded-full border border-slate-800 bg-slate-900 shadow-inner shadow-black/30"
                    style={{ background: conicGradient }}
                    aria-label="Sebaran tranche"
                  />
                  <div className="space-y-2 text-sm text-slate-300">
                    {!hasTrancheData ? (
                      <p className="text-xs font-bold text-white">Belum ada Tranche</p>
                    ) : (
                      donutSegments.map((seg) => (
                        <div key={seg.label} className="flex items-center gap-3">
                          <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: seg.color }} />
                          <span className="flex-1">{seg.label}</span>
                          <span className="text-slate-400">{Math.round(seg.value * 100)}%</span>
                        </div>
                      ))
                    )}
                  </div>
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
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              row.tranche === 'priority'
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
