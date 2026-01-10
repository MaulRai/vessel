import {
    APIResponse,
} from '../types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export interface CompleteProfileRequest {
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

export interface CompleteProfileResponse {
    message: string;
}

export interface UploadFileResponse {
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
        } catch (error) {
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
        } catch (error) {
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

    async getBankAccount(): Promise<APIResponse<any>> {
        return this.request<any>('/user/profile/bank-account', {
            method: 'GET',
        });
    }

    async getSupportedBanks(): Promise<APIResponse<Array<{ code: string; name: string }>>> {
        return this.request<Array<{ code: string; name: string }>>('/user/profile/banks', {
            method: 'GET',
        });
    }

    // Mitra Methods
    async applyMitra(data: SubmitMitraApplicationRequest): Promise<APIResponse<any>> {
        return this.request<any>('/user/mitra/apply', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getMitraStatus(): Promise<APIResponse<MitraApplicationResponse>> {
        return this.request<MitraApplicationResponse>('/user/mitra/status', {
            method: 'GET',
        });
    }

    async uploadMitraDocument(file: File, type: string): Promise<APIResponse<any>> {
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
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'NETWORK_ERROR',
                    message: 'Gagal mengupload dokumen',
                },
            };
        }
    }
}

export interface UserProfileResponse {
    id: string;
    email: string;
    username: string;
    role: 'mitra' | 'investor' | 'admin';
    is_verified: boolean;
    profile_completed: boolean;
    email_verified: boolean;
    balance_idr: number;
    created_at: string;
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

export interface RiskQuestionsResponse {
    questions: RiskQuestion[];
    catalyst_unlock_rules: {
        description: string;
        required_q1: number;
        required_q2: number;
        required_q3: number;
    };
}

export interface RiskQuestionnaireRequest {
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
        } catch (error) {
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

export interface MarketplaceResponse {
    pools: MarketplacePool[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
}

class MarketplaceAPI {
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
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'NETWORK_ERROR',
                    message: 'Gagal terhubung ke server',
                },
            };
        }
    }

    async getPools(filters?: MarketplaceFilters): Promise<APIResponse<MarketplaceResponse>> {
        const params = new URLSearchParams();
        if (filters?.grade) params.append('grade', filters.grade);
        if (filters?.is_insured !== undefined) params.append('is_insured', String(filters.is_insured));
        if (filters?.min_amount) params.append('min_amount', String(filters.min_amount));
        if (filters?.max_amount) params.append('max_amount', String(filters.max_amount));
        if (filters?.sort_by) params.append('sort_by', filters.sort_by);
        if (filters?.page) params.append('page', String(filters.page));
        if (filters?.per_page) params.append('per_page', String(filters.per_page));

        const queryString = params.toString();
        return this.request<MarketplaceResponse>(`/marketplace${queryString ? `?${queryString}` : ''}`, {
            method: 'GET',
        });
    }

    async getPoolDetail(poolId: string): Promise<APIResponse<any>> {
        return this.request<any>(`/marketplace/${poolId}/detail`, {
            method: 'GET',
        });
    }
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

export interface ActiveInvestmentListResponse {
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
        } catch (error) {
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
        return this.request<ActiveInvestmentListResponse>(`/investments/active?page=${page}&per_page=${perPage}`, {
            method: 'GET',
        });
    }
}

export interface WalletUpdateRequest {
    wallet_address: string;
}

export interface WalletUpdateResponse {
    message: string;
    wallet_address: string;
}

class WalletAPI {
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
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'NETWORK_ERROR',
                    message: 'Gagal terhubung ke server',
                },
            };
        }
    }

    async updateWallet(walletAddress: string): Promise<APIResponse<WalletUpdateResponse>> {
        return this.request<WalletUpdateResponse>('/user/wallet', {
            method: 'PUT',
            body: JSON.stringify({ wallet_address: walletAddress }),
        });
    }
}

export const userAPI = new UserAPI(API_BASE_URL);
export const riskQuestionnaireAPI = new RiskQuestionnaireAPI(API_BASE_URL);
export const marketplaceAPI = new MarketplaceAPI(API_BASE_URL);
export const investmentAPI = new InvestmentAPI(API_BASE_URL);
export const walletAPI = new WalletAPI(API_BASE_URL);
