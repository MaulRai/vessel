'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { userAPI, CompleteProfileRequest } from '@/lib/api/user';

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
}

export default function CompleteProfilePage() {
    const { user, isLoading: authLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        phone: '',
        nik: '',
        ktpPhotoUrl: '',
        selfieUrl: '',
        bankCode: '',
        accountNumber: '',
        accountName: '',
    });

    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) {
                router.push('/login');
                return;
            }

            // Redirect if already completed
            if (user?.profile_completed) {
                if (user?.role === 'investor') {
                    router.push('/pendana/dashboard');
                } else if (user?.role === 'mitra') {
                    router.push('/eksportir/dashboard');
                }
            }
        }
    }, [authLoading, isAuthenticated, user, router]);

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
        if (res.success) {
            // Redirect based on role
            if (user?.role === 'mitra') {
                router.push('/eksportir/dashboard');
            } else {
                router.push('/pendana/dashboard');
            }
        } else {
            setError(res.error?.message || 'Gagal menyimpan profil');
        }
    };

    // ================== SHARED ==================

    const fail = (msg: string) => { setError(msg); return false; };

    const [uploadingField, setUploadingField] = useState<string | null>(null);
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'ktpPhotoUrl' | 'selfieUrl') => {
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
                                                <input type="file" className="hidden" id={field} onChange={e => handleUpload(e, field)} disabled={!!uploadingField} />
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

