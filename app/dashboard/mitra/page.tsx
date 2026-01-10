import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthGuard } from '@/lib/components/AuthGuard';
import { DashboardLayout } from '@/lib/components/DashboardLayout';
import { useAuth } from '@/lib/context/AuthContext';
import { userAPI, MitraApplicationResponse } from '@/lib/api/user';

function MitraDashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [mitraStatus, setMitraStatus] = useState<MitraApplicationResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await userAPI.getMitraStatus();
        if (res.success && res.data) {
          setMitraStatus(res.data);
          if (res.data.application?.status !== 'approved') {
            router.push('/complete-profile');
          }
        } else {
          router.push('/complete-profile');
        }
      } catch (err) {
        console.error('Failed to check mitra status', err);
        router.push('/complete-profile');
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Pendanaan',
      value: 'Rp 75.000.000',
      change: '+25%',
      changeType: 'positive',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Hutang Aktif',
      value: 'Rp 45.000.000',
      change: '-15%',
      changeType: 'positive',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      label: 'Invoice Aktif',
      value: '5',
      change: '+2',
      changeType: 'positive',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: 'Jatuh Tempo',
      value: '15 Hari',
      change: 'Terdekat',
      changeType: 'neutral',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  const recentInvoices = [
    { id: 'INV-001', buyer: 'ABC Corp (USA)', amount: 15000, currency: 'USD', status: 'funded', dueDate: '2024-02-15' },
    { id: 'INV-002', buyer: 'XYZ Ltd (UK)', amount: 8500, currency: 'USD', status: 'pending_review', dueDate: '2024-03-01' },
    { id: 'INV-003', buyer: 'DEF GmbH (DE)', amount: 12000, currency: 'EUR', status: 'approved', dueDate: '2024-02-28' },
    { id: 'INV-004', buyer: 'GHI Inc (CA)', amount: 20000, currency: 'USD', status: 'draft', dueDate: '2024-03-15' },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      draft: { label: 'Draft', className: 'bg-slate-500/10 text-slate-400' },
      pending_review: { label: 'Menunggu Review', className: 'bg-yellow-500/10 text-yellow-400' },
      approved: { label: 'Disetujui', className: 'bg-green-500/10 text-green-400' },
      funded: { label: 'Didanai', className: 'bg-cyan-500/10 text-cyan-400' },
      repaid: { label: 'Lunas', className: 'bg-teal-500/10 text-teal-400' },
    };
    const config = statusConfig[status] || { label: status, className: 'bg-slate-500/10 text-slate-400' };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  return (
    <DashboardLayout role="mitra">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Selamat datang, {user?.username || 'Mitra'}!
            </h1>
            <p className="text-slate-400 mt-1">
              Kelola invoice dan pendanaan ekspor Anda
            </p>
          </div>
          <Link
            href="/dashboard/mitra/invoices/create"
            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 rounded-lg font-medium text-sm transition-all shadow-lg shadow-teal-500/25"
          >
            Buat Invoice Baru
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
                <div className="p-2 bg-teal-500/10 rounded-lg text-teal-400">
                  {stat.icon}
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${stat.changeType === 'positive'
                    ? 'bg-green-500/10 text-green-400'
                    : stat.changeType === 'negative'
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-slate-500/10 text-slate-400'
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
          {/* Recent Invoices */}
          <div className="lg:col-span-2 p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Invoice Terbaru</h2>
              <Link
                href="/dashboard/mitra/invoices"
                className="text-teal-400 hover:text-teal-300 text-sm font-medium"
              >
                Lihat Semua
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-slate-400 text-sm border-b border-slate-700/50">
                    <th className="pb-3 font-medium">No. Invoice</th>
                    <th className="pb-3 font-medium">Buyer</th>
                    <th className="pb-3 font-medium">Jumlah</th>
                    <th className="pb-3 font-medium">Jatuh Tempo</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {recentInvoices.map((inv) => (
                    <tr key={inv.id} className="text-sm">
                      <td className="py-3 text-cyan-400 font-medium">{inv.id}</td>
                      <td className="py-3 text-slate-200">{inv.buyer}</td>
                      <td className="py-3 text-slate-300">
                        {inv.currency} {inv.amount.toLocaleString()}
                      </td>
                      <td className="py-3 text-slate-400">{inv.dueDate}</td>
                      <td className="py-3">{getStatusBadge(inv.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions & Status */}
          <div className="space-y-4">
            {/* Company Verification Status */}
            <div className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-white mb-4">Status Verifikasi</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-green-400">KYC Terverifikasi</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-green-400">Perusahaan Approved</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-sm text-cyan-400">Siap Tokenisasi</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Payment */}
            <div className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-white mb-4">Pembayaran Mendatang</h2>
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">INV-001</span>
                  <span className="text-xs text-yellow-400">15 hari lagi</span>
                </div>
                <p className="text-lg font-bold text-white">Rp 230.000.000</p>
                <p className="text-xs text-slate-400 mt-1">Termasuk bunga 12%</p>
              </div>
              <Link
                href="/dashboard/mitra/repayment"
                className="mt-3 w-full flex items-center justify-center space-x-2 px-4 py-2 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/30 rounded-lg text-sm font-medium text-teal-400 transition-all"
              >
                <span>Bayar Sekarang</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Quick Links */}
            <div className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-white mb-4">Aksi Cepat</h2>
              <div className="space-y-2">
                <Link
                  href="/dashboard/mitra/invoices/create"
                  className="flex items-center space-x-3 p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-all"
                >
                  <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-sm text-slate-200">Buat Invoice Baru</span>
                </Link>
                <Link
                  href="/dashboard/mitra/funding"
                  className="flex items-center space-x-3 p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-all"
                >
                  <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-slate-200">Ajukan Pendanaan</span>
                </Link>
                <Link
                  href="/dashboard/mitra/company"
                  className="flex items-center space-x-3 p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-all"
                >
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-sm text-slate-200">Update Profil Perusahaan</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function MitraDashboardPage() {
  return (
    <AuthGuard allowedRoles={['mitra']}>
      <MitraDashboardContent />
    </AuthGuard>
  );
}
