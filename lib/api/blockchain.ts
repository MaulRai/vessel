import { APIResponse } from '../types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export interface ChainInfo {
    chain_id: number;
    chain_name: string;
    rpc_url: string;
    block_number: number;
    gas_price: string;
}

export interface TokenBalance {
    address: string;
    balance: string;
    formatted_balance: string;
    token_symbol: string;
    token_decimals: number;
}

export interface PlatformBalance {
    address: string;
    idrx_balance: string;
    formatted_balance: string;
    pool_count: number;
    total_locked: string;
}

export interface TransactionVerification {
    tx_hash: string;
    status: string;
    block_number: number;
    from: string;
    to: string;
    value: string;
    confirmed: boolean;
    timestamp: string;
}

export interface TokenTransfer {
    tx_hash: string;
    from: string;
    to: string;
    amount: string;
    formatted_amount: string;
    block_number: number;
    timestamp: string;
    direction: 'in' | 'out';
}

export interface PoolTransaction {
    tx_hash: string;
    investor: string;
    amount: string;
    tranche: string;
    action: string;
    timestamp: string;
    block_number: number;
}

class BlockchainAPI {
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

    async getChainInfo(): Promise<APIResponse<ChainInfo>> {
        return this.request<ChainInfo>('/blockchain/chain-info');
    }

    async getBalance(address: string): Promise<APIResponse<TokenBalance>> {
        return this.request<TokenBalance>(`/blockchain/balance/${address}`);
    }

    async getPlatformBalance(): Promise<APIResponse<PlatformBalance>> {
        return this.request<PlatformBalance>('/blockchain/platform-balance');
    }

    async verifyTransaction(txHash: string): Promise<APIResponse<TransactionVerification>> {
        return this.request<TransactionVerification>(`/blockchain/verify/${txHash}`);
    }

    async getTransfers(address: string): Promise<APIResponse<TokenTransfer[]>> {
        return this.request<TokenTransfer[]>(`/blockchain/transfers/${address}`);
    }

    async getPoolTransactions(poolId: string): Promise<APIResponse<PoolTransaction[]>> {
        return this.request<PoolTransaction[]>(`/blockchain/pools/${poolId}/transactions`);
    }

    async getMyTransactions(): Promise<APIResponse<TokenTransfer[]>> {
        return this.request<TokenTransfer[]>('/blockchain/my-transactions');
    }

    async getMyIdrxBalance(): Promise<APIResponse<TokenBalance>> {
        return this.request<TokenBalance>('/blockchain/my-idrx-balance');
    }
}

export const blockchainAPI = new BlockchainAPI(API_BASE_URL);
