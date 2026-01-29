'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/lib/components/DashboardLayout';
import { adminAPI, MitraApplicationDetail, PendingInvoice, FundingPool } from '@/lib/api/admin';
import { useLanguage } from '@/lib/i18n/LanguageContext';

type Tab = 'profile' | 'invoices' | 'pools';

export default function MitraDetailPage() {
  const { t, language } = useLanguage();
  const locale = language === 'en' ? 'en-US' : 'id-ID';

  const params = useParams();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [application, setApplication] = useState<MitraApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<PendingInvoice[]>([]);
  const [pools, setPools] = useState<FundingPool[]>([]);

  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Load Application Detail
  useEffect(() => {
    const loadDetail = async () => {
      try {
        const res = await adminAPI.getMitraApplicationDetail(id);
        if (res.success && res.data) {
          setApplication(res.data);
        }
      } catch (err) {
        console.error('Failed to load mitra detail', err);
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [id]);

  // Load Invoices and Pools specific to this Mitra's user_id
  useEffect(() => {
    if (!application?.user_id) return;

    const loadRelatedData = async () => {
      try {
        const [invRes, poolRes] = await Promise.all([
          adminAPI.getInvoicesByExporter(application.user_id, 1, 50), // Fetch up to 50 recent
          adminAPI.getPoolsByExporter(application.user_id, 1, 50)
        ]);

        if (invRes.success && invRes.data) {
          setInvoices(invRes.data.invoices);
        }
        if (poolRes.success && poolRes.data) {
          setPools(poolRes.data.pools);
        }
      } catch (err) {
        console.error('Failed to load related data', err);
      }
    };

    if (activeTab !== 'profile') {
      loadRelatedData();
    }
  }, [application?.user_id, activeTab]);

  const handleApprove = async () => {
    if (!confirm(t('admin.mitraDetail.alerts.confirmApprove'))) return;

    setActionLoading(true);
    try {
      const res = await adminAPI.approveMitraApplication(id);
      if (res.success) {
        // Refresh data
        const freshData = await adminAPI.getMitraApplicationDetail(id);
        if (freshData.success && freshData.data) {
          setApplication(freshData.data);
        }
        alert(t('admin.mitraDetail.alerts.approveSuccess'));
      } else {
        alert(t('admin.mitraDetail.alerts.approveFail') + ': ' + (typeof res.error === 'string' ? res.error : res.error?.message));
      }
    } catch (err) {
      console.error('Approve error', err);
      alert(t('common.errorOccurred'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert(t('admin.mitraDetail.alerts.rejectReasonRequired'));
      return;
    }

    setActionLoading(true);
    try {
      const res = await adminAPI.rejectMitraApplication(id, rejectReason);
      if (res.success) {
        // Refresh data
        const freshData = await adminAPI.getMitraApplicationDetail(id);
        if (freshData.success && freshData.data) {
          setApplication(freshData.data);
        }
        setRejectModalOpen(false);
        setRejectReason('');
        alert(t('admin.mitraDetail.alerts.rejectSuccess'));
      } else {
        alert(t('admin.mitraDetail.alerts.rejectFail') + ': ' + (typeof res.error === 'string' ? res.error : res.error?.message));
      }
    } catch (err) {
      console.error('Reject error', err);
      alert(t('common.errorOccurred'));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!application) {
    return (
      <DashboardLayout role="admin">
        <div className="text-center py-20">
          <h2 className="text-xl text-slate-300">{t('admin.mitraDetail.notFound')}</h2>
          <Link href="/admin/dashboard/mitra" className="text-cyan-400 hover:text-cyan-300 mt-4 inline-block">
            {t('admin.mitraDetail.backToList')}
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin/dashboard/mitra" className="text-slate-400 hover:text-slate-200 text-sm mb-2 inline-flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t('admin.mitraDetail.backToVerification')}
            </Link>
            <h1 className="text-3xl font-bold text-slate-50">{application.company_name}</h1>
            <p className="text-slate-400 text-sm mt-1">
              {t('admin.mitraDetail.joinedSince')} {new Date(application.created_at).toLocaleDateString(locale)}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-full text-sm font-semibold border ${application.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
              application.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
              {application.status === 'approved'
                ? t('admin.common.status.approved')
                : application.status === 'rejected'
                  ? t('admin.common.status.rejected')
                  : t('admin.common.status.pending')}
            </div>

            {application.status === 'pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => setRejectModalOpen(true)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:border-rose-500 text-sm font-medium rounded-lg transition-all"
                >
                  {t('admin.mitraDetail.actions.reject')}
                </button>
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium rounded-lg shadow-lg shadow-emerald-900/20 transition-all"
                >
                  {actionLoading ? t('admin.common.processing') : t('admin.mitraDetail.actions.approve')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-800">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {[
              { id: 'profile', name: t('admin.mitraDetail.tabs.profile') },
              { id: 'invoices', name: t('admin.mitraDetail.tabs.invoices') },
              { id: 'pools', name: t('admin.mitraDetail.tabs.pools') },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'}
                `}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'profile' && (
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">{t('admin.mitraDetail.profile.general')}</h3>
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-xs text-slate-500">{t('admin.mitraDetail.profile.npwp')}</dt>
                      <dd className="text-slate-200 font-mono">{application.npwp}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">{t('admin.mitraDetail.profile.companyType')}</dt>
                      <dd className="text-slate-200">{application.company_type}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">{t('admin.mitraDetail.profile.annualRevenue')}</dt>
                      <dd className="text-slate-200">{application.annual_revenue}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">{t('admin.mitraDetail.profile.yearFounded')}</dt>
                      <dd className="text-slate-200">{application.year_founded || '-'}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">{t('admin.mitraDetail.profile.contact')}</h3>
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-xs text-slate-500">{t('admin.mitraDetail.profile.accountEmail')}</dt>
                      <dd className="text-slate-200">{application.user?.email || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">{t('admin.mitraDetail.profile.address')}</dt>
                      <dd className="text-slate-200 whitespace-pre-wrap">{application.address}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">{t('admin.mitraDetail.profile.website')}</dt>
                      <dd className="text-cyan-400">
                        {application.website_url ? (
                          <a href={application.website_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {application.website_url}
                          </a>
                        ) : '-'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-6">
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">{t('admin.mitraDetail.profile.description')}</h3>
                <p className="text-slate-300 leading-relaxed bg-slate-950/30 p-4 rounded-xl border border-slate-800/50">
                  {application.business_description || t('admin.mitraDetail.profile.noDescription')}
                </p>
              </div>

              <div className="border-t border-slate-800 pt-6">
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">{t('admin.mitraDetail.profile.documents')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: t('completeProfile.documents.nib'), url: application.nib_document_url },
                    { label: t('completeProfile.documents.akta_pendirian'), url: application.akta_pendirian_url },
                    { label: t('completeProfile.documents.ktp_direktur'), url: application.ktp_direktur_url },
                  ].map((doc) => (
                    <div key={doc.label} className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-300">{doc.label}</p>
                        <p className={`text-xs mt-1 ${doc.url ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {doc.url ? t('admin.mitraDetail.profile.uploaded') : t('admin.mitraDetail.profile.notUploaded')}
                        </p>
                      </div>
                      {doc.url && (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors text-cyan-400"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
              <table className="min-w-full divide-y divide-slate-800">
                <thead className="bg-slate-950/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">{t('admin.mitraDetail.invoices.headerInvoice')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">{t('admin.mitraDetail.invoices.buyer')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">{t('admin.mitraDetail.invoices.amount')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">{t('admin.mitraDetail.invoices.dueDate')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">{t('admin.mitraDetail.invoices.status')}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">{t('admin.mitraDetail.invoices.action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        {t('admin.mitraDetail.invoices.empty')}
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-800/30">
                        <td className="px-6 py-4 text-sm font-medium text-slate-200">{inv.invoice_number}</td>
                        <td className="px-6 py-4 text-sm text-slate-300">{inv.buyer_name}</td>
                        <td className="px-6 py-4 text-sm font-mono text-cyan-300">
                          {inv.currency} {inv.amount.toLocaleString(locale)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {new Date(inv.due_date).toLocaleDateString(locale)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${inv.status === 'funded' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                            inv.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                              'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/admin/dashboard/invoices/${inv.id}`} className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
                            {t('admin.mitraDetail.invoices.review')}
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'pools' && (
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                {pools.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-slate-500">
                    {t('admin.mitraDetail.pools.empty')}
                  </div>
                ) : (
                  pools.map(pool => (
                    <div key={pool.id} className="bg-slate-950/50 border border-slate-800 rounded-xl p-5 hover:border-cyan-500/30 transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-slate-200 font-medium truncate">Pool {pool.invoice?.invoice_number || pool.id.slice(0, 8)}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${pool.status === 'open' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                          'bg-slate-700 text-slate-400 border-slate-600'
                          }`}>
                          {pool.status}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">{t('admin.mitraDetail.pools.target')}</span>
                          <span className="text-slate-200 text-right">{pool.pool_currency} {pool.target_amount.toLocaleString(locale)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">{t('admin.mitraDetail.pools.funded')}</span>
                          <span className="text-emerald-400 text-right">{pool.pool_currency} {pool.funded_amount.toLocaleString(locale)}</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full"
                            style={{ width: `${Math.min(100, (pool.funded_amount / pool.target_amount) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <Link
                        href={`/admin/dashboard/pools/${pool.id}`}
                        className="mt-4 block w-full text-center py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm transition-colors"
                      >
                        {t('admin.mitraDetail.pools.view')}
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">{t('admin.mitraDetail.modal.rejectTitle')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  {t('admin.mitraDetail.modal.reasonLabel')}
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-cyan-500 min-h-[100px]"
                  placeholder={t('admin.mitraDetail.modal.reasonPlaceholder')}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  {t('admin.mitraDetail.modal.cancel')}
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading || !rejectReason.trim()}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors font-medium"
                >
                  {actionLoading ? t('admin.common.processing') : t('admin.mitraDetail.modal.submit')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
