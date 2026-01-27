import { APIResponse, APIPagination } from '../types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export interface UserListItem {
    id: string;
    email: string;
    username?: string;
    role: 'investor' | 'mitra' | 'admin';
    member_status: string;

    is_verified: boolean;
    profile_completed: boolean;
    full_name?: string;
    balance_idr: number;
    created_at: string;
}

interface ListUsersResponse {
    users: UserListItem[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
}

interface GrantBalanceRequest {
    user_id: string;
    amount: number;
}

export interface GrantBalanceResponse {
    success: boolean;
    transaction_id: string;
    message: string;
    new_balance: number;
    timestamp: string;
}

class AdminAPI {
    protected baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    protected getAuthHeaders(): HeadersInit {
        const token = typeof window !== 'undefined' ? localStorage.getItem('vessel_access_token') : null;
        return {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    }

    protected async request<T>(
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

    async listUsers(
        page: number = 1,
        perPage: number = 10,
        role?: string,
        search?: string
    ): Promise<APIResponse<ListUsersResponse>> {
        const params = new URLSearchParams({
            page: page.toString(),
            per_page: perPage.toString(),
        });
        if (role) params.append('role', role);
        if (search) params.append('search', search);

        const rawRes = await this.request<UserListItem[] | ListUsersResponse>(`/admin/users?${params.toString()}`, {
            method: 'GET',
        });

        if (rawRes.success && rawRes.data) {
            const pagination = rawRes.pagination as APIPagination | undefined;
            if (Array.isArray(rawRes.data)) {
                return {
                    success: true,
                    data: {
                        users: rawRes.data as UserListItem[],
                        total: pagination?.total ?? 0,
                        page: pagination?.page ?? page,
                        per_page: pagination?.per_page ?? perPage,
                        total_pages: pagination?.total_pages ?? 1,
                    },
                };
            }
        }

        return rawRes as APIResponse<ListUsersResponse>;
    }

    async grantBalance(data: GrantBalanceRequest): Promise<APIResponse<GrantBalanceResponse>> {
        return this.request<GrantBalanceResponse>('/admin/balance/grant', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Mitra Application Management
    async listPendingMitraApplications(
        page: number = 1,
        perPage: number = 10
    ): Promise<APIResponse<MitraApplicationsListResponse>> {
        const params = new URLSearchParams({
            page: page.toString(),
            per_page: perPage.toString(),
        });
        return this.request<MitraApplicationsListResponse>(`/admin/mitra/pending?${params.toString()}`, {
            method: 'GET',
        });
    }

    async listAllMitraApplications(
        page: number = 1,
        perPage: number = 10
    ): Promise<APIResponse<MitraApplicationsListResponse>> {
        const params = new URLSearchParams({
            page: page.toString(),
            per_page: perPage.toString(),
        });
        return this.request<MitraApplicationsListResponse>(`/admin/mitra/all?${params.toString()}`, {
            method: 'GET',
        });
    }

    async getMitraApplicationDetail(id: string): Promise<APIResponse<MitraApplicationDetail>> {
        return this.request<MitraApplicationDetail>(`/admin/mitra/${id}`, {
            method: 'GET',
        });
    }

    async approveMitraApplication(id: string): Promise<APIResponse<{ message: string }>> {
        return this.request<{ message: string }>(`/admin/mitra/${id}/approve`, {
            method: 'POST',
        });
    }

    async rejectMitraApplication(id: string, reason: string): Promise<APIResponse<{ message: string }>> {
        return this.request<{ message: string }>(`/admin/mitra/${id}/reject`, {
            method: 'POST',
            body: JSON.stringify({ reason }),
        });
    }
}

// Mitra Application Types
export interface MitraApplicationItem {
    id: string;
    user_id: string;
    company_name: string;
    company_type: 'PT' | 'CV' | 'UD';
    npwp: string;
    annual_revenue: string;
    address: string;
    business_description: string;
    website_url?: string;
    year_founded: number;
    key_products: string;
    export_markets: string;
    nib_document_url?: string;
    akta_pendirian_url?: string;
    ktp_direktur_url?: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    user?: {
        id: string;
        email: string;
        username: string;
    };
}

interface MitraApplicationsListResponse {
    applications: MitraApplicationItem[];
    total: number;
    page: number;
    per_page: number;
}

export interface MitraApplicationDetail extends MitraApplicationItem {
    updated_at?: string;
    rejection_reason?: string;
}

export interface PendingInvoice {
    id: string;
    invoice_number: string;
    buyer_name: string;
    buyer_country: string;
    amount: number;
    currency: string;
    idr_amount?: number;
    status: string;
    grade?: string;
    is_repeat_buyer: boolean;
    document_complete_score: number;
    created_at: string;
    due_date: string;
    exporter?: {
        id: string;
        email: string;
        username?: string;
    };
}

interface PendingInvoicesResponse {
    invoices: PendingInvoice[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
}

export interface GradeSuggestion {
    invoice_id: string;
    suggested_grade: string;
    grade_score: number;
    country_risk: string;
    country_score: number;
    history_score: number;
    document_score: number;
    is_repeat_buyer: boolean;
    documents_complete: boolean;
    funding_limit: number;
}

export interface InvoiceReviewData {
    invoice: PendingInvoice & {
        priority_ratio: number;
        catalyst_ratio: number;
        priority_interest_rate?: number;
        catalyst_interest_rate?: number;
        advance_percentage: number;
        funding_duration_days: number;
        description?: string;
        original_currency?: string;
        original_amount?: number;
        exchange_rate?: number;
    };
    exporter?: {
        id: string;
        email: string;
        full_name?: string;
        phone?: string;
        company_name?: string;
    };
    documents: Array<{
        document_id: string;
        document_type: string;
        file_name: string;
        file_url: string;
        is_valid: boolean;
        needs_revision: boolean;
        revision_note?: string;
    }>;
    grade_suggestion: GradeSuggestion;
}

interface ApproveInvoiceRequest {
    grade: string;
    priority_interest_rate?: number;
    catalyst_interest_rate?: number;
    notes?: string;
}

export interface FundingPool {
    id: string;
    invoice_id: string;
    target_amount: number;
    funded_amount: number;
    investor_count: number;
    status: string;
    priority_target: number;
    priority_funded: number;
    catalyst_target: number;
    catalyst_funded: number;
    priority_interest_rate: number;
    catalyst_interest_rate: number;
    pool_currency: string;
    created_at: string;
    opened_at?: string;
    deadline?: string;
    invoice?: PendingInvoice;
}

class AdminAPIExtended extends AdminAPI {
    async getPendingInvoices(
        page: number = 1,
        perPage: number = 10
    ): Promise<APIResponse<PendingInvoicesResponse>> {
        const params = new URLSearchParams({
            page: page.toString(),
            per_page: perPage.toString(),
        });
        const rawRes = await this.request<PendingInvoice[] | PendingInvoicesResponse>(`/admin/invoices/pending?${params.toString()}`, {
            method: 'GET',
        });

        // Backend returns data as array with pagination in separate field
        // Transform to the expected PendingInvoicesResponse format
        if (rawRes.success && rawRes.data) {
            const pagination = rawRes.pagination as APIPagination | undefined;
            if (Array.isArray(rawRes.data)) {
                return {
                    success: true,
                    data: {
                        invoices: rawRes.data as PendingInvoice[],
                        total: pagination?.total ?? 0,
                        page: pagination?.page ?? page,
                        per_page: pagination?.per_page ?? perPage,
                        total_pages: pagination?.total_pages ?? 1,
                    },
                };
            }
        }

        return rawRes as APIResponse<PendingInvoicesResponse>;
    }

    async getInvoiceGradeSuggestion(invoiceId: string): Promise<APIResponse<GradeSuggestion>> {
        return this.request<GradeSuggestion>(`/admin/invoices/${invoiceId}/grade-suggestion`, {
            method: 'GET',
        });
    }

    async getInvoiceReviewData(invoiceId: string): Promise<APIResponse<InvoiceReviewData>> {
        return this.request<InvoiceReviewData>(`/admin/invoices/${invoiceId}/review`, {
            method: 'GET',
        });
    }

    async approveInvoice(invoiceId: string, data: ApproveInvoiceRequest): Promise<APIResponse<{ message: string; invoice_id: string; grade: string; nft?: unknown }>> {
        return this.request<{ message: string; invoice_id: string; grade: string; nft?: unknown }>(`/admin/invoices/${invoiceId}/approve`, {
            method: 'POST',
            body: JSON.stringify({ action: 'approve', ...data }),
        });
    }

    async rejectInvoice(invoiceId: string, reason: string): Promise<APIResponse<{ message: string }>> {
        return this.request<{ message: string }>(`/admin/invoices/${invoiceId}/reject`, {
            method: 'POST',
            body: JSON.stringify({ reason }),
        });
    }

    async getApprovedInvoices(
        page: number = 1,
        perPage: number = 50
    ): Promise<APIResponse<PendingInvoicesResponse>> {
        const params = new URLSearchParams({
            page: page.toString(),
            per_page: perPage.toString(),
            status: 'approved',
        });
        const rawRes = await this.request<PendingInvoice[] | PendingInvoicesResponse>(`/admin/invoices/approved?${params.toString()}`, {
            method: 'GET',
        });

        if (rawRes.success && rawRes.data) {
            const pagination = rawRes.pagination as APIPagination | undefined;
            if (Array.isArray(rawRes.data)) {
                return {
                    success: true,
                    data: {
                        invoices: rawRes.data as PendingInvoice[],
                        total: pagination?.total ?? 0,
                        page: pagination?.page ?? page,
                        per_page: pagination?.per_page ?? perPage,
                        total_pages: pagination?.total_pages ?? 1,
                    },
                };
            }
        }

        return rawRes as APIResponse<PendingInvoicesResponse>;
    }

    async createFundingPool(invoiceId: string): Promise<APIResponse<FundingPool>> {
        return this.request<FundingPool>(`/invoices/${invoiceId}/pool`, {
            method: 'POST',
        });
    }

    async getAllPools(
        page: number = 1,
        perPage: number = 10
    ): Promise<APIResponse<{ pools: FundingPool[]; total: number; page: number; per_page: number; total_pages: number }>> {
        const params = new URLSearchParams({
            page: page.toString(),
            per_page: perPage.toString(),
        });
        const rawRes = await this.request<FundingPool[] | { pools: FundingPool[]; total: number; page: number; per_page: number; total_pages: number }>(`/pools?${params.toString()}`, {
            method: 'GET',
        });

        if (rawRes.success && rawRes.data) {
            const pagination = rawRes.pagination as APIPagination | undefined;
            if (Array.isArray(rawRes.data)) {
                return {
                    success: true,
                    data: {
                        pools: rawRes.data as FundingPool[],
                        total: pagination?.total ?? 0,
                        page: pagination?.page ?? page,
                        per_page: pagination?.per_page ?? perPage,
                        total_pages: pagination?.total_pages ?? 1,
                    },
                };
            }
        }

        return rawRes as APIResponse<{ pools: FundingPool[]; total: number; page: number; per_page: number; total_pages: number }>;
    }

    async disbursePool(poolId: string): Promise<APIResponse<{ message: string }>> {
        return this.request<{ message: string }>(`/admin/pools/${poolId}/disburse`, {
            method: 'POST',
        });
    }

    async closePool(poolId: string): Promise<APIResponse<{ message: string }>> {
        return this.request<{ message: string }>(`/admin/pools/${poolId}/close`, {
            method: 'POST',
        });
    }

    async repayInvoice(invoiceId: string): Promise<APIResponse<{ message: string }>> {
        return this.request<{ message: string }>(`/admin/invoices/${invoiceId}/repay`, {
            method: 'POST',
        });
    }

    async getPlatformRevenue(): Promise<APIResponse<{ total_revenue: number; monthly_revenue: number; fee_collected: number; active_pools: number }>> {
        return this.request<{ total_revenue: number; monthly_revenue: number; fee_collected: number; active_pools: number }>('/admin/platform/revenue', {
            method: 'GET',
        });
    }

    async getInvoicesByExporter(
        userId: string,
        page: number = 1,
        perPage: number = 10,
        status?: string
    ): Promise<APIResponse<PendingInvoicesResponse>> {
        const params = new URLSearchParams({
            page: page.toString(),
            per_page: perPage.toString(),
        });
        if (status) params.append('status', status);

        const rawRes = await this.request<PendingInvoice[] | PendingInvoicesResponse>(`/admin/users/${userId}/invoices?${params.toString()}`, {
            method: 'GET',
        });

        if (rawRes.success && rawRes.data) {
            const pagination = rawRes.pagination as APIPagination | undefined;
            if (Array.isArray(rawRes.data)) {
                return {
                    success: true,
                    data: {
                        invoices: rawRes.data as PendingInvoice[],
                        total: pagination?.total ?? 0,
                        page: pagination?.page ?? page,
                        per_page: pagination?.per_page ?? perPage,
                        total_pages: pagination?.total_pages ?? 1,
                    },
                };
            }
        }
        return rawRes as APIResponse<PendingInvoicesResponse>;
    }

    async getPoolsByExporter(
        userId: string,
        page: number = 1,
        perPage: number = 10
    ): Promise<APIResponse<{ pools: FundingPool[]; total: number; page: number; per_page: number; total_pages: number }>> {
        const params = new URLSearchParams({
            page: page.toString(),
            per_page: perPage.toString(),
        });

        const rawRes = await this.request<FundingPool[] | { pools: FundingPool[]; total: number; page: number; per_page: number; total_pages: number }>(`/admin/users/${userId}/pools?${params.toString()}`, {
            method: 'GET',
        });

        if (rawRes.success && rawRes.data) {
            const pagination = rawRes.pagination as APIPagination | undefined;
            if (Array.isArray(rawRes.data)) {
                return {
                    success: true,
                    data: {
                        pools: rawRes.data as FundingPool[],
                        total: pagination?.total ?? 0,
                        page: pagination?.page ?? page,
                        per_page: pagination?.per_page ?? perPage,
                        total_pages: pagination?.total_pages ?? 1,
                    },
                };
            }
        }
        return rawRes as APIResponse<{ pools: FundingPool[]; total: number; page: number; per_page: number; total_pages: number }>;
    }
}

export const adminAPI = new AdminAPIExtended(API_BASE_URL);
