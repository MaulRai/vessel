'use client';

import { ReactNode, useLayoutEffect, useMemo, useRef, useState, useEffect } from 'react';
import { AuthGuard } from '@/lib/components/AuthGuard';
import { userAPI, MitraApplicationResponse } from '@/lib/api/user';
import { useAuth } from '@/lib/context/AuthContext';

type TabKey = 'perusahaan' | 'penanggung' | 'keuangan' | 'dokumen' | 'tandaTangan';

// Document types yang akan dikirim ke backend
type BackendDocumentType = 'nib' | 'akta_pendirian' | 'ktp_direktur';

interface DocumentUploadStatus {
  nib: boolean;
  akta_pendirian: boolean;
  ktp_direktur: boolean;
}

interface UploadedFile {
  name: string;
  size: number;
  file: File;
}

interface CompanyBasics {
  name: string;
  entityType: string;
  profile: UploadedFile | null;
  phone: string;
  email: string;
  city: string;
}

interface CompanyLocation {
  status: string;
  locationDoc: UploadedFile | null;
  address1: string;
  address2: string;
  postalCode: string;
  province: string;
  city: string;
  district: string;
  village: string;
  sector: string;
}

interface TeamMember {
  id: string;
  name: string;
  title: string;
  resume: UploadedFile | null;
  ownership: '' | 'pemilik' | 'bukan';
}

interface RiskItem {
  id: string;
  riskType: string;
  description: string;
  mitigation: string;
}

interface ResponsiblePerson {
  fullName: string;
  gender: string;
  religion: string;
  birthDate: string;
  birthPlace: string;
  email: string;
  phone: string;
  position: string;
  nationality: string;
  education: string;
  maritalStatus: string;
}

interface ResponsibleAddress {
  address: string;
  postalCode: string;
  province: string;
  city: string;
  district: string;
  village: string;
  sameAsKtp: boolean;
  ktpAddress: string;
  ktpPostalCode: string;
  ktpProvince: string;
  ktpCity: string;
  ktpDistrict: string;
  ktpVillage: string;
}

interface ResponsibleDocuments {
  ktpNumber: string;
  ktpFile: UploadedFile | null;
  npwpNumber: string;
  npwpFile: UploadedFile | null;
}

interface RelationsData {
  relativeName: string;
  relativePhone: string;
  relationType: string;
  commissionerName: string;
  commissionerPhone: string;
  commissionerKtp: string;
  commissionerKtpFile: UploadedFile | null;
  commissionerApproval: UploadedFile | null;
}

interface FinancialPerformance {
  sales: string;
  operatingIncome: string;
  netIncome: string;
  currentAssets: string;
  nonCurrentAssets: string;
  shortDebt: string;
  longDebt: string;
  totalEquity: string;
}

interface BankInfo {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  bankAddress: string;
}

interface FinancialDocuments {
  bankStatement: UploadedFile | null;
  financialReport: UploadedFile | null;
  currentYearReport: UploadedFile | null;
}

interface CorporateLegal {
  companyNpwp: string;
  companyNpwpFile: UploadedFile | null;
  deedNumber: string;
  deedDate: string;
  deedFile: UploadedFile | null;
  ministryDate: string;
  ministryFile: UploadedFile | null;
  deedChanges: {
    id: string;
    deedNumber: string;
    deedDate: string;
    deedFile: UploadedFile | null;
  }[];
}

interface LicensingData {
  licenseType: 'NIB' | 'SIUP & TDP';
  nibNumber: string;
  nibFile: UploadedFile | null;
  nibRiskFile: UploadedFile | null;
  commitmentLetter: UploadedFile | null;
}

interface DigitalSignatureData {
  selfie: UploadedFile | null;
}

interface MembershipAgreement {
  membership: boolean;
  savings: boolean;
  adArt: boolean;
}

type SectionCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

const SectionCard = ({ title, description, children }: SectionCardProps) => (
  <section className="bg-slate-900/40 border border-slate-700 rounded-2xl p-6 space-y-4">
    <div>
      <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
      {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
    </div>
    {children}
  </section>
);

const generateId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);

