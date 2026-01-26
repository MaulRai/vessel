import { APIResponse } from '../types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export interface DepositRequest {
    amount: number;
    payment_method?: string;
}

export interface DepositResponse {
    payment_id: string;
    amount: number;
    payment_url?: string;
    virtual_account?: string;
    bank_code?: string;
    expires_at: string;
    status: string;
}

export interface WithdrawRequest {
    amount: number;
    bank_code: string;
    account_number: string;
    account_name: string;
}

export interface WithdrawResponse {
    withdrawal_id: string;
    amount: number;
    fee: number;
    net_amount: number;
    status: string;
    estimated_arrival: string;
}

export interface PaymentBalance {
    available_balance: number;
    pending_balance: number;
    total_balance: number;
}

export interface PublicPayment {
    payment_id: string;
    amount: number;
    status: string;
    payment_method: string;
    virtual_account?: string;
    bank_code?: string;
    expires_at: string;
    created_at: string;
}

class PaymentAPI {
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

    async deposit(data: DepositRequest): Promise<APIResponse<DepositResponse>> {
        return this.request<DepositResponse>('/payments/deposit', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async withdraw(data: WithdrawRequest): Promise<APIResponse<WithdrawResponse>> {
        return this.request<WithdrawResponse>('/payments/withdraw', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getBalance(): Promise<APIResponse<PaymentBalance>> {
        return this.request<PaymentBalance>('/payments/balance');
    }

    async getPublicPayment(paymentId: string): Promise<APIResponse<PublicPayment>> {
        return this.request<PublicPayment>(`/public/payments/${paymentId}`);
    }

    async payPublicPayment(paymentId: string): Promise<APIResponse<{ message: string }>> {
        return this.request<{ message: string }>(`/public/payments/${paymentId}/pay`, {
            method: 'POST',
        });
    }
}

export const paymentAPI = new PaymentAPI(API_BASE_URL);
