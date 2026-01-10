import { APIResponse } from '../types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export interface UserListItem {
    id: string;
    email: string;
    username?: string;
    role: 'investor' | 'mitra' | 'admin';
    member_status: string;
    balance_idr: number;
    is_verified: boolean;
    profile_completed: boolean;
    full_name?: string;
    created_at: string;
}

export interface ListUsersResponse {
    users: UserListItem[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
}

export interface GrantBalanceRequest {
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

        return this.request<ListUsersResponse>(`/admin/users?${params.toString()}`, {
            method: 'GET',
        });
    }

    async grantBalance(data: GrantBalanceRequest): Promise<APIResponse<GrantBalanceResponse>> {
        return this.request<GrantBalanceResponse>('/admin/balance/grant', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

<<<<<<< HEAD
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
=======
    // Mitra Management
    async listMitraApplications(page: number = 1, perPage: number = 10): Promise<APIResponse<{ applications: any[]; total: number }>> {
        return this.request<{ applications: any[]; total: number }>(`/admin/mitra/pending?page=${page}&per_page=${perPage}`, {
>>>>>>> 31bf4a2 (fix)
            method: 'GET',
        });
    }

<<<<<<< HEAD
    async getMitraApplicationDetail(id: string): Promise<APIResponse<MitraApplicationDetail>> {
        return this.request<MitraApplicationDetail>(`/admin/mitra/${id}`, {
            method: 'GET',
        });
    }

    async approveMitraApplication(id: string): Promise<APIResponse<{ message: string }>> {
        return this.request<{ message: string }>(`/admin/mitra/${id}/approve`, {
=======
    async approveMitra(id: string): Promise<APIResponse<any>> {
        return this.request<any>(`/admin/mitra/${id}/approve`, {
>>>>>>> 31bf4a2 (fix)
            method: 'POST',
        });
    }

<<<<<<< HEAD
    async rejectMitraApplication(id: string, reason: string): Promise<APIResponse<{ message: string }>> {
        return this.request<{ message: string }>(`/admin/mitra/${id}/reject`, {
=======
    async rejectMitra(id: string, reason: string): Promise<APIResponse<any>> {
        return this.request<any>(`/admin/mitra/${id}/reject`, {
>>>>>>> 31bf4a2 (fix)
            method: 'POST',
            body: JSON.stringify({ reason }),
        });
    }
<<<<<<< HEAD
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

export interface MitraApplicationsListResponse {
    applications: MitraApplicationItem[];
    total: number;
    page: number;
    per_page: number;
}

export interface MitraApplicationDetail extends MitraApplicationItem {
    updated_at?: string;
    rejection_reason?: string;
=======
>>>>>>> 31bf4a2 (fix)
}

export const adminAPI = new AdminAPI(API_BASE_URL);
