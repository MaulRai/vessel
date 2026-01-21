'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { userAPI, MitraApplicationResponse } from '@/lib/api/user';
import { AuthGuard } from '@/lib/components/AuthGuard';

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
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
            <div className="max-w-lg w-full text-center">
                {/* Animated Icon */}
                <div className="relative mx-auto w-24 h-24 mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full opacity-20 animate-ping" />
                    <div className="relative w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full flex items-center justify-center border border-cyan-500/30 backdrop-blur-sm">
                        <svg className="w-12 h-12 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                    Application Under Review
                </h1>

                {/* Company Name */}
                {application?.application?.company_name && (
                    <div className="inline-block px-4 py-2 bg-slate-800/50 rounded-full border border-slate-700 mb-6">
                        <span className="text-slate-400 text-sm">Company: </span>
                        <span className="text-white font-medium">{application.application.company_name}</span>
                    </div>
                )}

                {/* Description */}
                <p className="text-slate-400 mb-8 leading-relaxed">
                    Your application has been submitted successfully and is currently being reviewed by our team.
                    This process typically takes <span className="text-cyan-400 font-medium">1-3 business days</span>.
                </p>

                {/* Status Card */}
                <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-400 text-sm">Status</span>
                        <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-medium rounded-full border border-amber-500/20">
                            Pending Review
                        </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full w-1/3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-pulse" />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-slate-500">
                        <span>Submitted</span>
                        <span>Under Review</span>
                        <span>Approved</span>
                    </div>
                </div>

                {/* Info */}
                <p className="text-slate-500 text-sm">
                    You will receive an email notification once your application has been reviewed.
                </p>
            </div>
        </div>
    );
}

export default function CompleteProfilePage() {
    const router = useRouter();
    const { user, refreshProfile } = useAuth();
    const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
    const [loading, setLoading] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
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
        if (!formData.company_name) return 'Company Name is required';
        if (!formData.npwp) return 'NPWP is required';
        if (!formData.address) return 'Address is required';
        if (!formData.business_description) return 'Description is required';
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
                <div className="w-full max-w-4xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-full border border-slate-700/50 mb-4">
                            <div className={`w-2 h-2 rounded-full ${currentStep === 1 ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                            <div className={`w-8 h-0.5 ${currentStep === 2 ? 'bg-cyan-400' : 'bg-slate-700'}`} />
                            <div className={`w-2 h-2 rounded-full ${currentStep === 2 ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                        </div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                            {currentStep === 1 ? 'Company Information' : 'Upload Documents'}
                        </h1>
                        <p className="mt-2 text-slate-500 text-sm">
                            {currentStep === 1 ? 'Tell us about your business' : 'Upload required legal documents'}
                        </p>
                    </div>

                    {/* Card */}
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
                            <form onSubmit={handleNextStep}>
                                <div className="grid grid-cols-6 gap-4">
                                    <div className="col-span-6 md:col-span-3">
                                        <label className={labelClass}>Company Name *</label>
                                        <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} className={inputClass} placeholder="PT Maju Jaya" />
                                    </div>
                                    <div className="col-span-3 md:col-span-2">
                                        <label className={labelClass}>Type</label>
                                        <select name="company_type" value={formData.company_type} onChange={handleChange} className={inputClass}>
                                            <option value="PT">PT</option>
                                            <option value="CV">CV</option>
                                            <option value="UD">UD</option>
                                        </select>
                                    </div>
                                    <div className="col-span-3 md:col-span-1">
                                        <label className={labelClass}>Year</label>
                                        <input type="number" name="year_founded" value={formData.year_founded} onChange={handleChange} className={inputClass} />
                                    </div>
                                    <div className="col-span-6 md:col-span-3">
                                        <label className={labelClass}>NPWP *</label>
                                        <input type="text" name="npwp" value={formData.npwp} onChange={handleChange} className={inputClass} placeholder="00.000.000.0-000.000" />
                                    </div>
                                    <div className="col-span-6 md:col-span-3">
                                        <label className={labelClass}>Annual Revenue</label>
                                        <select name="annual_revenue" value={formData.annual_revenue} onChange={handleChange} className={inputClass}>
                                            <option value="<1M">&lt; 1 Billion IDR</option>
                                            <option value="1M-5M">1 - 5 Billion IDR</option>
                                            <option value="5M-25M">5 - 25 Billion IDR</option>
                                            <option value="25M-100M">25 - 100 Billion IDR</option>
                                            <option value=">100M">&gt; 100 Billion IDR</option>
                                        </select>
                                    </div>
                                    <div className="col-span-6">
                                        <label className={labelClass}>Business Address *</label>
                                        <input type="text" name="address" value={formData.address} onChange={handleChange} className={inputClass} placeholder="Jl. Sudirman No. 1, Jakarta" />
                                    </div>
                                    <div className="col-span-6">
                                        <label className={labelClass}>Business Description *</label>
                                        <textarea name="business_description" value={formData.business_description} onChange={handleChange} rows={2} className={inputClass} placeholder="Describe your business activities and export experience" />
                                    </div>
                                    <div className="col-span-6 md:col-span-2">
                                        <label className={labelClass}>Website</label>
                                        <input type="url" name="website_url" value={formData.website_url} onChange={handleChange} className={inputClass} placeholder="https://" />
                                    </div>
                                    <div className="col-span-3 md:col-span-2">
                                        <label className={labelClass}>Key Products</label>
                                        <input type="text" name="key_products" value={formData.key_products} onChange={handleChange} className={inputClass} placeholder="Coffee, Furniture" />
                                    </div>
                                    <div className="col-span-3 md:col-span-2">
                                        <label className={labelClass}>Export Markets</label>
                                        <input type="text" name="export_markets" value={formData.export_markets} onChange={handleChange} className={inputClass} placeholder="USA, Europe, Asia" />
                                    </div>
                                </div>
                                <div className="mt-8 flex justify-end">
                                    <button type="submit" className="group px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2">
                                        Continue
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div>
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
                                                <p className="text-sm font-medium text-slate-300 mb-1 capitalize">{type.replace(/_/g, ' ')}</p>
                                                {docs[type] ? (
                                                    <p className="text-xs text-cyan-400 truncate max-w-full">{docs[type]!.name}</p>
                                                ) : (
                                                    <p className="text-xs text-slate-500">PDF, JPG, PNG (max 10MB)</p>
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
                                <div className="flex justify-between">
                                    <button
                                        type="button"
                                        onClick={handleBackStep}
                                        className="group px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 font-medium rounded-xl transition-all border border-slate-700/50 flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Back
                                    </button>
                                    <button
                                        onClick={handleFinalSubmit}
                                        disabled={loading}
                                        className="group px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                Submit Application
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
