'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { userAPI, MitraApplicationResponse } from '@/lib/api/user';
import { AuthGuard } from '@/lib/components/AuthGuard';
import { LanguageSwitcher } from '@/lib/components/LanguageSwitcher';
import { useLanguage } from '@/lib/i18n/LanguageContext';

type DocumentType = 'nib' | 'akta_pendirian' | 'ktp_direktur';

interface FormData {
    company_name: string;
    company_type: 'PT' | 'CV' | 'UD';
    npwp: string;
    annual_revenue: '<1M' | '1M-5M' | '5M-25M' | '25M-100M' | '>100M';
    address: string;
    business_description: string;
    website_url: string;
    year_founded: number;
    key_products: string;
    export_markets: string;
}

const INITIAL_DATA: FormData = {
    company_name: '',
    company_type: 'PT',
    npwp: '',
    annual_revenue: '<1M',
    address: '',
    business_description: '',
    website_url: '',
    year_founded: new Date().getFullYear(),
    key_products: '',
    export_markets: '',
};

// Pending Approval Screen
function PendingApprovalScreen({ application }: { application?: MitraApplicationResponse }) {
    const { t } = useLanguage();
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
            <div className="max-w-lg w-full text-center">
                {/* Animated Icon */}
                <div className="relative mx-auto w-24 h-24 mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full opacity-20 animate-ping" />
                    <div className="relative w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-teal-600/20 rounded-full flex items-center justify-center border border-cyan-500/30 backdrop-blur-sm">
                        <svg className="w-12 h-12 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent mb-4">
                    {t('completeProfile.pending.title')}
                </h1>

                {/* Company Name */}
                {application?.application?.company_name && (
                    <div className="inline-block px-4 py-2 bg-slate-800/50 rounded-full border border-slate-700 mb-6">
                        <span className="text-slate-400 text-sm">{t('completeProfile.pending.company')}: </span>
                        <span className="text-white font-medium">{application.application.company_name}</span>
                    </div>
                )}

                {/* Description */}
                <p className="text-slate-400 mb-8 leading-relaxed">
                    {t('completeProfile.pending.description')}
                    <span className="text-cyan-400 font-medium"> {t('completeProfile.pending.duration')} </span>
                    {t('completeProfile.pending.descriptionEnd')}
                </p>

                {/* Status Card */}
                <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-400 text-sm">{t('completeProfile.pending.status')}</span>
                        <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-medium rounded-full border border-amber-500/20">
                            {t('completeProfile.pending.statusPending')}
                        </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full w-1/3 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full animate-pulse" />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-slate-500">
                        <span>{t('completeProfile.pending.statusSubmitted')}</span>
                        <span>{t('completeProfile.pending.statusReview')}</span>
                        <span>{t('completeProfile.pending.statusApproved')}</span>
                    </div>
                </div>

                {/* Info */}
                <p className="text-slate-500 text-sm">
                    {t('completeProfile.pending.notification')}
                </p>
            </div>
        </div>
    );
}

