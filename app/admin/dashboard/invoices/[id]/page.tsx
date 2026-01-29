'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthGuard } from '@/lib/components/AuthGuard';
import { DashboardLayout } from '@/lib/components/DashboardLayout';
import { adminAPI, InvoiceReviewData, GradeSuggestion } from '@/lib/api/admin';
import { useLanguage } from '@/lib/i18n/LanguageContext';

function InvoiceReviewDetailContent() {
  const { t, language } = useLanguage();
  const locale = language === 'en' ? 'en-US' : 'id-ID';
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const [reviewData, setReviewData] = useState<InvoiceReviewData | null>(null);
  const [gradeSuggestion, setGradeSuggestion] = useState<GradeSuggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [actionCompleted, setActionCompleted] = useState<'approved' | 'rejected' | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [reviewRes, gradeRes] = await Promise.all([
          adminAPI.getInvoiceReviewData(invoiceId),
          adminAPI.getInvoiceGradeSuggestion(invoiceId),
        ]);

        if (reviewRes.success && reviewRes.data) {
          setReviewData(reviewRes.data);
        }
        if (gradeRes.success && gradeRes.data) {
          setGradeSuggestion(gradeRes.data);
          setSelectedGrade(gradeRes.data.suggested_grade);
        }
      } catch (err) {
        console.error('Failed to load review data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [invoiceId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string = 'IDR') => {
    if (currency === 'IDR') {
      return `Rp ${amount.toLocaleString(locale)}`;
    }
    return `${currency} ${amount.toLocaleString(locale)}`;
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'B': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'C': return 'text-red-400 bg-red-500/10 border-red-500/30';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const handleApprove = async () => {
    if (!selectedGrade) {
      alert('Pilih grade terlebih dahulu');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await adminAPI.approveInvoice(invoiceId, {
        grade: selectedGrade,
        notes: notes || undefined,
      });

      if (res.success) {
        setActionCompleted('approved');
        setShowApproveModal(false);
      } else {
        alert(res.error?.message || 'Gagal menyetujui invoice');
      }
    } catch (err) {
      console.error('Failed to approve invoice', err);
      alert('Terjadi kesalahan saat menyetujui invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Alasan penolakan harus diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await adminAPI.rejectInvoice(invoiceId, rejectReason);

      if (res.success) {
        setActionCompleted('rejected');
        setShowRejectModal(false);
      } else {
        alert(res.error?.message || 'Gagal menolak invoice');
      }
    } catch (err) {
      console.error('Failed to reject invoice', err);
      alert('Terjadi kesalahan saat menolak invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-400"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (actionCompleted) {
    return (
      <DashboardLayout role="admin">
        <div className="max-w-xl mx-auto">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${actionCompleted === 'approved' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {actionCompleted === 'approved' ? (
                <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-3">
              {actionCompleted === 'approved' ? 'Invoice Disetujui' : 'Invoice Ditolak'}
            </h2>
            <p className="text-slate-300 mb-6">
              {actionCompleted === 'approved'
                ? 'Invoice berhasil disetujui. Anda dapat membuat funding pool untuk invoice ini.'
                : 'Invoice telah ditolak. Mitra akan mendapat notifikasi.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {actionCompleted === 'approved' && (
                <Link
                  href={`/admin/dashboard/pools/create?invoice_id=${invoiceId}`}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-medium rounded-lg transition-all shadow-lg"
                >
                  Buat Funding Pool
                </Link>
              )}
              <Link
                href="/admin/dashboard/invoices"
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-lg transition-all"
              >
                Kembali ke Daftar
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!reviewData) {
    return (
      <DashboardLayout role="admin">
        <div className="text-center py-16">
          <p className="text-slate-400">Data invoice tidak ditemukan</p>
          <Link href="/admin/dashboard/invoices" className="text-purple-400 hover:text-purple-300 mt-4 inline-block">
            Kembali ke daftar
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const { invoice, exporter, documents } = reviewData;

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/admin/dashboard/invoices"
              className="inline-flex items-center text-purple-400 hover:text-purple-300 text-sm font-medium mb-4 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Kembali
            </Link>
            <h1 className="text-2xl font-bold text-white">Review Invoice</h1>
            <p className="text-slate-400 mt-1">Invoice #{invoice.invoice_number}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Informasi Invoice</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Nomor Invoice</p>
                  <p className="text-white font-medium">{invoice.invoice_number}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Tanggal Dibuat</p>
                  <p className="text-white font-medium">{formatDate(invoice.created_at)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Jatuh Tempo</p>
                  <p className="text-white font-medium">{formatDate(invoice.due_date)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Durasi Pendanaan</p>
                  <p className="text-white font-medium">{invoice.funding_duration_days} hari</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Jumlah Original</p>
                  <p className="text-white font-medium">
                    {invoice.original_currency} {(invoice.original_amount || invoice.amount).toLocaleString('en-US')}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Jumlah IDR</p>
                  <p className="text-white font-medium">{formatCurrency(invoice.idr_amount || invoice.amount, 'IDR')}</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-sm font-medium text-slate-300 mb-3">Konfigurasi Tranche</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-blue-400 text-sm font-medium">Priority Tranche</p>
                    <p className="text-white text-lg font-bold">{invoice.priority_ratio}%</p>
                    <p className="text-slate-400 text-xs">Yield: {invoice.priority_interest_rate || 10}% p.a.</p>
                  </div>
                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <p className="text-orange-400 text-sm font-medium">Catalyst Tranche</p>
                    <p className="text-white text-lg font-bold">{invoice.catalyst_ratio}%</p>
                    <p className="text-slate-400 text-xs">Yield: {invoice.catalyst_interest_rate || 15}% p.a.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Informasi Buyer</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Nama Perusahaan</p>
                  <p className="text-white font-medium">{invoice.buyer_name}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Negara</p>
                  <p className="text-white font-medium">{invoice.buyer_country}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Repeat Buyer</p>
                  <p className={`font-medium ${invoice.is_repeat_buyer ? 'text-green-400' : 'text-slate-400'}`}>
                    {invoice.is_repeat_buyer ? 'Ya' : 'Tidak'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Informasi Mitra</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Email</p>
                  <p className="text-white font-medium">{exporter?.email || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Nama</p>
                  <p className="text-white font-medium">{exporter?.full_name || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Perusahaan</p>
                  <p className="text-white font-medium">{exporter?.company_name || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Telepon</p>
                  <p className="text-white font-medium">{exporter?.phone || '-'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Dokumen</h2>
              {documents && documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-lg rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3">
                        <svg className="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-slate-200 font-medium">{doc.file_name}</p>
                          <p className="text-slate-500 text-xs capitalize">{doc.document_type.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded text-sm text-purple-400 transition-all"
                      >
                        Lihat
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-4">Tidak ada dokumen</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {gradeSuggestion && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Grade Suggestion</h2>

                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-3xl font-bold border-2 backdrop-blur ${getGradeColor(gradeSuggestion.suggested_grade)}`}>
                    {gradeSuggestion.suggested_grade}
                  </div>
                  <p className="text-slate-400 text-sm mt-2">Score: {gradeSuggestion.grade_score}/100</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Country Risk</span>
                    <span className={`font-medium capitalize ${getRiskColor(gradeSuggestion.country_risk)}`}>
                      {gradeSuggestion.country_risk}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Country Score</span>
                    <span className="text-white font-medium">{gradeSuggestion.country_score}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">History Score</span>
                    <span className="text-white font-medium">{gradeSuggestion.history_score}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Document Score</span>
                    <span className="text-white font-medium">{gradeSuggestion.document_score}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Funding Limit</span>
                    <span className="text-white font-medium">{gradeSuggestion.funding_limit}%</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Pilih Grade</h2>

              <div className="grid grid-cols-3 gap-3 mb-4">
                {['A', 'B', 'C'].map((grade) => (
                  <button
                    key={grade}
                    onClick={() => setSelectedGrade(grade)}
                    className={`p-4 rounded-lg border-2 text-2xl font-bold transition-all ${selectedGrade === grade
                        ? getGradeColor(grade)
                        : 'text-slate-200 bg-white/5 backdrop-blur border-white/15 hover:border-white/30'
                      }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>

              <div className="mb-4">
                <label className="block text-sm text-slate-400 mb-2">Catatan (Opsional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 backdrop-blur border border-white/15 rounded-lg text-slate-100 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="Tambahkan catatan..."
                />
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setShowApproveModal(true)}
                  disabled={!selectedGrade}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all"
                >
                  Approve Invoice
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="w-full px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 font-medium rounded-lg transition-all"
                >
                  Reject Invoice
                </button>
              </div>
            </div>
          </div>
        </div>

        {showApproveModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-white mb-4">Konfirmasi Persetujuan</h3>
              <p className="text-slate-300 mb-6">
                Apakah Anda yakin ingin menyetujui invoice ini dengan Grade <span className={`font-bold ${getGradeColor(selectedGrade).split(' ')[0]}`}>{selectedGrade}</span>?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-slate-100 rounded-lg transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-400 text-white rounded-lg transition-all disabled:bg-slate-600"
                >
                  {isSubmitting ? 'Memproses...' : 'Ya, Approve'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showRejectModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-white mb-4">Tolak Invoice</h3>
              <div className="mb-4">
                <label className="block text-sm text-slate-400 mb-2">Alasan Penolakan <span className="text-red-400">*</span></label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 backdrop-blur border border-white/15 rounded-lg text-slate-100 focus:ring-2 focus:ring-red-500 focus:outline-none"
                  placeholder="Masukkan alasan penolakan..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-slate-100 rounded-lg transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleReject}
                  disabled={isSubmitting || !rejectReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded-lg transition-all disabled:bg-slate-600"
                >
                  {isSubmitting ? 'Memproses...' : 'Tolak Invoice'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function InvoiceReviewDetailPage() {
  return (
    <AuthGuard allowedRoles={['admin']}>
      <InvoiceReviewDetailContent />
    </AuthGuard>
  );
}
