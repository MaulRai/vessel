'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AuthGuard } from '@/lib/components/AuthGuard';
import { DashboardLayout } from '@/lib/components/DashboardLayout';
import { adminAPI, PendingInvoice } from '@/lib/api/admin';

function InvoiceReviewListContent() {
  const [invoices, setInvoices] = useState<PendingInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const loadInvoices = async () => {
      setLoading(true);
      try {
        const res = await adminAPI.getPendingInvoices(page, 10);
        if (res.success && res.data) {
          setInvoices(res.data.invoices || []);
          setTotalPages(res.data.total_pages || 1);
          setTotal(res.data.total || 0);
        }
      } catch (err) {
        console.error('Failed to load pending invoices', err);
      } finally {
        setLoading(false);
      }
    };
    loadInvoices();
  }, [page]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string = 'IDR') => {
    if (currency === 'IDR') {
      return `Rp ${amount.toLocaleString('id-ID')}`;
    }
    return `${currency} ${amount.toLocaleString('en-US')}`;
  };

  const getDocumentScore = (score: number) => {
    if (score >= 80) return { label: 'Lengkap', className: 'bg-green-500/10 text-green-400' };
    if (score >= 50) return { label: 'Sebagian', className: 'bg-yellow-500/10 text-yellow-400' };
    return { label: 'Kurang', className: 'bg-red-500/10 text-red-400' };
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Invoice Review</h1>
            <p className="text-slate-400 mt-1">Review dan approve permohonan pendanaan dari mitra</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <span className="text-purple-400 font-medium">{total} Pending</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-400"></div>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-slate-400">Tidak ada invoice yang menunggu review</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-slate-400 text-sm border-b border-slate-700/50 bg-slate-800/50">
                      <th className="px-6 py-4 font-medium">Invoice</th>
                      <th className="px-6 py-4 font-medium">Mitra</th>
                      <th className="px-6 py-4 font-medium">Buyer</th>
                      <th className="px-6 py-4 font-medium">Jumlah</th>
                      <th className="px-6 py-4 font-medium">Dokumen</th>
                      <th className="px-6 py-4 font-medium">Repeat Buyer</th>
                      <th className="px-6 py-4 font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {invoices.map((invoice) => {
                      const docScore = getDocumentScore(invoice.document_complete_score);
                      return (
                        <tr key={invoice.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-purple-400 font-medium">{invoice.invoice_number}</p>
                              <p className="text-slate-500 text-xs">{formatDate(invoice.created_at)}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-slate-200">{invoice.exporter?.email}</p>
                              <p className="text-slate-500 text-xs">{invoice.exporter?.username || '-'}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-slate-200">{invoice.buyer_name}</p>
                              <p className="text-slate-500 text-xs">{invoice.buyer_country}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-slate-200">{formatCurrency(invoice.amount, invoice.currency)}</p>
                              {invoice.idr_amount && (
                                <p className="text-slate-500 text-xs">{formatCurrency(invoice.idr_amount, 'IDR')}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${docScore.className}`}>
                              {docScore.label} ({invoice.document_complete_score}%)
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {invoice.is_repeat_buyer ? (
                              <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-400">Ya</span>
                            ) : (
                              <span className="px-2 py-1 rounded text-xs font-medium bg-slate-500/10 text-slate-400">Tidak</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <Link
                              href={`/dashboard/admin/invoices/${invoice.id}`}
                              className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-sm font-medium text-purple-400 transition-all"
                            >
                              Review
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700/50">
                  <p className="text-sm text-slate-400">
                    Halaman {page} dari {totalPages}
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 bg-slate-700/50 hover:bg-slate-700 disabled:bg-slate-800 disabled:text-slate-600 rounded text-sm text-slate-300 transition-colors"
                    >
                      Sebelumnya
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1 bg-slate-700/50 hover:bg-slate-700 disabled:bg-slate-800 disabled:text-slate-600 rounded text-sm text-slate-300 transition-colors"
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function InvoiceReviewListPage() {
  return (
    <AuthGuard allowedRoles={['admin']}>
      <InvoiceReviewListContent />
    </AuthGuard>
  );
}
