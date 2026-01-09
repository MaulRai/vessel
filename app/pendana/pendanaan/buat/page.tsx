'use client';

import { useState, useRef, useMemo } from 'react';
import Link from 'next/link';

// Types
interface UploadedFile {
  name: string;
  size: number;
  file: File;
}

interface Step1Data {
  currency: 'USD' | 'EUR' | '';
  invoiceAmount: string;
  agreedExchangeRate: string;
  dueDate: string;
  fundingDuration: string;
  importerName: string;
  destinationCountry: string;
  tranchePrioritas: string;
  trancheKatalis: string;
  yieldPrioritas: string;
  yieldKatalis: string;
}

interface Step2Data {
  commercialInvoice: UploadedFile | null;
  billOfLading: UploadedFile | null;
  purchaseOrder: UploadedFile | null;
}

interface Step3Data {
  transactionType: 'first' | 'repeat' | 'system-verified';
  previousTransferProof: UploadedFile | null;
  manualAnswer: '' | 'belum' | 'sudah';
}

// Stepper Component
function Stepper({ currentStep, onStepClick }: { currentStep: number; onStepClick: (step: number) => void }) {
  const steps = [
    { number: 1, label: 'Data Pendanaan' },
    { number: 2, label: 'Dokumen Pendukung' },
    { number: 3, label: 'Riwayat Transaksi' },
    { number: 4, label: 'Tinjau & Kirim' }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <button
                onClick={() => onStepClick(step.number)}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                  currentStep === step.number
                    ? 'bg-cyan-600 text-white ring-4 ring-cyan-600/30'
                    : currentStep > step.number
                    ? 'bg-cyan-600 text-white hover:bg-cyan-500'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                {step.number}
              </button>
              <span
                className={`mt-2 text-xs font-medium ${
                  currentStep === step.number
                    ? 'text-cyan-400'
                    : currentStep > step.number
                    ? 'text-cyan-500'
                    : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-2 mb-6 ${
                  currentStep > step.number ? 'bg-cyan-600' : 'bg-slate-700'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <style jsx>{`
        .white-calendar {
          color-scheme: dark;
          position: relative;
        }

        :global(.white-calendar::-webkit-calendar-picker-indicator) {
          opacity: 0;
          pointer-events: auto;
          background: transparent;
        }

        :global(.white-calendar::-moz-focus-inner) {
          border: 0;
        }

        :global(.white-calendar::-moz-calendar-picker-indicator) {
          opacity: 0;
          pointer-events: auto;
          background: transparent;
        }
      `}</style>
    </div>
  );
}

// Upload Card Component
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

  const handleDragLeave = () => {
    setIsDragging(false);
  };

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
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
            isDragging
              ? 'border-cyan-500 bg-cyan-950/30'
              : error
              ? 'border-red-500 bg-red-950/20'
              : 'border-slate-600 bg-slate-900/30 hover:border-slate-500'
          }`}
        >
          <svg className="w-12 h-12 mx-auto text-slate-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm text-slate-300 mb-2">
            Seret & lepas file atau{' '}
            <label className="text-cyan-400 hover:text-cyan-300 cursor-pointer font-medium">
              pilih file
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
              />
            </label>
          </p>
          <p className="text-xs text-slate-500">PDF, JPG, PNG (Maks 10MB)</p>
        </div>
      ) : (
        <div className="border border-slate-600 rounded-lg p-4 bg-slate-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <svg className="w-8 h-8 text-cyan-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
                <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onRemove}
              className="ml-3 text-red-400 hover:text-red-300 text-sm font-medium flex-shrink-0"
            >
              Hapus
            </button>
          </div>
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}

