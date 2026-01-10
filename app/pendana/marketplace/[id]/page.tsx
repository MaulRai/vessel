'use client';

import { useMemo, useRef, useState } from 'react';
import { AuthGuard } from '@/lib/components/AuthGuard';
import { DashboardLayout } from '@/lib/components/DashboardLayout';

const project = {
  id: 'demo-1',
  title: 'Kopi Arabika Gayo Batch #12',
  buyer: 'Buyer Jerman',
  buyerCountry: 'Jerman',
  buyerFlag: '🇩🇪',
  buyerRisk: 'Low',
  grade: 'A',
  tenorDays: 60,
  priorityRate: 10,
  catalystRate: 15,
  targetAmount: 500_000_000,
  insuranceScheme: 'Proteksi invoice melalui mitra asuransi eksport. Klaim dapat diajukan jika importir gagal bayar.',
  insuranceProvider: 'PT Asuransi Ekspor',
  documents: [
    {
      name: 'Invoice & PO',
      href: '/example/sample-file.pdf',
    },
    {
      name: 'Kontrak Dagang',
      href: '/example/sample-file.pdf',
    },
  ],
};

type FundingTab = 'priority' | 'catalyst';

type PaymentMethod = {
  value: string;
  label: string;
  hint?: string;
};

const paymentMethods: PaymentMethod[] = [
  { value: 'bca-va', label: 'BCA Virtual Account', hint: 'Konfirmasi instan' },
  { value: 'bni-va', label: 'BNI Virtual Account' },
  { value: 'bri-va', label: 'BRI Virtual Account' },
  { value: 'mandiri-va', label: 'Mandiri Virtual Account' },
];

function formatCurrency(value: number) {
  return value.toLocaleString('id-ID');
}

