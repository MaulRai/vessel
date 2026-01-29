'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/lib/components/DashboardLayout';
import { adminAPI, MitraApplicationItem } from '@/lib/api/admin';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface ApplicationRow {
  id: string;
  companyName: string;
  companyType: string;
  email: string;
  username: string;
  annualRevenue: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  docsComplete: boolean;
}

export default function AdminMitraPage() {
  const { t, language } = useLanguage();
  const locale = language === 'en' ? 'en-US' : 'id-ID';

  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 10;

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await adminAPI.listAllMitraApplications(page, perPage);

        if (res.success && res.data) {
          const mapped: ApplicationRow[] = (res.data.applications || []).map((app: MitraApplicationItem) => ({
            id: app.id,
            companyName: app.company_name || '-',
            companyType: app.company_type,
            email: app.user?.email || '-',
            username: app.user?.username || '-',
            annualRevenue: app.annual_revenue || '-',
            submittedAt: app.created_at,
            status: app.status,
            docsComplete: Boolean(app.nib_document_url && app.akta_pendirian_url && app.ktp_direktur_url),
          }));

          setApplications(mapped);
          setTotal(res.data.total ?? mapped.length);
        } else {
          const errorMsg = res.error?.message || t('common.errorOccurred');
          if (errorMsg.toLowerCase().includes('not found') || errorMsg.toLowerCase().includes('no ')) {
            setApplications([]);
            setTotal(0);
          } else {
            setError(errorMsg);
          }
        }
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError(t('common.errorOccurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [page, perPage, t]);

  const statusStyles: Record<string, { label: string; className: string }> = {
    pending: {
      label: t('admin.common.status.pending'),
      className: 'bg-amber-500/15 text-amber-300 border border-amber-500/40',
    },
    approved: {
      label: t('admin.common.status.approved'),
      className: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40',
    },
    rejected: {
      label: t('admin.common.status.rejected'),
      className: 'bg-rose-500/15 text-rose-300 border border-rose-500/40',
    },
  };

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const pendingCount = applications.filter((a) => a.status === 'pending').length;
  const incompleteDocsCount = applications.filter((a) => !a.docsComplete).length;

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg"
            >
              {t('admin.mitraList.buttons.retry')}
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-50">{t('admin.mitraList.title')}</h1>
          <p className="text-slate-400 max-w-2xl">{t('admin.mitraList.subtitle')}</p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
            <p className="text-sm text-slate-400">{t('admin.mitraList.stats.total')}</p>
            <p className="text-3xl font-bold text-slate-50 mt-2">{total}</p>
          </article>
          <article className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
            <p className="text-sm text-slate-400">{t('admin.mitraList.stats.pending')}</p>
            <p className="text-3xl font-bold text-amber-300 mt-2">{pendingCount}</p>
          </article>
          <article className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
            <p className="text-sm text-slate-400">{t('admin.mitraList.stats.incomplete')}</p>
            <p className="text-3xl font-bold text-rose-400 mt-2">{incompleteDocsCount}</p>
          </article>
        </section>

        <section className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-slate-100">{t('admin.mitraList.title')}</h2>
            <p className="text-sm text-slate-400">{t('admin.mitraList.subtitle')}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800">
              <thead className="bg-slate-900/70">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase">{t('admin.mitraList.table.company')}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase">{t('admin.mitraList.table.type')}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase">{t('admin.mitraList.table.revenue')}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase">{t('admin.mitraList.table.docs')}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase">{t('admin.mitraList.table.status')}</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase">{t('admin.mitraList.table.action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-6 text-center text-slate-400">
                      {t('admin.mitraList.table.noData')}
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-900/30">
                      <td className="px-6 py-4">
                        <p className="text-slate-100 font-semibold">{app.companyName}</p>
                        <p className="text-xs text-slate-500">
                          {t('admin.mitraList.table.submittedOn')} {' '}
                          {new Date(app.submittedAt).toLocaleDateString(locale, {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-700/50 text-slate-200 rounded text-sm font-medium">
                          {app.companyType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-200">{app.annualRevenue}</td>
                      <td className="px-6 py-4">
                        {app.docsComplete ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-sm">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {t('admin.mitraList.table.complete')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-400 text-sm">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            {t('admin.mitraList.table.incomplete')}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[app.status]?.className || statusStyles.pending.className}`}>
                          {statusStyles[app.status]?.label || app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/dashboard/mitra/${app.id}`}
                          className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200 font-semibold"
                        >
                          {t('admin.mitraList.table.detailCta')}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-slate-800 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">
              {t('admin.mitraList.pagination.label')} {page} {t('admin.mitraList.pagination.of')} {totalPages} ({total} {t('admin.mitraList.pagination.total')})
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-lg bg-slate-800 text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('admin.mitraList.buttons.prev')}
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || total === 0}
                className="px-3 py-1.5 text-sm rounded-lg bg-slate-800 text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('admin.mitraList.buttons.next')}
              </button>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
