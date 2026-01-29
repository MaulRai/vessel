'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AuthGuard } from '@/lib/components/AuthGuard';
import { DashboardLayout } from '@/lib/components/DashboardLayout';
import { adminAPI, PendingInvoice } from '@/lib/api/admin';
import { useLanguage } from '@/lib/i18n/LanguageContext';

function InvoiceReviewListContent() {
  const { t, language } = useLanguage();
  const locale = language === 'en' ? 'en-US' : 'id-ID';
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
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string = 'IDR') => {
    if (currency === 'IDR') {
      return `Rp ${amount.toLocaleString(locale)}`;
    }
    return `${currency} ${amount.toLocaleString(locale)}`;
  };

  const getDocumentScore = (score: number) => {
    if (score >= 80) return { label: t('admin.invoiceList.table.docComplete'), className: 'bg-green-500/10 text-green-400' };
    if (score >= 50) return { label: t('admin.invoiceList.table.docPartial'), className: 'bg-yellow-500/10 text-yellow-400' };
    return { label: t('admin.invoiceList.table.docIncomplete'), className: 'bg-red-500/10 text-red-400' };
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600/10 via-fuchsia-600/10 to-transparent border border-violet-500/20 p-8 backdrop-blur-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{t('admin.invoiceList.heroTitle')}</h1>
                <p className="text-violet-200/70 mt-1">{t('admin.invoiceList.heroSubtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-amber-400 rounded-full animate-pulse" />
                  <span className="text-amber-400 font-semibold">{total} {t('admin.invoiceList.pendingLabel')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
                <div className="absolute inset-0 rounded-full border-2 border-violet-500/20"></div>
              </div>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-500/10 mb-4">
                <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-zinc-400 text-lg">{t('admin.invoiceList.empty.title')}</p>
              <p className="text-zinc-500 text-sm mt-2">{t('admin.invoiceList.empty.subtitle')}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-slate-200 text-sm border-b border-white/10 bg-white/5 backdrop-blur">
                      <th className="px-6 py-4 font-medium">{t('admin.invoiceList.table.invoice')}</th>
                      <th className="px-6 py-4 font-medium">{t('admin.invoiceList.table.mitra')}</th>
                      <th className="px-6 py-4 font-medium">{t('admin.invoiceList.table.buyer')}</th>
                      <th className="px-6 py-4 font-medium">{t('admin.invoiceList.table.amount')}</th>
                      <th className="px-6 py-4 font-medium">{t('admin.invoiceList.table.documents')}</th>
                      <th className="px-6 py-4 font-medium">{t('admin.invoiceList.table.repeatBuyer')}</th>
                      <th className="px-6 py-4 font-medium">{t('admin.invoiceList.table.action')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {invoices.map((invoice) => {
                      const docScore = getDocumentScore(invoice.document_complete_score);
                      return (
                        <tr key={invoice.id} className="hover:bg-white/5 transition-colors">
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
                              <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-400">{t('admin.common.yes')}</span>
                            ) : (
                              <span className="px-2 py-1 rounded text-xs font-medium bg-slate-500/10 text-slate-400">{t('admin.common.no')}</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <Link
                              href={`/admin/dashboard/invoices/${invoice.id}`}
                              className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-sm font-medium text-purple-400 transition-all"
                            >
                              {t('admin.invoiceList.reviewCta')}
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
                  <p className="text-sm text-slate-200">
                    {t('admin.invoiceList.pagination.label')} {page} {t('admin.invoiceList.pagination.of')} {totalPages}
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 bg-white/5 backdrop-blur hover:bg-white/10 disabled:bg-white/5 disabled:text-slate-600 rounded text-sm text-slate-100 transition-colors"
                    >
                      {t('common.prev')}
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1 bg-white/5 backdrop-blur hover:bg-white/10 disabled:bg-white/5 disabled:text-slate-600 rounded text-sm text-slate-100 transition-colors"
                    >
                      {t('common.next')}
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
