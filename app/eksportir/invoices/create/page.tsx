'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthGuard } from '@/lib/components/AuthGuard';
import { DashboardLayout } from '@/lib/components/DashboardLayout';
import { invoiceAPI, CreateInvoiceRequest } from '@/lib/api/user';
import { useAuth } from '@/lib/context/AuthContext';

interface UploadedFile {
  name: string;
  size: number;
  file: File;
}

interface Step1Data {
  buyerCompanyName: string;
  buyerCountry: string;
  buyerEmail: string;
  invoiceNumber: string;
  currency: string;
  originalAmount: string;
  lockedExchangeRate: string;
  idrAmount: string;
  dueDate: string;
  fundingDuration: string;
  priorityRatio: string;
  catalystRatio: string;
  priorityInterestRate: string;
  catalystInterestRate: string;
}

interface Step2Data {
  commercialInvoice: UploadedFile | null;
  billOfLading: UploadedFile | null;
  purchaseOrder: UploadedFile | null;
}

interface Step3Data {
  isRepeatBuyer: boolean;
  repeatBuyerVerified: boolean;
  fundingLimit: number;
  previousTransferProof: UploadedFile | null;
}

function Stepper({ currentStep, onStepClick }: { currentStep: number; onStepClick: (step: number) => void }) {
  const steps = [
    { number: 1, label: 'Data Pendanaan' },
    { number: 2, label: 'Dokumen' },
    { number: 3, label: 'Riwayat' },
    { number: 4, label: 'Konfirmasi' }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <button
                onClick={() => onStepClick(step.number)}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${currentStep === step.number
                  ? 'bg-teal-500 text-white ring-4 ring-teal-500/30'
                  : currentStep > step.number
                    ? 'bg-teal-500 text-white hover:bg-teal-400'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
              >
                {currentStep > step.number ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  step.number
                )}
              </button>
              <span className={`mt-2 text-xs font-medium ${currentStep === step.number ? 'text-teal-400' : currentStep > step.number ? 'text-teal-500' : 'text-slate-400'
                }`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mx-2 mb-6 ${currentStep > step.number ? 'bg-teal-500' : 'bg-slate-700'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function UploadCard({
  label,
  file,
  onChange,
  onRemove,
  required = false,
  error
}: {
  label: string;
  file: UploadedFile | null;
  onChange: (file: File) => void;
  onRemove: () => void;
  required?: boolean;
  error?: string;
}) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.size <= 10 * 1024 * 1024) {
      onChange(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.size <= 10 * 1024 * 1024) {
      onChange(selectedFile);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>

      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${isDragging ? 'border-teal-500 bg-teal-950/30' : error ? 'border-red-500 bg-red-950/20' : 'border-slate-600 bg-slate-900/30 hover:border-slate-500'
            }`}
        >
          <svg className="w-12 h-12 mx-auto text-slate-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm text-slate-300 mb-2">
            Seret & lepas file atau{' '}
            <label className="text-teal-400 hover:text-teal-300 cursor-pointer font-medium">
              pilih file
              <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileSelect} />
            </label>
          </p>
          <p className="text-xs text-slate-500">PDF, JPG, PNG (Maks 10MB)</p>
        </div>
      ) : (
        <div className="border border-slate-600 rounded-lg p-4 bg-slate-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <svg className="w-8 h-8 text-teal-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
                <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <button type="button" onClick={onRemove} className="ml-3 text-red-400 hover:text-red-300 text-sm font-medium flex-shrink-0">
              Hapus
            </button>
          </div>
        </div>
      )}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function CreateInvoiceContent() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdInvoiceId, setCreatedInvoiceId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checkingBuyer, setCheckingBuyer] = useState(false);

  const [step1Data, setStep1Data] = useState<Step1Data>({
    buyerCompanyName: '',
    buyerCountry: '',
    buyerEmail: '',
    invoiceNumber: '',
    currency: 'IDRX',
    originalAmount: '',
    lockedExchangeRate: '1',
    idrAmount: '',
    dueDate: '',
    fundingDuration: '14',
    priorityRatio: '80',
    catalystRatio: '20',
    priorityInterestRate: '10',
    catalystInterestRate: '15'
  });

  const [step2Data, setStep2Data] = useState<Step2Data>({
    commercialInvoice: null,
    billOfLading: null,
    purchaseOrder: null
  });

  const [step3Data, setStep3Data] = useState<Step3Data>({
    isRepeatBuyer: false,
    repeatBuyerVerified: false,
    fundingLimit: 60,
    previousTransferProof: null
  });

  const [acknowledgement, setAcknowledgement] = useState(false);
  const [dataConfirmation, setDataConfirmation] = useState(false);

  const dueDateInputRef = useRef<HTMLInputElement | null>(null);
  const todayJakarta = useMemo(
    () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date()),
    []
  );

  useEffect(() => {
    // IDRX is 1:1 with IDR in terms of value representation (Token Unit)
    // or simply, IDRX amount IS the amount.
    // originalAmount is in IDRX.
    setStep1Data(prev => ({ ...prev, idrAmount: prev.originalAmount }));
  }, [step1Data.originalAmount]);

  const handleCheckRepeatBuyer = async () => {
    if (!step1Data.buyerCompanyName.trim()) return;

    setCheckingBuyer(true);
    try {
      const res = await invoiceAPI.checkRepeatBuyer(step1Data.buyerCompanyName);
      if (res.success && res.data) {
        setStep3Data(prev => ({
          ...prev,
          isRepeatBuyer: res.data!.is_repeat_buyer,
          repeatBuyerVerified: true,
          fundingLimit: res.data!.funding_limit
        }));
      }
    } catch (err) {
      console.error('Failed to check repeat buyer', err);
    } finally {
      setCheckingBuyer(false);
    }
  };

  const handleFileUpload = (field: keyof Step2Data | 'previousTransferProof', file: File) => {
    if (field === 'previousTransferProof') {
      setStep3Data(prev => ({ ...prev, previousTransferProof: { name: file.name, size: file.size, file } }));
    } else {
      setStep2Data(prev => ({ ...prev, [field]: { name: file.name, size: file.size, file } }));
    }
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleFileRemove = (field: keyof Step2Data | 'previousTransferProof') => {
    if (field === 'previousTransferProof') {
      setStep3Data(prev => ({ ...prev, previousTransferProof: null }));
    } else {
      setStep2Data(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!step1Data.buyerCompanyName.trim()) newErrors.buyerCompanyName = 'Nama perusahaan importir harus diisi';
    if (!step1Data.buyerCountry) newErrors.buyerCountry = 'Negara tujuan harus dipilih';
    if (!step1Data.buyerEmail.trim()) newErrors.buyerEmail = 'Email buyer harus diisi';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(step1Data.buyerEmail)) newErrors.buyerEmail = 'Format email tidak valid';
    if (!step1Data.invoiceNumber.trim()) newErrors.invoiceNumber = 'Nomor invoice harus diisi';
    if (!step1Data.originalAmount) newErrors.originalAmount = 'Nominal invoice harus diisi';
    if (!step1Data.dueDate) newErrors.dueDate = 'Tanggal jatuh tempo harus diisi';
    else if (step1Data.dueDate < todayJakarta) newErrors.dueDate = 'Tanggal jatuh tempo tidak boleh sebelum hari ini';

    const durationValue = parseInt(step1Data.fundingDuration, 10);
    if (!step1Data.fundingDuration) newErrors.fundingDuration = 'Durasi pendanaan harus diisi';
    else if (Number.isNaN(durationValue) || durationValue < 3 || durationValue > 14) newErrors.fundingDuration = 'Durasi harus antara 3 hingga 14 hari';

    if (!walletAddress) newErrors.walletAddress = 'Wallet harus terhubung untuk menerima dana IDRX';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!step2Data.commercialInvoice) newErrors.commercialInvoice = 'Commercial Invoice harus diunggah';
    if (!step2Data.billOfLading) newErrors.billOfLading = 'Bill of Lading harus diunggah';
    if (!step2Data.purchaseOrder) newErrors.purchaseOrder = 'Purchase Order harus diunggah';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = true;
    if (currentStep === 1) isValid = validateStep1();
    if (currentStep === 2) isValid = validateStep2();

    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepClick = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const { user } = useAuth();
  const [showWalletAlert, setShowWalletAlert] = useState(false);

  useEffect(() => {
    if (user?.wallet_address && !walletAddress && !isSubmitted) {
      setWalletAddress(user.wallet_address);
      setShowWalletAlert(true);
    }
  }, [user, walletAddress, isSubmitted]);

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('MetaMask not found!');
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
      }
    } catch (err) {
      console.error('Failed to connect wallet', err);
      alert('Failed to connect wallet');
    }
  };

  const handleSubmit = async () => {
    if (!validateStep1() || !validateStep2()) {
      alert('Mohon lengkapi semua data yang diperlukan');
      return;
    }

    if (!acknowledgement || !dataConfirmation) {
      alert('Mohon setujui semua pernyataan untuk melanjutkan');
      return;
    }

    if (!walletAddress) {
      alert('Wallet must be connected');
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData: CreateInvoiceRequest = {
        buyer_company_name: step1Data.buyerCompanyName,
        buyer_country: step1Data.buyerCountry,
        buyer_email: step1Data.buyerEmail,
        invoice_number: step1Data.invoiceNumber,
        original_currency: step1Data.currency,
        original_amount: parseFloat(step1Data.originalAmount),
        locked_exchange_rate: parseFloat(step1Data.lockedExchangeRate),
        idr_amount: parseFloat(step1Data.idrAmount),
        due_date: step1Data.dueDate,
        funding_duration_days: parseInt(step1Data.fundingDuration),
        priority_ratio: parseFloat(step1Data.priorityRatio),
        catalyst_ratio: parseFloat(step1Data.catalystRatio),
        priority_interest_rate: parseFloat(step1Data.priorityInterestRate),
        catalyst_interest_rate: parseFloat(step1Data.catalystInterestRate),
        is_repeat_buyer: step3Data.isRepeatBuyer,
        data_confirmation: dataConfirmation,
        wallet_address: walletAddress
      };

      const res = await invoiceAPI.createFundingRequest(requestData);

      if (res.success && res.data) {
        const invoiceId = res.data.id;
        setCreatedInvoiceId(invoiceId);

        // Upload documents and check for failures
        const uploadErrors: string[] = [];

        if (step2Data.commercialInvoice) {
          const uploadRes = await invoiceAPI.uploadDocument(invoiceId, step2Data.commercialInvoice.file, 'commercial_invoice');
          if (!uploadRes.success) uploadErrors.push('Commercial Invoice: ' + (uploadRes.error?.message || 'Upload gagal'));
        }
        if (step2Data.billOfLading) {
          const uploadRes = await invoiceAPI.uploadDocument(invoiceId, step2Data.billOfLading.file, 'bill_of_lading');
          if (!uploadRes.success) uploadErrors.push('Bill of Lading: ' + (uploadRes.error?.message || 'Upload gagal'));
        }
        if (step2Data.purchaseOrder) {
          const uploadRes = await invoiceAPI.uploadDocument(invoiceId, step2Data.purchaseOrder.file, 'purchase_order');
          if (!uploadRes.success) uploadErrors.push('Purchase Order: ' + (uploadRes.error?.message || 'Upload gagal'));
        }

        if (uploadErrors.length > 0) {
          alert('Gagal mengupload dokumen:\n' + uploadErrors.join('\n'));
          return;
        }

        // Submit invoice for admin review (changes status from 'draft' to 'pending_review')
        const submitRes = await invoiceAPI.submitInvoice(invoiceId);
        if (!submitRes.success) {
          console.error('Failed to submit invoice for review:', submitRes.error);
          alert('Invoice berhasil dibuat tetapi gagal disubmit untuk review: ' + (submitRes.error?.message || 'Unknown error'));
          return;
        }

        setIsSubmitted(true);
      } else {
        alert(res.error?.message || 'Gagal membuat invoice');
      }
    } catch (err) {
      console.error('Failed to submit', err);
      alert('Terjadi kesalahan saat mengirim permohonan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateEstimatedFunds = (): string => {
    const idrAmount = parseFloat(step1Data.idrAmount) || 0;
    const percentage = step3Data.fundingLimit / 100;
    const estimated = idrAmount * percentage;
    return new Intl.NumberFormat('id-ID').format(Math.floor(estimated));
  };

  if (isSubmitted) {
    return (
      <DashboardLayout role="mitra">
        <div className="max-w-3xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-100 mb-3">Permohonan Berhasil Dikirim</h2>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Permohonan pendanaan invoice berhasil dikirim untuk review. Tim admin akan meninjau dan memberikan respons dalam 1-3 hari kerja.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/eksportir/invoices"
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-medium rounded-lg transition-all shadow-lg"
                >
                  Lihat Daftar Invoice
                </Link>
                <Link
                  href="/eksportir/dashboard"
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-lg transition-all"
                >
                  Kembali ke Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="mitra">
      {showWalletAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-800 border border-teal-500/50 rounded-xl p-6 max-w-md w-full shadow-2xl scale-100 animate-in zoom-in-95">
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Wallet Terhubung!</h3>
              <p className="text-slate-300 text-sm mb-6">
                Akun Anda telah terhubung dengan wallet:<br />
                <span className="font-mono text-teal-400">{user?.wallet_address}</span>
              </p>
              <button
                onClick={() => setShowWalletAlert(false)}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-lg transition-colors"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/eksportir/invoices"
            className="inline-flex items-center text-teal-400 hover:text-teal-300 text-sm font-medium mb-4 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Kembali
          </Link>
          <h1 className="text-2xl font-bold text-white">Buat Permohonan Pendanaan</h1>
          <p className="text-slate-400 mt-1">Ajukan pendanaan untuk invoice ekspor Anda</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50 p-6 md:p-8">

          {!walletAddress ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Hubungkan Wallet</h2>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                Anda perlu menghubungkan wallet untuk membuat invoice dan menerima funding dalam bentuk IDRX.
              </p>
              <button
                onClick={connectWallet}
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-bold rounded-lg transition-all shadow-lg"
              >
                Connect Wallet
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6 bg-teal-950/20 px-4 py-3 rounded-lg border border-teal-800/30">
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 mr-2"></div>
                  <span className="text-sm text-slate-300">Wallet Terhubung</span>
                </div>
                <code className="text-sm font-mono text-teal-400">{walletAddress}</code>
              </div>
              <Stepper currentStep={currentStep} onStepClick={handleStepClick} />
            </>
          )}

          <div className="mt-8">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-100 mb-4">Data Pendanaan</h2>
                  <p className="text-sm text-slate-400 mb-6">Isi informasi tagihan yang akan didanai</p>
                </div>

                {/* Wallet Connection Section */}
                <div className={`p-4 rounded-xl border ${walletAddress ? 'bg-teal-950/20 border-teal-800/30' : 'bg-slate-900/50 border-slate-700/60'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-200">Koneksi Wallet Pencairan (IDRX)</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {walletAddress ? 'Wallet terhubung. Dana akan dicairkan ke alamat ini.' : 'Hubungkan wallet untuk menerima pencairan dana IDRX.'}
                      </p>
                    </div>
                    {walletAddress ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-teal-400 bg-teal-950/40 px-2 py-1 rounded border border-teal-800/30">
                          {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                        </span>
                        <button onClick={() => setWalletAddress(null)} className="text-xs text-red-400 hover:text-red-300">
                          Putus
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={connectWallet}
                        className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white text-xs font-bold rounded-lg transition-all"
                      >
                        Hubungkan Wallet
                      </button>
                    )}
                  </div>
                  {errors.walletAddress && <p className="mt-2 text-xs text-red-400">{errors.walletAddress}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Nama Perusahaan Importir <span className="text-red-400">*</span>
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={step1Data.buyerCompanyName}
                        onChange={(e) => setStep1Data({ ...step1Data, buyerCompanyName: e.target.value })}
                        onBlur={handleCheckRepeatBuyer}
                        className={`flex-1 px-4 py-3 bg-slate-900/50 border rounded-lg focus:ring-2 focus:ring-teal-500 transition-all text-slate-100 ${errors.buyerCompanyName ? 'border-red-500' : 'border-slate-600'}`}
                        placeholder="Nama perusahaan buyer"
                      />
                      {checkingBuyer && (
                        <div className="flex items-center px-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-teal-400"></div>
                        </div>
                      )}
                    </div>
                    {errors.buyerCompanyName && <p className="mt-1 text-xs text-red-400">{errors.buyerCompanyName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email Buyer <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={step1Data.buyerEmail}
                      onChange={(e) => setStep1Data({ ...step1Data, buyerEmail: e.target.value })}
                      className={`w-full px-4 py-3 bg-slate-900/50 border rounded-lg focus:ring-2 focus:ring-teal-500 transition-all text-slate-100 ${errors.buyerEmail ? 'border-red-500' : 'border-slate-600'}`}
                      placeholder="email@company.com"
                    />
                    {errors.buyerEmail && <p className="mt-1 text-xs text-red-400">{errors.buyerEmail}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Negara Tujuan <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={step1Data.buyerCountry}
                      onChange={(e) => setStep1Data({ ...step1Data, buyerCountry: e.target.value })}
                      className={`w-full px-4 py-3 bg-slate-900/50 border rounded-lg focus:ring-2 focus:ring-teal-500 transition-all text-slate-100 ${errors.buyerCountry ? 'border-red-500' : 'border-slate-600'}`}
                    >
                      <option value="">Pilih negara tujuan</option>
                      <option value="Singapore">Singapura</option>
                      <option value="United States">Amerika Serikat</option>
                      <option value="China">Tiongkok</option>
                      <option value="Japan">Jepang</option>
                      <option value="Germany">Jerman</option>
                      <option value="Netherlands">Belanda</option>
                      <option value="Australia">Australia</option>
                      <option value="Other">Negara Lainnya</option>
                    </select>
                    {errors.buyerCountry && <p className="mt-1 text-xs text-red-400">{errors.buyerCountry}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Nomor Invoice <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={step1Data.invoiceNumber}
                      onChange={(e) => setStep1Data({ ...step1Data, invoiceNumber: e.target.value })}
                      className={`w-full px-4 py-3 bg-slate-900/50 border rounded-lg focus:ring-2 focus:ring-teal-500 transition-all text-slate-100 ${errors.invoiceNumber ? 'border-red-500' : 'border-slate-600'}`}
                      placeholder="INV-2024-001"
                    />
                    {errors.invoiceNumber && <p className="mt-1 text-xs text-red-400">{errors.invoiceNumber}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Mata Uang
                    </label>
                    <input
                      type="text"
                      value="IDRX (Vessel Network Token)"
                      readOnly
                      className="w-full px-4 py-3 bg-slate-900/30 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Nominal Invoice (IDRX) <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">IDRX</span>
                      <input
                        type="number"
                        value={step1Data.originalAmount}
                        onChange={(e) => setStep1Data({ ...step1Data, originalAmount: e.target.value })}
                        className={`w-full pl-16 pr-4 py-3 bg-slate-900/50 border rounded-lg focus:ring-2 focus:ring-teal-500 transition-all text-slate-100 ${errors.originalAmount ? 'border-red-500' : 'border-slate-600'}`}
                        placeholder="10000"
                      />
                    </div>
                    {errors.originalAmount && <p className="mt-1 text-xs text-red-400">{errors.originalAmount}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Tanggal Jatuh Tempo <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={step1Data.dueDate}
                      onChange={(e) => setStep1Data({ ...step1Data, dueDate: e.target.value })}
                      min={todayJakarta}
                      ref={dueDateInputRef}
                      className={`w-full px-4 py-3 bg-slate-900/50 border rounded-lg focus:ring-2 focus:ring-teal-500 transition-all text-slate-100 ${errors.dueDate ? 'border-red-500' : 'border-slate-600'}`}
                    />
                    {errors.dueDate && <p className="mt-1 text-xs text-red-400">{errors.dueDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Durasi Pendanaan (Hari) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min={3}
                      max={14}
                      value={step1Data.fundingDuration}
                      onChange={(e) => setStep1Data({ ...step1Data, fundingDuration: e.target.value })}
                      className={`w-full px-4 py-3 bg-slate-900/50 border rounded-lg focus:ring-2 focus:ring-teal-500 transition-all text-slate-100 ${errors.fundingDuration ? 'border-red-500' : 'border-slate-600'}`}
                      placeholder="3-14 hari"
                    />
                    {errors.fundingDuration && <p className="mt-1 text-xs text-red-400">{errors.fundingDuration}</p>}
                  </div>
                </div>

                <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                  <h3 className="text-sm font-medium text-slate-300 mb-4">Konfigurasi Tranche</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Prioritas (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={step1Data.priorityRatio}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setStep1Data({ ...step1Data, priorityRatio: e.target.value, catalystRatio: String(100 - val) });
                          }}
                          className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Katalis (%)</label>
                        <input
                          type="number"
                          value={step1Data.catalystRatio}
                          readOnly
                          className="w-full px-4 py-2 bg-slate-900/30 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Yield Prioritas (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={step1Data.priorityInterestRate}
                          onChange={(e) => setStep1Data({ ...step1Data, priorityInterestRate: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Yield Katalis (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={step1Data.catalystInterestRate}
                          onChange={(e) => setStep1Data({ ...step1Data, catalystInterestRate: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 text-slate-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-teal-950/30 border border-teal-800/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-slate-300">Total Funding:</span>
                      <p className="text-xs text-slate-400 mt-1">Limit pendanaan: {step3Data.fundingLimit}%</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-teal-400">
                        {new Intl.NumberFormat('id-ID').format(parseFloat(step1Data.originalAmount) || 0)} IDRX
                      </span>
                      <p className="text-xs text-slate-400">Est. Dana Cair: {calculateEstimatedFunds()} IDRX</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-100 mb-4">Dokumen Pendukung</h2>
                  <div className="bg-teal-950/20 border border-teal-800/30 rounded-lg p-4 mb-6">
                    <p className="text-sm text-slate-300">
                      <svg className="w-5 h-5 inline mr-2 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Dokumen ini digunakan untuk memverifikasi klaim tagihan dan akan direview oleh admin.
                    </p>
                  </div>
                </div>

                <UploadCard
                  label="Commercial Invoice"
                  file={step2Data.commercialInvoice}
                  onChange={(file) => handleFileUpload('commercialInvoice', file)}
                  onRemove={() => handleFileRemove('commercialInvoice')}
                  required
                  error={errors.commercialInvoice}
                />

                <UploadCard
                  label="Bill of Lading (BL)"
                  file={step2Data.billOfLading}
                  onChange={(file) => handleFileUpload('billOfLading', file)}
                  onRemove={() => handleFileRemove('billOfLading')}
                  required
                  error={errors.billOfLading}
                />

                <UploadCard
                  label="Purchase Order (PO)"
                  file={step2Data.purchaseOrder}
                  onChange={(file) => handleFileUpload('purchaseOrder', file)}
                  onRemove={() => handleFileRemove('purchaseOrder')}
                  required
                  error={errors.purchaseOrder}
                />
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-100 mb-4">Riwayat Transaksi</h2>
                  <p className="text-sm text-slate-400 mb-6">Verifikasi riwayat transaksi dengan importir</p>
                </div>

                {step3Data.repeatBuyerVerified ? (
                  step3Data.isRepeatBuyer ? (
                    <div className="bg-emerald-950/30 border border-emerald-800/30 rounded-lg p-5">
                      <div className="flex items-start space-x-3">
                        <svg className="w-6 h-6 text-emerald-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-emerald-200 font-semibold mb-1">Riwayat Transaksi Terverifikasi</p>
                          <p className="text-sm text-slate-300">
                            Importir <span className="font-semibold text-white">{step1Data.buyerCompanyName}</span> memiliki riwayat transaksi yang baik.
                            Limit pendanaan: <span className="text-emerald-300 font-semibold">{step3Data.fundingLimit}%</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-950/30 border border-amber-800/30 rounded-lg p-5">
                      <div className="flex items-start space-x-3">
                        <svg className="w-6 h-6 text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-amber-200 font-semibold mb-1">Transaksi Pertama</p>
                          <p className="text-sm text-slate-300">
                            Ini adalah transaksi pertama dengan <span className="font-semibold text-white">{step1Data.buyerCompanyName}</span>.
                            Untuk kemitraan baru, maksimal pendanaan adalah <span className="text-amber-300 font-semibold">{step3Data.fundingLimit}%</span> dari nilai invoice.
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="bg-slate-900/40 border border-slate-700 rounded-lg p-5">
                    <p className="text-slate-300 text-center">
                      Masukkan nama perusahaan importir di Step 1 untuk memverifikasi riwayat transaksi.
                    </p>
                  </div>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-100 mb-4">Konfirmasi Data</h2>
                  <p className="text-sm text-slate-400 mb-6">Periksa kembali informasi sebelum mengirim permohonan</p>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-5 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-200">Data Pendanaan</h3>
                    <button onClick={() => setCurrentStep(1)} className="text-teal-400 hover:text-teal-300 text-sm font-medium">Edit</button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Importir:</span>
                      <span className="text-slate-200 font-medium">{step1Data.buyerCompanyName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Negara:</span>
                      <span className="text-slate-200 font-medium">{step1Data.buyerCountry}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">No. Invoice:</span>
                      <span className="text-slate-200 font-medium">{step1Data.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nominal:</span>
                      <span className="text-slate-200 font-medium">{step1Data.currency} {new Intl.NumberFormat('en-US').format(parseFloat(step1Data.originalAmount) || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nilai IDR:</span>
                      <span className="text-slate-200 font-medium">Rp {new Intl.NumberFormat('id-ID').format(parseFloat(step1Data.idrAmount) || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Jatuh Tempo:</span>
                      <span className="text-slate-200 font-medium">{step1Data.dueDate}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300 font-medium">Estimasi Dana Diterima:</span>
                      <span className="text-teal-400 font-bold">Rp {calculateEstimatedFunds()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-5 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-200">Dokumen</h3>
                    <button onClick={() => setCurrentStep(2)} className="text-teal-400 hover:text-teal-300 text-sm font-medium">Edit</button>
                  </div>
                  <div className="space-y-2 text-sm">
                    {[
                      { label: 'Commercial Invoice', file: step2Data.commercialInvoice },
                      { label: 'Bill of Lading', file: step2Data.billOfLading },
                      { label: 'Purchase Order', file: step2Data.purchaseOrder },
                    ].map((doc) => (
                      <div key={doc.label} className="flex items-center justify-between">
                        <span className="text-slate-400">{doc.label}:</span>
                        <span className="text-emerald-400 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {doc.file?.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-teal-950/20 border border-teal-800/30 rounded-lg p-5">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="acknowledgement"
                        checked={acknowledgement}
                        onChange={(e) => setAcknowledgement(e.target.checked)}
                        className="mt-1 w-4 h-4 bg-slate-900/50 border-slate-600 rounded text-teal-500 focus:ring-2 focus:ring-teal-500"
                      />
                      <label htmlFor="acknowledgement" className="text-sm text-slate-300 cursor-pointer">
                        Saya menyetujui Pengalihan Hak Tagih (Cessie) kepada platform sebagai jaminan.
                        <span className="text-red-400 ml-1">*</span>
                      </label>
                    </div>

                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="dataConfirmation"
                        checked={dataConfirmation}
                        onChange={(e) => setDataConfirmation(e.target.checked)}
                        className="mt-1 w-4 h-4 bg-slate-900/50 border-slate-600 rounded text-teal-500 focus:ring-2 focus:ring-teal-500"
                      />
                      <label htmlFor="dataConfirmation" className="text-sm text-slate-300 cursor-pointer">
                        Data yang saya berikan adalah benar dan asli.
                        <span className="text-red-400 ml-1">*</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-slate-200 font-medium rounded-lg transition-all"
            >
              Kembali
            </button>

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-medium rounded-lg transition-all shadow-lg"
              >
                Lanjut
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!acknowledgement || !dataConfirmation || isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all shadow-lg flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <span>Kirim Permohonan</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function CreateInvoicePage() {
  return (
    <AuthGuard allowedRoles={['mitra']}>
      <CreateInvoiceContent />
    </AuthGuard>
  );
}
