'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const samplePdf = '/example/sample-file.pdf';

type DocumentStatus = 'pending' | 'valid' | 'revisi';

interface DocumentRecord {
  id: string;
  name: string;
  description: string;
  fileUrl: string;
  status: DocumentStatus;
  note: string;
}

interface SubmissionDetail {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  destinationCountry: string;
  invoiceAmount: string;
  fundingCurrency: string;
  tenorDays: number;
  status: 'Menunggu Verifikasi' | 'Need Revision' | 'Open for Investment';
  responsible: {
    name: string;
    position: string;
    ktpNumber: string;
    npwpNumber: string;
  };
  financials: {
    sales: string;
    netIncome: string;
    bank: string;
    account: string;
  };
  documents: DocumentRecord[];
}

const submissionStore: Record<string, SubmissionDetail> = {
  'pengajuan-001': {
    id: 'pengajuan-001',
    companyName: 'PT Arunika Bahari',
    contactPerson: 'Ratna Widyasari',
    email: 'ratna@arunikabahari.co.id',
    phone: '+62 812 9988 4411',
    destinationCountry: 'Amerika Serikat',
    invoiceAmount: 'USD 125.000',
    fundingCurrency: 'IDR',
    tenorDays: 12,
    status: 'Menunggu Verifikasi',
    responsible: {
      name: 'Ratna Widyasari',
      position: 'Direktur Utama',
      ktpNumber: '3175xxxxxxxxxxxx',
      npwpNumber: '12.345.678.9-012.000'
    },
    financials: {
      sales: 'Rp 25.400.000.000',
      netIncome: 'Rp 3.150.000.000',
      bank: 'Bank Mandiri',
      account: '1230012345678 a.n. PT Arunika Bahari'
    },
    documents: [
      {
        id: 'profil-perusahaan',
        name: 'Profil Perusahaan (PDF)',
        description: 'Ikhtisar usaha sesuai unggahan di halaman Profil Bisnis',
        fileUrl: samplePdf,
        status: 'pending',
        note: ''
      },
      {
        id: 'npwp-perusahaan',
        name: 'NPWP Perusahaan',
        description: 'Lampiran NPWP PT',
        fileUrl: samplePdf,
        status: 'pending',
        note: ''
      },
      {
        id: 'akta-pendirian',
        name: 'Akta Pendirian & Perubahan',
        description: 'Akta terakhir yang terunggah pada tab Dokumen',
        fileUrl: samplePdf,
        status: 'pending',
        note: ''
      },
      {
        id: 'ktp-penanggung',
        name: 'KTP Penanggung Jawab',
        description: 'KTP sesuai data penanggung jawab',
        fileUrl: samplePdf,
        status: 'pending',
        note: ''
      },
      {
        id: 'npwp-penanggung',
        name: 'NPWP Penanggung Jawab',
        description: 'NPWP individu sesuai tab Penanggung Jawab',
        fileUrl: samplePdf,
        status: 'pending',
        note: ''
      },
      {
        id: 'nib-risk',
        name: 'NIB & Analisa Risiko OSS',
        description: 'Dokumen NIB + lampiran tingkat risiko',
        fileUrl: samplePdf,
        status: 'pending',
        note: ''
      },
      {
        id: 'selfie',
        name: 'Selfie Verifikasi',
        description: 'Selfie penanggung jawab yang diambil pada tab Tanda Tangan Digital',
        fileUrl: samplePdf,
        status: 'pending',
        note: ''
      }
    ]
  }
};

const badgeStyles: Record<SubmissionDetail['status'], string> = {
  'Menunggu Verifikasi': 'bg-amber-500/10 text-amber-200 border border-amber-500/30',
  'Need Revision': 'bg-rose-500/10 text-rose-200 border border-rose-500/30',
  'Open for Investment': 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/30'
};

const docStatusLabel: Record<DocumentStatus, { text: string; className: string }> = {
  pending: { text: 'Pending', className: 'bg-slate-700/60 text-slate-200' },
  valid: { text: 'Valid', className: 'bg-emerald-600/30 text-emerald-200' },
  revisi: { text: 'Perlu Revisi', className: 'bg-rose-600/20 text-rose-200' }
};

