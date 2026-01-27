import { APIResponse, APIPagination } from '../types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export interface FundingPool {
    id: string;
    invoice_id: string;
    invoice_number: string;
    project_title: string;
    buyer_company_name: string;
    buyer_country: string;
    grade: string;
    target_amount: number;
    funded_amount: number;
    priority_target: number;
    catalyst_target: number;
    priority_funded: number;
    catalyst_funded: number;
    priority_interest_rate: number;
    catalyst_interest_rate: number;
    tenor_days: number;
    deadline: string;
    status: 'open' | 'filled' | 'disbursed' | 'closed' | 'repaid';
    created_at: string;
}

export interface InvestRequest {
    pool_id: string;
    amount: number;
    tranche: 'priority' | 'catalyst';
    tnc_accepted: boolean;
    catalyst_consents?: {
        risk_acknowledgment: boolean;
        loss_acceptance: boolean;
        non_bank_product: boolean;
    };
    tx_hash: string;
}

export interface InvestmentResponse {
    id: string;
    amount: number;
    status: string;
    tx_hash: string;
    created_at: string;
}

export interface RepayRequest {
    invoice_id: string;
    tx_hash: string;
}

export interface MarketplaceDetailResponse {
    pool: FundingPool;
    invoice: {
        id: string;
        invoice_number: string;
        buyer_name: string;
        buyer_country: string;
        amount: number;
        currency: string;
        due_date: string;
        grade: string;
        description?: string;
    };
}

export interface CalculateInvestmentRequest {
    pool_id: string;
    amount: number;
    tranche: 'priority' | 'catalyst';
}

export interface CalculateInvestmentResponse {
    pool_id: string;
    tranche: string;
    amount: number;
    interest_rate: number;
    tenor_days: number;
    estimated_return: number;
    total_expected: number;
    platform_fee: number;
    net_return: number;
}

export interface InvestmentConfirmRequest {
    pool_id: string;
    amount: number;
    tranche: 'priority' | 'catalyst';
    tx_hash: string;
    tnc_accepted: boolean;
    catalyst_consents?: {
        risk_acknowledgment: boolean;
        loss_acceptance: boolean;
        non_bank_product: boolean;
    };
}

export interface DisbursementRequest {
    invoice_id: string;
    bank_code: string;
    account_number: string;
}

interface BackendFundingPoolResponse {
    pool: {
        id: string;
        invoice_id: string;
        target_amount: number;
        funded_amount: number;
        priority_target: number;
        catalyst_target: number;
        priority_funded: number;
        catalyst_funded: number;
        priority_interest_rate: number;
        catalyst_interest_rate: number;
        status: 'open' | 'filled' | 'disbursed' | 'closed' | 'repaid';
        created_at: string;
        deadline: string;
    };
    invoice?: {
        id: string;
        invoice_number: string;
        buyer_name: string;
        buyer_country: string;
        grade: string;
        funding_duration_days: number;
        description?: string;
    };
    remaining_amount: number;
    percentage_funded: number;
    priority_remaining: number;
    catalyst_remaining: number;
    priority_percentage_funded: number;
    catalyst_percentage_funded: number;
}

interface ListPoolsResponse {
    pools: BackendFundingPoolResponse[];
    total: number;
}


class FundingAPI {
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

    private mapBackendPoolToFrontend(item: BackendFundingPoolResponse): FundingPool {
        return {
            id: item.pool.id,
            invoice_id: item.pool.invoice_id,
            invoice_number: item.invoice?.invoice_number || 'N/A',
            project_title: item.invoice ? `Project ${item.invoice.invoice_number}` : 'Unknown Project',
            buyer_company_name: item.invoice?.buyer_name || 'Unknown Buyer',
            buyer_country: item.invoice?.buyer_country || 'Unknown',
            grade: item.invoice?.grade || 'N/A',
            target_amount: Number(item.pool.target_amount),
            funded_amount: Number(item.pool.funded_amount),
            priority_target: Number(item.pool.priority_target),
            catalyst_target: Number(item.pool.catalyst_target),
            priority_funded: Number(item.pool.priority_funded),
            catalyst_funded: Number(item.pool.catalyst_funded),
            priority_interest_rate: Number(item.pool.priority_interest_rate),
            catalyst_interest_rate: Number(item.pool.catalyst_interest_rate),
            tenor_days: item.invoice?.funding_duration_days || 30,
            deadline: item.pool.deadline,
            status: item.pool.status,
            created_at: item.pool.created_at
        };
    }

    async listPools(page: number = 1, perPage: number = 10): Promise<APIResponse<{ pools: FundingPool[]; total: number }>> {
        const rawRes = await this.request<BackendFundingPoolResponse[] | ListPoolsResponse>(`/marketplace?page=${page}&per_page=${perPage}`);

        if (rawRes.success && rawRes.data) {
            const pagination = rawRes.pagination as APIPagination | undefined;

            // Handle both array response and paginated object response
            const rawPools = Array.isArray(rawRes.data)
                ? rawRes.data as BackendFundingPoolResponse[]
                : (rawRes.data as ListPoolsResponse).pools;

            const total = pagination?.total ?? (Array.isArray(rawRes.data) ? rawRes.data.length : (rawRes.data as ListPoolsResponse).total);

            // Map backend response to flat FundingPool interface
            const pools: FundingPool[] = rawPools.map(item => this.mapBackendPoolToFrontend(item));

            return {
                success: true,
                data: {
                    pools,
                    total
                },
            };
        }

        return {
            success: false,
            error: rawRes.error
        };
    }

    async getPool(id: string): Promise<APIResponse<FundingPool>> {
        const rawRes = await this.request<BackendFundingPoolResponse>(`/pools/${id}`);

        if (rawRes.success && rawRes.data) {
            return {
                success: true,
                data: this.mapBackendPoolToFrontend(rawRes.data)
            };
        }

        return {
            success: false,
            error: rawRes.error
        };
    }

    async getMarketplaceDetail(id: string): Promise<APIResponse<MarketplaceDetailResponse>> {
        return this.request<MarketplaceDetailResponse>(`/marketplace/${id}/detail`);
    }

    async calculateInvestment(data: CalculateInvestmentRequest): Promise<APIResponse<CalculateInvestmentResponse>> {
        return this.request<CalculateInvestmentResponse>('/marketplace/calculate', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async invest(data: InvestRequest): Promise<APIResponse<InvestmentResponse>> {
        return this.request<InvestmentResponse>('/investments', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async confirmInvestment(data: InvestmentConfirmRequest): Promise<APIResponse<InvestmentResponse>> {
        return this.request<InvestmentResponse>('/investments/confirm', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async listInvestments(page: number = 1, perPage: number = 10): Promise<APIResponse<{ investments: InvestmentResponse[]; total: number }>> {
        return this.request<{ investments: InvestmentResponse[]; total: number }>(`/investments?page=${page}&per_page=${perPage}`);
    }

    async repay(invoiceId: string, txHash: string): Promise<APIResponse<{ message: string }>> {
        return this.request<{ message: string }>(`/invoices/${invoiceId}/repay`, {
            method: 'POST',
            body: JSON.stringify({ tx_hash: txHash }),
        });
    }

    async requestDisbursement(data: DisbursementRequest): Promise<APIResponse<{ message: string }>> {
        return this.request<{ message: string }>('/exporter/disbursement', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
}

export const fundingAPI = new FundingAPI(API_BASE_URL);
