import {
    APIResponse,
} from '../types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

interface CompleteProfileRequest {
    full_name: string;
    phone?: string;
    nik: string;
    ktp_photo_url: string;
    selfie_url: string;
    bank_code: string;
    account_number: string;
    account_name: string;
    company_name?: string;
    country?: string;
}

interface CompleteProfileResponse {
    message: string;
}

interface UploadFileResponse {
    url: string;
    hash: string;
}

class UserAPI {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private getAuthHeaders(): HeadersInit {
        const token = typeof window !== 'undefined' ? localStorage.getItem('vessel_access_token') : null;
        return {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<APIResponse<T>> {
        const url = `${this.baseURL}${endpoint}`;

        const config: RequestInit = {
            ...options,
            headers: {
                ...this.getAuthHeaders(),
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                const errorMessage = typeof data.error === 'string' ? data.error : (data.error?.message || 'Terjadi kesalahan yang tidak diketahui');
                return {
                    success: false,
                    error: {
                        code: 'API_ERROR',
                        message: errorMessage,
                    },
                };
            }

            return data;
        } catch {
            return {
                success: false,
                error: {
                    code: 'NETWORK_ERROR',
                    message: 'Gagal terhubung ke server. Periksa koneksi internet Anda.',
                },
            };
        }
    }

    async completeProfile(data: CompleteProfileRequest): Promise<APIResponse<CompleteProfileResponse>> {
        return this.request<CompleteProfileResponse>('/user/complete-profile', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async uploadFile(file: File, type: string): Promise<APIResponse<UploadFileResponse>> {
        const token = typeof window !== 'undefined' ? localStorage.getItem('vessel_access_token') : null;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('document_type', type);

        try {
            const response = await fetch(`${this.baseURL}/user/documents`, {
                method: 'POST',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formData,
            });
            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || {
                        code: 'UPLOAD_ERROR',
                        message: 'Gagal mengupload file',
                    },
                };
            }

            return data;
        } catch {
            return {
                success: false,
                error: {
                    code: 'NETWORK_ERROR',
                    message: 'Gagal mengupload file',
                },
            };
        }
    }

    async getProfile(): Promise<APIResponse<UserProfileResponse>> {
        return this.request<UserProfileResponse>('/user/profile', {
            method: 'GET',
        });
    }

    async updateProfile(data: Partial<UserProfileResponse>): Promise<APIResponse<UserProfileResponse>> {
        return this.request<UserProfileResponse>('/user/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async getProfileData(): Promise<APIResponse<UserProfileDataResponse>> {
        return this.request<UserProfileDataResponse>('/user/profile/data', {
            method: 'GET',
        });
    }

    async changePassword(data: { current_password: string; new_password: string; confirm_password: string }): Promise<APIResponse<{ message: string }>> {
        return this.request<{ message: string }>('/user/profile/password', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async getBalance(): Promise<APIResponse<{ balance_idrx: number; balance_idr: number }>> {
        return this.request<{ balance_idrx: number; balance_idr: number }>('/user/balance', {
            method: 'GET',
        });
    }

    async getBankAccount(): Promise<APIResponse<unknown>> {
        return this.request<unknown>('/user/profile/bank-account', {
            method: 'GET',
        });
    }

    async getSupportedBanks(): Promise<APIResponse<Array<{ code: string; name: string }>>> {
        return this.request<Array<{ code: string; name: string }>>('/user/profile/banks', {
            method: 'GET',
        });
    }

    async applyMitra(data: SubmitMitraApplicationRequest): Promise<APIResponse<unknown>> {
        return this.request<unknown>('/user/mitra/apply', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getMitraStatus(): Promise<APIResponse<MitraApplicationResponse>> {
        return this.request<MitraApplicationResponse>('/user/mitra/status', {
            method: 'GET',
        });
    }

    async uploadMitraDocument(file: File, type: string): Promise<APIResponse<unknown>> {
        const token = typeof window !== 'undefined' ? localStorage.getItem('vessel_access_token') : null;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('document_type', type);

        try {
            const response = await fetch(`${this.baseURL}/user/mitra/documents`, {
                method: 'POST',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formData,
            });
            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || {
                        code: 'UPLOAD_ERROR',
                        message: 'Gagal mengupload dokumen',
                    },
                };
            }

            return { success: true, data };
        } catch {
            return {
                success: false,
                error: {
                    code: 'NETWORK_ERROR',
                    message: 'Gagal mengupload dokumen',
                },
            };
        }
    }
    async updateWallet(data: { wallet_address: string; message: string; signature: string; nonce: string }): Promise<APIResponse<WalletUpdateResponse>> {
        return this.request<WalletUpdateResponse>('/user/wallet', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }
}

export interface WalletUpdateResponse {
    message: string;
    wallet_address: string;
}

export interface UserProfileResponse {
    id: string;
    email?: string;
    username: string;
    role: 'mitra' | 'investor' | 'admin';
    is_verified: boolean;
    profile_completed: boolean;
    email_verified: boolean;
    balance_idr: number;
    balance_idrx?: number;
    wallet_address?: string;
    member_status?: string;
    created_at: string;
}

export interface UserProfileDataResponse {
    user: UserProfileResponse;
    profile?: {
        full_name?: string;
        phone?: string;
        nik?: string;
        address?: string;
        city?: string;
        province?: string;
        postal_code?: string;
        country?: string;
        company_name?: string;
        bank_code?: string;
        account_number?: string;
        account_name?: string;
    };
}

export interface SubmitMitraApplicationRequest {
    company_name: string;
    company_type: 'PT' | 'CV' | 'UD';
    npwp: string;
    annual_revenue: '<1M' | '1M-5M' | '5M-25M' | '25M-100M' | '>100M';
    address: string;
    business_description: string;
    website_url?: string;
    year_founded: number;
    key_products: string;
    export_markets: string;
}

export interface MitraApplicationResponse {
    application: {
        id: string;
        status: 'pending' | 'approved' | 'rejected';
        company_name: string;
        company_type: string;
        rejection_reason?: string;
    };
    documents_status: {
        nib: boolean;
        akta_pendirian: boolean;
        ktp_direktur: boolean;
    };
    is_complete: boolean;
}

// Risk Questionnaire Types
export interface RiskQuestion {
    id: number;
    question: string;
    options: { value: number; label: string }[];
    required_for_catalyst?: boolean;
    required_answer?: number;
}

interface RiskQuestionsResponse {
    questions: RiskQuestion[];
    catalyst_unlock_rules: {
        description: string;
        required_q1: number;
        required_q2: number;
        required_q3: number;
    };
}

interface RiskQuestionnaireRequest {
    q1_answer: number;
    q2_answer: number;
    q3_answer: number;
}

export interface RiskQuestionnaireStatusResponse {
    completed: boolean;
    catalyst_unlocked: boolean;
    completed_at?: string;
    message: string;
}

class RiskQuestionnaireAPI {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private getAuthHeaders(): HeadersInit {
        const token = typeof window !== 'undefined' ? localStorage.getItem('vessel_access_token') : null;
        return {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<APIResponse<T>> {
        const url = `${this.baseURL}${endpoint}`;

        const config: RequestInit = {
            ...options,
            headers: {
                ...this.getAuthHeaders(),
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                const errorMessage = typeof data.error === 'string' ? data.error : (data.error?.message || 'Terjadi kesalahan');
                return {
                    success: false,
                    error: {
                        code: 'API_ERROR',
                        message: errorMessage,
                    },
                };
            }

            return data;
        } catch {
            return {
                success: false,
                error: {
                    code: 'NETWORK_ERROR',
                    message: 'Gagal terhubung ke server',
                },
            };
        }
    }

    async getQuestions(): Promise<APIResponse<RiskQuestionsResponse>> {
        return this.request<RiskQuestionsResponse>('/risk-questionnaire/questions', {
            method: 'GET',
        });
    }

    async submit(data: RiskQuestionnaireRequest): Promise<APIResponse<RiskQuestionnaireStatusResponse>> {
        return this.request<RiskQuestionnaireStatusResponse>('/risk-questionnaire', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getStatus(): Promise<APIResponse<RiskQuestionnaireStatusResponse>> {
        return this.request<RiskQuestionnaireStatusResponse>('/risk-questionnaire/status', {
            method: 'GET',
        });
    }
}

export interface MarketplacePool {
    pool_id: string;
    invoice_id: string;
    project_title: string;
    grade: string;
    is_insured: boolean;
    buyer_country: string;
    buyer_country_flag: string;
    buyer_company_name: string;
    buyer_country_risk: string;
    yield_range: string;
    min_yield: number;
    max_yield: number;
    tenor_days: number;
    tenor_display: string;
    remaining_time: string;
    funding_progress: number;
    target_amount: number;
    funded_amount: number;
    remaining_amount: number;
    is_fully_funded: boolean;
    priority_progress: number;
    catalyst_progress: number;
    priority_target: number;
    priority_funded: number;
    catalyst_target: number;
    catalyst_funded: number;
    priority_interest_rate: number;
    catalyst_interest_rate: number;
}

export interface MarketplaceFilters {
    grade?: string;
    is_insured?: boolean;
    min_amount?: number;
    max_amount?: number;
    sort_by?: 'yield_desc' | 'tenor_asc' | 'newest';
    page?: number;
    per_page?: number;
}





export interface InvestorPortfolio {
    total_funding: number;
    total_expected_gain: number;
    total_realized_gain: number;
    priority_allocation: number;
    catalyst_allocation: number;
    active_investments: number;
    completed_deals: number;
    available_balance: number;
}

export interface ActiveInvestment {
    investment_id: string;
    project_name: string;
    invoice_number: string;
    buyer_name: string;
    buyer_country: string;
    buyer_flag: string;
    tranche: string;
    tranche_display: string;
    principal: number;
    interest_rate: number;
    estimated_return: number;
    total_expected: number;
    due_date: string;
    days_remaining: number;
    status: string;
    status_display: string;
    status_color: string;
    invested_at: string;
}

interface ActiveInvestmentListResponse {
    investments: ActiveInvestment[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
}

class InvestmentAPI {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private getAuthHeaders(): HeadersInit {
        const token = typeof window !== 'undefined' ? localStorage.getItem('vessel_access_token') : null;
        return {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<APIResponse<T>> {
        const url = `${this.baseURL}${endpoint}`;

        const config: RequestInit = {
            ...options,
            headers: {
                ...this.getAuthHeaders(),
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                const errorMessage = typeof data.error === 'string' ? data.error : (data.error?.message || 'Terjadi kesalahan');
                return {
                    success: false,
                    error: {
                        code: 'API_ERROR',
                        message: errorMessage,
                    },
                };
            }

            return data;
        } catch {
            return {
                success: false,
                error: {
                    code: 'NETWORK_ERROR',
                    message: 'Gagal terhubung ke server',
                },
            };
        }
    }

    async getPortfolio(): Promise<APIResponse<InvestorPortfolio>> {
        return this.request<InvestorPortfolio>('/investments/portfolio', {
            method: 'GET',
        });
    }

    async getActiveInvestments(page: number = 1, perPage: number = 10): Promise<APIResponse<ActiveInvestmentListResponse>> {
        return this.request<ActiveInvestmentListResponse>(`/investments?page=${page}&per_page=${perPage}`, {
            method: 'GET',
        });
    }
}



export interface CreateInvoiceRequest {
    buyer_company_name: string;
    buyer_country: string;
    buyer_email: string;
    invoice_number: string;
    original_currency: string;
    original_amount: number;
    locked_exchange_rate: number;
    idr_amount: number;
    due_date: string;
    funding_duration_days: number;
    priority_ratio: number;
    catalyst_ratio: number;
    priority_interest_rate: number;
    catalyst_interest_rate: number;
    is_repeat_buyer: boolean;
    repeat_buyer_proof?: string;
    data_confirmation: boolean;
    description?: string;
    wallet_address: string;
}

export interface Invoice {
    id: string;
    exporter_id: string;
    buyer_name: string;
    buyer_country: string;
    invoice_number: string;
    currency: string;
    amount: number;
    idr_amount?: number;
    issue_date: string;
    due_date: string;
    description?: string;
    status: string;
    grade?: string;
    is_repeat_buyer: boolean;
    document_complete_score: number;
    priority_ratio: number;
    catalyst_ratio: number;
    priority_interest_rate?: number;
    catalyst_interest_rate?: number;
    original_currency?: string;
    original_amount?: number;
    exchange_rate?: number;
    funding_duration_days: number;
    created_at: string;
    updated_at: string;
}

export interface InvoiceDocument {
    id: string;
    invoice_id: string;
    document_type: string;
    file_url: string;
    file_hash: string;
    is_valid: boolean;
    created_at: string;
}

export interface InvoiceDetail extends Invoice {
    documents: InvoiceDocument[];
    file_url?: string;
    notes?: string;
}

interface InvoiceListResponse {
    invoices: Invoice[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
}

interface RepeatBuyerCheckResponse {
    is_repeat_buyer: boolean;
    message: string;
    previous_transactions?: number;
    funding_limit: number;
}

interface CurrencyConvertResponse {
    original_currency: string;
    original_amount: number;
    target_currency: string;
    converted_amount: number;
    exchange_rate: number;
    buffer_rate: number;
    locked_rate: number;
    valid_until: string;
}

class InvoiceAPI {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private getAuthHeaders(): HeadersInit {
        const token = typeof window !== 'undefined' ? localStorage.getItem('vessel_access_token') : null;
        return {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<APIResponse<T>> {
        const url = `${this.baseURL}${endpoint}`;

        const config: RequestInit = {
            ...options,
            headers: {
                ...this.getAuthHeaders(),
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                const errorMessage = typeof data.error === 'string' ? data.error : (data.error?.message || 'Terjadi kesalahan');
                return {
                    success: false,
                    error: {
                        code: 'API_ERROR',
                        message: errorMessage,
                    },
                };
            }

            return data;
        } catch {
            return {
                success: false,
                error: {
                    code: 'NETWORK_ERROR',
                    message: 'Gagal terhubung ke server',
                },
            };
        }
    }

    async checkRepeatBuyer(buyerCompanyName: string): Promise<APIResponse<RepeatBuyerCheckResponse>> {
        return this.request<RepeatBuyerCheckResponse>('/invoices/check-repeat-buyer', {
            method: 'POST',
            body: JSON.stringify({ buyer_company_name: buyerCompanyName }),
        });
    }

    async createFundingRequest(data: CreateInvoiceRequest): Promise<APIResponse<Invoice>> {
        return this.request<Invoice>('/invoices/funding-request', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getMyInvoices(page: number = 1, perPage: number = 10, status?: string): Promise<APIResponse<Invoice[]>> {
        const params = new URLSearchParams({
            page: page.toString(),
            per_page: perPage.toString(),
        });
        if (status) params.append('status', status);

        return this.request<Invoice[]>(`/invoices?${params.toString()}`, {
            method: 'GET',
        });
    }

    async getInvoice(invoiceId: string): Promise<APIResponse<Invoice>> {
        return this.request<Invoice>(`/invoices/${invoiceId}`, {
            method: 'GET',
        });
    }

    async submitInvoice(invoiceId: string): Promise<APIResponse<{ message: string }>> {
        return this.request<{ message: string }>(`/invoices/${invoiceId}/submit`, {
            method: 'POST',
        });
    }

    async getInvoiceDetail(invoiceId: string): Promise<APIResponse<InvoiceDetail>> {
        return this.request<InvoiceDetail>(`/invoices/${invoiceId}/detail`, {
            method: 'GET',
        });
    }

    async uploadDocument(invoiceId: string, file: File, documentType: string): Promise<APIResponse<{ id: string; file_url: string; file_hash: string }>> {
        const token = typeof window !== 'undefined' ? localStorage.getItem('vessel_access_token') : null;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('document_type', documentType);

        try {
            const response = await fetch(`${this.baseURL}/invoices/${invoiceId}/documents`, {
                method: 'POST',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formData,
            });
            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || {
                        code: 'UPLOAD_ERROR',
                        message: 'Gagal mengupload dokumen',
                    },
                };
            }

            return { success: true, data };
        } catch {
            return {
                success: false,
                error: {
                    code: 'NETWORK_ERROR',
                    message: 'Gagal mengupload dokumen',
                },
            };
        }
    }

    async getDocuments(invoiceId: string): Promise<APIResponse<Array<{ id: string; document_type: string; file_name: string; file_url: string }>>> {
        return this.request<Array<{ id: string; document_type: string; file_name: string; file_url: string }>>(`/invoices/${invoiceId}/documents`, {
            method: 'GET',
        });
    }

    async convertCurrency(currency: string, amount: number): Promise<APIResponse<CurrencyConvertResponse>> {
        return this.request<CurrencyConvertResponse>('/currency/convert', {
            method: 'POST',
            body: JSON.stringify({ currency, amount }),
        });
    }

    async getSupportedCurrencies(): Promise<APIResponse<Array<{ code: string; name: string }>>> {
        return this.request<Array<{ code: string; name: string }>>('/currency/supported', {
            method: 'GET',
        });
    }

    async getDisbursementEstimate(invoiceId: string): Promise<APIResponse<{ invoice_id: string; estimated_amount: number; fee: number; net_amount: number }>> {
        return this.request<{ invoice_id: string; estimated_amount: number; fee: number; net_amount: number }>(`/currency/disbursement-estimate?invoice_id=${invoiceId}`, {
            method: 'GET',
        });
    }

    async updateInvoice(invoiceId: string, data: Partial<CreateInvoiceRequest>): Promise<APIResponse<Invoice>> {
        return this.request<Invoice>(`/invoices/${invoiceId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteInvoice(invoiceId: string): Promise<APIResponse<{ message: string }>> {
        return this.request<{ message: string }>(`/invoices/${invoiceId}`, {
            method: 'DELETE',
        });
    }

    async getFundableInvoices(): Promise<APIResponse<Invoice[]>> {
        return this.request<Invoice[]>('/invoices/fundable', {
            method: 'GET',
        });
    }

    async tokenizeInvoice(invoiceId: string): Promise<APIResponse<{ message: string; nft_token_id?: string; tx_hash?: string }>> {
        return this.request<{ message: string; nft_token_id?: string; tx_hash?: string }>(`/invoices/${invoiceId}/tokenize`, {
            method: 'POST',
        });
    }

    async createPool(invoiceId: string): Promise<APIResponse<{ pool_id: string; message: string }>> {
        return this.request<{ pool_id: string; message: string }>(`/invoices/${invoiceId}/pool`, {
            method: 'POST',
        });
    }
}

export const userAPI = new UserAPI(API_BASE_URL);
export const invoiceAPI = new InvoiceAPI(API_BASE_URL);
export const riskQuestionnaireAPI = new RiskQuestionnaireAPI(API_BASE_URL);

export const investmentAPI = new InvestmentAPI(API_BASE_URL);

