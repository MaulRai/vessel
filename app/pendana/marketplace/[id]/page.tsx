'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AuthGuard } from '@/lib/components/AuthGuard';
import { DashboardLayout } from '@/lib/components/DashboardLayout';
import { fundingAPI, FundingPool } from '@/lib/api/funding';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { InvestmentModal } from '@/lib/components/marketplace/InvestmentModal';

function formatCurrency(value: number) {
  return value.toLocaleString('id-ID');
}

function ProjectDetailContent() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { t } = useLanguage();

  const [pool, setPool] = useState<FundingPool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tab, setTab] = useState<'priority' | 'catalyst'>('priority');
  const [amountInput, setAmountInput] = useState('10000000');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchPool() {
      if (!id) return;
      try {
        const res = await fundingAPI.getPool(id);
        if (res.success && res.data) {
          setPool(res.data);
        } else {
          setError(res.error?.message || 'Gagal memuat detail proyek');
        }
      } catch (err) {
        setError('Terjadi kesalahan jaringan');
      } finally {
        setLoading(false);
      }
    }
    fetchPool();
  }, [id]);

  const rate = pool ? (tab === 'priority' ? pool.priority_interest_rate : pool.catalyst_interest_rate) : 0;
  const tenorDays = pool?.tenor_days || 0;
  const tenorFactor = tenorDays / 360;

  const amount = useMemo(() => {
    const parsed = Number(amountInput.replace(/[^0-9]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }, [amountInput]);

  const estimatedReturn = useMemo(() => {
    const gain = amount * (rate / 100) * tenorFactor;
    return amount + gain;
  }, [amount, rate, tenorFactor]);

  if (loading) return <DashboardLayout role="investor"><div className="p-8 text-center text-slate-400">Loading...</div></DashboardLayout>;
  if (error || !pool) return <DashboardLayout role="investor"><div className="p-8 text-center text-red-400">{error || 'Pool not found'}</div></DashboardLayout>;

  return (
    <DashboardLayout role="investor">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{pool.project_title || `Invoice #${pool.invoice_number}`}</h1>
            <p className="text-slate-400 mt-1">Detail proyek, simulasi, dan eksekusi pendanaan</p>
          </div>
          <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/60 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden>🌍</span>
              <div>
                <p className="text-slate-200 font-semibold">{pool.buyer_company_name}</p>
                <p className="text-sm text-slate-500">{pool.buyer_country} · Grade {pool.grade}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">Target Pendanaan</p>
              <span className="text-sm text-slate-500">Tenor {pool.tenor_days} hari</span>
            </div>
            <p className="text-2xl font-bold text-white">IDRX {formatCurrency(pool.target_amount)}</p>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>P: {pool.priority_interest_rate}%</span>
              <span>•</span>
              <span>K: {pool.catalyst_interest_rate}%</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/60 rounded-2xl p-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTab('priority')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${tab === 'priority' ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-100' : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
                }`}
            >
              🛡️ Pendanaan Prioritas ({pool.priority_interest_rate}%)
            </button>
            <button
              onClick={() => setTab('catalyst')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${tab === 'catalyst' ? 'bg-orange-500/20 border-orange-500/30 text-orange-100' : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
                }`}
            >
              ⚡ Pendanaan Katalis ({pool.catalyst_interest_rate}%)
            </button>
          </div>

          <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-3">
            <label className="text-sm text-slate-300 font-semibold">Simulasi Nominal Pendanaan (IDRX)</label>
            <input
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value.replace(/[^0-9]/g, ''))}
              inputMode="numeric"
              className="w-full px-4 py-3 rounded-lg bg-slate-900/60 border border-slate-700/60 text-white"
              placeholder="Masukkan nominal simulasi"
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/70">
                <p className="text-xs text-slate-500">Estimasi Imbal Hasil</p>
                <p className="text-lg font-semibold text-cyan-300">{rate}% p.a</p>
              </div>
              <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/70">
                <p className="text-xs text-slate-500">Estimasi Total Diterima</p>
                <p className="text-lg font-semibold text-slate-100">IDRX {formatCurrency(Math.floor(estimatedReturn))}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full py-3 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white shadow-lg transition-all disabled:opacity-50"
          >
            Danai Sekarang
          </button>
        </div>
      </div>

      <InvestmentModal
        pool={pool}
        isOpen={isModalOpen}
        initialTab={tab}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          alert("Investasi Berhasil!");
          router.push('/pendana/dashboard');
        }}
      />
    </DashboardLayout>
  );
}

export default function ProjectDetailPage() {
  return (
    <AuthGuard allowedRoles={['investor']}>
      <ProjectDetailContent />
    </AuthGuard>
  );
}
