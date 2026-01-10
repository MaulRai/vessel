'use client';

import { useMemo } from 'react';
import { AuthGuard } from '@/lib/components/AuthGuard';
import { DashboardLayout } from '@/lib/components/DashboardLayout';

type Tier = 'Prioritas' | 'Katalis';
type Status = 'Lancar' | 'Perhatian' | 'Gagal Bayar';

const numberId = new Intl.NumberFormat('id-ID');

const portfolio = {
  saldoTersedia: 180_000_000,
  danaDisalurkan: 420_000_000,
  imbalHasil: 58_500_000,
  sebaran: {
    tunai: 0.25,
    prioritas: 0.5,
    katalis: 0.25,
  },
};

const aktifRows: { nama: string; tier: Tier; modal: number; estimasi: number; status: Status }[] = [
  { nama: 'Kopi Gayo #12', tier: 'Prioritas', modal: 120_000_000, estimasi: 8_400_000, status: 'Lancar' },
  { nama: 'Rempah Maluku #07', tier: 'Katalis', modal: 150_000_000, estimasi: 11_250_000, status: 'Perhatian' },
  { nama: 'Udang Vanname #03', tier: 'Prioritas', modal: 90_000_000, estimasi: 6_300_000, status: 'Lancar' },
  { nama: 'Kakao Sulawesi #05', tier: 'Katalis', modal: 60_000_000, estimasi: 4_200_000, status: 'Gagal Bayar' },
];

function InvestorDashboardContent() {
  const totalPembiayaanBerjalan = useMemo(() => portfolio.saldoTersedia + portfolio.danaDisalurkan, []);

  const donutSegments = useMemo(
    () => [
      { label: 'Saldo Tunai', value: portfolio.sebaran.tunai, color: '#16a34a' },
      { label: 'Prioritas', value: portfolio.sebaran.prioritas, color: '#2563eb' },
      { label: 'Katalis', value: portfolio.sebaran.katalis, color: '#ea580c' },
    ],
    []
  );

  const cumulativeStops = donutSegments.reduce<{ stop: number; color: string }[]>((acc, seg) => {
    const last = acc[acc.length - 1]?.stop ?? 0;
    const next = last + seg.value;
    return acc.concat({ stop: next, color: seg.color });
  }, []);

  const conicGradient = useMemo(() => {
    const parts: string[] = [];
    let start = 0;
    cumulativeStops.forEach(({ stop, color }) => {
      const end = Math.round(stop * 360);
      parts.push(`${color} ${start}deg ${end}deg`);
      start = end;
    });
    return `conic-gradient(${parts.join(', ')})`;
  }, [cumulativeStops]);

  return (
    <DashboardLayout role="investor">
      <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <header className="space-y-2">
            <p className="text-sm font-semibold tracking-wide text-cyan-300/80">Pendana • Dashboard</p>
            <h1 className="text-3xl font-bold text-slate-50">Ringkasan Aset</h1>
            <p className="max-w-3xl text-sm text-slate-400">
              Pantau Nilai Pembiayaan Berjalan, realisasi imbal hasil, dan distribusi aset lintas prioritas.
            </p>
          </header>

          <section className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="Total Simpanan & Pembiayaan"
              value={`Rp ${numberId.format(totalPembiayaanBerjalan)}`}
              subtitle={`Saldo Tersedia Rp ${numberId.format(portfolio.saldoTersedia)} • Dana Sedang Disalurkan Rp ${numberId.format(portfolio.danaDisalurkan)}`}
            />
            <StatCard
              title="Total Imbal Hasil Diterima"
              value={`Rp ${numberId.format(portfolio.imbalHasil)}`}
              subtitle="Akumulasi profit terealisasi"
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
                  {aktifRows.map((row) => (
                    <tr key={row.nama} className="hover:bg-slate-900/40">
                      <Td>
                        <p className="font-semibold text-slate-100">{row.nama}</p>
                        <p className="text-xs text-slate-500">Nilai Pembiayaan Berjalan</p>
                      </Td>
                      <Td>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            row.tier === 'Prioritas'
                              ? 'bg-blue-500/15 text-blue-200 border border-blue-500/40'
                              : 'bg-amber-500/15 text-amber-200 border border-amber-500/40'
                          }`}
                        >
                          {row.tier}
                        </span>
                      </Td>
                      <Td className="text-slate-200">Rp {numberId.format(row.modal)}</Td>
                      <Td className="text-slate-200">Rp {numberId.format(row.estimasi)}</Td>
                      <Td>
                        <StatusBadge status={row.status} />
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

function StatusBadge({ status }: { status: Status }) {
  const tone: Record<Status, { bg: string; text: string; label: string }> = {
    Lancar: { bg: 'bg-emerald-500/15', text: 'text-emerald-200', label: 'Lancar' },
    Perhatian: { bg: 'bg-amber-500/15', text: 'text-amber-200', label: 'Perhatian' },
    'Gagal Bayar': { bg: 'bg-rose-500/20', text: 'text-rose-200', label: 'Gagal Bayar' },
  };

  const cls = tone[status];
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${cls.bg} ${cls.text}`}>
      {status === 'Lancar' && <span aria-hidden>🟢</span>}
      {status === 'Perhatian' && <span aria-hidden>🟡</span>}
      {status === 'Gagal Bayar' && <span aria-hidden>🔴</span>}
      {cls.label}
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