export default function VerifikasiPengajuanDetail() {
  const params = useParams<{ id: string }>();
  const submissionId = params?.id;
  const submission = submissionId ? submissionStore[submissionId] : undefined;

  const [documents, setDocuments] = useState<DocumentRecord[]>(submission?.documents ?? []);
  const [selectedDocId, setSelectedDocId] = useState<string>(submission?.documents?.[0]?.id ?? '');
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [status, setStatus] = useState<SubmissionDetail['status']>(submission?.status ?? 'Menunggu Verifikasi');
  const [toast, setToast] = useState<string | null>(null);

  if (!submission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-center px-4">
        <div>
          <p className="text-sm text-slate-400 mb-2">Halaman tidak ditemukan</p>
          <Link href="/admin/dashboard-verifikasi" className="text-cyan-400 font-semibold">
            Kembali ke dashboard
          </Link>
        </div>
      </div>
    );
  }

  const selectedDoc = documents.find((doc) => doc.id === selectedDocId) ?? documents[0];
  const allDocsValid = documents.length > 0 && documents.every((doc) => doc.status === 'valid');

  const handleDocStatus = (targetId: string, nextStatus: DocumentStatus) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === targetId
          ? {
              ...doc,
              status: nextStatus,
              note: nextStatus === 'valid' ? '' : doc.note
            }
          : doc
      )
    );
  };

  const handleDocNote = (targetId: string, value: string) => {
    setDocuments((prev) => prev.map((doc) => (doc.id === targetId ? { ...doc, note: value } : doc)));
  };

  const handleFinalize = () => {
    if (!allDocsValid) {
      setToast('Mohon pastikan seluruh dokumen telah diberi status Valid sebelum membuka pendanaan.');
      return;
    }
    setStatus('Open for Investment');
    const message = 'Status berubah menjadi Open for Investment. Smart contract minting terpanggil ✅';
    setToast(message);
    console.log('Smart contract minting triggered for', submission.id);
  };

  const decrementZoom = () => setZoom((prev) => Math.max(0.5, parseFloat((prev - 0.25).toFixed(2))));
  const incrementZoom = () => setZoom((prev) => Math.min(2.5, parseFloat((prev + 0.25).toFixed(2))));
  const rotateClockwise = () => setRotation((prev) => (prev + 90) % 360);
  const rotateCounterClockwise = () => setRotation((prev) => (prev + 270) % 360);
  const resetViewer = () => {
    setZoom(1);
    setRotation(0);
  };

  const statusBadge = useMemo(
    () => (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badgeStyles[status]}`}>
        {status}
      </span>
    ),
    [status]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <nav className="text-sm text-slate-400">
          <Link href="/admin/dashboard-verifikasi" className="text-cyan-400 hover:text-cyan-300">
            Dashboard Verifikasi
          </Link>{' '}
          / <span className="text-slate-500">{submission.companyName}</span>
        </nav>

        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-slate-400">ID Pengajuan #{submission.id}</p>
            <h1 className="text-3xl font-bold text-slate-50">Verifikasi Dokumen & Data</h1>
            <p className="text-slate-400">Pastikan kesesuaian data dengan unggahan pada Profil Bisnis.</p>
          </div>
          {statusBadge}
        </header>

        {toast && (
          <div className="bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 flex items-center justify-between">
            <span>{toast}</span>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-slate-200 text-xs font-semibold"
            >
              Tutup
            </button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="space-y-6">
            <article className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-100">Data Perusahaan</h2>
                  <p className="text-sm text-slate-400">Sumber: Tab "Perusahaan" Profil Bisnis</p>
                </div>
                <span className="text-xs text-slate-500">Destination: {submission.destinationCountry}</span>
              </div>
              <dl className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <dt className="text-slate-500">Perusahaan</dt>
                  <dd className="text-slate-100 font-medium">{submission.companyName}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Contact Person</dt>
                  <dd className="text-slate-100 font-medium">{submission.contactPerson}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Email</dt>
                  <dd className="text-slate-100">{submission.email}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Nomor Tlp</dt>
                  <dd className="text-slate-100">{submission.phone}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Nilai Invoice</dt>
                  <dd className="text-slate-100 font-medium">{submission.invoiceAmount}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Tenor Pendanaan</dt>
                  <dd className="text-slate-100 font-medium">{submission.tenorDays} hari</dd>
                </div>
              </dl>
            </article>

            <article className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">Penanggung Jawab</h2>
                <p className="text-sm text-slate-400">Pastikan identitas sesuai dengan dokumen.</p>
              </div>
              <dl className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <dt className="text-slate-500">Nama</dt>
                  <dd className="text-slate-100 font-medium">{submission.responsible.name}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Jabatan</dt>
                  <dd className="text-slate-100">{submission.responsible.position}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">No. KTP</dt>
                  <dd className="text-slate-100">{submission.responsible.ktpNumber}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">No. NPWP</dt>
                  <dd className="text-slate-100">{submission.responsible.npwpNumber}</dd>
                </div>
              </dl>
            </article>

            <article className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">Ringkasan Keuangan</h2>
                <p className="text-sm text-slate-400">Sumber: Tab "Keuangan" Profil Bisnis</p>
              </div>
              <dl className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <dt className="text-slate-500">Penjualan Tahunan</dt>
                  <dd className="text-slate-100">{submission.financials.sales}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Laba Bersih</dt>
                  <dd className="text-slate-100">{submission.financials.netIncome}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Bank</dt>
                  <dd className="text-slate-100">{submission.financials.bank}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Rekening</dt>
                  <dd className="text-slate-100">{submission.financials.account}</dd>
                </div>
              </dl>
            </article>

            <article className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-100">Verifikasi Dokumen</h2>
                  <p className="text-sm text-slate-400">Klik dokumen untuk melihat pratinjau PDF di panel kanan.</p>
                </div>
                <span className="text-xs text-slate-500">{documents.filter((doc) => doc.status === 'valid').length}/{documents.length} valid</span>
              </div>

              <div className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="border border-slate-800 rounded-xl p-4 bg-slate-950/40">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <button
                          onClick={() => setSelectedDocId(doc.id)}
                          className="text-left"
                        >
                          <p className="text-slate-100 font-semibold flex items-center gap-2">
                            {doc.name}
                            {selectedDoc?.id === doc.id && <span className="text-xs text-cyan-300">(Sedang ditinjau)</span>}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">{doc.description}</p>
                        </button>
                      </div>
                      <span className={`px-2.5 py-1 text-xs rounded-full font-semibold ${docStatusLabel[doc.status].className}`}>
                        {docStatusLabel[doc.status].text}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-3">
                      <button
                        onClick={() => handleDocStatus(doc.id, 'valid')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                          doc.status === 'valid'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                        }`}
                      >
                        Valid
                      </button>
                      <button
                        onClick={() => handleDocStatus(doc.id, 'revisi')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                          doc.status === 'revisi'
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                        }`}
                      >
                        Revisi
                      </button>
                    </div>

                    {doc.status === 'revisi' && (
                      <div className="mt-3">
                        <label className="block text-xs font-semibold text-slate-400 mb-2">
                          Catatan Revisi
                        </label>
                        <textarea
                          value={doc.note}
                          onChange={(e) => handleDocNote(doc.id, e.target.value)}
                          placeholder="Tuliskan alasan revisi dan dokumen pendukung yang dibutuhkan..."
                          className="w-full px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800 text-sm text-slate-100 focus:ring-2 focus:ring-rose-500"
                          rows={3}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-800 pt-4">
                <button
                  onClick={handleFinalize}
                  disabled={!allDocsValid || status === 'Open for Investment'}
                  className="px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-600 to-teal-600 text-white disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400"
                >
                  Setujui & Buka Pendanaan
                </button>
                <p className="text-xs text-slate-500">
                  Tombol hanya aktif bila seluruh dokumen telah valid. Sistem otomatis memanggil smart contract minting ketika status berubah menjadi "Open for Investment".
                </p>
              </div>
            </article>
          </section>

          <section className="space-y-4">
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 h-full flex flex-col">
              <div className="flex flex-wrap items-center gap-3 justify-between">
                <div>
                  <p className="text-sm text-slate-400">Preview Dokumen</p>
                  <h2 className="text-lg font-semibold text-slate-100">{selectedDoc?.name ?? 'Pilih dokumen'}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={decrementZoom} className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-100">
                    Zoom -
                  </button>
                  <button onClick={incrementZoom} className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-100">
                    Zoom +
                  </button>
                  <button onClick={rotateCounterClockwise} className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-100">
                    ⟲
                  </button>
                  <button onClick={rotateClockwise} className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-100">
                    ⟳
                  </button>
                  <button onClick={resetViewer} className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-700 text-slate-200">
                    Reset
                  </button>
                </div>
              </div>

              <div className="mt-4 text-xs text-slate-400 flex items-center justify-between">
                <span>Zoom: {(zoom * 100).toFixed(0)}%</span>
                <span>Rotasi: {rotation}°</span>
              </div>

              <div className="mt-4 flex-1 border border-slate-800 rounded-xl bg-slate-950/50 overflow-auto">
                {selectedDoc ? (
                  <div
                    className="origin-top-left"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      transformOrigin: 'top left'
                    }}
                  >
                    <iframe
                      src={`${selectedDoc.fileUrl}#toolbar=0`}
                      title={selectedDoc.name}
                      className="w-[900px] h-[1100px]"
                    />
                  </div>
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
    </div>
  );
}
