'use client';

import { useState } from 'react';
import Link from 'next/link';

type CommodityType = 'Kopi' | 'Furnitur' | 'Rempah' | 'Perikanan' | 'Tekstil' | 'Lainnya';

interface UploadedFile {
  name: string;
  size: number;
  file: File;
}

interface FormData {
  companyName: string;
  companyAddress: string;
  commodity: CommodityType | '';
  customCommodity: string;
  annualRevenue: string;
}

interface DocumentFiles {
  ktp: UploadedFile | null;
  npwp: UploadedFile | null;
  nib: UploadedFile | null;
  akta: UploadedFile | null;
}

export default function ProfilBisnisPage() {
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    companyAddress: '',
    commodity: '',
    customCommodity: '',
    annualRevenue: '',
  });

  const [documents, setDocuments] = useState<DocumentFiles>({
    ktp: null,
    npwp: null,
    nib: null,
    akta: null,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileSelect = (docType: keyof DocumentFiles, file: File) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('Ukuran file maksimal 10MB');
      return;
    }

    setDocuments(prev => ({
      ...prev,
      [docType]: {
        name: file.name,
        size: file.size,
        file: file,
      },
    }));
  };

  const handleFileRemove = (docType: keyof DocumentFiles) => {
    setDocuments(prev => ({ ...prev, [docType]: null }));
  };

  const formatCurrency = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleRevenueChange = (value: string) => {
    const formatted = formatCurrency(value);
    handleInputChange('annualRevenue', formatted);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Nama perusahaan wajib diisi';
    }
    if (!formData.companyAddress.trim()) {
      newErrors.companyAddress = 'Alamat perusahaan wajib diisi';
    }
    if (!formData.commodity) {
      newErrors.commodity = 'Jenis komoditas wajib dipilih';
    }
    if (formData.commodity === 'Lainnya' && !formData.customCommodity.trim()) {
      newErrors.customCommodity = 'Harap sebutkan komoditas';
    }
    if (!formData.annualRevenue.trim()) {
      newErrors.annualRevenue = 'Omzet tahunan wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormComplete = (): boolean => {
    return (
      formData.companyName.trim() !== '' &&
      formData.companyAddress.trim() !== '' &&
      formData.commodity !== '' &&
      (formData.commodity !== 'Lainnya' || formData.customCommodity.trim() !== '') &&
      formData.annualRevenue.trim() !== '' &&
      documents.ktp !== null &&
      documents.npwp !== null &&
      documents.nib !== null &&
      documents.akta !== null
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!isFormComplete()) {
      alert('Harap lengkapi semua data dan upload semua dokumen');
      return;
    }

    // Simulate submission
    console.log('Form submitted:', { formData, documents });
    setSubmitted(true);
    
    // Scroll to top to show success message
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Main Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50 p-8 md:p-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent mb-2">
              Profil Bisnis
            </h1>
            <p className="text-slate-300 text-base">
              Lengkapi data untuk verifikasi bisnis dan akses pencairan invoice.
            </p>
          </div>

          {/* Success Message */}
          {submitted && (
            <div className="mb-6 p-4 bg-emerald-950/30 border border-emerald-800/30 rounded-lg">
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm text-emerald-400 font-medium">Permintaan verifikasi berhasil dikirim</p>
                  <p className="text-xs text-slate-300 mt-1">
                    Tim kami akan memproses dalam 1–3 hari kerja.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section A - Data Bisnis */}
            <div>
              <h2 className="text-xl font-semibold text-slate-100 mb-6 flex items-center">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 text-sm font-bold mr-3">
                  A
                </span>
                Data Bisnis
              </h2>

              <div className="space-y-5">
                {/* Company Name */}
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-slate-300 mb-2">
                    Nama PT/CV <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-slate-100 text-base placeholder:text-slate-500"
                    placeholder="PT Ekspor Indonesia"
                    aria-required="true"
                  />
                  {errors.companyName && (
                    <p className="mt-1 text-sm text-red-400">{errors.companyName}</p>
                  )}
                </div>

                {/* Company Address */}
                <div>
                  <label htmlFor="companyAddress" className="block text-sm font-medium text-slate-300 mb-2">
                    Alamat Perusahaan <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    id="companyAddress"
                    value={formData.companyAddress}
                    onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-slate-100 text-base placeholder:text-slate-500 resize-none"
                    placeholder="Jl. Sudirman No. 123, Jakarta Selatan"
                    aria-required="true"
                  />
                  {errors.companyAddress && (
                    <p className="mt-1 text-sm text-red-400">{errors.companyAddress}</p>
                  )}
                </div>

                {/* Commodity Type */}
                <div>
                  <label htmlFor="commodity" className="block text-sm font-medium text-slate-300 mb-2">
                    Jenis Komoditas <span className="text-red-400">*</span>
                  </label>
                  <select
                    id="commodity"
                    value={formData.commodity}
                    onChange={(e) => handleInputChange('commodity', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-slate-100 text-base"
                    aria-required="true"
                  >
                    <option value="">Pilih komoditas</option>
                    <option value="Kopi">Kopi</option>
                    <option value="Furnitur">Furnitur</option>
                    <option value="Rempah">Rempah</option>
                    <option value="Perikanan">Perikanan</option>
                    <option value="Tekstil">Tekstil</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                  {errors.commodity && (
                    <p className="mt-1 text-sm text-red-400">{errors.commodity}</p>
                  )}
                </div>

                {/* Custom Commodity (conditional) */}
                {formData.commodity === 'Lainnya' && (
                  <div>
                    <label htmlFor="customCommodity" className="block text-sm font-medium text-slate-300 mb-2">
                      Sebutkan Komoditas <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="customCommodity"
                      value={formData.customCommodity}
                      onChange={(e) => handleInputChange('customCommodity', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-slate-100 text-base placeholder:text-slate-500"
                      placeholder="Contoh: Elektronik, Otomotif, dll"
                      aria-required="true"
                    />
                    {errors.customCommodity && (
                      <p className="mt-1 text-sm text-red-400">{errors.customCommodity}</p>
                    )}
                  </div>
                )}

                {/* Annual Revenue */}
                <div>
                  <label htmlFor="annualRevenue" className="block text-sm font-medium text-slate-300 mb-2">
                    Omzet Tahunan (IDR) <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">Rp</span>
                    <input
                      type="text"
                      id="annualRevenue"
                      value={formData.annualRevenue}
                      onChange={(e) => handleRevenueChange(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-slate-100 text-base placeholder:text-slate-500"
                      placeholder="5.000.000.000"
                      aria-required="true"
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">Contoh: 5.000.000.000</p>
                  {errors.annualRevenue && (
                    <p className="mt-1 text-sm text-red-400">{errors.annualRevenue}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section B - Dokumen Legal */}
            <div>
              <h2 className="text-xl font-semibold text-slate-100 mb-4 flex items-center">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 text-sm font-bold mr-3">
                  B
                </span>
                Dokumen Legal
              </h2>
              <p className="text-sm text-slate-400 mb-6">
                Upload sekali saja. Anda bisa mengganti sebelum mengirim verifikasi.
              </p>

              <div className="space-y-4">
                <UploadCard
                  label="KTP Direktur"
                  required
                  acceptedTypes="image/*, application/pdf"
                  maxSize="10MB"
                  file={documents.ktp}
                  onFileSelect={(file) => handleFileSelect('ktp', file)}
                  onFileRemove={() => handleFileRemove('ktp')}
                />
                
                <UploadCard
                  label="NPWP Badan"
                  required
                  acceptedTypes="image/*, application/pdf"
                  maxSize="10MB"
                  file={documents.npwp}
                  onFileSelect={(file) => handleFileSelect('npwp', file)}
                  onFileRemove={() => handleFileRemove('npwp')}
                />
                
                <UploadCard
                  label="NIB (Nomor Induk Berusaha)"
                  required
                  acceptedTypes="application/pdf"
                  maxSize="10MB"
                  file={documents.nib}
                  onFileSelect={(file) => handleFileSelect('nib', file)}
                  onFileRemove={() => handleFileRemove('nib')}
                />
                
                <UploadCard
                  label="Akta Pendirian"
                  required
                  acceptedTypes="application/pdf"
                  maxSize="10MB"
                  file={documents.akta}
                  onFileSelect={(file) => handleFileSelect('akta', file)}
                  onFileRemove={() => handleFileRemove('akta')}
                />
              </div>
            </div>

            {/* Trust Notice */}
            <div className="p-4 bg-cyan-950/30 border border-cyan-800/30 rounded-lg">
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Data Anda aman dan hanya digunakan untuk proses verifikasi sesuai regulasi. Kami tidak membagikan dokumen Anda kepada pihak lain tanpa persetujuan.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={!isFormComplete()}
                className={`flex-1 py-3 px-6 rounded-lg font-medium text-base transition-all ${
                  isFormComplete()
                    ? 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white shadow-lg shadow-cyan-900/50'
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                }`}
              >
                Verifikasi Bisnis Saya
              </button>
              <Link
                href="/"
                className="flex-shrink-0 py-3 px-6 rounded-lg font-medium text-base transition-all border-2 border-slate-600 text-slate-300 hover:border-slate-500 text-center"
              >
                Nanti Saja
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Upload Card Component
interface UploadCardProps {
  label: string;
  required?: boolean;
  acceptedTypes: string;
  maxSize: string;
  file: UploadedFile | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
}

function UploadCard({ label, required, acceptedTypes, maxSize, file, onFileSelect, onFileRemove }: UploadCardProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      onFileSelect(droppedFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="p-4 bg-slate-900/30 border border-slate-600 rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-slate-200">
            {label} {required && <span className="text-red-400">*</span>}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {acceptedTypes.includes('image') ? 'JPG, PNG, atau PDF' : 'PDF'} · Maks {maxSize}
          </p>
        </div>
      </div>

      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver
              ? 'border-cyan-500 bg-cyan-500/5'
              : 'border-slate-600 hover:border-slate-500'
          }`}
        >
          <svg className="w-10 h-10 text-slate-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm text-slate-300 mb-2">
            Seret file ke sini atau
          </p>
          <label className="inline-block">
            <input
              type="file"
              accept={acceptedTypes}
              onChange={handleFileInputChange}
              className="hidden"
            />
            <span className="cursor-pointer text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
              Pilih File
            </span>
          </label>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-600 rounded-lg">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <svg className="w-8 h-8 text-cyan-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-200 truncate">{file.name}</p>
              <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onFileRemove}
            className="ml-3 p-2 text-slate-400 hover:text-red-400 transition-colors flex-shrink-0"
            aria-label="Hapus file"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
