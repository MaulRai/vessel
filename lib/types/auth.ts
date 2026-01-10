// Auth Types - sesuai dengan backend lisk-builders

export type UserRole = 'investor' | 'mitra' | 'admin';

export type MemberStatus = 'calon_anggota_pendana' | 'member_mitra' | 'admin';

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  is_verified: boolean;
  is_active: boolean;
  cooperative_agreement: boolean;
  member_status: MemberStatus;
  balance_idr: number;
  email_verified: boolean;
  profile_completed: boolean;
  wallet_address?: string;
  profile?: UserProfile;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
  profile_picture?: string;
  created_at: string;
  updated_at: string;
}

// Request Types
export interface SendOTPRequest {
  email: string;
  purpose: 'registration' | 'login' | 'password_reset';
}

export interface VerifyOTPRequest {
  email: string;
  code: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  confirm_password: string;
  role: UserRole;
  cooperative_agreement: boolean;
  otp_token: string;
}

export interface LoginRequest {
  email_or_username: string;
  password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

// Response Types
export interface APIResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: APIError;
}

export interface APIError {
  code: string;
  message: string;
  details?: string;
}

export interface SendOTPResponse {
  message: string;
  expires_at: string;
}

export interface VerifyOTPResponse {
  verified: boolean;
  message: string;
  token: string;
}

export interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface RegisterResponse extends LoginResponse { }

// Auth State
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
