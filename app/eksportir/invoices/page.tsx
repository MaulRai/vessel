'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AuthGuard } from '@/lib/components/AuthGuard';
import { DashboardLayout } from '@/lib/components/DashboardLayout';
import { invoiceAPI, Invoice } from '@/lib/api/user';

function InvoiceListContent() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    const loadInvoices = async () => {
      setLoading(true);
      try {
        const res = await invoiceAPI.getMyInvoices(page, 10, statusFilter || undefined);
        if (res.success && res.data) {
          setInvoices(res.data);
          setTotalPages(res.pagination?.total_pages || 1);
        }
      } catch (err) {
        console.error('Failed to load invoices', err);
      } finally {
        setLoading(false);
      }
    };
    loadInvoices();
  }, [page, statusFilter]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      draft: { label: 'Draft', className: 'bg-slate-500/10 text-slate-400' },
      pending_review: { label: 'Menunggu Review', className: 'bg-yellow-500/10 text-yellow-400' },
      approved: { label: 'Disetujui', className: 'bg-green-500/10 text-green-400' },
      rejected: { label: 'Ditolak', className: 'bg-red-500/10 text-red-400' },
      tokenized: { label: 'Tokenized', className: 'bg-purple-500/10 text-purple-400' },
      funding: { label: 'Funding', className: 'bg-blue-500/10 text-blue-400' },
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string = 'IDR') => {
    if (currency === 'IDR') {
      return `IDRX ${amount.toLocaleString('id-ID')}`;
    }
    return `${currency} ${amount.toLocaleString('en-US')}`;
  };

  return (
    <DashboardLayout role="mitra">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Daftar Invoice</h1>
            <p className="text-slate-400 mt-1">Kelola invoice dan permohonan pendanaan Anda</p>
          </div>
          <Link
            href="/eksportir/invoices/create"
            className="px-4 py-2 bg-linear-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 rounded-lg font-medium text-sm transition-all shadow-lg shadow-teal-500/25 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Buat Invoice Baru</span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Semua Status</option>
            <option value="draft">Draft</option>
            <option value="pending_review">Menunggu Review</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
            <option value="funding">Funding</option>
            <option value="funded">Didanai</option>
          </select>
        </div>

        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-400"></div>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-slate-400 mb-4">Belum ada invoice</p>
              <Link
                href="/eksportir/invoices/create"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/30 rounded-lg text-sm font-medium text-teal-400 transition-all"
              >
                <span>Buat Invoice Pertama</span>
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-slate-400 text-sm border-b border-slate-700/50 bg-slate-800/50">
                      <th className="px-6 py-4 font-medium">No. Invoice</th>
                      <th className="px-6 py-4 font-medium">Buyer</th>
                      <th className="px-6 py-4 font-medium">Jumlah</th>
                      <th className="px-6 py-4 font-medium">Jatuh Tempo</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-cyan-400 font-medium">{invoice.invoice_number}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-slate-200">{invoice.buyer_name}</p>
                            <p className="text-slate-500 text-xs">{invoice.buyer_country}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-slate-200">
                              {invoice.original_currency && invoice.original_amount
                                ? formatCurrency(invoice.original_amount, invoice.original_currency)
                                : formatCurrency(invoice.amount, invoice.currency)}
                            </p>
                            {invoice.idr_amount && (
                              <p className="text-slate-500 text-xs">{formatCurrency(invoice.idr_amount, 'IDR')}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-400">{formatDate(invoice.due_date)}</td>
                        <td className="px-6 py-4">{getStatusBadge(invoice.status)}</td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/eksportir/invoices/${invoice.id}`}
                            className="text-teal-400 hover:text-teal-300 text-sm font-medium"
                          >
                            Lihat Detail
                          </Link>
                        </td>
                      </tr>
                    ))}
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

export default function InvoiceListPage() {
  return (
    <AuthGuard allowedRoles={['mitra']}>
      <InvoiceListContent />
    </AuthGuard>
  );
}