function ProfilBisnisContent() {
  useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('perusahaan');
  const [savedToast, setSavedToast] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Backend integration state
  const [mitraStatus, setMitraStatus] = useState<MitraApplicationResponse | null>(null);
  const [documentUploadStatus, setDocumentUploadStatus] = useState<DocumentUploadStatus>({
    nib: false,
    akta_pendirian: false,
    ktp_direktur: false,
  });
  const [, setUploadingDocs] = useState<Record<string, boolean>>({});

  const [companyBasics, setCompanyBasics] = useState<CompanyBasics>({
    name: '',
    entityType: '',
    profile: null,
    phone: '',
    email: '',
    city: '',
  });

  const [companyLocation, setCompanyLocation] = useState<CompanyLocation>({
    status: '',
    locationDoc: null,
    address1: '',
    address2: '',
    postalCode: '',
    province: '',
    city: '',
    district: '',
    village: '',
    sector: '',
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: generateId(), name: '', title: '', resume: null, ownership: '' },
  ]);

  const [riskList, setRiskList] = useState<RiskItem[]>([
    { id: generateId(), riskType: '', description: '', mitigation: '' },
  ]);

  const [responsiblePerson, setResponsiblePerson] = useState<ResponsiblePerson>({
    fullName: '',
    gender: '',
    religion: '',
    birthDate: '',
    birthPlace: '',
    email: '',
    phone: '',
    position: '',
    nationality: '',
    education: '',
    maritalStatus: '',
  });

  const [responsibleAddress, setResponsibleAddress] = useState<ResponsibleAddress>({
    address: '',
    postalCode: '',
    province: '',
    city: '',
    district: '',
    village: '',
    sameAsKtp: false,
    ktpAddress: '',
    ktpPostalCode: '',
    ktpProvince: '',
    ktpCity: '',
    ktpDistrict: '',
    ktpVillage: '',
  });

  const [responsibleDocs, setResponsibleDocs] = useState<ResponsibleDocuments>({
    ktpNumber: '',
    ktpFile: null,
    npwpNumber: '',
    npwpFile: null,
  });

  const [relationsData, setRelationsData] = useState<RelationsData>({
    relativeName: '',
    relativePhone: '',
    relationType: '',
    commissionerName: '',
    commissionerPhone: '',
    commissionerKtp: '',
    commissionerKtpFile: null,
    commissionerApproval: null,
  });

  const [financialPerformance, setFinancialPerformance] = useState<FinancialPerformance>({
    sales: '',
    operatingIncome: '',
    netIncome: '',
    currentAssets: '',
    nonCurrentAssets: '',
    shortDebt: '',
    longDebt: '',
    totalEquity: '',
  });

  const [bankInfo, setBankInfo] = useState<BankInfo>({
    bankName: '',
    accountName: '',
    accountNumber: '',
    branch: '',
    bankAddress: '',
  });

  const [financialDocs, setFinancialDocs] = useState<FinancialDocuments>({
    bankStatement: null,
    financialReport: null,
    currentYearReport: null,
  });

  const [corporateLegal, setCorporateLegal] = useState<CorporateLegal>({
    companyNpwp: '',
    companyNpwpFile: null,
    deedNumber: '',
    deedDate: '',
    deedFile: null,
    ministryDate: '',
    ministryFile: null,
    deedChanges: [],
  });

  const [licensing, setLicensing] = useState<LicensingData>({
    licenseType: 'NIB',
    nibNumber: '',
    nibFile: null,
    nibRiskFile: null,
    commitmentLetter: null,
  });

  const [digitalSignature, setDigitalSignature] = useState<DigitalSignatureData>({
    selfie: null,
  });

  const [membershipAgreement, setMembershipAgreement] = useState<MembershipAgreement>({
    membership: false,
    savings: false,
    adArt: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check mitra status on mount
  useEffect(() => {
    const checkMitraStatus = async () => {
      try {
        const res = await userAPI.getMitraStatus();
        if (res.success && res.data) {
          setMitraStatus(res.data);
          setDocumentUploadStatus(res.data.documents_status);

          // If already approved or pending, mark as submitted
          if (res.data.application?.status === 'pending' || res.data.application?.status === 'approved') {
            setSubmitted(true);
            // Pre-fill company name if available
            if (res.data.application?.company_name) {
              const companyName = res.data.application.company_name;
              setCompanyBasics(prev => ({ ...prev, name: companyName }));
            }
          }
        }
      } catch (err) {
        console.error('Failed to check mitra status:', err);
      }
    };

    checkMitraStatus();
  }, []);

  // Function to upload document to backend (only for nib, akta_pendirian, ktp_direktur)
  const uploadDocumentToBackend = async (file: File, documentType: BackendDocumentType): Promise<boolean> => {
    setUploadingDocs(prev => ({ ...prev, [documentType]: true }));
    try {
      const res = await userAPI.uploadMitraDocument(file, documentType);
      if (res.success) {
        setDocumentUploadStatus(prev => ({ ...prev, [documentType]: true }));
        return true;
      } else {
        setSubmitError(res.error?.message || `Gagal mengupload ${documentType}`);
        return false;
      }
    } catch {
      setSubmitError(`Gagal mengupload ${documentType}`);
      return false;
    } finally {
      setUploadingDocs(prev => ({ ...prev, [documentType]: false }));
    }
  };

  const fieldRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({});
  const activeFieldRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    const activeKey = activeFieldRef.current;
    if (!activeKey) {
      return;
    }
    const node = fieldRefs.current[activeKey];
    if (node && document.activeElement !== node) {
      node.focus();
      try {
        const length = node.value.length;
        node.setSelectionRange(length, length);
      } catch {
        // Ignore selection errors for inputs that do not support setSelectionRange
      }
    }
  });

  const tabList: { key: TabKey; label: string }[] = [
    { key: 'perusahaan', label: 'Perusahaan' },
    { key: 'penanggung', label: 'Penanggung Jawab' },
    { key: 'keuangan', label: 'Keuangan' },
    { key: 'dokumen', label: 'Dokumen Perusahaan' },
    { key: 'tandaTangan', label: 'Tanda Tangan Digital' },
  ];

  const requiredChecks = useMemo(() => {
    const fields: boolean[] = [];

    // Company basics
    fields.push(
      Boolean(companyBasics.name.trim()),
      Boolean(companyBasics.entityType),
      Boolean(companyBasics.profile),
      Boolean(companyBasics.phone.trim()),
      Boolean(companyBasics.email.trim()),
      Boolean(companyBasics.city.trim()),
    );

    // Location
    fields.push(
      Boolean(companyLocation.status),
      companyLocation.status === 'Sewa' || companyLocation.status === 'Pinjam'
        ? Boolean(companyLocation.locationDoc)
        : true,
      Boolean(companyLocation.address1.trim()),
      Boolean(companyLocation.postalCode.trim()),
      Boolean(companyLocation.province),
      Boolean(companyLocation.city),
      Boolean(companyLocation.district),
      Boolean(companyLocation.village),
      Boolean(companyLocation.sector),
    );

    // Team members
    teamMembers.forEach((member) => {
      fields.push(
        Boolean(member.name.trim()),
        Boolean(member.title.trim()),
        Boolean(member.resume),
        Boolean(member.ownership),
      );
    });

    // Risks
    riskList.forEach((risk) => {
      fields.push(
        Boolean(risk.riskType),
        Boolean(risk.description.trim()),
        Boolean(risk.mitigation.trim()),
      );
    });

    // Responsible person
    Object.values(responsiblePerson).forEach((value) => fields.push(Boolean((value as string).trim())));

    // Address
    fields.push(
      Boolean(responsibleAddress.address.trim()),
      Boolean(responsibleAddress.postalCode.trim()),
      Boolean(responsibleAddress.province),
      Boolean(responsibleAddress.city),
      Boolean(responsibleAddress.district),
      Boolean(responsibleAddress.village),
    );

    if (!responsibleAddress.sameAsKtp) {
      fields.push(
        Boolean(responsibleAddress.ktpAddress.trim()),
        Boolean(responsibleAddress.ktpPostalCode.trim()),
        Boolean(responsibleAddress.ktpProvince),
        Boolean(responsibleAddress.ktpCity),
        Boolean(responsibleAddress.ktpDistrict),
        Boolean(responsibleAddress.ktpVillage),
      );
    }

    // Docs
    fields.push(
      Boolean(responsibleDocs.ktpNumber.trim()),
      Boolean(responsibleDocs.ktpFile),
      Boolean(responsibleDocs.npwpNumber.trim()),
      Boolean(responsibleDocs.npwpFile),
      Boolean(responsiblePerson.maritalStatus),
    );

    // Relations
    fields.push(
      Boolean(relationsData.relativeName.trim()),
      Boolean(relationsData.relativePhone.trim()),
      Boolean(relationsData.relationType),
    );

    const commissionerProvided = Boolean(
      relationsData.commissionerName.trim() ||
      relationsData.commissionerPhone.trim() ||
      relationsData.commissionerKtp.trim() ||
      relationsData.commissionerKtpFile ||
      relationsData.commissionerApproval,
    );

    if (commissionerProvided) {
      fields.push(
        Boolean(relationsData.commissionerName.trim()),
        Boolean(relationsData.commissionerPhone.trim()),
        Boolean(relationsData.commissionerKtp.trim()),
        Boolean(relationsData.commissionerKtpFile),
        Boolean(relationsData.commissionerApproval),
      );
    }

    // Financial
    Object.values(financialPerformance).forEach((val) => fields.push(Boolean((val as string).trim())));
    Object.values(bankInfo).forEach((val) => fields.push(Boolean((val as string).trim())));
    fields.push(
      Boolean(financialDocs.bankStatement),
      Boolean(financialDocs.financialReport),
      Boolean(financialDocs.currentYearReport),
    );

    // Legal docs
    fields.push(
      Boolean(corporateLegal.companyNpwp.trim()),
      Boolean(corporateLegal.companyNpwpFile),
      Boolean(corporateLegal.deedNumber.trim()),
      Boolean(corporateLegal.deedDate),
      Boolean(corporateLegal.deedFile),
      Boolean(corporateLegal.ministryDate),
      Boolean(corporateLegal.ministryFile),
    );

    corporateLegal.deedChanges.forEach((change) => {
      fields.push(Boolean(change.deedNumber.trim()), Boolean(change.deedDate), Boolean(change.deedFile));
    });

    fields.push(
      Boolean(licensing.nibNumber.trim()),
      Boolean(licensing.nibFile),
      Boolean(licensing.nibRiskFile),
      Boolean(licensing.commitmentLetter),
    );

    fields.push(Boolean(digitalSignature.selfie));
    fields.push(
      membershipAgreement.membership,
      membershipAgreement.savings,
      membershipAgreement.adArt,
    );

    return fields;
  }, [
    bankInfo,
    companyBasics,
    companyLocation,
    corporateLegal,
    digitalSignature,
    financialDocs,
    financialPerformance,
    licensing,
    relationsData,
    responsibleAddress,
    responsibleDocs,
    responsiblePerson,
    riskList,
    teamMembers,
    membershipAgreement,
  ]);

  const progress = useMemo(() => {
    const filled = requiredChecks.filter(Boolean).length;
    const percent = requiredChecks.length === 0 ? 0 : Math.round((filled / requiredChecks.length) * 100);
    return Math.min(percent, 100);
  }, [requiredChecks]);

  const handleFileUpload = (file: File, callback: (uploaded: UploadedFile) => void) => {
    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file maksimal 10MB');
      return;
    }
    callback({ name: file.name, size: file.size, file });
  };

  const handleTeamMemberChange = (id: string, field: keyof TeamMember, value: string | UploadedFile | null) => {
    setTeamMembers((prev) =>
      prev.map((member) => (member.id === id ? { ...member, [field]: value } : member)),
    );
  };

  const handleRiskChange = (id: string, field: keyof RiskItem, value: string) => {
    setRiskList((prev) => prev.map((risk) => (risk.id === id ? { ...risk, [field]: value } : risk)));
  };

  const addTeamMember = () => {
    setTeamMembers((prev) => [
      ...prev,
      { id: generateId(), name: '', title: '', resume: null, ownership: '' },
    ]);
  };

  const removeTeamMember = (id: string) => {
    setTeamMembers((prev) => (prev.length === 1 ? prev : prev.filter((member) => member.id !== id)));
  };

  const addRisk = () => {
    setRiskList((prev) => [
      ...prev,
      { id: generateId(), riskType: '', description: '', mitigation: '' },
    ]);
  };

  const removeRisk = (id: string) => {
    setRiskList((prev) => (prev.length === 1 ? prev : prev.filter((risk) => risk.id !== id)));
  };

  const addDeedChange = () => {
    setCorporateLegal((prev) => ({
      ...prev,
      deedChanges: [
        ...prev.deedChanges,
        { id: generateId(), deedNumber: '', deedDate: '', deedFile: null },
      ],
    }));
  };

  const handleDeedChange = (
    id: string,
    field: 'deedNumber' | 'deedDate' | 'deedFile',
    value: string | UploadedFile | null,
  ) => {
    setCorporateLegal((prev) => ({
      ...prev,
      deedChanges: prev.deedChanges.map((change) =>
        change.id === id ? { ...change, [field]: value } : change,
      ),
    }));
  };

  const removeDeedChange = (id: string) => {
    setCorporateLegal((prev) => ({
      ...prev,
      deedChanges: prev.deedChanges.filter((change) => change.id !== id),
    }));
  };

  const formatNumberInput = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleSaveDraft = () => {
    console.log('Draft saved', {
      companyBasics,
      companyLocation,
      teamMembers,
      riskList,
      responsiblePerson,
      responsibleAddress,
      responsibleDocs,
      relationsData,
      financialPerformance,
      bankInfo,
      financialDocs,
      corporateLegal,
      licensing,
      digitalSignature,
      membershipAgreement,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 4000);
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    // Validasi data perusahaan yang diperlukan backend
    if (!companyBasics.name.trim()) {
      newErrors.companyName = 'Nama perusahaan wajib diisi.';
    }
    if (!companyBasics.entityType) {
      newErrors.entityType = 'Bentuk badan usaha wajib dipilih.';
    }
    if (!corporateLegal.companyNpwp.trim()) {
      newErrors.npwp = 'NPWP perusahaan wajib diisi.';
    }
    if (!digitalSignature.selfie) {
      newErrors.selfie = 'Mohon ambil foto selfie penanggung jawab terlebih dahulu.';
    }
    if (!membershipAgreement.membership || !membershipAgreement.savings || !membershipAgreement.adArt) {
      newErrors.membership = 'Mohon setujui seluruh akad keanggotaan sebelum melanjutkan.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (newErrors.companyName || newErrors.entityType) {
        setActiveTab('perusahaan');
      } else if (newErrors.npwp) {
        setActiveTab('dokumen');
      } else {
        setActiveTab('tandaTangan');
      }
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Step 1: Submit Mitra Application (company data)
      // Map entityType to company_type format expected by backend
      const companyTypeMap: Record<string, 'PT' | 'CV' | 'UD'> = {
        'PT': 'PT',
        'CV': 'CV',
        'Firma': 'CV',
        'Koperasi': 'CV',
        'Lainnya': 'UD',
        'UD': 'UD',
      };

      // Map financialPerformance.sales to annual_revenue format
      const getAnnualRevenue = (sales: string): '<1M' | '1M-5M' | '5M-25M' | '25M-100M' | '>100M' => {
        const numericValue = parseInt(sales.replace(/\./g, ''), 10);
        if (isNaN(numericValue)) return '<1M';
        if (numericValue < 1000000000) return '<1M'; // < 1 Miliar
        if (numericValue < 5000000000) return '1M-5M'; // 1-5 Miliar
        if (numericValue < 25000000000) return '5M-25M'; // 5-25 Miliar
        if (numericValue < 100000000000) return '25M-100M'; // 25-100 Miliar
        return '>100M'; // > 100 Miliar
      };

      const mitraApplicationData = {
        company_name: companyBasics.name.trim(),
        company_type: companyTypeMap[companyBasics.entityType] || 'PT',
        npwp: corporateLegal.companyNpwp.replace(/\D/g, ''), // Remove non-digits
        annual_revenue: getAnnualRevenue(financialPerformance.sales),
        address: companyLocation.address1 || '',
        business_description: riskList[0]?.description || 'Eksportir',
        website_url: '',
        year_founded: new Date().getFullYear(),
        key_products: companyLocation.sector || 'Export Products',
        export_markets: 'International',
      };

      const applyRes = await userAPI.applyMitra(mitraApplicationData);

      if (!applyRes.success) {
        setSubmitError(applyRes.error?.message || 'Gagal mengirim aplikasi mitra.');
        setIsSubmitting(false);
        return;
      }

      // Step 2: Upload required documents (only the three that backend supports)
      const documentsToUpload: { file: File | null; type: BackendDocumentType; name: string }[] = [
        { file: licensing.nibFile?.file || null, type: 'nib', name: 'NIB' },
        { file: corporateLegal.deedFile?.file || null, type: 'akta_pendirian', name: 'Akta Pendirian' },
        { file: responsibleDocs.ktpFile?.file || null, type: 'ktp_direktur', name: 'KTP Direktur' },
      ];

      for (const doc of documentsToUpload) {
        if (doc.file && !documentUploadStatus[doc.type]) {
          const uploadSuccess = await uploadDocumentToBackend(doc.file, doc.type);
          if (!uploadSuccess) {
            setSubmitError(`Gagal mengupload ${doc.name}. Silakan coba lagi.`);
            setIsSubmitting(false);
            return;
          }
        }
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      console.error('Submit error:', err);
      setSubmitError('Terjadi kesalahan saat mengirim data. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMembershipAgreementChange = (key: keyof MembershipAgreement, checked: boolean) => {
    setMembershipAgreement((prev) => {
      const updated = { ...prev, [key]: checked };
      if (updated.membership && updated.savings && updated.adArt) {
        setErrors((prevErrors) => {
          if (!prevErrors.membership) {
            return prevErrors;
          }
          const nextErrors = { ...prevErrors };
          delete nextErrors.membership;
          return nextErrors;
        });
      }
      return updated;
    });
  };

  const renderSidebar = () => (
    <nav className="space-y-2">
      {tabList.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`w-full text-left px-4 py-3 rounded-xl transition-all border ${activeTab === tab.key
            ? 'bg-cyan-600/20 border-cyan-500 text-cyan-200'
            : 'bg-slate-900/30 border-slate-700 text-slate-300 hover:border-slate-600'
            }`}
        >
          <div className="text-sm font-semibold">{tab.label}</div>
          <p className="text-xs text-slate-400">Lengkapi data {tab.label.toLowerCase()}</p>
        </button>
      ))}
    </nav>
  );

  const renderInput = (
    fieldKey: string,
    label: string,
    value: string,
    onChange: (value: string) => void,
    options: { placeholder?: string; required?: boolean; type?: string; helper?: string } = {},
  ) => (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {label} {options.required && <span className="text-red-400">*</span>}
      </label>
      <input
        ref={(node) => {
          fieldRefs.current[fieldKey] = node;
        }}
        type={options.type ?? 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          activeFieldRef.current = fieldKey;
        }}
        onBlur={() => {
          if (activeFieldRef.current === fieldKey) {
            activeFieldRef.current = null;
          }
        }}
        className="w-full px-4 py-3 bg-slate-950/40 border border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 placeholder:text-slate-500"
        placeholder={options.placeholder}
      />
      {options.helper && <p className="text-xs text-slate-500 mt-1">{options.helper}</p>}
    </div>
  );

  const renderSelect = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    choices: string[],
    required = false,
  ) => (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-slate-950/40 border border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-cyan-500"
      >
        <option value="">Pilih {label}</option>
        {choices.map((choice) => (
          <option key={choice} value={choice}>
            {choice}
          </option>
        ))}
      </select>
    </div>
  );

  const renderTextarea = (
    fieldKey: string,
    label: string,
    value: string,
    onChange: (value: string) => void,
    required = false,
    rows = 3,
  ) => (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        ref={(node) => {
          fieldRefs.current[fieldKey] = node;
        }}
        onFocus={() => {
          activeFieldRef.current = fieldKey;
        }}
        onBlur={() => {
          if (activeFieldRef.current === fieldKey) {
            activeFieldRef.current = null;
          }
        }}
        className="w-full px-4 py-3 bg-slate-950/40 border border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 placeholder:text-slate-500"
      />
    </div>
  );

  const uploadField = (
    label: string,
    file: UploadedFile | null,
    onFileChange: (uploaded: UploadedFile | null) => void,
    required = false,
    accept = '.pdf,.jpg,.jpeg,.png',
  ) => (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {!file ? (
        <label className="relative flex flex-col items-center justify-center w-full border-2 border-dashed border-slate-600 rounded-xl py-6 cursor-pointer text-center text-slate-400 hover:border-cyan-500 transition-all">
          <svg className="w-10 h-10 mb-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <div className="text-sm">
            Seret & lepas atau <span className="text-cyan-400">pilih file</span>
          </div>
          <p className="text-xs mt-1">PDF/JPG/PNG · Maks 10MB</p>
          <input
            type="file"
            accept={accept}
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) => {
              const selected = e.target.files?.[0];
              if (selected) {
                handleFileUpload(selected, (uploaded) => onFileChange(uploaded));
              }
            }}
          />
        </label>
      ) : (
        <div className="flex items-center justify-between border border-slate-700 rounded-xl px-4 py-3 bg-slate-900/50">
          <div>
            <p className="text-sm text-slate-100">{file.name}</p>
            <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
          <button
            type="button"
            onClick={() => onFileChange(null)}
            className="text-red-400 text-sm hover:text-red-300"
          >
            Hapus
          </button>
        </div>
      )}
    </div>
  );

  const companyTab = (
    <div className="space-y-8">
      <SectionCard title="Informasi Dasar" description="Data utama perusahaan untuk verifikasi awal.">
        <div className="grid gap-6 md:grid-cols-2">
          {renderInput('companyBasics.name', 'Nama Perusahaan', companyBasics.name, (value) => setCompanyBasics((prev) => ({ ...prev, name: value })), {
            required: true,
            placeholder: 'PT Mitra Ekspor Nusantara',
          })}
          {renderSelect('Bentuk Badan Usaha', companyBasics.entityType, (value) => setCompanyBasics((prev) => ({ ...prev, entityType: value })), ['PT', 'CV', 'Firma', 'Koperasi', 'Lainnya'], true)}
        </div>
        {uploadField('Profil Perusahaan (PDF)', companyBasics.profile, (file) => setCompanyBasics((prev) => ({ ...prev, profile: file })), true, '.pdf')}
        <div className="grid gap-6 md:grid-cols-2">
          {renderInput('companyBasics.phone', 'Nomor Telepon', companyBasics.phone, (value) => setCompanyBasics((prev) => ({ ...prev, phone: value })), {
            required: true,
            placeholder: '021-1234567',
          })}
          {renderInput('companyBasics.email', 'Email Perusahaan', companyBasics.email, (value) => setCompanyBasics((prev) => ({ ...prev, email: value })), {
            required: true,
            placeholder: 'cs@perusahaan.com',
            type: 'email',
          })}
        </div>
        {renderInput('companyBasics.city', 'Kota/Kabupaten Berdiri', companyBasics.city, (value) => setCompanyBasics((prev) => ({ ...prev, city: value })), {
          required: true,
          placeholder: 'Jakarta Selatan',
        })}
      </SectionCard>

      <SectionCard title="Lokasi & Alamat" description="Detail lokasi operasional untuk verifikasi kunjungan.">
        <div className="grid gap-6 md:grid-cols-2">
          {renderSelect('Status Lokasi Usaha', companyLocation.status, (value) => setCompanyLocation((prev) => ({ ...prev, status: value })), ['Milik Sendiri', 'Sewa', 'Pinjam Pakai', 'Lainnya'], true)}
          {uploadField('Dokumen Lokasi Usaha', companyLocation.locationDoc, (file) => setCompanyLocation((prev) => ({ ...prev, locationDoc: file })), companyLocation.status === 'Sewa' || companyLocation.status === 'Pinjam Pakai')}
        </div>
        {renderInput('companyLocation.address1', 'Alamat Perusahaan (Jalan/No)', companyLocation.address1, (value) => setCompanyLocation((prev) => ({ ...prev, address1: value })), {
          required: true,
          placeholder: 'Jl. Gatot Subroto No. 12',
        })}
        {renderInput('companyLocation.address2', 'Alamat Perusahaan 2 (Opsional)', companyLocation.address2, (value) => setCompanyLocation((prev) => ({ ...prev, address2: value })), {
          placeholder: 'Gedung / Lantai',
        })}
        <div className="grid gap-6 md:grid-cols-2">
          {renderInput('companyLocation.postalCode', 'Kode Pos', companyLocation.postalCode, (value) => setCompanyLocation((prev) => ({ ...prev, postalCode: value })), { required: true })}
          {renderSelect('Provinsi', companyLocation.province, (value) => setCompanyLocation((prev) => ({ ...prev, province: value })), ['DKI Jakarta', 'Jawa Barat', 'Jawa Timur', 'Jawa Tengah', 'Banten', 'Sumatera Utara', 'Lainnya'], true)}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {renderSelect('Kabupaten/Kota', companyLocation.city, (value) => setCompanyLocation((prev) => ({ ...prev, city: value })), ['Jakarta Selatan', 'Jakarta Timur', 'Bandung', 'Surabaya', 'Medan', 'Makassar'], true)}
          {renderSelect('Kecamatan', companyLocation.district, (value) => setCompanyLocation((prev) => ({ ...prev, district: value })), ['Setiabudi', 'Menteng', 'Cidadap', 'Cilandak', 'Sukmajaya', 'Lainnya'], true)}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {renderSelect('Kelurahan', companyLocation.village, (value) => setCompanyLocation((prev) => ({ ...prev, village: value })), ['Kuningan', 'Senayan', 'Lebak Bulus', 'Rawamangun', 'Cipinang', 'Lainnya'], true)}
          {renderSelect('Sektor Usaha', companyLocation.sector, (value) => setCompanyLocation((prev) => ({ ...prev, sector: value })), ['Perdagangan', 'Manufaktur', 'Pertanian/Perkebunan', 'Perikanan', 'Jasa', 'Lainnya'], true)}
        </div>
      </SectionCard>

      <SectionCard title="Informasi Tim" description="Daftarkan anggota tim kunci.">
        <div className="space-y-6">
          {teamMembers.map((member, index) => (
            <div key={member.id} className="border border-slate-700 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">Anggota #{index + 1}</p>
                <button
                  type="button"
                  onClick={() => removeTeamMember(member.id)}
                  className="text-xs text-red-400 hover:text-red-300"
                  disabled={teamMembers.length === 1}
                >
                  Hapus
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {renderInput(`teamMembers.${member.id}.name`, 'Nama Lengkap', member.name, (value) => handleTeamMemberChange(member.id, 'name', value), { required: true })}
                {renderInput(`teamMembers.${member.id}.title`, 'Jabatan', member.title, (value) => handleTeamMemberChange(member.id, 'title', value), { required: true })}
              </div>
              {uploadField('Daftar Riwayat Hidup', member.resume, (file) => handleTeamMemberChange(member.id, 'resume', file), true)}
              {renderSelect('Kepemilikan Saham', member.ownership, (value) => handleTeamMemberChange(member.id, 'ownership', value), ['pemilik', 'bukan'], true)}
            </div>
          ))}
          <button
            type="button"
            onClick={addTeamMember}
            className="px-4 py-2 rounded-xl border border-dashed border-cyan-500 text-cyan-300 text-sm hover:bg-cyan-500/10"
          >
            Tambah Anggota Tim
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Risiko" description="Identifikasi risiko dan mitigasinya.">
        <div className="space-y-6">
          {riskList.map((risk, index) => (
            <div key={risk.id} className="border border-slate-700 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">Risiko #{index + 1}</p>
                <button
                  type="button"
                  onClick={() => removeRisk(risk.id)}
                  className="text-xs text-red-400"
                  disabled={riskList.length === 1}
                >
                  Hapus
                </button>
              </div>
              {renderSelect('Jenis Risiko', risk.riskType, (value) => handleRiskChange(risk.id, 'riskType', value), ['Operasional', 'Keuangan', 'Legal', 'Supply Chain', 'Lainnya'], true)}
              {renderTextarea(`riskList.${risk.id}.description`, 'Deskripsi Risiko', risk.description, (value) => handleRiskChange(risk.id, 'description', value), true, 3)}
              {renderTextarea(`riskList.${risk.id}.mitigation`, 'Mitigasi Risiko', risk.mitigation, (value) => handleRiskChange(risk.id, 'mitigation', value), true, 3)}
            </div>
          ))}
          <button
            type="button"
            onClick={addRisk}
            className="px-4 py-2 rounded-xl border border-dashed border-cyan-500 text-cyan-300 text-sm hover:bg-cyan-500/10"
          >
            Tambah Risiko
          </button>
        </div>
      </SectionCard>
    </div>
  );

  const penanggungTab = (
    <div className="space-y-8">
      <SectionCard title="Data Pribadi" description="Informasi penanggung jawab utama.">
        <div className="grid gap-6 md:grid-cols-2">
          {renderInput('responsiblePerson.fullName', 'Nama Lengkap', responsiblePerson.fullName, (value) => setResponsiblePerson((prev) => ({ ...prev, fullName: value })), { required: true })}
          {renderSelect('Jenis Kelamin', responsiblePerson.gender, (value) => setResponsiblePerson((prev) => ({ ...prev, gender: value })), ['Laki-laki', 'Perempuan'], true)}
          {renderSelect('Agama', responsiblePerson.religion, (value) => setResponsiblePerson((prev) => ({ ...prev, religion: value })), ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Lainnya'], true)}
          {renderInput('responsiblePerson.birthDate', 'Tanggal Lahir', responsiblePerson.birthDate, (value) => setResponsiblePerson((prev) => ({ ...prev, birthDate: value })), { required: true, type: 'date' })}
          {renderInput('responsiblePerson.birthPlace', 'Tempat Lahir', responsiblePerson.birthPlace, (value) => setResponsiblePerson((prev) => ({ ...prev, birthPlace: value })), { required: true })}
          {renderInput('responsiblePerson.email', 'Email', responsiblePerson.email, (value) => setResponsiblePerson((prev) => ({ ...prev, email: value })), { required: true, type: 'email' })}
          {renderInput('responsiblePerson.phone', 'No. Handphone', responsiblePerson.phone, (value) => setResponsiblePerson((prev) => ({ ...prev, phone: value })), { required: true })}
          {renderInput('responsiblePerson.position', 'Jabatan', responsiblePerson.position, (value) => setResponsiblePerson((prev) => ({ ...prev, position: value })), { required: true })}
          {renderInput('responsiblePerson.nationality', 'Kewarganegaraan', responsiblePerson.nationality, (value) => setResponsiblePerson((prev) => ({ ...prev, nationality: value })), { required: true })}
          {renderSelect('Pendidikan Terakhir', responsiblePerson.education, (value) => setResponsiblePerson((prev) => ({ ...prev, education: value })), ['SMA/SMK', 'Diploma', 'S1', 'S2', 'S3'], true)}
          {renderSelect('Status Pernikahan', responsiblePerson.maritalStatus, (value) => setResponsiblePerson((prev) => ({ ...prev, maritalStatus: value })), ['Belum Menikah', 'Menikah', 'Cerai'], true)}
        </div>
      </SectionCard>

      <SectionCard title="Alamat" description="Alamat domisili dan sesuai KTP.">
        {renderTextarea('responsibleAddress.address', 'Alamat Tempat Tinggal', responsibleAddress.address, (value) => setResponsibleAddress((prev) => ({ ...prev, address: value })), true, 3)}
        <div className="grid gap-6 md:grid-cols-2">
          {renderInput('responsibleAddress.postalCode', 'Kode Pos', responsibleAddress.postalCode, (value) => setResponsibleAddress((prev) => ({ ...prev, postalCode: value })), { required: true })}
          {renderSelect('Provinsi', responsibleAddress.province, (value) => setResponsibleAddress((prev) => ({ ...prev, province: value })), ['DKI Jakarta', 'Jawa Barat', 'Jawa Timur', 'Jawa Tengah', 'Lainnya'], true)}
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {renderSelect('Kabupaten/Kota', responsibleAddress.city, (value) => setResponsibleAddress((prev) => ({ ...prev, city: value })), ['Jakarta Selatan', 'Jakarta Timur', 'Bandung', 'Surabaya', 'Lainnya'], true)}
          {renderSelect('Kecamatan', responsibleAddress.district, (value) => setResponsibleAddress((prev) => ({ ...prev, district: value })), ['Setiabudi', 'Menteng', 'Tebet', 'Cilandak', 'Lainnya'], true)}
          {renderSelect('Kelurahan', responsibleAddress.village, (value) => setResponsibleAddress((prev) => ({ ...prev, village: value })), ['Kuningan', 'Senayan', 'Rawamangun', 'Cipinang', 'Lainnya'], true)}
        </div>
        <label className="inline-flex items-center space-x-3 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={responsibleAddress.sameAsKtp}
            onChange={(e) => setResponsibleAddress((prev) => ({ ...prev, sameAsKtp: e.target.checked }))}
            className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-cyan-500"
          />
          <span>Alamat sama dengan KTP</span>
        </label>
        {!responsibleAddress.sameAsKtp && (
          <div className="space-y-4">
            {renderTextarea('responsibleAddress.ktpAddress', 'Alamat sesuai KTP', responsibleAddress.ktpAddress, (value) => setResponsibleAddress((prev) => ({ ...prev, ktpAddress: value })), true, 3)}
            <div className="grid gap-6 md:grid-cols-2">
              {renderInput('responsibleAddress.ktpPostalCode', 'Kode Pos sesuai KTP', responsibleAddress.ktpPostalCode, (value) => setResponsibleAddress((prev) => ({ ...prev, ktpPostalCode: value })), { required: true })}
              {renderSelect('Provinsi KTP', responsibleAddress.ktpProvince, (value) => setResponsibleAddress((prev) => ({ ...prev, ktpProvince: value })), ['DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'Lainnya'], true)}
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {renderSelect('Kabupaten/Kota KTP', responsibleAddress.ktpCity, (value) => setResponsibleAddress((prev) => ({ ...prev, ktpCity: value })), ['Jakarta Selatan', 'Bogor', 'Depok', 'Bekasi', 'Lainnya'], true)}
              {renderSelect('Kecamatan KTP', responsibleAddress.ktpDistrict, (value) => setResponsibleAddress((prev) => ({ ...prev, ktpDistrict: value })), ['Setiabudi', 'Menteng', 'Sukmajaya', 'Cimanggis', 'Lainnya'], true)}
              {renderSelect('Kelurahan KTP', responsibleAddress.ktpVillage, (value) => setResponsibleAddress((prev) => ({ ...prev, ktpVillage: value })), ['Kuningan', 'Cinere', 'Sawangan', 'Lainnya'], true)}
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Dokumen Identitas">
        <div className="grid gap-6 md:grid-cols-2">
          {renderInput('responsibleDocs.ktpNumber', 'No. KTP Direktur', responsibleDocs.ktpNumber, (value) => setResponsibleDocs((prev) => ({ ...prev, ktpNumber: value })), { required: true })}
          {renderInput('responsibleDocs.npwpNumber', 'No. NPWP', responsibleDocs.npwpNumber, (value) => setResponsibleDocs((prev) => ({ ...prev, npwpNumber: value })), { required: true })}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {uploadField('Upload File KTP Direktur', responsibleDocs.ktpFile, (file) => setResponsibleDocs((prev) => ({ ...prev, ktpFile: file })), true)}
          {uploadField('Upload File NPWP', responsibleDocs.npwpFile, (file) => setResponsibleDocs((prev) => ({ ...prev, npwpFile: file })), true)}
        </div>
      </SectionCard>

      <SectionCard title="Relasi & Komisaris">
        <div className="grid gap-6 md:grid-cols-2">
          {renderInput('relationsData.relativeName', 'Nama Relasi/Kerabat', relationsData.relativeName, (value) => setRelationsData((prev) => ({ ...prev, relativeName: value })), { required: true })}
          {renderInput('relationsData.relativePhone', 'No. Telepon Relasi', relationsData.relativePhone, (value) => setRelationsData((prev) => ({ ...prev, relativePhone: value })), { required: true })}
          {renderSelect('Hubungan', relationsData.relationType, (value) => setRelationsData((prev) => ({ ...prev, relationType: value })), ['Pasangan', 'Orang Tua', 'Saudara', 'Rekan Kerja', 'Lainnya'], true)}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {renderInput('relationsData.commissionerName', 'Nama Komisaris', relationsData.commissionerName, (value) => setRelationsData((prev) => ({ ...prev, commissionerName: value })), { placeholder: 'Opsional' })}
          {renderInput('relationsData.commissionerPhone', 'No. Telepon Komisaris', relationsData.commissionerPhone, (value) => setRelationsData((prev) => ({ ...prev, commissionerPhone: value })), { placeholder: 'Opsional' })}
          {renderInput('relationsData.commissionerKtp', 'No. KTP Komisaris', relationsData.commissionerKtp, (value) => setRelationsData((prev) => ({ ...prev, commissionerKtp: value })), { placeholder: 'Opsional' })}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {uploadField('Upload KTP Komisaris', relationsData.commissionerKtpFile, (file) => setRelationsData((prev) => ({ ...prev, commissionerKtpFile: file })), false)}
          {uploadField('Surat Persetujuan Komisaris', relationsData.commissionerApproval, (file) => setRelationsData((prev) => ({ ...prev, commissionerApproval: file })), false)}
        </div>
      </SectionCard>
    </div>
  );

  const keuanganTab = (
    <div className="space-y-8">
      <SectionCard title="Kinerja Keuangan (Per Tahun)" description="Gunakan angka rupiah tanpa simbol.">
        <div className="grid gap-6 md:grid-cols-2">
          {renderInput('financialPerformance.sales', 'Total Penjualan Per Tahun (Rp)', financialPerformance.sales, (value) => setFinancialPerformance((prev) => ({ ...prev, sales: formatNumberInput(value) })), { required: true })}
          {renderInput('financialPerformance.operatingIncome', 'Laba Usaha (Rp)', financialPerformance.operatingIncome, (value) => setFinancialPerformance((prev) => ({ ...prev, operatingIncome: formatNumberInput(value) })), { required: true })}
          {renderInput('financialPerformance.netIncome', 'Laba Bersih Perusahaan (Rp)', financialPerformance.netIncome, (value) => setFinancialPerformance((prev) => ({ ...prev, netIncome: formatNumberInput(value) })), { required: true })}
          {renderInput('financialPerformance.currentAssets', 'Aset Lancar (Rp)', financialPerformance.currentAssets, (value) => setFinancialPerformance((prev) => ({ ...prev, currentAssets: formatNumberInput(value) })), { required: true })}
          {renderInput('financialPerformance.nonCurrentAssets', 'Aset Tidak Lancar (Rp)', financialPerformance.nonCurrentAssets, (value) => setFinancialPerformance((prev) => ({ ...prev, nonCurrentAssets: formatNumberInput(value) })), { required: true })}
          {renderInput('financialPerformance.shortDebt', 'Utang Jangka Pendek (Rp)', financialPerformance.shortDebt, (value) => setFinancialPerformance((prev) => ({ ...prev, shortDebt: formatNumberInput(value) })), { required: true })}
          {renderInput('financialPerformance.longDebt', 'Utang Jangka Panjang (Rp)', financialPerformance.longDebt, (value) => setFinancialPerformance((prev) => ({ ...prev, longDebt: formatNumberInput(value) })), { required: true })}
          {renderInput('financialPerformance.totalEquity', 'Total Modal (Rp)', financialPerformance.totalEquity, (value) => setFinancialPerformance((prev) => ({ ...prev, totalEquity: formatNumberInput(value) })), { required: true })}
        </div>
      </SectionCard>

      <SectionCard title="Informasi Rekening">
        <div className="grid gap-6 md:grid-cols-2">
          {renderInput('bankInfo.bankName', 'Nama Bank', bankInfo.bankName, (value) => setBankInfo((prev) => ({ ...prev, bankName: value })), { required: true })}
          {renderInput('bankInfo.accountName', 'Nama Rekening', bankInfo.accountName, (value) => setBankInfo((prev) => ({ ...prev, accountName: value })), { required: true })}
          {renderInput('bankInfo.accountNumber', 'Nomor Rekening', bankInfo.accountNumber, (value) => setBankInfo((prev) => ({ ...prev, accountNumber: value })), { required: true })}
          {renderInput('bankInfo.branch', 'Cabang / Wilayah / Negara', bankInfo.branch, (value) => setBankInfo((prev) => ({ ...prev, branch: value })), { required: true })}
          {renderInput('bankInfo.bankAddress', 'Alamat Bank', bankInfo.bankAddress, (value) => setBankInfo((prev) => ({ ...prev, bankAddress: value })), { required: true })}
        </div>
      </SectionCard>

      <SectionCard title="Dokumen Keuangan">
        <div className="grid gap-6 md:grid-cols-2">
          {uploadField('Rekening Koran Perusahaan', financialDocs.bankStatement, (file) => setFinancialDocs((prev) => ({ ...prev, bankStatement: file })), true)}
          {uploadField('Laporan Keuangan Perusahaan', financialDocs.financialReport, (file) => setFinancialDocs((prev) => ({ ...prev, financialReport: file })), true)}
          {uploadField('Laporan Keuangan Tahun Berjalan', financialDocs.currentYearReport, (file) => setFinancialDocs((prev) => ({ ...prev, currentYearReport: file })), true)}
        </div>
      </SectionCard>
    </div>
  );

  const dokumenTab = (
    <div className="space-y-8">
      <SectionCard title="Legalitas Utama">
        <div className="grid gap-6 md:grid-cols-2">
          {renderInput('corporateLegal.companyNpwp', 'Nomor NPWP Perusahaan', corporateLegal.companyNpwp, (value) => setCorporateLegal((prev) => ({ ...prev, companyNpwp: value })), { required: true })}
          {uploadField('Upload File NPWP', corporateLegal.companyNpwpFile, (file) => setCorporateLegal((prev) => ({ ...prev, companyNpwpFile: file })), true)}
          {renderInput('corporateLegal.deedNumber', 'No. Akta Pendirian', corporateLegal.deedNumber, (value) => setCorporateLegal((prev) => ({ ...prev, deedNumber: value })), { required: true })}
          {renderInput('corporateLegal.deedDate', 'Tanggal Akta Pendirian', corporateLegal.deedDate, (value) => setCorporateLegal((prev) => ({ ...prev, deedDate: value })), { required: true, type: 'date' })}
          {uploadField('Upload File Akta Pendirian', corporateLegal.deedFile, (file) => setCorporateLegal((prev) => ({ ...prev, deedFile: file })), true, '.pdf')}
          {renderInput('corporateLegal.ministryDate', 'Tanggal SK Kemenkumham Akta Pendirian', corporateLegal.ministryDate, (value) => setCorporateLegal((prev) => ({ ...prev, ministryDate: value })), { required: true, type: 'date' })}
          {uploadField('Upload SK Kemenkumham Akta Pendirian', corporateLegal.ministryFile, (file) => setCorporateLegal((prev) => ({ ...prev, ministryFile: file })), true, '.pdf')}
        </div>
        <div className="space-y-4">
          {corporateLegal.deedChanges.map((change, index) => (
            <div key={change.id} className="border border-slate-700 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between text-sm text-slate-400">
                Akta Perubahan #{index + 1}
                <button
                  type="button"
                  onClick={() => removeDeedChange(change.id)}
                  className="text-xs text-red-400"
                >
                  Hapus
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {renderInput(`corporateLegal.deedChanges.${change.id}.deedNumber`, 'No. Akta Perubahan', change.deedNumber, (value) => handleDeedChange(change.id, 'deedNumber', value), { required: true })}
                {renderInput(`corporateLegal.deedChanges.${change.id}.deedDate`, 'Tanggal Akta', change.deedDate, (value) => handleDeedChange(change.id, 'deedDate', value), { required: true, type: 'date' })}
              </div>
              {uploadField('Upload Akta Perubahan', change.deedFile, (file) => handleDeedChange(change.id, 'deedFile', file), true, '.pdf')}
            </div>
          ))}
          <button
            type="button"
            onClick={addDeedChange}
            className="px-4 py-2 rounded-xl border border-dashed border-cyan-500 text-cyan-300 text-sm hover:bg-cyan-500/10"
          >
            Tambah Akta Perubahan
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Perizinan">
        {renderSelect(
          'Jenis Dokumen Perizinan',
          licensing.licenseType,
          (value) => setLicensing((prev) => ({ ...prev, licenseType: value as LicensingData['licenseType'] })),
          ['NIB', 'SIUP & TDP'],
          true,
        )}
        <div className="grid gap-6 md:grid-cols-2">
          {renderInput('licensing.nibNumber', 'No. NIB', licensing.nibNumber, (value) => setLicensing((prev) => ({ ...prev, nibNumber: value })), { required: true })}
          {uploadField('Upload File NIB', licensing.nibFile, (file) => setLicensing((prev) => ({ ...prev, nibFile: file })), true)}
          {uploadField('Upload NIB Berbasis Risiko', licensing.nibRiskFile, (file) => setLicensing((prev) => ({ ...prev, nibRiskFile: file })), true)}
          {uploadField('Surat Permohonan Menjadi Anggota & Kesanggupan Bayar', licensing.commitmentLetter, (file) => setLicensing((prev) => ({ ...prev, commitmentLetter: file })), true)}
        </div>
      </SectionCard>
    </div>
  );

  const tandaTanganTab = (
    <div className="space-y-8">
      <SectionCard title="Verifikasi Wajah" description="Gunakan kamera untuk mengambil selfie penanggung jawab.">
        {uploadField('Foto Selfie Penanggung Jawab', digitalSignature.selfie, (file) => setDigitalSignature({ selfie: file }), true, '.jpg,.jpeg,.png')}
        {errors.selfie && <p className="text-sm text-red-400">{errors.selfie}</p>}
      </SectionCard>

      <SectionCard
        title="Akad Keanggotaan"
        description="Setujui ketentuan menjadi Anggota Luar Biasa/Mitra Koperasi Jasa VESSEL."
      >
        <div className="space-y-4">
          <label className="flex items-start gap-3 text-sm text-slate-200 bg-slate-900/40 border border-slate-700 rounded-xl p-4">
            <input
              type="checkbox"
              className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-900 text-cyan-500"
              checked={membershipAgreement.membership}
              onChange={(e) => handleMembershipAgreementChange('membership', e.target.checked)}
            />
            <span>Saya mewakili perusahaan mengajukan diri menjadi Anggota Luar Biasa/Mitra pada Koperasi Jasa VESSEL.</span>
          </label>
          <label className="flex items-start gap-3 text-sm text-slate-200 bg-slate-900/40 border border-slate-700 rounded-xl p-4">
            <input
              type="checkbox"
              className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-900 text-cyan-500"
              checked={membershipAgreement.savings}
              onChange={(e) => handleMembershipAgreementChange('savings', e.target.checked)}
            />
            <span>Saya menyetujui pemotongan Simpanan Pokok (Rp 50.000) dan Simpanan Wajib dari pencairan pembiayaan pertama.</span>
          </label>
          <label className="flex items-start gap-3 text-sm text-slate-200 bg-slate-900/40 border border-slate-700 rounded-xl p-4">
            <input
              type="checkbox"
              className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-900 text-cyan-500"
              checked={membershipAgreement.adArt}
              onChange={(e) => handleMembershipAgreementChange('adArt', e.target.checked)}
            />
            <span>Saya telah membaca dan menyetujui AD/ART Koperasi.</span>
          </label>
        </div>
        {errors.membership && <p className="text-sm text-red-400">{errors.membership}</p>}
      </SectionCard>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <button
          type="button"
          onClick={handleSaveDraft}
          className="px-6 py-3 rounded-xl border border-slate-600 text-slate-300 hover:border-slate-500"
          disabled={isSubmitting}
        >
          Simpan
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('dokumen')}
            className="px-6 py-3 rounded-xl bg-slate-800 text-slate-200 border border-slate-700"
            disabled={isSubmitting}
          >
            Kembali
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || submitted}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-semibold shadow-lg shadow-cyan-900/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Mengirim...
              </>
            ) : submitted ? (
              'Sudah Terkirim'
            ) : (
              'Setuju & Daftar Anggota'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'perusahaan':
        return companyTab;
      case 'penanggung':
        return penanggungTab;
      case 'keuangan':
        return keuanganTab;
      case 'dokumen':
        return dokumenTab;
      case 'tandaTangan':
        return tandaTanganTab;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
      <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-[280px,1fr]">
        <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-6 space-y-6">
          <div>
            <p className="text-cyan-400 text-sm font-semibold">Kelengkapan</p>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-cyan-500 to-teal-500" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-slate-200 text-sm font-semibold">{progress}%</span>
            </div>
          </div>
          <div className="hidden lg:block">{renderSidebar()}</div>
          <div className="lg:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as TabKey)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100"
            >
              {tabList.map((tab) => (
                <option key={tab.key} value={tab.key}>
                  {tab.label}
                </option>
              ))}
            </select>
          </div>
          <div className="text-xs text-slate-500">
            Data Anda tersimpan secara lokal saat menekan tombol &quot;Simpan&quot;. Tidak ada data yang dikirim hingga Anda menekan &quot;Kirim Untuk Verifikasi&quot;.
          </div>
        </div>

        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 mt-2">Profil Bisnis & Verifikasi</h1>
            <p className="text-slate-400 mt-2">
              Lengkapi data untuk verifikasi perusahaan. Data digunakan untuk verifikasi kelayakan usaha (KYB)
              dan seluruh informasi tetap aman serta sesuai regulasi.
            </p>
          </div>

          {submitted && (
            <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 flex items-start gap-3">
              <svg className="w-5 h-5 text-emerald-400 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm text-emerald-300 font-semibold">Permohonan verifikasi terkirim</p>
                <p className="text-xs text-emerald-200 mt-1">
                  {mitraStatus?.application?.status === 'pending'
                    ? 'Aplikasi Anda sedang ditinjau oleh tim kami.'
                    : mitraStatus?.application?.status === 'approved'
                      ? 'Selamat! Aplikasi Anda telah disetujui.'
                      : 'Tim kami segera meninjau data dan menghubungi Anda melalui email.'}
                </p>
              </div>
            </div>
          )}

          {submitError && (
            <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-400 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm text-red-300 font-semibold">Terjadi Kesalahan</p>
                <p className="text-xs text-red-200 mt-1">{submitError}</p>
              </div>
            </div>
          )}

          {savedToast && (
            <div className="p-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-200 text-sm">
              Perubahan tersimpan secara lokal.
            </div>
          )}

          {renderActiveTab()}

          {activeTab !== 'tandaTangan' && (
            <div className="flex flex-col md:flex-row gap-3 justify-between pt-4">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = tabList.findIndex((tab) => tab.key === activeTab);
                    if (currentIndex > 0) {
                      setActiveTab(tabList[currentIndex - 1].key);
                    }
                  }}
                  className="px-5 py-3 rounded-xl border border-slate-700 text-slate-200"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = tabList.findIndex((tab) => tab.key === activeTab);
                    if (currentIndex < tabList.length - 1) {
                      setActiveTab(tabList[currentIndex + 1].key);
                    }
                  }}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-900/40"
                >
                  Lanjut
                </button>
              </div>
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-5 py-3 rounded-xl border border-slate-700 text-slate-200"
              >
                Simpan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfilBisnisPage() {
  return (
    <AuthGuard allowedRoles={['mitra']}>
      <ProfilBisnisContent />
    </AuthGuard>
  );
}
