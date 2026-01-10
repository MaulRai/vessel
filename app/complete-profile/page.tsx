'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { userAPI, CompleteProfileRequest, SubmitMitraApplicationRequest, MitraApplicationResponse } from '@/lib/api/user';

const SUPPORTED_BANKS = [
    { code: 'bca', name: 'Bank Central Asia (BCA)' },
    { code: 'mandiri', name: 'Bank Mandiri' },
    { code: 'bni', name: 'Bank Negara Indonesia (BNI)' },
    { code: 'bri', name: 'Bank Rakyat Indonesia (BRI)' },
    { code: 'cimb', name: 'CIMB Niaga' },
    { code: 'danamon', name: 'Bank Danamon' },
    { code: 'permata', name: 'Bank Permata' },
    { code: 'bsi', name: 'Bank Syariah Indonesia (BSI)' },
    { code: 'btn', name: 'Bank Tabungan Negara (BTN)' },
    { code: 'ocbc', name: 'OCBC NISP' },
];

type Step = 1 | 2 | 3;

interface FormData {
    fullName: string;
    phone: string;
    nik: string;
    ktpPhotoUrl: string;
    selfieUrl: string;
    bankCode: string;
    accountNumber: string;
    accountName: string;
    // Mitra fields
    companyName: string;
    companyType: 'PT' | 'CV' | 'UD';
    npwp: string;
    annualRevenue: '<1M' | '1M-5M' | '5M-25M' | '25M-100M' | '>100M';
    address: string;
    businessDescription: string;
    websiteUrl: string;
    yearFounded: string;
    keyProducts: string;
    exportMarkets: string;
}

