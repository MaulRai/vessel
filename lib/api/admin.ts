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
}

export const adminAPI = new AdminAPI(API_BASE_URL);