export default function CompleteProfilePage() {
    const router = useRouter();
    const { user, refreshProfile } = useAuth();
    const { t } = useLanguage();
    const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
    const [loading, setLoading] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState<1 | 2>(1);
    const [mitraStatus, setMitraStatus] = useState<MitraApplicationResponse | null>(null);

    const [docs, setDocs] = useState<Record<DocumentType, File | null>>({
        nib: null,
        akta_pendirian: null,
        ktp_direktur: null,
    });

    // Check mitra status on mount
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await userAPI.getMitraStatus();
                if (res.success && res.data) {
                    setMitraStatus(res.data);
                    // If approved, redirect to dashboard
                    if (res.data.application?.status === 'approved') {
                        router.push('/eksportir/dashboard');
                        return;
                    }
                }
            } catch (err) {
                console.error('Failed to check mitra status:', err);
            } finally {
                setCheckingStatus(false);
            }
        };
        checkStatus();
    }, [router]);

    useEffect(() => {
        if (user?.profile_completed) {
            router.push('/eksportir/dashboard');
        }
    }, [user, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (type: DocumentType, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setDocs(prev => ({ ...prev, [type]: e.target.files![0] }));
        }
    };

    const validateStep1 = () => {
        if (!formData.company_name) return t('completeProfile.validation.companyName');
        if (!formData.npwp) return t('completeProfile.validation.npwp');
        if (!formData.address) return t('completeProfile.validation.address');
        if (!formData.business_description) return t('completeProfile.validation.description');
        return null;
    };

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault();
        const err = validateStep1();
        if (err) {
            setError(err);
            return;
        }
        setError(null);
        setCurrentStep(2);
    };

    const handleBackStep = () => {
        setError(null);
        setCurrentStep(1);
    };

    const handleFinalSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            const applyRes = await userAPI.applyMitra({
                ...formData,
                year_founded: Number(formData.year_founded),
            });

            if (!applyRes.success) {
                throw new Error(applyRes.error?.message || 'Failed to submit application');
            }

            const types: DocumentType[] = ['nib', 'akta_pendirian', 'ktp_direktur'];
            for (const type of types) {
                if (docs[type]) {
                    const res = await userAPI.uploadMitraDocument(docs[type]!, type);
                    if (!res.success) throw new Error(res.error?.message || `Failed to upload ${type}`);
                }
            }

            await refreshProfile();
            // Refresh status to show pending screen
            const statusRes = await userAPI.getMitraStatus();
            if (statusRes.success && statusRes.data) {
                setMitraStatus(statusRes.data);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Loading state
    if (checkingStatus) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Show pending screen if already submitted
    if (mitraStatus?.application?.status === 'pending') {
        return (
            <AuthGuard allowedRoles={['mitra']}>
                <PendingApprovalScreen application={mitraStatus} />
            </AuthGuard>
        );
    }

    if (!user) return null;

    const inputClass = "w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 outline-none transition-all placeholder-slate-600 text-sm backdrop-blur-sm";
    const labelClass = "block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider";

    return (
        <AuthGuard allowedRoles={['mitra']}>
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
                <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Left Column - Header & Image */}
                    <div className="space-y-8">
                        {/* Logo */}
                        <div className="flex items-center space-x-2">
                            <Link href="/" className="group flex items-center space-x-2">
                                <Image
                                    src="/vessel-logo.png"
                                    alt="VESSEL Logo"
                                    width={120}
                                    height={32}
                                    className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
                                    priority
                                />
                            </Link>
                        </div>
                        {/* Header */}
                        <div>
                            <h1 key={`title-${currentStep}`} className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent mb-4 animate-in fade-in slide-in-from-left-4 duration-500">
                                {currentStep === 1 ? t('completeProfile.step1.title') : t('completeProfile.step2.title')}
                            </h1>
                            <p key={`subtitle-${currentStep}`} className="text-slate-400 text-lg mb-6 animate-in fade-in slide-in-from-left-4 duration-500 delay-75">
                                {currentStep === 1 ? t('completeProfile.step1.subtitle') : t('completeProfile.step2.subtitle')}
                            </p>

                            {/* Language Switcher */}
                            <div className="flex items-center gap-3 mb-8">
                                <span className="text-sm text-slate-500">{t('completeProfile.changeLanguage')}:</span>
                                <LanguageSwitcher />
                            </div>
                        </div>

                        {/* Large Image */}
                        <div className="relative w-full aspect-square max-w-lg">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 blur-3xl" />
                            <div className="relative w-full h-full">
                                <Image
                                    src="/assets/auth/company.png"
                                    alt="Company illustration"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Form Card */}
                    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm shadow-2xl shadow-black/20">
                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </div>
                        )}

                        {currentStep === 1 ? (
                            <form onSubmit={handleNextStep} key="step-1" className="animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="grid grid-cols-6 gap-4">
                                    <div className="col-span-6 md:col-span-3">
                                        <label className={labelClass}>{t('completeProfile.form.companyName')}</label>
                                        <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} className={inputClass} placeholder={t('completeProfile.form.companyNamePlaceholder')} />
                                    </div>
                                    <div className="col-span-3 md:col-span-2">
                                        <label className={labelClass}>{t('completeProfile.form.type')}</label>
                                        <select name="company_type" value={formData.company_type} onChange={handleChange} className={inputClass}>
                                            <option value="PT">{t('completeProfile.form.typePT')}</option>
                                            <option value="CV">{t('completeProfile.form.typeCV')}</option>
                                            <option value="UD">{t('completeProfile.form.typeUD')}</option>
                                        </select>
                                    </div>
                                    <div className="col-span-3 md:col-span-1">
                                        <label className={labelClass}>{t('completeProfile.form.year')}</label>
                                        <input type="number" name="year_founded" value={formData.year_founded} onChange={handleChange} className={inputClass} />
                                    </div>
                                    <div className="col-span-6 md:col-span-3">
                                        <label className={labelClass}>{t('completeProfile.form.npwp')}</label>
                                        <input type="text" name="npwp" value={formData.npwp} onChange={handleChange} className={inputClass} placeholder={t('completeProfile.form.npwpPlaceholder')} />
                                    </div>
                                    <div className="col-span-6 md:col-span-3">
                                        <label className={labelClass}>{t('completeProfile.form.annualRevenue')}</label>
                                        <select name="annual_revenue" value={formData.annual_revenue} onChange={handleChange} className={inputClass}>
                                            <option value="<1M">{t('completeProfile.form.revenue1')}</option>
                                            <option value="1M-5M">{t('completeProfile.form.revenue2')}</option>
                                            <option value="5M-25M">{t('completeProfile.form.revenue3')}</option>
                                            <option value="25M-100M">{t('completeProfile.form.revenue4')}</option>
                                            <option value=">100M">{t('completeProfile.form.revenue5')}</option>
                                        </select>
                                    </div>
                                    <div className="col-span-6">
                                        <label className={labelClass}>{t('completeProfile.form.address')}</label>
                                        <input type="text" name="address" value={formData.address} onChange={handleChange} className={inputClass} placeholder={t('completeProfile.form.addressPlaceholder')} />
                                    </div>
                                    <div className="col-span-6">
                                        <label className={labelClass}>{t('completeProfile.form.description')}</label>
                                        <textarea name="business_description" value={formData.business_description} onChange={handleChange} rows={2} className={inputClass} placeholder={t('completeProfile.form.descriptionPlaceholder')} />
                                    </div>
                                    <div className="col-span-6 md:col-span-2">
                                        <label className={labelClass}>{t('completeProfile.form.website')}</label>
                                        <input type="text" name="website_url" value={formData.website_url} onChange={handleChange} className={inputClass} placeholder="example.com" />
                                    </div>
                                    <div className="col-span-3 md:col-span-2">
                                        <label className={labelClass}>{t('completeProfile.form.keyProducts')}</label>
                                        <input type="text" name="key_products" value={formData.key_products} onChange={handleChange} className={inputClass} placeholder={t('completeProfile.form.keyProductsPlaceholder')} />
                                    </div>
                                    <div className="col-span-3 md:col-span-2">
                                        <label className={labelClass}>{t('completeProfile.form.exportMarkets')}</label>
                                        <input type="text" name="export_markets" value={formData.export_markets} onChange={handleChange} className={inputClass} placeholder={t('completeProfile.form.exportMarketsPlaceholder')} />
                                    </div>
                                </div>
                                <div className="mt-8 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-slate-400">{t('completeProfile.page')} {currentStep} {t('completeProfile.of')} 2</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-cyan-400" />
                                            <div className="w-2 h-2 rounded-full bg-slate-600" />
                                        </div>
                                    </div>
                                    <button type="submit" className="group px-8 py-3 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2">
                                        {t('completeProfile.continue')}
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div key="step-2" className="animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    {(['nib', 'akta_pendirian', 'ktp_direktur'] as DocumentType[]).map((type) => (
                                        <div key={type} className={`relative p-6 rounded-xl border-2 border-dashed transition-all ${docs[type] ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-slate-700/50 bg-slate-900/30 hover:border-slate-600'}`}>
                                            <div className="text-center">
                                                <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${docs[type] ? 'bg-cyan-500/20' : 'bg-slate-800'}`}>
                                                    {docs[type] ? (
                                                        <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <p className="text-sm font-medium text-slate-300 mb-1 capitalize">{t(`completeProfile.documents.${type}`)}</p>
                                                {docs[type] ? (
                                                    <p className="text-xs text-cyan-400 truncate max-w-full">{docs[type]!.name}</p>
                                                ) : (
                                                    <p className="text-xs text-slate-500">{t('completeProfile.documents.fileTypes')}</p>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                onChange={(e) => handleFileChange(type, e)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <button
                                            type="button"
                                            onClick={handleBackStep}
                                            className="group px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 font-medium rounded-xl transition-all border border-slate-700/50 flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                            {t('completeProfile.back')}
                                        </button>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-slate-400">{t('completeProfile.page')} {currentStep} {t('completeProfile.of')} 2</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-slate-600" />
                                                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleFinalSubmit}
                                        disabled={loading}
                                        className="group px-8 py-3 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                {t('completeProfile.submitting')}
                                            </>
                                        ) : (
                                            <>
                                                {t('completeProfile.submit')}
                                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