export default function CompleteProfilePage() {
    const { user, isLoading: authLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [mitraStatus, setMitraStatus] = useState<MitraApplicationResponse | null>(null);
    const [loadingMitra, setLoadingMitra] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        phone: '',
        nik: '',
        ktpPhotoUrl: '',
        selfieUrl: '',
        bankCode: '',
        accountNumber: '',
        accountName: '',
        companyName: '',
        companyType: 'PT',
        npwp: '',
        annualRevenue: '<1M',
        address: '',
        businessDescription: '',
        websiteUrl: '',
        yearFounded: '',
        keyProducts: '',
        exportMarkets: '',
    });

    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) {
                router.push('/login');
                return;
            }

            // Redirect if already completed (Investor only, Mitra logic handled below)
            if (user?.role === 'investor' && user?.profile_completed) {
                router.push('/dashboard/investor');
            } else if (user?.role === 'mitra') {
                checkMitraStatus();
            }
        }
    }, [authLoading, isAuthenticated, user, router]);

    const checkMitraStatus = async () => {
        setLoadingMitra(true);
        try {
            const res = await userAPI.getMitraStatus();
            if (res.success && res.data) {
                setMitraStatus(res.data);
                // If application exists but rejected
                if (res.data.application.status === 'rejected') {
                    // Stay on step 1 to re-apply (logic can be improved)
                    setError(`Aplikasi sebelumnya ditolak: ${res.data.application.rejection_reason}`);
                }
                // If approved, redirect
                else if (res.data.application.status === 'approved') {
                    router.push('/dashboard/mitra');
                }
            }
        } catch (err) {
            // 404 expectation for new mitra
        } finally {
            setLoadingMitra(false);
        }
    };

    const updateFormData = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // ================== INVESTOR LOGIC ==================

    const validateInvestorStep = (step: Step): boolean => {
        setError('');
        if (step === 1) {
            if (!formData.fullName.trim()) return fail('Nama lengkap harus diisi');
            if (!formData.phone.trim()) return fail('Nomor telepon harus diisi');
        } else if (step === 2) {
            if (!formData.nik || formData.nik.length !== 16) return fail('NIK harus 16 digit');
            if (!formData.ktpPhotoUrl) return fail('Foto KTP harus diupload');
            if (!formData.selfieUrl) return fail('Foto selfie harus diupload');
        } else if (step === 3) {
            if (!formData.bankCode) return fail('Pilih bank');
            if (!formData.accountNumber) return fail('Nomor rekening harus diisi');
            if (!formData.accountName) return fail('Nama pemilik rekening harus diisi');
        }
        return true;
    };

    const handleInvestorSubmit = async () => {
        if (!validateInvestorStep(3)) return;
        setIsSubmitting(true);
        const req: CompleteProfileRequest = {
            full_name: formData.fullName,
            phone: formData.phone,
            nik: formData.nik,
            ktp_photo_url: formData.ktpPhotoUrl,
            selfie_url: formData.selfieUrl,
            bank_code: formData.bankCode,
            account_number: formData.accountNumber,
            account_name: formData.accountName,
        };
        const res = await userAPI.completeProfile(req);
        setIsSubmitting(false);
        if (res.success) router.push('/dashboard/investor');
        else setError(res.error?.message || 'Gagal menyimpan profil');
    };

    // ================== MITRA LOGIC ==================

    const handleMitraApply = async () => {
        if (!formData.companyName) return fail('Nama perusahaan harus diisi');
        if (!formData.npwp || formData.npwp.length < 15) return fail('NPWP tidak valid');
        if (!formData.address) return fail('Alamat perusahaan harus diisi');
        if (!formData.businessDescription) return fail('Deskripsi bisnis harus diisi');
        if (!formData.yearFounded) return fail('Tahun berdiri harus diisi');
        if (!formData.keyProducts) return fail('Produk utama harus diisi');
        if (!formData.exportMarkets) return fail('Pasar ekspor harus diisi');

        setIsSubmitting(true);
        const req: SubmitMitraApplicationRequest = {
            company_name: formData.companyName,
            company_type: formData.companyType,
            npwp: formData.npwp,
            annual_revenue: formData.annualRevenue,
            address: formData.address,
            business_description: formData.businessDescription,
            website_url: formData.websiteUrl,
            year_founded: parseInt(formData.yearFounded),
            key_products: formData.keyProducts,
            export_markets: formData.exportMarkets,
        };
        const res = await userAPI.applyMitra(req);
        setIsSubmitting(false);

        if (res.success) {
            checkMitraStatus(); // Refresh status to move to next phase
        } else {
            setError(res.error?.message || 'Gagal mengajukan aplikasi');
        }
    };

    const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

    const handleMitraUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) return fail('Ukuran file maks 10MB');

        setUploadingDoc(type);
        const res = await userAPI.uploadMitraDocument(file, type);
        setUploadingDoc(null);

        if (res.success) {
            checkMitraStatus(); // Refresh status to update checklist
        } else {
            setError(res.error?.message || 'Gagal upload dokumen');
        }
    };

    // ================== SHARED ==================

    const fail = (msg: string) => { setError(msg); return false; };

    const [uploadingField, setUploadingField] = useState<string | null>(null);
    const handleInvestorUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'ktpPhotoUrl' | 'selfieUrl') => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) return fail('Max 5MB');
        setUploadingField(field);
        const docType = field === 'ktpPhotoUrl' ? 'ktp' : 'selfie';
        const res = await userAPI.uploadFile(file, docType);
        setUploadingField(null);
        if (res.success && res.data) updateFormData(field, res.data.url);
        else setError(res.error?.message || 'Upload failed');
    };

    // ================== SHARED UI COMPONENTS ==================

    const StepIndicator = ({ steps, current }: { steps: { title: string; desc: string }[]; current: number }) => (
        <div className="mb-12">
            <div className="flex items-center justify-between mb-2">
                {steps.map((step, i) => (
                    <div key={i} className="flex-1 text-center relative">
                        <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center font-bold text-sm transition-all duration-300 ${current > i + 1 ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]' :
                                current === i + 1 ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]' :
                                    'bg-slate-800 text-slate-500 border border-slate-700'
                            }`}>
                            {current > i + 1 ? (
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : i + 1}
                        </div>
                        <p className={`mt-2 text-xs font-medium uppercase tracking-wider ${current === i + 1 ? 'text-cyan-400' : 'text-slate-500'}`}>
                            {step.title}
                        </p>
                        {i < steps.length - 1 && (
                            <div className="absolute top-5 left-[60%] right-[-40%] h-[2px] bg-slate-800 -z-10">
                                <div className={`h-full bg-cyan-500 transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]`} style={{ width: current > i + 1 ? '100%' : '0%' }}></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="text-center mt-6">
                <h2 className="text-xl font-bold text-white tracking-tight">{steps[current - 1]?.desc}</h2>
            </div>
        </div>
    );

    const BackButton = () => (
        <button
            onClick={() => router.push('/')}
            className="group absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
            <div className="w-8 h-8 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center group-hover:border-slate-500 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </div>
            <span className="text-sm font-medium">Kembali ke Beranda</span>
        </button>
    );

    if (authLoading || loadingMitra) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-t-2 border-cyan-500 animate-spin"></div>
                    <div className="absolute inset-0 w-16 h-16 rounded-full border-b-2 border-slate-800 animate-spin-slow"></div>
                </div>
            </div>
        );
    }

    // ================== MITRA UI ==================
    if (user?.role === 'mitra') {
        const app = mitraStatus?.application;

        // Waiting Approval
        if (app && mitraStatus?.is_complete && app.status === 'pending') {
            return (
                <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] -z-10"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] -z-10"></div>
                    <BackButton />

                    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 p-10 rounded-3xl max-w-lg w-full text-center shadow-2xl">
                        <div className="w-20 h-20 bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3 border border-yellow-500/20">
                            <svg className="w-10 h-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">Aplikasi Sedang Ditinjau</h2>
                        <p className="text-slate-400 leading-relaxed mb-8">
                            Terima kasih telah mengajukan sebagai Mitra. Tim kami sedang memverifikasi profil dan dokumen hukum Anda. Anda akan mendapatkan notifikasi setelah proses ini selesai.
                        </p>
                        <div className="space-y-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all border border-slate-700"
                            >
                                Cek Status Terbaru
                            </button>
                            <button
                                onClick={() => router.push('/')}
                                className="w-full text-slate-500 hover:text-cyan-400 text-sm font-medium transition-colors"
                            >
                                Kembali ke Beranda
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        // Mitra Document Upload
        if (app && app.status === 'pending') {
            const docs = mitraStatus?.documents_status;
            return (
                <div className="min-h-screen bg-slate-950 py-20 px-4 relative overflow-hidden">
                    <BackButton />
                    <div className="max-w-3xl mx-auto relative">
                        <StepIndicator steps={[
                            { title: 'Aplikasi', desc: 'Detail Perusahaan' },
                            { title: 'Dokumen', desc: 'Legalitas & Dokumen' },
                            { title: 'Review', desc: 'Tinjauan Akhir' }
                        ]} current={2} />

                        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-10 shadow-2xl">
                            {error && <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm flex items-center gap-3">
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </div>}

                            <div className="grid gap-6">
                                {[
                                    { id: 'nib', label: 'NIB (Nomor Induk Berusaha)', desc: 'Nomor Induk Berusaha terbaru', done: docs?.nib },
                                    { id: 'akta_pendirian', label: 'Akta Pendirian', desc: 'Akta pendirian perusahaan & SK Menkumham', done: docs?.akta_pendirian },
                                    { id: 'ktp_direktur', label: 'KTP Direktur', desc: 'Foto KTP asli Direktur Utama', done: docs?.ktp_direktur }
                                ].map((doc) => (
                                    <div key={doc.id} className={`group flex items-center justify-between p-6 rounded-2xl border transition-all duration-300 ${doc.done ? 'bg-green-500/5 border-green-500/20' : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50'
                                        }`}>
                                        <div className="flex items-center gap-5">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${doc.done ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'
                                                }`}>
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-bold text-white mb-0.5">{doc.label}</p>
                                                <p className="text-sm text-slate-400">{doc.desc}</p>
                                            </div>
                                        </div>

                                        {doc.done ? (
                                            <div className="flex items-center gap-2 bg-green-500/10 text-green-400 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Uploaded
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    id={`file-${doc.id}`}
                                                    className="hidden"
                                                    accept=".pdf,application/pdf"
                                                    onChange={(e) => handleMitraUpload(e, doc.id)}
                                                    disabled={!!uploadingDoc}
                                                />
                                                <label
                                                    htmlFor={`file-${doc.id}`}
                                                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${uploadingDoc === doc.id ? 'bg-slate-800 text-slate-500' : 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95'
                                                        }`}
                                                >
                                                    {uploadingDoc === doc.id ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-slate-600 border-t-slate-400 animate-spin rounded-full"></div>
                                                            Uploading
                                                        </>
                                                    ) : 'Pilih File'}
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {mitraStatus?.is_complete && (
                                <div className="mt-12 text-center p-8 bg-gradient-to-br from-green-500/10 to-emerald-500/5 rounded-3xl border border-green-500/20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <h3 className="text-xl font-bold text-green-400 mb-2">Semua Dokumen Berhasil Diunggah!</h3>
                                    <p className="text-slate-400 mb-6">Klik tombol di bawah untuk menyelesaikan proses pendaftaran.</p>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-green-500/20 active:scale-95 transition-all"
                                    >
                                        Selesaikan Pendaftaran
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        // Mitra Application Form
        return (
            <div className="min-h-screen bg-slate-950 py-20 px-4 relative">
                <BackButton />
                <div className="max-w-4xl mx-auto relative">
                    <StepIndicator steps={[
                        { title: 'Aplikasi', desc: 'Profil Bisnis & Perusahaan' },
                        { title: 'Dokumen', desc: 'Legalitas & Dokumen' },
                        { title: 'Review', desc: 'Tinjauan Akhir' }
                    ]} current={1} />

                    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-10 shadow-2xl">
                        {error && <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">{error}</div>}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Company Section */}
                            <div className="space-y-6">
                                <h3 className="text-cyan-400 text-sm font-bold uppercase tracking-widest mb-4">Informasi Perusahaan</h3>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">Nama Perusahaan</label>
                                    <input
                                        type="text"
                                        value={formData.companyName}
                                        onChange={(e) => updateFormData('companyName', e.target.value)}
                                        className="w-full bg-slate-800/50 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-3 text-white transition-all outline-none"
                                        placeholder="Ex: PT Bakti Jaya"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">Badan Hukum</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {(['PT', 'CV', 'UD'] as const).map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setFormData(p => ({ ...p, companyType: type }))}
                                                className={`py-3 rounded-xl border font-bold transition-all ${formData.companyType === type
                                                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                                                    : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:border-slate-500'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-300 mb-2">Tahun Berdiri</label>
                                        <input
                                            type="number"
                                            value={formData.yearFounded}
                                            onChange={(e) => updateFormData('yearFounded', e.target.value)}
                                            className="w-full bg-slate-800/50 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-3 text-white transition-all outline-none"
                                            placeholder="2010"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-300 mb-2">NPWP</label>
                                        <input
                                            type="text"
                                            value={formData.npwp}
                                            onChange={(e) => updateFormData('npwp', e.target.value.replace(/\D/g, ''))}
                                            className="w-full bg-slate-800/50 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-3 text-white transition-all outline-none"
                                            placeholder="15 Digit NPWP"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">Alamat Kantor Pusat</label>
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => updateFormData('address', e.target.value)}
                                        className="w-full bg-slate-800/50 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-3 text-white transition-all outline-none"
                                        placeholder="Jalan, Kota, Kode Pos"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            {/* Business Profile Section */}
                            <div className="space-y-6">
                                <h3 className="text-teal-400 text-sm font-bold uppercase tracking-widest mb-4">Profil Bisnis</h3>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">Deskripsi Bisnis</label>
                                    <textarea
                                        value={formData.businessDescription}
                                        onChange={(e) => updateFormData('businessDescription', e.target.value)}
                                        className="w-full bg-slate-800/50 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-3 text-white transition-all outline-none"
                                        placeholder="Apa yang perusahaan Anda tawarkan?"
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">Produk Utama</label>
                                    <input
                                        type="text"
                                        value={formData.keyProducts}
                                        onChange={(e) => updateFormData('keyProducts', e.target.value)}
                                        className="w-full bg-slate-800/50 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-3 text-white transition-all outline-none"
                                        placeholder="Ex: Karbon Aktif, Briket Kelapa..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">Pasar Ekspor Utama</label>
                                    <input
                                        type="text"
                                        value={formData.exportMarkets}
                                        onChange={(e) => updateFormData('exportMarkets', e.target.value)}
                                        className="w-full bg-slate-800/50 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-3 text-white transition-all outline-none"
                                        placeholder="Ex: Amerika Serikat, Uni Eropa, China"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-300 mb-2">Website</label>
                                        <input
                                            type="url"
                                            value={formData.websiteUrl}
                                            onChange={(e) => updateFormData('websiteUrl', e.target.value)}
                                            className="w-full bg-slate-800/50 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-3 text-white transition-all outline-none"
                                            placeholder="https://"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-300 mb-2">Omzet Tahunan</label>
                                        <select
                                            value={formData.annualRevenue}
                                            onChange={(e) => setFormData(p => ({ ...p, annualRevenue: e.target.value as any }))}
                                            className="w-full bg-slate-800/50 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-3 text-white transition-all outline-none appearance-none"
                                        >
                                            <option value="<1M">{"< Rp 1 M"}</option>
                                            <option value="1M-5M">Rp 1 M - 5 M</option>
                                            <option value="5M-25M">Rp 5 M - 25 M</option>
                                            <option value="25M-100M">Rp 25 M - 100 M</option>
                                            <option value=">100M">{"> Rp 100 M"}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 flex justify-center">
                            <button
                                onClick={handleMitraApply}
                                disabled={isSubmitting}
                                className="px-12 py-4 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
                                        Memproses...
                                    </span>
                                ) : 'Lanjut ke Upload Dokumen'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ================== INVESTOR UI ==================
    return (
        <div className="min-h-screen bg-slate-950 py-20 px-4 relative overflow-hidden">
            <BackButton />
            <div className="max-w-3xl mx-auto relative">
                <StepIndicator steps={[
                    { title: 'Personal', desc: 'Detail Data Diri' },
                    { title: 'Verifikasi', desc: 'Identitas & KYC' },
                    { title: 'Finance', desc: 'Informasi Rekening Bank' }
                ]} current={currentStep} />

                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-10 shadow-2xl">
                    {error && <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">{error}</div>}

                    {/* Step 1: Personal Data */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">Nama Lengkap (Sesuai KTP)</label>
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={e => updateFormData('fullName', e.target.value)}
                                        className="w-full bg-slate-800/50 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-3 text-white outline-none"
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">Nomor Telepon</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-3 text-slate-500">+62</span>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={e => updateFormData('phone', e.target.value)}
                                            className="w-full bg-slate-800/50 border border-slate-700 focus:border-cyan-500 rounded-xl pl-14 pr-4 py-3 text-white outline-none"
                                            placeholder="8xxxxxxxxx"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: KYC */}
                    {currentStep === 2 && (
                        <div className="space-y-8">
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">NIK (16 Digit)</label>
                                <input
                                    type="text"
                                    value={formData.nik}
                                    onChange={e => updateFormData('nik', e.target.value.replace(/\D/g, '').slice(0, 16))}
                                    className="w-full bg-slate-800/50 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-3 text-white outline-none"
                                    placeholder="16 digit NIK"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {(['ktpPhotoUrl', 'selfieUrl'] as const).map(field => (
                                    <div key={field} className={`group relative border-2 border-dashed transition-all rounded-3xl p-10 text-center ${formData[field] ? 'border-green-500/50 bg-green-500/5' : 'border-slate-700 bg-slate-800/30 hover:bg-slate-800/50 hover:border-slate-500'
                                        }`}>
                                        {formData[field] ? (
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <p className="text-green-400 font-bold uppercase tracking-widest text-xs">Berhasil diunggah</p>
                                                <button onClick={() => updateFormData(field, '')} className="text-slate-500 hover:text-red-400 text-xs transition-colors">Ganti Foto</button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 rounded-2xl bg-slate-700/50 text-slate-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white mb-1">{field === 'ktpPhotoUrl' ? 'Foto KTP' : 'Foto Selfie + KTP'}</p>
                                                    <p className="text-xs text-slate-500">Pastikan wajah dan teks terbaca jelas</p>
                                                </div>
                                                <input type="file" className="hidden" id={field} onChange={e => handleInvestorUpload(e, field)} disabled={!!uploadingField} />
                                                <label htmlFor={field} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${uploadingField === field ? 'bg-slate-700 text-slate-500' : 'bg-slate-700 text-white hover:bg-slate-600'
                                                    }`}>
                                                    {uploadingField === field ? 'Uploading...' : 'Pilih Foto'}
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Bank */}
                    {currentStep === 3 && (
                        <div className="space-y-8">
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Pilih Bank</label>
                                <select
                                    value={formData.bankCode}
                                    onChange={e => updateFormData('bankCode', e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-4 text-white outline-none appearance-none"
                                >
                                    <option value="">Cari Bank...</option>
                                    {SUPPORTED_BANKS.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">Nomor Rekening</label>
                                    <input
                                        type="text"
                                        value={formData.accountNumber}
                                        onChange={e => updateFormData('accountNumber', e.target.value.replace(/\D/g, ''))}
                                        className="w-full bg-slate-800/50 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-3 text-white outline-none"
                                        placeholder="0000000000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">Nama Pemilik Rekening</label>
                                    <input
                                        type="text"
                                        value={formData.accountName}
                                        onChange={e => updateFormData('accountName', e.target.value)}
                                        className="w-full bg-slate-800/50 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-3 text-white outline-none"
                                        placeholder="Sesuai buku tabungan"
                                    />
                                </div>
                            </div>
                            <div className="p-4 bg-cyan-500/5 rounded-2xl border border-cyan-500/20 flex gap-4">
                                <div className="text-cyan-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Rekening ini akan digunakan untuk penarikan saldo dan penerimaan hasil investasi. Pastikan nama pemilik rekening sesuai dengan nama lengkap Anda.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-800/50">
                        {currentStep > 1 ? (
                            <button
                                onClick={() => setCurrentStep(p => Math.max(p - 1, 1) as Step)}
                                className="px-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-white font-bold transition-all"
                            >
                                Kembali
                            </button>
                        ) : (
                            <div></div>
                        )}

                        {currentStep < 3 ? (
                            <button
                                onClick={() => { if (validateInvestorStep(currentStep)) setCurrentStep(p => Math.min(p + 1, 3) as Step) }}
                                className="px-10 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl text-white font-bold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 active:scale-95 transition-all"
                            >
                                Selanjutnya
                            </button>
                        ) : (
                            <button
                                onClick={handleInvestorSubmit}
                                disabled={isSubmitting}
                                className="px-12 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl text-white font-bold shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
                                        Menyimpan...
                                    </>
                                ) : 'Simpan Profil'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Background elements */}
            <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
            <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        </div>
    );
}

