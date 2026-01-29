import { APIResponse } from '../types/auth';

export class BaseAPI {
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
        const isDev = process.env.NODE_ENV === 'development';

        const config: RequestInit = {
            ...options,
            headers: {
                ...this.getAuthHeaders(),
                ...options.headers,
            },
        };

        if (isDev) {
            console.log(`%c[API Request] %c${options.method || 'GET'} %c${url}`,
                'color: #3b82f6; font-weight: bold;',
                'color: #10b981; font-weight: bold;',
                'color: #6b7280;');
            if (config.body) {
                try {
                    console.log('%cBody:', 'color: #3b82f6; font-weight: bold;', JSON.parse(config.body as string));
                } catch {
                    console.log('%cBody:', 'color: #3b82f6; font-weight: bold;', config.body);
                }
            }
        }

        try {
            const response = await fetch(url, config);
            const text = await response.text();

            let data;
            try {
                data = JSON.parse(text);
            } catch {
                if (isDev) {
                    console.error(`%c[API Response Error] %c${response.status} %c${url}`,
                        'color: #ef4444; font-weight: bold;',
                        'color: #ef4444;',
                        'color: #6b7280;');
                    console.log('%cRaw Text:', 'color: #ef4444; font-weight: bold;', text);
                }
                return {
                    success: false,
                    error: {
                        code: 'PARSE_ERROR',
                        message: text || 'Failed to parse server response',
                    },
                };
            }

            if (isDev) {
                const statusColor = response.ok ? '#10b981' : '#ef4444';
                console.log(`%c[API Response] %c${response.status} %c${url}`,
                    `color: ${statusColor}; font-weight: bold;`,
                    `color: ${statusColor};`,
                    'color: #6b7280;');
                console.log('%cData:', `color: ${statusColor}; font-weight: bold;`, data);
            }

            if (!response.ok) {
                const errorMessage = typeof data.error === 'string'
                    ? data.error
                    : (data.error?.message || data.message || 'Terjadi kesalahan');
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
            if (isDev) {
                console.error(`%c[API Network Error] %c${url}`, 'color: #ef4444; font-weight: bold;', 'color: #6b7280;');
                console.error(error);
            }
            return {
                success: false,
                error: {
                    code: 'NETWORK_ERROR',
                    message: 'Gagal terhubung ke server. Periksa koneksi internet Anda.',
                },
            };
        }
    }
}
