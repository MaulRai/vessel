import { APIResponse, APIPagination } from '../types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export interface MitraDashboard {
    total_funding: number;
    active_debt: number;
    active_invoices: number;
    nearest_due_days: number;
    nearest_due_invoice?: string;
    total_repaid: number;
    funding_pools: MitraPoolSummary[];
}

export interface MitraPoolSummary {
    pool_id: string;
    invoice_id: string;
    invoice_number: string;
    project_title: string;
    buyer_company_name: string;
    buyer_country: string;
    grade: string;
    target_amount: number;
    funded_amount: number;
    status: string;
    priority_interest_rate: number;
    catalyst_interest_rate: number;
    tenor_days: number;
    deadline: string;
    created_at: string;
}

export interface MitraInvoice {
    id: string;
    invoice_number: string;
    buyer_name: string;
    buyer_country: string;
    amount: number;
    currency: string;
    idr_amount: number;
    status: string;
    grade?: string;
    due_date: string;
    created_at: string;
    funding_duration_days: number;
    priority_ratio: number;
    catalyst_ratio: number;
}

export interface MitraPoolBreakdown {
    pool_id: string;
    invoice_id: string;
    invoice_number: string;
    target_amount: number;
    funded_amount: number;
    priority_target: number;
    priority_funded: number;
    catalyst_target: number;
    catalyst_funded: number;
    priority_interest_rate: number;
    catalyst_interest_rate: number;
    investor_count: number;
    status: string;
    investors: MitraPoolInvestor[];
}

export interface MitraPoolInvestor {
    investor_id: string;
    tranche: string;
    amount: number;
    invested_at: string;
}

class MitraAPI {
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

    async getDashboard(): Promise<APIResponse<MitraDashboard>> {
        return this.request<MitraDashboard>('/mitra/dashboard');
    }

    async getPools(page: number = 1, perPage: number = 10): Promise<APIResponse<{ pools: MitraPoolSummary[]; total: number }>> {
        const rawRes = await this.request<MitraPoolSummary[] | { pools: MitraPoolSummary[]; total: number }>(`/mitra/pools?page=${page}&per_page=${perPage}`);

        if (rawRes.success && rawRes.data) {
            const pagination = rawRes.pagination as APIPagination | undefined;
            if (Array.isArray(rawRes.data)) {
                return {
                    success: true,
                    data: {
                        pools: rawRes.data,
                        total: pagination?.total ?? rawRes.data.length,
                    },
                };
            }
        }

        return rawRes as APIResponse<{ pools: MitraPoolSummary[]; total: number }>;
    }

    async getInvoices(page: number = 1, perPage: number = 10): Promise<APIResponse<{ invoices: MitraInvoice[]; total: number }>> {
        const rawRes = await this.request<MitraInvoice[] | { invoices: MitraInvoice[]; total: number }>(`/mitra/invoices?page=${page}&per_page=${perPage}`);

        if (rawRes.success && rawRes.data) {
            const pagination = rawRes.pagination as APIPagination | undefined;
            if (Array.isArray(rawRes.data)) {
                return {
                    success: true,
                    data: {
                        invoices: rawRes.data,
                        total: pagination?.total ?? rawRes.data.length,
                    },
                };
            }
        }

        return rawRes as APIResponse<{ invoices: MitraInvoice[]; total: number }>;
    }

    async getActiveInvoices(): Promise<APIResponse<{ invoices: MitraInvoice[]; total: number }>> {
        const rawRes = await this.request<MitraInvoice[] | { invoices: MitraInvoice[]; total: number }>('/mitra/invoices/active');

        if (rawRes.success && rawRes.data) {
            if (Array.isArray(rawRes.data)) {
                return {
                    success: true,
                    data: {
                        invoices: rawRes.data,
                        total: rawRes.data.length,
                    },
                };
            }
        }

        return rawRes as APIResponse<{ invoices: MitraInvoice[]; total: number }>;
    }

    async getPoolByInvoice(invoiceId: string): Promise<APIResponse<MitraPoolSummary>> {
        return this.request<MitraPoolSummary>(`/mitra/invoices/${invoiceId}/pool`);
    }

    async getPoolBreakdown(poolId: string): Promise<APIResponse<MitraPoolBreakdown>> {
        return this.request<MitraPoolBreakdown>(`/mitra/pools/${poolId}/breakdown`);
    }
}

export const mitraAPI = new MitraAPI(API_BASE_URL);
