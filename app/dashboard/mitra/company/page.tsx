'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { DashboardLayout } from '@/lib/components/DashboardLayout';
import { userAPI, MitraApplicationResponse, SubmitMitraApplicationRequest } from '@/lib/api/user';

type DocumentType = 'nib' | 'akta_pendirian' | 'ktp_direktur';

interface Toast {
    message: string;
    type: 'success' | 'error' | 'info';
}

interface DocumentUploadStatus {
    nib: boolean;
    akta_pendirian: boolean;
    ktp_direktur: boolean;
}

interface UploadingState {
    nib: boolean;
    akta_pendirian: boolean;
    ktp_direktur: boolean;
}

export default function CompanyProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<MitraApplicationResponse | null>(null);
    const [toast, setToast] = useState<Toast | null>(null);
    const [documentsStatus, setDocumentsStatus] = useState<DocumentUploadStatus>({
        nib: false,
        akta_pendirian: false,
        ktp_direktur: false,
    });
    const [uploading, setUploading] = useState<UploadingState>({
        nib: false,
        akta_pendirian: false,
        ktp_direktur: false,
    });

    // File input refs
    const nibInputRef = useRef<HTMLInputElement>(null);
    const aktaInputRef = useRef<HTMLInputElement>(null);
    const ktpInputRef = useRef<HTMLInputElement>(null);

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
                setDocumentsStatus(res.data.documents_status);
            }
        } catch (error) {
            console.error('Failed to fetch status', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file: File, documentType: DocumentType) => {
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setToast({ message: 'Ukuran file maksimal 10MB', type: 'error' });
            return;
        }

        // Validate file type (PDF, JPG, PNG)
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            setToast({ message: 'Format file harus PDF, JPG, atau PNG', type: 'error' });
            return;
        }

        setUploading(prev => ({ ...prev, [documentType]: true }));

        try {
            const res = await userAPI.uploadMitraDocument(file, documentType);
            if (res.success) {
                setDocumentsStatus(prev => ({ ...prev, [documentType]: true }));
                setToast({ 
                    message: `Dokumen ${getDocumentLabel(documentType)} berhasil diupload`, 
                    type: 'success' 
                });
                // Refresh status to get updated data
                await fetchStatus();
            } else {
                setToast({ 
                    message: res.error?.message || `Gagal mengupload ${getDocumentLabel(documentType)}`, 
                    type: 'error' 
                });
            }
        } catch (error) {
            console.error('Upload error:', error);
            setToast({ message: 'Terjadi kesalahan saat mengupload', type: 'error' });
        } finally {
            setUploading(prev => ({ ...prev, [documentType]: false }));
        }
    };

    const getDocumentLabel = (type: DocumentType): string => {
        switch (type) {
            case 'nib': return 'NIB';
            case 'akta_pendirian': return 'Akta Pendirian';
            case 'ktp_direktur': return 'KTP Direktur';
        }
    };

    const onSubmit = async (data: SubmitMitraApplicationRequest) => {
        try {
            const res = await userAPI.applyMitra(data);
            if (res.success) {
                setToast({ message: 'Aplikasi berhasil dikirim! Lanjutkan dengan upload dokumen.', type: 'success' });
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
    const hasApplication = !!status?.application;
    const isDocumentsComplete = status?.is_complete;

    // Document Upload Card Component
    const DocumentUploadCard = ({ 
        type, 
        label, 
        description,
        inputRef 
    }: { 
        type: DocumentType; 
        label: string; 
        description: string;
        inputRef: React.RefObject<HTMLInputElement | null>;
    }) => {
        const isUploaded = documentsStatus[type];
        const isUploading = uploading[type];

        return (
            <div className={`p-4 rounded-xl border transition-all ${
                isUploaded 
                    ? 'bg-green-500/5 border-green-500/30' 
                    : 'bg-slate-800/50 border-slate-700/50 hover:border-cyan-500/30'
            }`}>
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${isUploaded ? 'bg-green-500/20' : 'bg-slate-700/50'}`}>
                            <svg className={`w-5 h-5 ${isUploaded ? 'text-green-400' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-white">{label}</h4>
                            <p className="text-xs text-slate-400 mt-0.5">{description}</p>
                        </div>
                    </div>
                    
                    {isUploaded ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-400 flex items-center space-x-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Uploaded</span>
                        </span>
                    ) : (
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            disabled={isUploading}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                        >
                            {isUploading ? (
                                <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-t border-cyan-400"></div>
                                    <span>Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    <span>Upload</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
                
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            handleFileUpload(file, type);
                        }
                        // Reset input value so same file can be selected again
                        e.target.value = '';
                    }}
                />
            </div>
        );
    };

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
                {!hasApplication || appStatus === 'rejected' ? (
                    /* No Application - Show Full Form */
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
                    /* Has Application - Show Status + Upload Section */
                    <div className="space-y-6">
                        {/* Status Banner */}
                        {appStatus === 'approved' && (
                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
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

                        {appStatus === 'pending' && !isDocumentsComplete && (
                            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                <div className="flex items-start space-x-3">
                                    <div className="p-2 bg-amber-500/20 rounded-full mt-0.5">
                                        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-amber-400 font-medium">Dokumen Belum Lengkap</p>
                                        <p className="text-amber-300/70 text-sm">Lengkapi semua dokumen untuk melanjutkan proses verifikasi.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {appStatus === 'pending' && isDocumentsComplete && (
                            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-500/20 rounded-full">
                                        <svg className="w-5 h-5 text-blue-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-blue-400 font-medium">Menunggu Verifikasi</p>
                                        <p className="text-blue-300/70 text-sm">Dokumen lengkap. Tim kami sedang meninjau aplikasi Anda (1-3 hari kerja).</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Company Info Card */}
                        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-sm">
                            <div className="p-4 border-b border-slate-700/50">
                                <h3 className="text-lg font-semibold text-white">Informasi Perusahaan</h3>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wider">Nama Perusahaan</label>
                                    <p className="text-white font-medium">{status?.application?.company_name}</p>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wider">Bentuk Badan Usaha</label>
                                    <p className="text-white font-medium">{status?.application?.company_type || '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Document Upload Section */}
                        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-sm">
                            <div className="p-4 border-b border-slate-700/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Dokumen Legalitas</h3>
                                        <p className="text-sm text-slate-400 mt-1">Upload dokumen untuk melengkapi profil bisnis</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs text-slate-400">
                                            {Object.values(documentsStatus).filter(Boolean).length}/3 dokumen
                                        </span>
                                        <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 transition-all duration-300"
                                                style={{ width: `${(Object.values(documentsStatus).filter(Boolean).length / 3) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-6 space-y-4">
                                <DocumentUploadCard
                                    type="nib"
                                    label="Nomor Induk Berusaha (NIB)"
                                    description="Dokumen NIB dari OSS (PDF/JPG/PNG, max 10MB)"
                                    inputRef={nibInputRef}
                                />
                                <DocumentUploadCard
                                    type="akta_pendirian"
                                    label="Akta Pendirian Perusahaan"
                                    description="Akta notaris pendirian perusahaan (PDF/JPG/PNG, max 10MB)"
                                    inputRef={aktaInputRef}
                                />
                                <DocumentUploadCard
                                    type="ktp_direktur"
                                    label="KTP Direktur Utama"
                                    description="Scan/foto KTP direktur yang bertanggung jawab (PDF/JPG/PNG, max 10MB)"
                                    inputRef={ktpInputRef}
                                />
                            </div>

                            {/* Completion Message */}
                            {isDocumentsComplete && (
                                <div className="px-6 pb-6">
                                    <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                                        <div className="flex items-center space-x-3">
                                            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-green-300 text-sm">
                                                Semua dokumen telah lengkap! Aplikasi Anda siap untuk ditinjau.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
