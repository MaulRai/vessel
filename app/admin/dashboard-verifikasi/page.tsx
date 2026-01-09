'use client';

import Link from 'next/link';

type SubmissionType = 'profil-bisnis' | 'pendanaan';

interface SubmissionRow {
  id: string;
  type: SubmissionType;
  companyName: string;
  contactPerson: string;
  invoiceCurrency: 'USD' | 'EUR';
  invoiceAmount: number;
  tenorDays: number;
  destinationCountry: string;
  submittedAt: string;
  status: 'Menunggu Verifikasi' | 'Need Revision' | 'Open for Investment';
  pendingDocs: number;
}

const submissions: SubmissionRow[] = [
  {
    id: 'pengajuan-profil-bisnis-001',
    type: 'profil-bisnis',
    companyName: 'PT Arunika Bahari',
    contactPerson: 'Ratna Widyasari',
    invoiceCurrency: 'USD',
    invoiceAmount: 125000,
    tenorDays: 12,
    destinationCountry: 'Amerika Serikat',
    submittedAt: '8 Jan 2026',
    status: 'Menunggu Verifikasi',
    pendingDocs: 3
  },
  {
    id: 'pengajuan-dana-001',
    type: 'pendanaan',
    companyName: 'PT Samudra Niaga Sejahtera',
    contactPerson: 'Aditya Rahman',
    invoiceCurrency: 'USD',
    invoiceAmount: 98000,
    tenorDays: 45,
    destinationCountry: 'Belanda',
    submittedAt: '12 Jan 2026',
    status: 'Menunggu Verifikasi',
    pendingDocs: 2
  }
];

const statusStyles: Record<SubmissionRow['status'], { label: string; className: string }> = {
  'Menunggu Verifikasi': {
    label: 'Menunggu Verifikasi',
    className: 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
  },
  'Need Revision': {
    label: 'Perlu Revisi',
    className: 'bg-rose-500/15 text-rose-300 border border-rose-500/40'
  },
  'Open for Investment': {
    label: 'Open for Investment',
    className: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40'
  }
};

const numberFormatter = new Intl.NumberFormat('id-ID');

export default function DashboardVerifikasiPage() {
  const totalAwaiting = submissions.filter((row) => row.status === 'Menunggu Verifikasi').length;
  const danaSubmissions = submissions.filter((row) => row.type === 'pendanaan');
  const profilSubmissions = submissions.filter((row) => row.type === 'profil-bisnis');

  const renderTable = (rows: SubmissionRow[], title: string, subtitle: string) => (
    <section className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
          <p className="text-sm text-slate-400">{subtitle}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800">
          <thead className="bg-slate-900/70">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase">Perusahaan</th>
              <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase">Nilai Invoice</th>
              <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase">Tenor</th>
              <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase">Negara Tujuan</th>
              <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-900/30">
                <td className="px-6 py-4">
                  <p className="text-slate-100 font-semibold">{row.companyName}</p>
                  <p className="text-sm text-slate-400">CP: {row.contactPerson}</p>
                  <p className="text-xs text-slate-500">Masuk pada {row.submittedAt}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-slate-100 font-semibold">
                    {row.invoiceCurrency} {numberFormatter.format(row.invoiceAmount)}
                  </p>
                  <p className="text-xs text-slate-500">Dokumen pending: {row.pendingDocs}</p>
                </td>
                <td className="px-6 py-4 text-slate-200">{row.tenorDays} hari</td>
                <td className="px-6 py-4 text-slate-200">{row.destinationCountry}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[row.status].className}`}>
                    {statusStyles[row.status].label}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={
                      row.type === 'profil-bisnis'
                        ? `/admin/verifikasi-pengajuan-profil-bisnis/${row.id}`
                        : `/admin/verifikasi-pengajuan-dana/${row.id}`
                    }
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 text-white text-sm font-semibold hover:from-cyan-500 hover:to-teal-500"
                  >
                    Lihat Detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-cyan-300/80 font-semibold tracking-wide">Backoffice Admin</p>
          <h1 className="text-3xl font-bold text-slate-50">Dashboard Verifikasi Pendanaan</h1>
          <p className="text-slate-400 max-w-2xl">
            Tinjau pengajuan terbaru, cek kelengkapan dokumen, dan lanjutkan ke tahap Open for Investment setelah seluruh dokumen tervalidasi.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
            <p className="text-sm text-slate-400">Menunggu Verifikasi</p>
            <p className="text-3xl font-bold text-slate-50 mt-2">{totalAwaiting}</p>
          </article>
          <article className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
            <p className="text-sm text-slate-400">Total Pengajuan</p>
            <p className="text-3xl font-bold text-slate-50 mt-2">{submissions.length}</p>
          </article>
          <article className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
            <p className="text-sm text-slate-400">Dokumen Pending</p>
            <p className="text-3xl font-bold text-slate-50 mt-2">
              {submissions.reduce((sum, row) => sum + row.pendingDocs, 0)}
            </p>
          </article>
        </section>

        {renderTable(danaSubmissions, 'Daftar Pengajuan Dana', 'Klik detail untuk memverifikasi dokumen dan data pendanaan')}
        {renderTable(profilSubmissions, 'Daftar Pengajuan Profil Bisnis', 'Klik detail untuk memverifikasi data dan lampiran profil bisnis')}
      </div>
    </div>
  );
}
