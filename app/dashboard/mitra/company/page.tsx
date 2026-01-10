'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { DashboardLayout } from '@/lib/components/DashboardLayout';
import { userAPI, MitraApplicationResponse, SubmitMitraApplicationRequest } from '@/lib/api/user';

interface Toast {
    message: string;
    type: 'success' | 'error' | 'info';
}

export default function CompanyProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<MitraApplicationResponse | null>(null);
    const [toast, setToast] = useState<Toast | null>(null);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SubmitMitraApplicationRequest>();

    useEffect(() => {
        fetchStatus();
    }, []);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const fetchStatus = async () => {
        try {
            const res = await userAPI.getMitraStatus();
            if (res.success && res.data) {
                setStatus(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch status', error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: SubmitMitraApplicationRequest) => {
        try {
            const res = await userAPI.applyMitra(data);
            if (res.success) {
                setToast({ message: 'Aplikasi berhasil dikirim! Tunggu proses verifikasi.', type: 'success' });
                await fetchStatus();
            } else {
                setToast({ message: res.error?.message || 'Gagal mengirim aplikasi', type: 'error' });
            }
        } catch (error) {
            console.error('Submit error:', error);
            setToast({ message: 'Terjadi kesalahan saat mengirim data', type: 'error' });
        }
    };

    if (loading) {
        return (
            <DashboardLayout role="mitra">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
                </div>
            </DashboardLayout>
        );
    }

    const appStatus = status?.application?.status;

    return (
        <DashboardLayout role="mitra">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-md transition-all max-w-sm ${toast.type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-400' :
                        toast.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-400' :
                            'bg-blue-500/20 border-blue-500/30 text-blue-400'
                    }`}>
                    <div className="flex items-start space-x-3">
                        {toast.type === 'success' && (
                            <div className="p-1 bg-green-500/20 rounded-full">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        )}
                        {toast.type === 'error' && (
                            <div className="p-1 bg-red-500/20 rounded-full">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        )}
                        <div className="flex-1">
                            <p className="font-medium text-sm">{toast.message}</p>
                        </div>
                        <button onClick={() => setToast(null)} className="text-current opacity-60 hover:opacity-100 transition-opacity">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Profil Perusahaan</h1>
                        <p className="text-slate-400 mt-1">Kelola data dan dokumen legalitas perusahaan</p>
                    </div>
                    {appStatus && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${appStatus === 'approved' ? 'bg-green-500/10 text-green-400' :
                            appStatus === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                                'bg-red-500/10 text-red-400'
                            }`}>
                            {appStatus === 'approved' ? 'Terverifikasi' :
                                appStatus === 'pending' ? 'Menunggu Verifikasi' :
                                    'Ditolak'}
                        </span>
                    )}
                </div>

                {/* Content based on status */}
                {!appStatus || appStatus === 'rejected' ? (
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-white mb-2">Formulir Pengajuan Mitra</h2>
                            <p className="text-slate-400 text-sm">Lengkapi data perusahaan Anda untuk mulai mengajukan pendanaan.</p>
                            {appStatus === 'rejected' && (
                                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                    <p className="text-red-400 text-sm font-medium">Pengajuan Ditolak</p>
                                    <p className="text-red-300 text-sm mt-1">{status?.application?.rejection_reason}</p>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Nama Perusahaan</label>
                                    <input
                                        {...register('company_name', { required: 'Wajib diisi' })}
                                        className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Contoh: PT. Sumber Makmur"
                                    />
                                    {errors.company_name && <p className="text-red-400 text-xs">{errors.company_name.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Bentuk Badan Usaha</label>
                                    <select
                                        {...register('company_type', { required: 'Wajib dipilih' })}
                                        className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                                    >
                                        <option value="">Pilih Badan Usaha</option>
                                        <option value="PT">Perseroan Terbatas (PT)</option>
                                        <option value="CV">Persekutuan Komanditer (CV)</option>
                                        <option value="UD">Usaha Dagang (UD)</option>
                                    </select>
                                    {errors.company_type && <p className="text-red-400 text-xs">{errors.company_type.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">NPWP Perusahaan</label>
                                    <input
                                        {...register('npwp', {
                                            required: 'Wajib diisi',
                                            minLength: { value: 15, message: 'Minimal 15 digit' },
                                            maxLength: { value: 16, message: 'Maksimal 16 digit' }
                                        })}
                                        className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Nomor Pokok Wajib Pajak"
                                    />
                                    {errors.npwp && <p className="text-red-400 text-xs">{errors.npwp.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Pendapatan Tahunan</label>
                                    <select
                                        {...register('annual_revenue', { required: 'Wajib dipilih' })}
                                        className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                                    >
                                        <option value="">Pilih Range Pendapatan</option>
                                        <option value="<1M">&lt; Rp 1 Miliar</option>
                                        <option value="1M-5M">Rp 1 M - 5 M</option>
                                        <option value="5M-25M">Rp 5 M - 25 M</option>
                                        <option value="25M-100M">Rp 25 M - 100 M</option>
                                        <option value=">100M">&gt; Rp 100 Miliar</option>
                                    </select>
                                    {errors.annual_revenue && <p className="text-red-400 text-xs">{errors.annual_revenue.message}</p>}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-slate-300">Alamat Lengkap</label>
                                    <textarea
                                        {...register('address', { required: 'Wajib diisi' })}
                                        rows={3}
                                        className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Alamat lengkap sesuai domisili perusahaan"
                                    />
                                    {errors.address && <p className="text-red-400 text-xs">{errors.address.message}</p>}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-slate-300">Deskripsi Bisnis</label>
                                    <textarea
                                        {...register('business_description', { required: 'Wajib diisi' })}
                                        rows={4}
                                        className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Jelaskan secara singkat mengenai bidang usaha, model bisnis, dan operasional Anda"
                                    />
                                    {errors.business_description && <p className="text-red-400 text-xs">{errors.business_description.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Website Perusahaan (Opsional)</label>
                                    <input
                                        {...register('website_url')}
                                        className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Tahun Berdiri</label>
                                    <input
                                        type="number"
                                        {...register('year_founded', {
                                            required: 'Wajib diisi',
                                            valueAsNumber: true,
                                            min: { value: 1900, message: 'Tahun tidak valid' },
                                            max: { value: new Date().getFullYear(), message: 'Tahun tidak valid' }
                                        })}
                                        className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                                        placeholder="YYYY"
                                    />
                                    {errors.year_founded && <p className="text-red-400 text-xs">{errors.year_founded.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Produk Utama</label>
                                    <input
                                        {...register('key_products', { required: 'Wajib diisi' })}
                                        className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Komoditas/produk yang diekspor"
                                    />
                                    {errors.key_products && <p className="text-red-400 text-xs">{errors.key_products.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Pasar Ekspor Utama</label>
                                    <input
                                        {...register('export_markets', { required: 'Wajib diisi' })}
                                        className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Negara tujuan ekspor utama"
                                    />
                                    {errors.export_markets && <p className="text-red-400 text-xs">{errors.export_markets.message}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-slate-700/50">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 rounded-lg font-medium text-white transition-all shadow-lg shadow-teal-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Mengirim...' : 'Ajukan Permohonan'}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-sm">
                        {/* Approved/Pending View */}
                        {appStatus === 'approved' && (
                            <div className="p-4 bg-green-500/10 border-b border-green-500/20">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-green-500/20 rounded-full">
                                        <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-green-400 font-medium">Anda adalah Mitra Terverifikasi</p>
                                        <p className="text-green-300/70 text-sm">Anda dapat mulai membuat invoice dan mengajukan pendanaan.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wider">Nama Perusahaan</label>
                                <p className="text-white font-medium text-lg">{status?.application?.company_name}</p>
                            </div>

                            <div>
                                <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wider">Bentuk Badan Usaha</label>
                                <p className="text-white font-medium">{status?.application?.company_type || '-'}</p>
                            </div>

                            {appStatus === 'pending' && (
                                <div className="md:col-span-2">
                                    <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                                        <div className="flex items-center space-x-3">
                                            <svg className="w-5 h-5 text-yellow-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-yellow-300 text-sm">
                                                Data perusahaan Anda sedang ditinjau oleh tim kami. Proses verifikasi memakan waktu 1-3 hari kerja.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 bg-slate-800/50 border-t border-slate-700/50">
                            <h3 className="text-sm font-semibold text-white mb-3">Dokumen Legalitas</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span className="text-sm text-slate-300">Nomor Induk Berusaha (NIB)</span>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded ${status?.documents_status?.nib ? 'bg-green-500/10 text-green-400' : 'bg-slate-600/50 text-slate-400'}`}>
                                        {status?.documents_status?.nib ? 'Uploaded' : 'Pending'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span className="text-sm text-slate-300">Akta Pendirian</span>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded ${status?.documents_status?.akta_pendirian ? 'bg-green-500/10 text-green-400' : 'bg-slate-600/50 text-slate-400'}`}>
                                        {status?.documents_status?.akta_pendirian ? 'Uploaded' : 'Pending'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span className="text-sm text-slate-300">KTP Direktur Utama</span>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded ${status?.documents_status?.ktp_direktur ? 'bg-green-500/10 text-green-400' : 'bg-slate-600/50 text-slate-400'}`}>
                                        {status?.documents_status?.ktp_direktur ? 'Uploaded' : 'Pending'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
