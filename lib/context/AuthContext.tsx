'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authAPI } from '../api/auth';
import {
  User,
  AuthState,
  LoginRequest,
  RegisterRequest,
  SendOTPRequest,
  VerifyOTPRequest,
  APIResponse,
  LoginResponse,
  SendOTPResponse,
  VerifyOTPResponse,
  RegisterResponse,
} from '../types/auth';

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<APIResponse<LoginResponse>>;
  register: (data: RegisterRequest) => Promise<APIResponse<RegisterResponse>>;
  sendOTP: (data: SendOTPRequest) => Promise<APIResponse<SendOTPResponse>>;
  verifyOTP: (data: VerifyOTPRequest) => Promise<APIResponse<VerifyOTPResponse>>;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'vessel_access_token';
const REFRESH_TOKEN_KEY = 'vessel_refresh_token';
const USER_KEY = 'vessel_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Load auth state from localStorage on mount
  useEffect(() => {
    const loadAuthState = () => {
      try {
        const accessToken = localStorage.getItem(TOKEN_KEY);
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        const userStr = localStorage.getItem(USER_KEY);
        const user = userStr ? JSON.parse(userStr) : null;

        if (accessToken && user) {
          setState({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    loadAuthState();
  }, []);

  const saveAuthData = useCallback((data: LoginResponse) => {
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));

    setState({
      user: data.user,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const clearAuthData = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const login = useCallback(async (data: LoginRequest): Promise<APIResponse<LoginResponse>> => {
    const response = await authAPI.login(data);

    if (response.success && response.data) {
      saveAuthData(response.data);
    }

    return response;
  }, [saveAuthData]);

  const register = useCallback(async (data: RegisterRequest): Promise<APIResponse<RegisterResponse>> => {
    // Register tanpa auto-login, user harus login manual setelah registrasi
    const response = await authAPI.register(data);
    return response;
  }, []);

  const sendOTP = useCallback(async (data: SendOTPRequest): Promise<APIResponse<SendOTPResponse>> => {
    return authAPI.sendOTP(data);
  }, []);

  const verifyOTP = useCallback(async (data: VerifyOTPRequest): Promise<APIResponse<VerifyOTPResponse>> => {
    return authAPI.verifyOTP(data);
  }, []);

  const logout = useCallback(() => {
    clearAuthData();
  }, [clearAuthData]);

  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      clearAuthData();
      return false;
    }

    const response = await authAPI.refreshToken({ refresh_token: refreshToken });

    if (response.success && response.data) {
      saveAuthData(response.data);
      return true;
    }

    clearAuthData();
    return false;
  }, [saveAuthData, clearAuthData]);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    sendOTP,
    verifyOTP,
    logout,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