function ProjectDetailContent() {
  const [tab, setTab] = useState<FundingTab>('priority');
  const [amountInput, setAmountInput] = useState('10000000');
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0].value);
  const [showPrioritySheet, setShowPrioritySheet] = useState(false);
  const [priorityAgreed, setPriorityAgreed] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [riskChecks, setRiskChecks] = useState({ a: false, b: false, c: false });
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const warningScrollRef = useRef<HTMLDivElement>(null);

  const rate = tab === 'priority' ? project.priorityRate : project.catalystRate;
  const tenorFactor = project.tenorDays / 360;

  const amount = useMemo(() => {
    const parsed = Number(amountInput.replace(/[^0-9]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }, [amountInput]);

  const estimatedReturn = useMemo(() => {
    const gain = amount * (rate / 100) * tenorFactor;
    return amount + gain;
  }, [amount, rate, tenorFactor]);

  const infoCopy = tab === 'priority'
    ? {
        title: 'Pendanaan Prioritas',
        body:
          'Dana Anda berada di antrean pertama. Saat importir membayar, Anda akan menerima pengembalian modal dan hasil paling awal. Risikonya lebih rendah karena dilindungi oleh dana Katalis.',
        style: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-100',
      }
    : {
        title: 'Pendanaan Katalis',
        body:
          'Dana Anda berfungsi sebagai penopang risiko. Anda akan dibayar setelah Pendana Prioritas lunas sepenuhnya. Sebagai ganti risiko ini, Anda mendapatkan imbal hasil lebih tinggi.',
        style: 'bg-orange-500/10 border-orange-500/20 text-orange-100',
      };

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
    setShowPinModal(false);
    setPriorityAgreed(false);
    setRiskChecks({ a: false, b: false, c: false });
    setScrolledToBottom(false);
    setPin('');
  };

  const openPin = () => {
    setShowPrioritySheet(false);
    setShowWarning(false);
    setShowPinModal(true);
  };

  const handleWarningScroll = () => {
    const el = warningScrollRef.current;
    if (!el) return;
    const reachedBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
    if (reachedBottom) setScrolledToBottom(true);
  };

  const pinReady = pin.length >= 6;
  const riskReady = scrolledToBottom && riskChecks.a && riskChecks.b && riskChecks.c;

  return (
    <DashboardLayout role="investor">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{project.title}</h1>
            <p className="text-slate-400 mt-1">Detail proyek, simulasi, dan eksekusi pendanaan</p>
          </div>
          <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/60 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden>{project.buyerFlag}</span>
              <div>
                <p className="text-slate-200 font-semibold">{project.buyer}</p>
                <p className="text-sm text-slate-500">{project.buyerCountry} · Risk {project.buyerRisk}</p>
              </div>
            </div>
            <span className="px-2 py-1 rounded text-xs font-semibold bg-green-500/10 text-green-300 border border-green-500/20">Grade {project.grade}</span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">Target Pendanaan</p>
              <span className="text-sm text-slate-500">Tenor {project.tenorDays} hari</span>
            </div>
            <p className="text-2xl font-bold text-white">Rp {formatCurrency(project.targetAmount)}</p>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>Prioritas: {project.priorityRate}% p.a</span>
              <span className="text-slate-600">•</span>
              <span>Katalis: {project.catalystRate}% p.a</span>
            </div>
          </div>

          <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl space-y-2">
            <p className="text-sm text-slate-400">Dokumen Legal</p>
            <div className="space-y-2">
              {project.documents.map((doc) => (
                <div key={doc.name} className="flex items-center justify-between bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2">
                  <span className="text-slate-200 text-sm">{doc.name}</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={doc.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-300 text-xs hover:text-cyan-200"
                    >
                      Preview
                    </a>
                    <a
                      href={doc.href}
                      download
                      className="text-slate-400 text-xs hover:text-white"
                    >
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl space-y-2">
            <p className="text-sm text-slate-400">Skema Asuransi</p>
            <p className="text-slate-200 text-sm leading-relaxed">{project.insuranceScheme}</p>
            <p className="text-xs text-slate-500">Penyedia: {project.insuranceProvider}</p>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/60 rounded-2xl p-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTab('priority')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                tab === 'priority'
                  ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-100 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:text-white'
              }`}
            >
              🛡️ Pendanaan Prioritas
            </button>
            <button
              onClick={() => setTab('catalyst')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                tab === 'catalyst'
                  ? 'bg-orange-500/20 border-orange-500/30 text-orange-100 shadow-lg shadow-orange-500/10'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:text-white'
              }`}
            >
              ⚡ Pendanaan Katalis
            </button>
          </div>

          <div className={`p-4 rounded-xl border ${infoCopy.style}`}>
            <p className="text-sm font-semibold mb-1">{infoCopy.title}</p>
            <p className="text-sm leading-relaxed">{infoCopy.body}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2 space-y-4">
              <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-3">
                <label className="text-sm text-slate-300 font-semibold">Nominal Pendanaan (Rp)</label>
                <input
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value.replace(/[^0-9]/g, ''))}
                  inputMode="numeric"
                  className="w-full px-4 py-3 rounded-lg bg-slate-900/60 border border-slate-700/60 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
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
                    <p className="text-xs text-slate-500">Rumus: Modal + (Modal x Rate x Tenor/360)</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-3">
                <p className="text-sm text-slate-300 font-semibold">Metode Pembayaran</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.value}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        paymentMethod === method.value
                          ? 'border-cyan-500/40 bg-cyan-500/5 text-cyan-100'
                          : 'border-slate-700/60 bg-slate-900/40 text-slate-200 hover:border-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment-method"
                        value={method.value}
                        checked={paymentMethod === method.value}
                        onChange={() => setPaymentMethod(method.value)}
                        className="accent-cyan-500"
                      />
                      <div>
                        <p className="font-semibold text-sm">{method.label}</p>
                        {method.hint && <p className="text-xs text-slate-500">{method.hint}</p>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-3 h-fit">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">Tenor</p>
                <span className="text-sm text-slate-200">{project.tenorDays} hari</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">Tipe Pendanaan</p>
                <span className="text-sm font-semibold text-white capitalize">{tab}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">Rate</p>
                <span className="text-sm font-semibold text-cyan-300">{rate}% p.a</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">Nominal</p>
                <span className="text-lg font-bold text-white">Rp {formatCurrency(amount)}</span>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleDanai}
                  className="w-full py-3 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
                  disabled={amount <= 0}
                >
                  Danai Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>

        {showPrioritySheet && (
          <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pb-6">
            <div className="w-full max-w-xl bg-slate-900 rounded-2xl border border-slate-700/60 p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <p className="text-lg font-semibold text-white">Ringkasan Pendanaan</p>
                <button
                  onClick={closeAll}
                  className="text-slate-500 hover:text-white"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex justify-between"><span>Nominal</span><span className="font-semibold text-white">Rp {formatCurrency(amount)}</span></div>
                <div className="flex justify-between"><span>Rate</span><span className="font-semibold text-cyan-300">{rate}% p.a</span></div>
                <div className="flex justify-between"><span>Tenor</span><span>{project.tenorDays} hari</span></div>
                <div className="flex justify-between"><span>Estimasi diterima</span><span className="font-semibold text-white">Rp {formatCurrency(Math.floor(estimatedReturn))}</span></div>
                <div className="flex justify-between"><span>Metode bayar</span><span>{paymentMethods.find((m) => m.value === paymentMethod)?.label}</span></div>
              </div>
              <label className="mt-4 flex items-start gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  className="mt-1 accent-cyan-500"
                  checked={priorityAgreed}
                  onChange={(e) => setPriorityAgreed(e.target.checked)}
                />
                <span>Saya menyetujui Syarat & Ketentuan.</span>
              </label>
              <button
                onClick={openPin}
                disabled={!priorityAgreed}
                className="mt-4 w-full py-3 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-40"
              >
                Lanjutkan Danai
              </button>
            </div>
          </div>
        )}

        {showWarning && (
          <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4 py-6">
            <div className="w-full max-w-3xl bg-slate-900 rounded-2xl border border-orange-500/40 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 bg-orange-500/10 border-b border-orange-500/30">
                <p className="text-lg font-semibold text-orange-100">Peringatan Risiko Pendanaan Katalis</p>
                <button onClick={closeAll} className="text-orange-200 hover:text-white" aria-label="Close">✕</button>
              </div>
              <div
                ref={warningScrollRef}
                onScroll={handleWarningScroll}
                className="max-h-[60vh] overflow-y-auto px-5 py-4 space-y-3"
              >
                <p className="text-sm text-orange-100 font-semibold">Harap baca hingga selesai sebelum melanjutkan.</p>
                <p className="text-sm text-slate-200 leading-relaxed">
                  Dana katalis menjadi penopang risiko bagi pendana prioritas. Pembayaran kepada Anda dilakukan setelah seluruh kewajiban kepada pendana prioritas terpenuhi. Jika terjadi gagal bayar, dana katalis akan digunakan terlebih dahulu sebagai jaring pengaman.
                </p>
                <p className="text-sm text-slate-200 leading-relaxed">
                  Produk ini bukan simpanan bank dan tidak dijamin oleh LPS. Imbal hasil bersifat tidak pasti dan terdapat kemungkinan kerugian sebagian atau seluruh modal.
                </p>
                <p className="text-sm text-slate-200 leading-relaxed">
                  Pastikan Anda telah memahami profil risiko ini, membaca dokumen terkait, dan menyesuaikannya dengan profil risiko pribadi sebelum berinvestasi.
                </p>
                <p className="text-sm text-slate-400">Scroll hingga akhir untuk mengaktifkan tombol.</p>
                <div className="h-10" />
              </div>
              <div className="px-5 pb-5 pt-2 space-y-3 bg-slate-900/80 border-t border-orange-500/20">
                <label className="flex items-start gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    className="mt-1 accent-orange-500"
                    checked={riskChecks.a}
                    onChange={(e) => setRiskChecks((prev) => ({ ...prev, a: e.target.checked }))}
                  />
                  <span>Saya sadar dana ini menjadi jaminan pertama jika gagal bayar.</span>
                </label>
                <label className="flex items-start gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    className="mt-1 accent-orange-500"
                    checked={riskChecks.b}
                    onChange={(e) => setRiskChecks((prev) => ({ ...prev, b: e.target.checked }))}
                  />
                  <span>Saya siap menanggung risiko kehilangan modal.</span>
                </label>
                <label className="flex items-start gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    className="mt-1 accent-orange-500"
                    checked={riskChecks.c}
                    onChange={(e) => setRiskChecks((prev) => ({ ...prev, c: e.target.checked }))}
                  />
                  <span>Saya paham ini bukan produk bank.</span>
                </label>
                <button
                  onClick={openPin}
                  disabled={!riskReady}
                  className="w-full py-3 rounded-lg text-sm font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white shadow-lg shadow-orange-500/25 transition-all disabled:opacity-40"
                >
                  Lanjut Danai
                </button>
              </div>
            </div>
          </div>
        )}

        {showPinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
            <div className="w-full max-w-sm bg-slate-900 rounded-2xl border border-slate-700/60 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-white">Verifikasi PIN</p>
                <button onClick={closeAll} className="text-slate-500 hover:text-white" aria-label="Close">✕</button>
              </div>
              <p className="text-sm text-slate-400">Masukkan 6 digit PIN atau gunakan biometrik Anda.</p>
              <input
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                inputMode="numeric"
                className="w-full px-4 py-3 rounded-lg bg-slate-900/60 border border-slate-700/60 text-center tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                placeholder="••••••"
              />
              <button
                onClick={() => {
                  if (!pinReady) return;
                  // Placeholder submit logic
                  closeAll();
                }}
                disabled={!pinReady}
                className="w-full py-3 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-40"
              >
                Submit
              </button>
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
