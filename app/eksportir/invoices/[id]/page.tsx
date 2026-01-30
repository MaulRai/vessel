'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { AuthGuard } from '@/lib/components/AuthGuard';
import { DashboardLayout } from '@/lib/components/DashboardLayout';
import { invoiceAPI, InvoiceDetail } from '@/lib/api/user';

function InvoiceDetailContent() {
    const params = useParams();
    const router = useRouter();
    const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadInvoice = async () => {
            if (!params?.id) return;

            setLoading(true);
            try {
                const res = await invoiceAPI.getInvoiceDetail(params.id as string);
                if (res.success && res.data) {
                    setInvoice(res.data);
                } else {
                    setError(res.error?.message || 'Gagal memuat detail invoice');
                }
            } catch (err) {
                setError('Terjadi kesalahan saat memuat data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadInvoice();
    }, [params?.id]);

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
            <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${config.className}`}>
                {config.label}
            </span>
        );
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatCurrency = (amount: number, currency: string = 'IDR') => {
        if (currency === 'IDR') {
            return `IDRX ${amount.toLocaleString('id-ID')}`;
        }
        return `${currency} ${amount.toLocaleString('en-US')}`;
    };

    if (loading) {
        return (
            <DashboardLayout role="mitra">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-400"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !invoice) {
        return (
            <DashboardLayout role="mitra">
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <div className="bg-red-500/10 p-4 rounded-full mb-4">
                        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Gagal Memuat Invoice</h3>
                    <p className="text-slate-400 mb-6">{error || 'Invoice tidak ditemukan'}</p>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all"
                    >
                        Kembali
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="mitra">
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Link
                                href="/eksportir/invoices"
                                className="text-slate-400 hover:text-white transition-colors"
                                title="Kembali ke daftar invoice"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </Link>
                            <h1 className="text-2xl font-bold text-white">Detail Invoice</h1>
                        </div>
                        <p className="text-slate-400 ml-8 text-sm">
                            #{invoice.invoice_number}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 ml-8 md:ml-0">
                        {getStatusBadge(invoice.status)}
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="md:col-span-2 space-y-6">
                        <section className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Informasi Invoice
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-slate-400 mb-1">Nomor Invoice</p>
                                    <p className="text-white font-medium">{invoice.invoice_number}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400 mb-1">Tanggal Jatuh Tempo</p>
                                    <p className="text-white font-medium">{formatDate(invoice.due_date)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400 mb-1">Jumlah</p>
                                    <p className="text-xl font-bold text-teal-400">
                                        {formatCurrency(invoice.original_amount || invoice.amount, invoice.original_currency || invoice.currency)}
                                    </p>
                                    {invoice.original_currency && invoice.original_currency !== 'IDR' && (
                                        <p className="text-xs text-slate-500 mt-1">
                                            ~ {formatCurrency(invoice.idr_amount || 0, 'IDR')}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400 mb-1">Tanggal Dibuat</p>
                                    <p className="text-white font-medium">{formatDate(invoice.created_at)}</p>
                                </div>
                            </div>
                        </section>

                        <section className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Informasi Buyer
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-slate-400 mb-1">Nama Buyer</p>
                                    <p className="text-white font-medium">{invoice.buyer_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400 mb-1">Negara Asal</p>
                                    <p className="text-white font-medium flex items-center gap-2">
                                        <span className="text-lg">🌍</span> {invoice.buyer_country}
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <section className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Status Dokumen
                            </h3>

                            <div className="space-y-4">
                                {/* Dokumen Utama */}
                                <div className="flex items-start justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded bg-slate-800">
                                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-200">Invoice File</p>
                                            <a href={invoice.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-400 hover:text-teal-300 hover:underline">
                                                Lihat Dokumen
                                            </a>
                                        </div>
                                    </div>
                                    <div className="mt-1">
                                        <span className="px-2 py-0.5 rounded text-[10px] bg-green-500/10 text-green-400 font-medium">Uploaded</span>
                                    </div>
                                </div>

                                {/* Supporting Docs */}
                                {invoice.documents && invoice.documents.length > 0 && (
                                    <div className="pt-2 border-t border-slate-700/50">
                                        <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-semibold">Dokumen Pendukung</p>
                                        <div className="space-y-3">
                                            {invoice.documents.map((doc) => (
                                                <div key={doc.id} className="flex items-start justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded bg-slate-800">
                                                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-slate-200 truncate">{doc.document_type}</p>
                                                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-400 hover:text-teal-300 hover:underline">
                                                                Lihat
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                Verifikasi On-Chain
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Status Network</span>
                                    <span className="text-emerald-400 flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Base Sepolia
                                    </span>
                                </div>
                                {invoice.nft?.token_id && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">Token ID</span>
                                        <span className="text-slate-200 font-mono">#{invoice.nft.token_id}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Minting NFT</span>
                                    {invoice.nft?.mint_tx_hash ? (
                                        <a
                                            href={`https://base-sepolia.blockscout.com/tx/${invoice.nft.mint_tx_hash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 transition-colors"
                                        >
                                            {invoice.nft.mint_tx_hash.substring(0, 6)}...{invoice.nft.mint_tx_hash.substring(invoice.nft.mint_tx_hash.length - 4)}
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    ) : (
                                        <span className="text-slate-600">Pending</span>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Riwayat Status - Mockup if needed, or simple status display */}
                        <section className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Catatan</h3>
                            <p className="text-sm text-slate-400 italic">
                                {invoice.notes || 'Tidak ada catatan tambahan.'}
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default function InvoiceDetailPage() {
    return (
        <AuthGuard allowedRoles={['mitra']}>
            <InvoiceDetailContent />
        </AuthGuard>
    );
}
