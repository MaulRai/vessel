import {
  APIResponse,
  SendOTPRequest,
  SendOTPResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  GoogleAuthRequest,
  GoogleAuthResponse,
} from '../types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

class AuthAPI {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      // Get the response text first
      const text = await response.text();

      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error('Failed to parse JSON response:', text);
        return {
          success: false,
          error: {
            code: 'PARSE_ERROR',
            message: text || 'Failed to parse server response',
          },
        };
      }

      if (!response.ok) {
        // Handle error response
        return {
          success: false,
          error: data.error || {
            code: 'UNKNOWN_ERROR',
            message: data.message || 'Terjadi kesalahan yang tidak diketahui',
          },
        };
      }

      return data;
    } catch (error) {
      console.error('Network error:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Gagal terhubung ke server. Periksa koneksi internet Anda.',
        },
      };
    }
  }

  async sendOTP(data: SendOTPRequest): Promise<APIResponse<SendOTPResponse>> {
    return this.request<SendOTPResponse>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyOTP(data: VerifyOTPRequest): Promise<APIResponse<VerifyOTPResponse>> {
    return this.request<VerifyOTPResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async register(data: RegisterRequest): Promise<APIResponse<RegisterResponse>> {
    return this.request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequest): Promise<APIResponse<LoginResponse>> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async refreshToken(data: RefreshTokenRequest): Promise<APIResponse<LoginResponse>> {
    return this.request<LoginResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async googleAuth(data: GoogleAuthRequest): Promise<APIResponse<GoogleAuthResponse>> {
    return this.request<GoogleAuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const authAPI = new AuthAPI(API_BASE_URL);
