'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { adminAPI, MitraApplicationDetail } from '@/lib/api/admin';

type DocumentItem = {
  id: string;
  name: string;
  description: string;
  url: string | null;
};

const statusStyles: Record<string, { label: string; className: string }> = {
  pending: {
    label: 'Menunggu Verifikasi',
    className: 'bg-amber-500/10 text-amber-200 border border-amber-500/30'
  },
  approved: {
    label: 'Disetujui',
    className: 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/30'
  },
  rejected: {
    label: 'Ditolak',
    className: 'bg-rose-500/10 text-rose-200 border border-rose-500/30'
  }
};

export default function VerifikasiPengajuanDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const applicationId = params?.id;

  const [application, setApplication] = useState<MitraApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedDocUrl, setSelectedDocUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!applicationId) return;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await adminAPI.getMitraApplicationDetail(applicationId);
        if (res.success && res.data) {
          setApplication(res.data);
          // Set default preview to first available document
          const firstDoc = res.data.nib_document_url || res.data.akta_pendirian_url || res.data.ktp_direktur_url;
          if (firstDoc) setSelectedDocUrl(firstDoc);
        } else {
          setError(res.error?.message || 'Gagal memuat detail aplikasi');
        }
      } catch (err) {
        setError('Terjadi kesalahan saat memuat data');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [applicationId]);

  const handleApprove = async () => {
    if (!applicationId) return;
    setActionLoading(true);
    try {
      const res = await adminAPI.approveMitraApplication(applicationId);
      if (res.success) {
        setToast({ message: 'Aplikasi berhasil disetujui!', type: 'success' });
        // Refresh data
        const updated = await adminAPI.getMitraApplicationDetail(applicationId);
        if (updated.success && updated.data) {
          setApplication(updated.data);
        }
      } else {
        setToast({ message: res.error?.message || 'Gagal menyetujui aplikasi', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Terjadi kesalahan', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!applicationId || !rejectReason.trim()) return;
    setActionLoading(true);
    try {
      const res = await adminAPI.rejectMitraApplication(applicationId, rejectReason);
      if (res.success) {
        setToast({ message: 'Aplikasi berhasil ditolak', type: 'success' });
        setShowRejectModal(false);
        setRejectReason('');
        // Refresh data
        const updated = await adminAPI.getMitraApplicationDetail(applicationId);
        if (updated.success && updated.data) {
          setApplication(updated.data);
        }
      } else {
        setToast({ message: res.error?.message || 'Gagal menolak aplikasi', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Terjadi kesalahan', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Build documents list from application data
  const getDocuments = (): DocumentItem[] => {
    if (!application) return [];
    return [
      {
        id: 'nib',
        name: 'NIB (Nomor Induk Berusaha)',
        description: 'Dokumen NIB dari OSS',
        url: application.nib_document_url || null
      },
      {
        id: 'akta',
        name: 'Akta Pendirian',
        description: 'Akta pendirian perusahaan yang disahkan notaris',
        url: application.akta_pendirian_url || null
      },
      {
        id: 'ktp',
        name: 'KTP Direktur',
        description: 'KTP direktur atau penanggung jawab perusahaan',
        url: application.ktp_direktur_url || null
      }
    ];
  };

  const documents = getDocuments();
  const allDocsUploaded = documents.every(doc => doc.url);
  const canApprove = application?.status === 'pending' && allDocsUploaded;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Aplikasi tidak ditemukan'}</p>
          <Link href="/admin/dashboard-verifikasi" className="text-cyan-400 font-semibold hover:text-cyan-300">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-400">
          <Link href="/admin/dashboard-verifikasi" className="text-cyan-400 hover:text-cyan-300">
            Dashboard Verifikasi
          </Link>{' '}
          / <span className="text-slate-500">{application.company_name}</span>
        </nav>

        {/* Header */}
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-slate-400">ID Pengajuan: {application.id}</p>
            <h1 className="text-3xl font-bold text-slate-50">Verifikasi Profil Bisnis</h1>
            <p className="text-slate-400">Review data dan dokumen perusahaan sebelum menyetujui.</p>
          </div>
          <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold ${statusStyles[application.status]?.className}`}>
            {statusStyles[application.status]?.label}
          </span>
        </header>

        {/* Toast */}
        {toast && (
          <div className={`rounded-xl px-4 py-3 text-sm flex items-center justify-between ${
            toast.type === 'success' 
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}>
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-200 text-xs font-semibold">
              Tutup
            </button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Data & Documents */}
          <section className="space-y-6">
            {/* Company Info */}
            <article className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">Informasi Perusahaan</h2>
                <p className="text-sm text-slate-400">Data yang diisi saat apply mitra</p>
              </div>
              <dl className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <dt className="text-slate-500">Nama Perusahaan</dt>
                  <dd className="text-slate-100 font-medium">{application.company_name}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Tipe Perusahaan</dt>
                  <dd className="text-slate-100 font-medium">{application.company_type}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">NPWP</dt>
                  <dd className="text-slate-100 font-mono">{application.npwp}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Pendapatan Tahunan</dt>
                  <dd className="text-slate-100">{application.annual_revenue}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Tahun Berdiri</dt>
                  <dd className="text-slate-100">{application.year_founded}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Website</dt>
                  <dd className="text-slate-100">
                    {application.website_url ? (
                      <a href={application.website_url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">
                        {application.website_url}
                      </a>
                    ) : '-'}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-slate-500">Alamat</dt>
                  <dd className="text-slate-100">{application.address}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-slate-500">Deskripsi Bisnis</dt>
                  <dd className="text-slate-100">{application.business_description}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-slate-500">Produk Utama</dt>
                  <dd className="text-slate-100">{application.key_products}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-slate-500">Pasar Ekspor</dt>
                  <dd className="text-slate-100">{application.export_markets}</dd>
                </div>
              </dl>
            </article>

            {/* Applicant Info */}
            <article className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">Informasi Pemohon</h2>
                <p className="text-sm text-slate-400">Akun user yang mengajukan</p>
              </div>
              <dl className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <dt className="text-slate-500">Email</dt>
                  <dd className="text-slate-100">{application.user?.email || '-'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Username</dt>
                  <dd className="text-slate-100">{application.user?.username || '-'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Tanggal Pengajuan</dt>
                  <dd className="text-slate-100">
                    {new Date(application.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </dd>
                </div>
              </dl>
            </article>

            {/* Documents List */}
            <article className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-100">Dokumen</h2>
                  <p className="text-sm text-slate-400">Klik dokumen untuk melihat pratinjau</p>
                </div>
                <span className="text-xs text-slate-500">
                  {documents.filter(d => d.url).length}/{documents.length} terupload
                </span>
              </div>

              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`border rounded-xl p-4 transition-all cursor-pointer ${
                      selectedDocUrl === doc.url && doc.url
                        ? 'border-cyan-500/50 bg-cyan-500/5'
                        : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                    }`}
                    onClick={() => doc.url && setSelectedDocUrl(doc.url)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-slate-100 font-semibold flex items-center gap-2">
                          {doc.name}
                          {selectedDocUrl === doc.url && doc.url && (
                            <span className="text-xs text-cyan-300">(Sedang ditinjau)</span>
                          )}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">{doc.description}</p>
                      </div>
                      {doc.url ? (
                        <span className="px-2.5 py-1 text-xs rounded-full font-semibold bg-emerald-600/30 text-emerald-200">
                          Uploaded
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs rounded-full font-semibold bg-rose-600/20 text-rose-200">
                          Belum Upload
                        </span>
                      )}
                    </div>
                    {doc.url && (
                      <div className="mt-3">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Buka di Tab Baru
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              {application.status === 'pending' && (
                <div className="flex flex-col gap-3 border-t border-slate-800 pt-4">
                  <button
                    onClick={handleApprove}
                    disabled={!canApprove || actionLoading}
                    className="px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 text-white disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? 'Memproses...' : '✅ Setujui Aplikasi'}
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={actionLoading}
                    className="px-4 py-3 rounded-xl text-sm font-semibold bg-rose-600/20 text-rose-300 border border-rose-600/30 hover:bg-rose-600/30 disabled:opacity-50"
                  >
                    ❌ Tolak Aplikasi
                  </button>
                  {!allDocsUploaded && (
                    <p className="text-xs text-amber-400">
                      ⚠️ Tidak bisa menyetujui karena dokumen belum lengkap.
                    </p>
                  )}
                </div>
              )}

              {application.status === 'rejected' && application.rejection_reason && (
                <div className="border-t border-slate-800 pt-4">
                  <p className="text-sm text-slate-400 mb-2">Alasan Penolakan:</p>
                  <p className="text-rose-300 bg-rose-500/10 p-3 rounded-lg text-sm">{application.rejection_reason}</p>
                </div>
              )}
            </article>
          </section>

          {/* Right Column - Document Preview */}
          <section className="space-y-4">
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 h-full flex flex-col min-h-[600px]">
              <div>
                <p className="text-sm text-slate-400">Preview Dokumen</p>
                <h2 className="text-lg font-semibold text-slate-100">
                  {selectedDocUrl ? documents.find(d => d.url === selectedDocUrl)?.name || 'Dokumen' : 'Pilih dokumen'}
                </h2>
              </div>

              <div className="mt-4 flex-1 border border-slate-800 rounded-xl bg-slate-950/50 overflow-hidden">
                {selectedDocUrl ? (
                  <iframe
                    src={selectedDocUrl}
                    title="Document Preview"
                    className="w-full h-full min-h-[500px]"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                    Pilih dokumen pada panel kiri untuk melihat pratinjau.
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-semibold text-slate-100">Tolak Aplikasi</h3>
            <p className="text-sm text-slate-400">
              Berikan alasan penolakan yang jelas agar mitra dapat memperbaiki aplikasinya.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: Dokumen NIB tidak valid atau tidak terbaca..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || actionLoading}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'Memproses...' : 'Konfirmasi Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
