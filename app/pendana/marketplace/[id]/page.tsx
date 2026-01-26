'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ethers } from 'ethers';
import { AuthGuard } from '@/lib/components/AuthGuard';
import { DashboardLayout } from '@/lib/components/DashboardLayout';
import { fundingAPI, FundingPool } from '@/lib/api/funding';
import { useInvestorWallet } from '@/lib/context/InvestorWalletContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const PLATFORM_WALLET_ADDRESS = process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
const IDRX_ADDRESS = process.env.NEXT_PUBLIC_IDRX_TOKEN_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)"
];

type FundingTab = 'priority' | 'catalyst';

function formatCurrency(value: number) {
  return value.toLocaleString('id-ID');
}

function ProjectDetailContent() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { walletAddress } = useInvestorWallet();
  const { t } = useLanguage();

  const [pool, setPool] = useState<FundingPool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tab, setTab] = useState<FundingTab>('priority');
  const [amountInput, setAmountInput] = useState('10000000');
  const [showPrioritySheet, setShowPrioritySheet] = useState(false);
  const [priorityAgreed, setPriorityAgreed] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [riskChecks, setRiskChecks] = useState({ a: false, b: false, c: false });
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const warningScrollRef = useRef<HTMLDivElement>(null);

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

  const handleDanai = () => {
    if (tab === 'priority') {
      setShowPrioritySheet(true);
    } else {
      setShowWarning(true);
    }
  };

  const closeAll = () => {
    setShowPrioritySheet(false);
    setShowWarning(false);
    setPriorityAgreed(false);
    setRiskChecks({ a: false, b: false, c: false });
    setScrolledToBottom(false);
    setIsProcessing(false);
  };

  const handleWarningScroll = () => {
    const el = warningScrollRef.current;
    if (!el) return;
    const reachedBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
    if (reachedBottom) setScrolledToBottom(true);
  };

  const riskReady = scrolledToBottom && riskChecks.a && riskChecks.b && riskChecks.c;

  const executeInvestment = async () => {
    if (!walletAddress || !pool) {
      alert('Wallet must be connected');
      return;
    }
    if (!window.ethereum) return;

    setIsProcessing(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const idrx = new ethers.Contract(IDRX_ADDRESS, ERC20_ABI, signer);

      const amountUnits = ethers.parseUnits(amount.toString(), 18);

      console.log(`Transferring ${amountUnits} to ${PLATFORM_WALLET_ADDRESS}`);

      const tx = await idrx.transfer(PLATFORM_WALLET_ADDRESS, amountUnits);
      console.log('Tx sent:', tx.hash);
      await tx.wait();
      console.log('Tx confirmed');

      const res = await fundingAPI.invest({
        pool_id: pool.id,
        amount: amount,
        tranche: tab,
        tnc_accepted: true,
        catalyst_consents: tab === 'catalyst' ? {
          risk_acknowledgment: riskChecks.a,
          loss_acceptance: riskChecks.b,
          non_bank_product: riskChecks.c
        } : undefined,
        tx_hash: tx.hash
      });

      if (res.success) {
        alert('Investasi berhasil!');
        router.push('/pendana/marketplace');
      } else {
        alert('Gagal mencatat investasi: ' + res.error?.message);
      }

    } catch (err: any) {
      console.error('Investment failed:', err);
      alert('Investasi gagal: ' + (err.reason || err.message));
    } finally {
      setIsProcessing(false);
      closeAll();
    }
  };

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
            <p className="text-2xl font-bold text-white">Rp {formatCurrency(pool.target_amount)}</p>
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
            <label className="text-sm text-slate-300 font-semibold">Nominal Pendanaan (IDRX)</label>
            <input
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value.replace(/[^0-9]/g, ''))}
              inputMode="numeric"
              className="w-full px-4 py-3 rounded-lg bg-slate-900/60 border border-slate-700/60 text-white"
              placeholder="Masukkan nominal"
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/70">
                <p className="text-xs text-slate-500">Estimasi Imbal Hasil</p>
                <p className="text-lg font-semibold text-cyan-300">{rate}% p.a</p>
              </div>
              <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/70">
                <p className="text-xs text-slate-500">Estimasi Total Diterima</p>
                <p className="text-lg font-semibold text-slate-100">Rp {formatCurrency(Math.floor(estimatedReturn))}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleDanai}
            className="w-full py-3 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white shadow-lg transition-all disabled:opacity-50"
            disabled={amount <= 0}
          >
            Danai Sekarang
          </button>
        </div>

        {showPrioritySheet && (
          <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pb-6">
            <div className="w-full max-w-xl bg-slate-900 rounded-2xl border border-slate-700/60 p-5 shadow-2xl">
              <h3 className="text-lg font-semibold text-white mb-4">Konfirmasi Pendanaan Prioritas</h3>
              <p className="text-slate-400 text-sm mb-4">
                Anda akan mengirimkan <b>{formatCurrency(amount)} IDRX</b> ke Smart Contract.
              </p>
              <label className="flex gap-2 text-sm text-slate-300 mb-4">
                <input type="checkbox" checked={priorityAgreed} onChange={e => setPriorityAgreed(e.target.checked)} />
                Saya menyetujui Syarat & Ketentuan.
              </label>
              <div className="flex gap-3">
                <button onClick={closeAll} className="flex-1 py-3 bg-slate-700 rounded-lg text-white">Batal</button>
                <button
                  onClick={executeInvestment}
                  disabled={!priorityAgreed || isProcessing}
                  className="flex-1 py-3 bg-teal-500 rounded-lg text-white font-bold"
                >
                  {isProcessing ? 'Memproses...' : 'Konfirmasi & Bayar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showWarning && (
          <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4 py-6">
            <div className="w-full max-w-3xl bg-slate-900 rounded-2xl border border-orange-500/40 shadow-2xl overflow-hidden p-6">
              <h3 className="text-xl font-bold text-orange-400 mb-4">Risk Disclosure (Review Required)</h3>
              <div ref={warningScrollRef} onScroll={handleWarningScroll} className="h-40 overflow-y-auto bg-slate-800 p-4 rounded mb-4 text-sm text-slate-300">
                <p>CATALYST TRANCHE RISK WARNING...</p>
                <p className="mt-2">Scroll to bottom to proceed.</p>
                <div className="h-10"></div>
              </div>
              <div className="space-y-2 mb-4">
                <label className="flex gap-2 text-slate-300"><input type="checkbox" onChange={e => setRiskChecks(p => ({ ...p, a: e.target.checked }))} /> Risk Acknowledgment</label>
                <label className="flex gap-2 text-slate-300"><input type="checkbox" onChange={e => setRiskChecks(p => ({ ...p, b: e.target.checked }))} /> Loss Acceptance</label>
                <label className="flex gap-2 text-slate-300"><input type="checkbox" onChange={e => setRiskChecks(p => ({ ...p, c: e.target.checked }))} /> Non-Bank Product</label>
              </div>
              <div className="flex gap-3">
                <button onClick={closeAll} className="flex-1 py-3 bg-slate-700 rounded-lg text-white">Batal</button>
                <button
                  onClick={executeInvestment}
                  disabled={!riskReady || isProcessing}
                  className="flex-1 py-3 bg-orange-500 rounded-lg text-white font-bold"
                >
                  {isProcessing ? 'Memproses...' : 'I Understand & Invest'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
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
