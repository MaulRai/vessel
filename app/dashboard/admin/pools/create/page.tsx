'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthGuard } from '@/lib/components/AuthGuard';
import { DashboardLayout } from '@/lib/components/DashboardLayout';
import { adminAPI, PendingInvoice } from '@/lib/api/admin';
import { Invoice } from '@/lib/api/user';

function CreatePoolContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedInvoiceId = searchParams.get('invoice_id');

  const [approvedInvoices, setApprovedInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdPoolId, setCreatedPoolId] = useState<string | null>(null);

  useEffect(() => {
    const loadApprovedInvoices = async () => {
      setLoading(true);
      try {
        const res = await adminAPI.getApprovedInvoices(1, 50);
        if (res.success && res.data) {
          const invoices = (res.data.invoices || []).map(inv => ({
            ...inv,
            buyer_name: inv.buyer_name,
            buyer_country: inv.buyer_country,
            idr_amount: inv.idr_amount,
          })) as Invoice[];
          setApprovedInvoices(invoices);
          if (preSelectedInvoiceId) {
            const found = invoices.find((inv) => inv.id === preSelectedInvoiceId);
            if (found) setSelectedInvoice(found);
          }
        }
      } catch (err) {
        console.error('Failed to load invoices', err);
      } finally {
        setLoading(false);
      }
    };
    loadApprovedInvoices();
  }, [preSelectedInvoiceId]);

  const formatCurrency = (amount: number, currency: string = 'IDR') => {
    if (currency === 'IDR') {
      return `Rp ${amount.toLocaleString('id-ID')}`;
    }
    return `${currency} ${amount.toLocaleString('en-US')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getGradeColor = (grade?: string) => {
    switch (grade) {
      case 'A': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'B': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'C': return 'text-red-400 bg-red-500/10 border-red-500/30';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  const handleCreatePool = async () => {
    if (!selectedInvoice) {
      alert('Pilih invoice terlebih dahulu');
      return;
    }

    setCreating(true);
    try {
      const res = await adminAPI.createFundingPool(selectedInvoice.id);
      if (res.success && res.data) {
        setCreatedPoolId(res.data.id);
        setSuccess(true);
      } else {
        alert(res.error?.message || 'Gagal membuat funding pool');
      }
    } catch (err) {
      console.error('Failed to create pool', err);
      alert('Terjadi kesalahan saat membuat pool');
    } finally {
      setCreating(false);
    }
  };

  if (success) {
    return (
      <DashboardLayout role="admin">
        <div className="max-w-xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50 p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-3">Funding Pool Berhasil Dibuat</h2>
            <p className="text-slate-300 mb-6">
              Pool pendanaan untuk invoice {selectedInvoice?.invoice_number} telah dibuat dan siap untuk investor.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/dashboard/admin/pools"
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-medium rounded-lg transition-all shadow-lg"
              >
                Lihat Daftar Pool
              </Link>
              <button
                onClick={() => {
                  setSuccess(false);
                  setSelectedInvoice(null);
                }}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-lg transition-all"
              >
                Buat Pool Lain
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Link
            href="/dashboard/admin/pools"
            className="inline-flex items-center text-purple-400 hover:text-purple-300 text-sm font-medium mb-4 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Kembali
          </Link>
          <h1 className="text-2xl font-bold text-white">Buat Funding Pool</h1>
          <p className="text-slate-400 mt-1">Pilih invoice yang sudah disetujui untuk membuat funding pool</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-400"></div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Pilih Invoice</h2>

              {approvedInvoices.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 mx-auto text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-slate-400">Tidak ada invoice yang disetujui</p>
                  <Link
                    href="/dashboard/admin/invoices"
                    className="text-purple-400 hover:text-purple-300 text-sm mt-2 inline-block"
                  >
                    Review invoice terlebih dahulu
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {approvedInvoices.map((invoice) => (
                    <button
                      key={invoice.id}
                      onClick={() => setSelectedInvoice(invoice)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${selectedInvoice?.id === invoice.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-slate-700 bg-slate-900/30 hover:border-slate-600'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-purple-400 font-medium">{invoice.invoice_number}</span>
                        {invoice.grade && (
                          <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getGradeColor(invoice.grade)}`}>
                            Grade {invoice.grade}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-300">{invoice.buyer_name}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {formatCurrency(invoice.idr_amount || invoice.amount, 'IDR')}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Detail Pool</h2>

              {selectedInvoice ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-slate-400 text-sm">Invoice</p>
                      <p className="text-white font-medium">{selectedInvoice.invoice_number}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Buyer</p>
                      <p className="text-white font-medium">{selectedInvoice.buyer_name}</p>
                      <p className="text-slate-500 text-xs">{selectedInvoice.buyer_country}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Jumlah Total</p>
                      <p className="text-white font-medium">{formatCurrency(selectedInvoice.idr_amount || selectedInvoice.amount, 'IDR')}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Jatuh Tempo</p>
                      <p className="text-white font-medium">{formatDate(selectedInvoice.due_date)}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-700/50">
                    <h3 className="text-sm font-medium text-slate-300 mb-3">Konfigurasi Tranche</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-blue-400 text-xs font-medium">Priority</p>
                        <p className="text-white font-bold">{((selectedInvoice.priority_ratio || 0.8) * 100).toFixed(0)}%</p>
                        <p className="text-slate-400 text-xs">{selectedInvoice.priority_interest_rate || 10}% yield</p>
                      </div>
                      <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                        <p className="text-orange-400 text-xs font-medium">Catalyst</p>
                        <p className="text-white font-bold">{((selectedInvoice.catalyst_ratio || 0.2) * 100).toFixed(0)}%</p>
                        <p className="text-slate-400 text-xs">{selectedInvoice.catalyst_interest_rate || 15}% yield</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-700/50 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Priority Target</span>
                      <span className="text-white font-medium">
                        {formatCurrency((selectedInvoice.idr_amount || selectedInvoice.amount) * (selectedInvoice.priority_ratio || 0.8), 'IDR')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Catalyst Target</span>
                      <span className="text-white font-medium">
                        {formatCurrency((selectedInvoice.idr_amount || selectedInvoice.amount) * (selectedInvoice.catalyst_ratio || 0.2), 'IDR')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm pt-3 border-t border-slate-700/50">
                      <span className="text-slate-300 font-medium">Total Target</span>
                      <span className="text-purple-400 font-bold">
                        {formatCurrency(selectedInvoice.idr_amount || selectedInvoice.amount, 'IDR')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleCreatePool}
                    disabled={creating}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 disabled:from-slate-700 disabled:to-slate-700 text-white font-medium rounded-lg transition-all shadow-lg flex items-center justify-center space-x-2"
                  >
                    {creating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        <span>Membuat Pool...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Buat Funding Pool</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 mx-auto text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <p className="text-slate-400">Pilih invoice dari daftar di sebelah kiri</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function CreatePoolPage() {
  return (
    <AuthGuard allowedRoles={['admin']}>
      <CreatePoolContent />
    </AuthGuard>
  );
}