// Main Page Component
export default function BuatPendanaanPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Step 1 State
  const [step1Data, setStep1Data] = useState<Step1Data>({
    currency: '',
    invoiceAmount: '',
    agreedExchangeRate: '15750', // Mock exchange rate
    dueDate: '',
    fundingDuration: '14',
    importerName: '',
    destinationCountry: '',
    tranchePrioritas: '80',
    trancheKatalis: '20',
    yieldPrioritas: '10',
    yieldKatalis: '15'
  });

  // Step 2 State
  const [step2Data, setStep2Data] = useState<Step2Data>({
    commercialInvoice: null,
    billOfLading: null,
    purchaseOrder: null
  });

  // Step 3 State
  const [step3Data, setStep3Data] = useState<Step3Data>({
    transactionType: 'first',
    previousTransferProof: null,
    manualAnswer: ''
  });

  // Mock function to check if importer exists in transaction history
  const checkImporterHistory = (importerName: string): boolean => {
    // Mock: Returns true if name contains certain keywords (for demo)
    const verifiedImporters = ['PT Arunika Bahari', 'Samsung', 'Apple'];
    return verifiedImporters.some(name => importerName.toLowerCase().includes(name.toLowerCase()));
  };

  // Step 4 State
  const [acknowledgement, setAcknowledgement] = useState(false);
  const [dataIntegrity, setDataIntegrity] = useState(false);

  const dueDateInputRef = useRef<HTMLInputElement | null>(null);
  const todayJakarta = useMemo(
    () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date()),
    []
  );

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleDueDateFieldClick = () => {
    const node = dueDateInputRef.current;
    if (!node) return;
    const picker = (node as HTMLInputElement & { showPicker?: () => void }).showPicker;
    if (picker) {
      picker.call(node);
    } else {
      node.focus();
      node.click();
    }
  };

  // Handle file upload
  const handleFileUpload = (field: keyof Step2Data | 'previousTransferProof', file: File) => {
    if (field === 'previousTransferProof') {
      setStep3Data(prev => ({
        ...prev,
        previousTransferProof: { name: file.name, size: file.size, file }
      }));
    } else {
      setStep2Data(prev => ({
        ...prev,
        [field]: { name: file.name, size: file.size, file }
      }));
    }
    // Clear error for this field
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

  // Validation functions
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!step1Data.importerName.trim()) newErrors.importerName = 'Nama perusahaan importir harus diisi';
    if (!step1Data.destinationCountry) newErrors.destinationCountry = 'Negara tujuan harus dipilih';
    if (!step1Data.currency) newErrors.currency = 'Mata uang harus dipilih';
    if (!step1Data.invoiceAmount) newErrors.invoiceAmount = 'Nominal invoice harus diisi';
    if (!step1Data.dueDate) newErrors.dueDate = 'Tanggal jatuh tempo harus diisi';
    else if (step1Data.dueDate < todayJakarta) {
      newErrors.dueDate = 'Tanggal jatuh tempo tidak boleh sebelum hari ini (WIB)';
    }

    const durationValue = parseInt(step1Data.fundingDuration, 10);
    if (!step1Data.fundingDuration) {
      newErrors.fundingDuration = 'Durasi pendanaan harus diisi';
    } else if (Number.isNaN(durationValue) || durationValue < 3 || durationValue > 14) {
      newErrors.fundingDuration = 'Durasi harus antara 3 hingga 14 hari';
    }
    
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

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};
    const importerExists = step1Data.importerName.trim() ? checkImporterHistory(step1Data.importerName) : false;
    
    if (!importerExists && !step3Data.manualAnswer) {
      newErrors.manualAnswer = 'Mohon jawab pertanyaan riwayat transaksi';
    }
    
    if (step3Data.manualAnswer === 'sudah' && !step3Data.previousTransferProof) {
      newErrors.previousTransferProof = 'Bukti transfer transaksi sebelumnya harus diunggah';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle step navigation
  const handleNext = () => {
    let isValid = true;
    
    if (currentStep === 1) isValid = validateStep1();
    if (currentStep === 2) isValid = validateStep2();
    if (currentStep === 3) isValid = validateStep3();
    
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
    setCurrentStep(step);
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle submit
  const handleSubmit = () => {
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      alert('Mohon lengkapi semua data yang diperlukan');
      return;
    }
    
    if (!acknowledgement) {
      alert('Mohon setujui pengalihan hak tagih untuk melanjutkan');
      return;
    }

    if (!dataIntegrity) {
      alert('Mohon konfirmasi bahwa data yang diberikan benar dan asli');
      return;
    }
    
    // Log form data (no API integration yet)
    console.log('Submitting financing request:', {
      step1Data,
      step2Data,
      step3Data,
      acknowledgement,
      dataIntegrity
    });
    
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate estimated funds
  const calculateEstimatedFunds = (): string => {
    const amount = parseFloat(step1Data.invoiceAmount) || 0;
    const rate = parseFloat(step1Data.agreedExchangeRate) || 0;
    const percentage = step3Data.transactionType === 'first' ? 0.6 : 1.0;
    const estimated = amount * rate * percentage;
    
    return new Intl.NumberFormat('id-ID').format(Math.floor(estimated));
  };

  // Success state
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-100 mb-3">
                Permohonan Berhasil Dikirim
              </h2>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Permohonan pendanaan berhasil dikirim. Tim kami akan meninjau dan menghubungi Anda melalui email.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/exporter/dashboard"
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-medium rounded-lg transition-all shadow-lg shadow-cyan-900/50"
                >
                  Kembali ke Dashboard
                </Link>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setCurrentStep(1);
                    setStep1Data({
                      currency: '',
                      invoiceAmount: '',
                      agreedExchangeRate: '15750',
                      dueDate: '',
                      fundingDuration: '14',
                      importerName: '',
                      destinationCountry: '',
                      tranchePrioritas: '80',
                      trancheKatalis: '20',
                      yieldPrioritas: '10',
                      yieldKatalis: '15'
                    });
                    setStep2Data({ commercialInvoice: null, billOfLading: null, purchaseOrder: null });
                    setStep3Data({ transactionType: 'first', previousTransferProof: null, manualAnswer: '' });
                    setAcknowledgement(false);
                    setDataIntegrity(false);
                  }}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-lg transition-all"
                >
                  Buat Permohonan Baru
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/exporter/dashboard"
            className="inline-flex items-center text-cyan-400 hover:text-cyan-300 text-sm font-medium mb-4 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Kembali
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
            Permohonan Pendanaan Tagihan
          </h1>
          <p className="text-slate-400 mt-2">
            Ajukan pendanaan untuk tagihan ekspor Anda
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50 p-6 md:p-8">
          {/* Stepper */}
          <Stepper currentStep={currentStep} onStepClick={handleStepClick} />

          {/* Step Content */}
          <div className="mt-8">
            {/* STEP 1 - Data Pendanaan */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-100 mb-4">Data Pendanaan</h2>
                  <p className="text-sm text-slate-400 mb-6">
                    Isi informasi tagihan yang akan didanai
                  </p>
                </div>

                {/* Importer Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nama Perusahaan Importir <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={step1Data.importerName}
                    onChange={(e) => setStep1Data({ ...step1Data, importerName: e.target.value })}
                    className={`w-full px-4 py-3 bg-slate-900/50 border rounded-lg focus:ring-2 focus:ring-cyan-500 transition-all text-slate-100 ${
                      errors.importerName ? 'border-red-500' : 'border-slate-600'
                    }`}
                    placeholder="Nama perusahaan buyer/importir"
                  />
                  {errors.importerName && <p className="mt-1 text-xs text-red-400">{errors.importerName}</p>}
                </div>

                {/* Destination Country */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Negara Tujuan <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={step1Data.destinationCountry}
                    onChange={(e) => setStep1Data({ ...step1Data, destinationCountry: e.target.value })}
                    className={`w-full px-4 py-3 bg-slate-900/50 border rounded-lg focus:ring-2 focus:ring-cyan-500 transition-all text-slate-100 ${
                      errors.destinationCountry ? 'border-red-500' : 'border-slate-600'
                    }`}
                  >
                    <option value="">Pilih negara tujuan</option>
                    <option value="Singapura">Singapura</option>
                    <option value="Amerika Serikat">Amerika Serikat</option>
                    <option value="Tiongkok">Tiongkok</option>
                    <option value="Jepang">Jepang</option>
                    <option value="Uni Eropa">Uni Eropa</option>
                    <option value="Negara Lainnya">Negara Lainnya</option>
                  </select>
                  <p className="mt-1 text-xs text-slate-400">Negara mempengaruhi Grade Risiko.</p>
                  {errors.destinationCountry && (
                    <p className="mt-1 text-xs text-red-400">{errors.destinationCountry}</p>
                  )}
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Mata Uang Invoice <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={step1Data.currency}
                    onChange={(e) => setStep1Data({ ...step1Data, currency: e.target.value as 'USD' | 'EUR' })}
                    className={`w-full px-4 py-3 bg-slate-900/50 border rounded-lg focus:ring-2 focus:ring-cyan-500 transition-all text-slate-100 ${
                      errors.currency ? 'border-red-500' : 'border-slate-600'
                    }`}
                  >
                    <option value="">Pilih mata uang</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                  {errors.currency && <p className="mt-1 text-xs text-red-400">{errors.currency}</p>}
                </div>

                {/* Invoice Amount */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nominal Invoice <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      {step1Data.currency || 'XXX'}
                    </span>
                    <input
                      type="number"
                      value={step1Data.invoiceAmount}
                      onChange={(e) => setStep1Data({ ...step1Data, invoiceAmount: e.target.value })}
                      className={`w-full pl-16 pr-4 py-3 bg-slate-900/50 border rounded-lg focus:ring-2 focus:ring-cyan-500 transition-all text-slate-100 ${
                        errors.invoiceAmount ? 'border-red-500' : 'border-slate-600'
                      }`}
                      placeholder="10000"
                    />
                  </div>
                  {errors.invoiceAmount && <p className="mt-1 text-xs text-red-400">{errors.invoiceAmount}</p>}
                </div>

                {/* Agreed Exchange Rate */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Kurs Pencairan Disepakati
                  </label>
                  <input
                    type="text"
                    value={`Rp ${new Intl.NumberFormat('id-ID').format(parseFloat(step1Data.agreedExchangeRate))}`}
                    readOnly
                    className="w-full px-4 py-3 bg-slate-900/30 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed"
                  />
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    <svg className="w-4 h-4 inline mr-1 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Kurs dikunci final untuk melindungi nilai pencairan.
                  </p>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tanggal Jatuh Tempo (Tenor) <span className="text-red-400">*</span>
                  </label>
                  <div className="relative cursor-pointer" onClick={handleDueDateFieldClick}>
                    <input
                      type="date"
                      value={step1Data.dueDate}
                      onChange={(e) => setStep1Data({ ...step1Data, dueDate: e.target.value })}
                      min={todayJakarta}
                      className={`white-calendar w-full pr-12 pl-4 py-3 bg-slate-900/50 border rounded-lg focus:ring-2 focus:ring-cyan-500 transition-all text-slate-100 ${
                        errors.dueDate ? 'border-red-500' : 'border-slate-600'
                      }`}
                      ref={dueDateInputRef}
                    />
                    <svg
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm10 7H4v6a1 1 0 001 1h10a1 1 0 001-1V9z" />
                    </svg>
                  </div>
                  {errors.dueDate && <p className="mt-1 text-xs text-red-400">{errors.dueDate}</p>}
                </div>

                {/* Funding Duration */}
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
                    className={`w-full px-4 py-3 bg-slate-900/50 border rounded-lg focus:ring-2 focus:ring-cyan-500 transition-all text-slate-100 ${
                      errors.fundingDuration ? 'border-red-500' : 'border-slate-600'
                    }`}
                    placeholder="Masukkan durasi (3-14 hari)"
                  />
                  <p className="mt-1 text-xs text-slate-400">Durasi pendanaan dapat dipilih antara 3-14 hari.</p>
                  {errors.fundingDuration && (
                    <p className="mt-1 text-xs text-red-400">{errors.fundingDuration}</p>
                  )}
                </div>

                {/* Tranche Ratio */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Rasio Tranche <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Prioritas (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={step1Data.tranchePrioritas}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setStep1Data({ ...step1Data, tranchePrioritas: e.target.value, trancheKatalis: String(100 - val) });
                        }}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 transition-all text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Katalis (%)</label>
                      <input
                        type="number"
                        value={step1Data.trancheKatalis}
                        readOnly
                        className="w-full px-4 py-3 bg-slate-900/30 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">Total harus 100%. Misal: Prioritas 80%, Katalis 20%.</p>
                </div>

                {/* Yield Rate */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Rate Imbal Hasil <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Prioritas (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={step1Data.yieldPrioritas}
                        onChange={(e) => setStep1Data({ ...step1Data, yieldPrioritas: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 transition-all text-slate-100"
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Katalis (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={step1Data.yieldKatalis}
                        onChange={(e) => setStep1Data({ ...step1Data, yieldKatalis: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 transition-all text-slate-100"
                        placeholder="15"
                      />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">Misal: Prioritas 10%, Katalis 15% per tahun.</p>
                </div>

                {/* Estimated Funds */}
                <div className="bg-cyan-950/30 border border-cyan-800/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-300">Estimasi Pencairan Bersih (IDR):</span>
                    <span className="text-lg font-bold text-cyan-400">
                      Rp {calculateEstimatedFunds()}
                    </span>
                  </div>
                  {(step3Data.transactionType === 'first' || step3Data.manualAnswer === 'belum') && step1Data.invoiceAmount && (
                    <p className="mt-2 text-xs text-slate-400">
                      *Untuk kemitraan baru, maksimal pendanaan 60%
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2 - Upload Documents */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-100 mb-4">Dokumen Pendukung Klaim Tagihan</h2>
                  <div className="bg-cyan-950/20 border border-cyan-800/30 rounded-lg p-4 mb-6">
                    <p className="text-sm text-slate-300 leading-relaxed">
                      <svg className="w-5 h-5 inline mr-2 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Dokumen ini digunakan untuk memverifikasi klaim tagihan dan proses pengalihan hak tagih (cessie).
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

            {/* STEP 3 - Transaction History */}
            {currentStep === 3 && (() => {
              const importerExists = step1Data.importerName.trim() ? checkImporterHistory(step1Data.importerName) : false;
              
              return (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-100 mb-4">Riwayat Transaksi</h2>
                    <p className="text-sm text-slate-400 mb-6">
                      Verifikasi riwayat transaksi dengan importir
                    </p>
                  </div>

                  {/* System Verified Badge */}
                  {importerExists ? (
                    <div className="bg-emerald-950/30 border border-emerald-800/30 rounded-lg p-5">
                      <div className="flex items-start space-x-3">
                        <svg className="w-6 h-6 text-emerald-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-emerald-200 font-semibold mb-1">✅ Riwayat transaksi terverifikasi</p>
                          <p className="text-sm text-slate-300 leading-relaxed">
                            Sistem mendeteksi importir <span className="font-semibold">{step1Data.importerName}</span> memiliki riwayat transaksi lunas. Status otomatis ditetapkan: <span className="text-emerald-300 font-semibold">Repeat Order (Verified by System)</span>.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="bg-slate-900/40 border border-slate-700 rounded-lg p-5">
                        <p className="text-slate-200 font-medium mb-4">Apakah Anda pernah bertransaksi dengan Importir ini sebelumnya?</p>
                        <div className="space-y-3">
                          <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-slate-900/30 ${
                            step3Data.manualAnswer === 'belum'
                              ? 'border-amber-500 bg-amber-950/20'
                              : 'border-slate-600 bg-slate-900/20'
                          }`}>
                            <input
                              type="radio"
                              name="manualAnswer"
                              value="belum"
                              checked={step3Data.manualAnswer === 'belum'}
                              onChange={(e) => {
                                setStep3Data({ ...step3Data, manualAnswer: 'belum', transactionType: 'first', previousTransferProof: null });
                              }}
                              className="w-4 h-4 text-amber-600 focus:ring-2 focus:ring-amber-500"
                            />
                            <span className="ml-3 text-slate-200 font-medium">Belum Pernah</span>
                          </label>

                          <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-slate-900/30 ${
                            step3Data.manualAnswer === 'sudah'
                              ? 'border-cyan-500 bg-cyan-950/20'
                              : 'border-slate-600 bg-slate-900/20'
                          }`}>
                            <input
                              type="radio"
                              name="manualAnswer"
                              value="sudah"
                              checked={step3Data.manualAnswer === 'sudah'}
                              onChange={(e) => {
                                setStep3Data({ ...step3Data, manualAnswer: 'sudah', transactionType: 'repeat' });
                              }}
                              className="w-4 h-4 text-cyan-600 focus:ring-2 focus:ring-cyan-500"
                            />
                            <span className="ml-3 text-slate-200 font-medium">Sudah Pernah</span>
                          </label>
                        </div>
                      </div>

                      {/* First Transaction Warning */}
                      {step3Data.manualAnswer === 'belum' && (
                        <div className="bg-amber-950/30 border border-amber-800/30 rounded-lg p-4">
                          <div className="flex items-start space-x-2">
                            <svg className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm text-slate-300 leading-relaxed">
                              ⚠️ Untuk kemitraan baru, maksimal pembiayaan yang dapat dicairkan adalah 60% dari nilai tagihan.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Upload Previous Transfer Proof */}
                      {step3Data.manualAnswer === 'sudah' && (
                        <div>
                          <UploadCard
                            label="Bukti Transfer Bank Transaksi Sebelumnya"
                            file={step3Data.previousTransferProof}
                            onChange={(file) => handleFileUpload('previousTransferProof', file)}
                            onRemove={() => handleFileRemove('previousTransferProof')}
                            required
                            error={errors.previousTransferProof}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* STEP 4 - Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-100 mb-4">Halaman Summary</h2>
                  <p className="text-sm text-slate-400 mb-6">
                    Periksa kembali informasi sebelum mengirim permohonan
                  </p>
                </div>

                {/* Data Pendanaan Summary */}
                <div className="bg-slate-900/50 rounded-lg p-5 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-200">Data Pendanaan</h3>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nama Importir:</span>
                      <span className="text-slate-200 font-medium">{step1Data.importerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Negara Tujuan:</span>
                      <span className="text-slate-200 font-medium">{step1Data.destinationCountry || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Mata Uang Invoice:</span>
                      <span className="text-slate-200 font-medium">{step1Data.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nominal Invoice:</span>
                      <span className="text-slate-200 font-medium">
                        {step1Data.currency} {new Intl.NumberFormat('id-ID').format(parseFloat(step1Data.invoiceAmount) || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Kurs Pencairan:</span>
                      <span className="text-slate-200 font-medium">
                        Rp {new Intl.NumberFormat('id-ID').format(parseFloat(step1Data.agreedExchangeRate))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tanggal Jatuh Tempo:</span>
                      <span className="text-slate-200 font-medium">{step1Data.dueDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Durasi Pendanaan:</span>
                      <span className="text-slate-200 font-medium">{step1Data.fundingDuration} hari</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-slate-700">
                      <span className="text-slate-300 font-medium">Estimasi Dana Diterima:</span>
                      <span className="text-cyan-400 font-bold">Rp {calculateEstimatedFunds()}</span>
                    </div>
                  </div>
                </div>

                {/* Documents Summary */}
                <div className="bg-slate-900/50 rounded-lg p-5 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-200">Dokumen Pendukung</h3>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Commercial Invoice:</span>
                      <span className="text-emerald-400 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {step2Data.commercialInvoice?.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Bill of Lading:</span>
                      <span className="text-emerald-400 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {step2Data.billOfLading?.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Purchase Order:</span>
                      <span className="text-emerald-400 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {step2Data.purchaseOrder?.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Transaction History Summary */}
                <div className="bg-slate-900/50 rounded-lg p-5 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-200">Riwayat Transaksi</h3>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Jenis Transaksi:</span>
                      <span className="text-slate-200 font-medium">
                        {checkImporterHistory(step1Data.importerName) 
                          ? 'Repeat Order (Verified by System)' 
                          : step3Data.manualAnswer === 'belum' 
                          ? 'Kemitraan Baru (60% Max)' 
                          : step3Data.manualAnswer === 'sudah' 
                          ? 'Repeat Order (Manual)'
                          : 'Transaksi Pertama'}
                      </span>
                    </div>
                    {(step3Data.manualAnswer === 'sudah' || step3Data.transactionType === 'repeat') && step3Data.previousTransferProof && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Bukti Transfer:</span>
                        <span className="text-emerald-400 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {step3Data.previousTransferProof.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Acknowledgement Checkbox */}
                <div className="bg-cyan-950/20 border border-cyan-800/30 rounded-lg p-5">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="acknowledgement"
                        checked={acknowledgement}
                        onChange={(e) => setAcknowledgement(e.target.checked)}
                        className="mt-1 w-4 h-4 bg-slate-900/50 border-slate-600 rounded text-cyan-600 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-0"
                      />
                      <label
                        htmlFor="acknowledgement"
                        className="text-sm text-slate-300 leading-relaxed cursor-pointer"
                      >
                        Saya menyetujui Pengalihan Hak Tagih (Cessie) kepada Koperasi sebagai jaminan.
                        <span className="text-red-400 ml-1">*</span>
                      </label>
                    </div>

                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="dataIntegrity"
                        checked={dataIntegrity}
                        onChange={(e) => setDataIntegrity(e.target.checked)}
                        className="mt-1 w-4 h-4 bg-slate-900/50 border-slate-600 rounded text-cyan-600 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-0"
                      />
                      <label
                        htmlFor="dataIntegrity"
                        className="text-sm text-slate-300 leading-relaxed cursor-pointer"
                      >
                        Data yang saya berikan adalah benar dan asli.
                        <span className="text-red-400 ml-1">*</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
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
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-medium rounded-lg transition-all shadow-lg shadow-cyan-900/50"
              >
                Lanjut
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!acknowledgement || !dataIntegrity}
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all shadow-lg shadow-cyan-900/50"
              >
                Kirim Permohonan Pendanaan
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
