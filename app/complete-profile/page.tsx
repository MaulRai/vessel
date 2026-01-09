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

    if (authLoading || loadingMitra) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
            </div>
        );
    }

    // MITRA RENDER
    if (user?.role === 'mitra') {
        const app = mitraStatus?.application;
        // Case 1: Waiting for Approval (Everything submitted)
        if (app && mitraStatus?.is_complete && app.status === 'pending') {
            return (
                <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Menunggu Persetujuan</h2>
                        <p className="text-slate-400 mb-6">
                            Aplikasi Anda sedang ditinjau oleh tim kami. Proses ini biasanya memakan waktu 1-2 hari kerja.
                        </p>
                        <button onClick={() => window.location.reload()} className="text-cyan-400 hover:text-cyan-300 text-sm">
                            Cek Status
                        </button>
                    </div>
                </div>
            );
        }

        // Case 2: Document Upload Phase (Application submitted)
        if (app && app.status === 'pending') {
            const docs = mitraStatus?.documents_status;
            return (
                <div className="min-h-screen bg-slate-950 py-12 px-4">
                    <div className="max-w-2xl mx-auto">
                        <h1 className="text-3xl font-bold text-white mb-8 text-center">Upload Dokumen Legalitas</h1>
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
                            {error && <div className="p-3 mb-4 bg-red-500/10 text-red-400 rounded-lg">{error}</div>}

                            <div className="space-y-6">
                                {[
                                    { id: 'nib', label: 'NIB (Nomor Induk Berusaha)', done: docs?.nib },
                                    { id: 'akta_pendirian', label: 'Akta Pendirian', done: docs?.akta_pendirian },
                                    { id: 'ktp_direktur', label: 'KTP Direktur', done: docs?.ktp_direktur }
                                ].map((doc) => (
                                    <div key={doc.id} className="border border-slate-700 rounded-lg p-4 flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-slate-200">{doc.label}</p>
                                            <p className="text-sm text-slate-500">{doc.done ? 'Terupload' : 'Format PDF maks 10MB'}</p>
                                        </div>
                                        {doc.done ? (
                                            <span className="text-green-400 flex items-center">
                                                <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Selesai
                                            </span>
                                        ) : (
                                            <div>
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
                                                    className={`px-4 py-2 rounded-lg text-sm cursor-pointer ${uploadingDoc === doc.id ? 'bg-slate-800 text-slate-500' : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                                                        }`}
                                                >
                                                    {uploadingDoc === doc.id ? 'Uploading...' : 'Upload PDF'}
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {mitraStatus?.is_complete && (
                                <div className="mt-8 text-center">
                                    <p className="text-green-400 mb-4">Semua dokumen lengkap!</p>
                                    <button onClick={() => window.location.reload()} className="px-6 py-2 bg-green-600 text-white rounded-lg">
                                        Refresh Status
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        // Case 3: Initial Application Form
        return (
            <div className="min-h-screen bg-slate-950 py-12 px-4">
                <div className="max-w-xl mx-auto">
                    <h1 className="text-3xl font-bold text-white mb-2 text-center">Pengajuan Mitra</h1>
                    <p className="text-slate-400 text-center mb-8">Daftarkan perusahaan Anda untuk mendapatkan pendanaan.</p>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                        {error && <div className="p-3 mb-4 bg-red-500/10 text-red-400 rounded-lg">{error}</div>}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Nama Perusahaan</label>
                                <input
                                    type="text"
                                    value={formData.companyName}
                                    onChange={(e) => updateFormData('companyName', e.target.value)}
                                    className="w-full bg-slate-800 border-slate-700 rounded-lg px-4 py-2 text-white"
                                    placeholder="Nama Perusahaan"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Badan Hukum</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['PT', 'CV', 'UD'] as const).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setFormData(p => ({ ...p, companyType: type }))}
                                            className={`py-2 rounded-lg border ${formData.companyType === type
                                                ? 'bg-cyan-900/50 border-cyan-500 text-cyan-400'
                                                : 'border-slate-700 text-slate-400'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">NPWP Perusahaan</label>
                                <input
                                    type="text"
                                    value={formData.npwp}
                                    onChange={(e) => updateFormData('npwp', e.target.value.replace(/\D/g, ''))}
                                    className="w-full bg-slate-800 border-slate-700 rounded-lg px-4 py-2 text-white"
                                    placeholder="Contoh: 013456789012000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Tahun Berdiri</label>
                                <input
                                    type="number"
                                    value={formData.yearFounded}
                                    onChange={(e) => updateFormData('yearFounded', e.target.value)}
                                    className="w-full bg-slate-800 border-slate-700 rounded-lg px-4 py-2 text-white"
                                    placeholder="2010"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Alamat Perusahaan</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => updateFormData('address', e.target.value)}
                                    className="w-full bg-slate-800 border-slate-700 rounded-lg px-4 py-2 text-white"
                                    placeholder="Alamat lengkap..."
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Deskripsi Bisnis</label>
                                <textarea
                                    value={formData.businessDescription}
                                    onChange={(e) => updateFormData('businessDescription', e.target.value)}
                                    className="w-full bg-slate-800 border-slate-700 rounded-lg px-4 py-2 text-white"
                                    placeholder="Jelaskan bisnis Anda secara singkat..."
                                    rows={4}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Produk Utama</label>
                                <input
                                    type="text"
                                    value={formData.keyProducts}
                                    onChange={(e) => updateFormData('keyProducts', e.target.value)}
                                    className="w-full bg-slate-800 border-slate-700 rounded-lg px-4 py-2 text-white"
                                    placeholder="Kopi Arabika, Kakao, Furniture..."
                                />
                                <p className="text-xs text-slate-500 mt-1">Pisahkan dengan koma</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Pasar Ekspor Utama</label>
                                <input
                                    type="text"
                                    value={formData.exportMarkets}
                                    onChange={(e) => updateFormData('exportMarkets', e.target.value)}
                                    className="w-full bg-slate-800 border-slate-700 rounded-lg px-4 py-2 text-white"
                                    placeholder="Amerika Serikat, Jepang, Eropa..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Website (Opsional)</label>
                                <input
                                    type="url"
                                    value={formData.websiteUrl}
                                    onChange={(e) => updateFormData('websiteUrl', e.target.value)}
                                    className="w-full bg-slate-800 border-slate-700 rounded-lg px-4 py-2 text-white"
                                    placeholder="https://"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Pendapatan Tahunan</label>
                                <select
                                    value={formData.annualRevenue}
                                    onChange={(e) => setFormData(p => ({ ...p, annualRevenue: e.target.value as any }))}
                                    className="w-full bg-slate-800 border-slate-700 rounded-lg px-4 py-2 text-white"
                                >
                                    <option value="<1M">Kurang dari RP 1 Miliar</option>
                                    <option value="1M-5M">Rp 1 M - Rp 5 M</option>
                                    <option value="5M-25M">Rp 5 M - Rp 25 M</option>
                                    <option value="25M-100M">Rp 25 M - Rp 100 M</option>
                                    <option value=">100M">Lebih dari Rp 100 Miliar</option>
                                </select>
                            </div>
                            <button
                                onClick={handleMitraApply}
                                disabled={isSubmitting}
                                className="w-full mt-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-lg text-white font-bold hover:opacity-90 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Memproses...' : 'Lanjut Upload Dokumen'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // INVESTOR RENDER
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent mb-2">
                        Lengkapi Profil Anda
                    </h1>
                    <p className="text-slate-400">Silakan lengkapi data berikut untuk mengakses semua fitur</p>
                </div>

                <div className="flex items-center justify-center mb-8">
                    {[
                        { number: 1, title: 'Data Diri' },
                        { number: 2, title: 'Verifikasi' },
                        { number: 3, title: 'Rekening' }
                    ].map((step, index) => (
                        <div key={step.number} className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${currentStep >= step.number ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white' : 'bg-slate-700 text-slate-400'
                                }`}>
                                {step.number}
                            </div>
                            <span className={`ml-2 text-sm hidden sm:block ${currentStep >= step.number ? 'text-slate-200' : 'text-slate-500'}`}>
                                {step.title}
                            </span>
                            {index < 2 && <div className={`w-12 h-1 mx-4 rounded ${currentStep > step.number ? 'bg-cyan-500' : 'bg-slate-700'}`} />}
                        </div>
                    ))}
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8">
                    {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">{error}</div>}

                    {/* Step 1: Personal Data */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm text-slate-300 mb-2">Nama Lengkap (Sesuai KTP)</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={e => updateFormData('fullName', e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white"
                                    placeholder="Nama Lengkap"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-300 mb-2">Nomor Telepon</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={e => updateFormData('phone', e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white"
                                    placeholder="08xxxxxxxxxx"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: KYC */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm text-slate-300 mb-2">NIK (16 Digit)</label>
                                <input
                                    type="text"
                                    value={formData.nik}
                                    onChange={e => updateFormData('nik', e.target.value.replace(/\D/g, '').slice(0, 16))}
                                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white"
                                    placeholder="16 digit NIK"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {(['ktpPhotoUrl', 'selfieUrl'] as const).map(field => (
                                    <div key={field} className="border-2 border-dashed border-slate-600 rounded-lg p-4 text-center">
                                        {formData[field] ? (
                                            <div className="text-green-400 text-sm">Terupload</div>
                                        ) : (
                                            <>
                                                <label className="block text-sm text-slate-400 mb-2">
                                                    {field === 'ktpPhotoUrl' ? 'Foto KTP' : 'Selfie + KTP'}
                                                </label>
                                                <input type="file" className="hidden" id={field} onChange={e => handleInvestorUpload(e, field)} disabled={!!uploadingField} />
                                                <label htmlFor={field} className="px-3 py-1 bg-slate-700 rounded text-sm cursor-pointer hover:bg-slate-600">
                                                    {uploadingField === field ? '...' : 'Upload'}
                                                </label>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Bank */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm text-slate-300 mb-2">Bank</label>
                                <select
                                    value={formData.bankCode}
                                    onChange={e => updateFormData('bankCode', e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white"
                                >
                                    <option value="">Pilih Bank</option>
                                    {SUPPORTED_BANKS.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-300 mb-2">Nomor Rekening</label>
                                <input
                                    type="text"
                                    value={formData.accountNumber}
                                    onChange={e => updateFormData('accountNumber', e.target.value.replace(/\D/g, ''))}
                                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-300 mb-2">Nama Pemilik Rekening</label>
                                <input
                                    type="text"
                                    value={formData.accountName}
                                    onChange={e => updateFormData('accountName', e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between mt-8 pt-6 border-t border-slate-700">
                        {currentStep > 1 && <button onClick={() => setCurrentStep(p => Math.max(p - 1, 1) as Step)} className="px-6 py-2 bg-slate-700 rounded-lg text-white">Kembali</button>}
                        {currentStep < 3 ? (
                            <button onClick={() => { if (validateInvestorStep(currentStep)) setCurrentStep(p => Math.min(p + 1, 3) as Step) }} className="px-6 py-2 bg-cyan-600 rounded-lg text-white ml-auto">Lanjut</button>
                        ) : (
                            <button onClick={handleInvestorSubmit} disabled={isSubmitting} className="px-6 py-2 bg-cyan-600 rounded-lg text-white ml-auto">
                                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
