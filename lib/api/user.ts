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

    async getProfile(): Promise<APIResponse<any>> {
        return this.request<any>('/user/profile/data', {
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

export const userAPI = new UserAPI(API_BASE_URL);
export const riskQuestionnaireAPI = new RiskQuestionnaireAPI(API_BASE_URL);
