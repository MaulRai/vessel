'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserRole } from '../types/auth';

interface User {
  wallet_address: string;
  role: UserRole;
  username?: string;
  email?: string;
  balance_idr?: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  loginWithWallet: (walletAddress: string, initialRole?: UserRole) => Promise<void>;
  switchRole: (newRole: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = 'vessel_user';
const CURRENT_ROLE_KEY = 'vessel_current_role';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Load auth state from localStorage on mount
  useEffect(() => {
    const loadAuthState = () => {
      try {
        const userStr = localStorage.getItem(USER_KEY);
        const savedRole = localStorage.getItem(CURRENT_ROLE_KEY) as UserRole | null;
        
        if (userStr) {
          const user = JSON.parse(userStr);
          // Use saved role if exists, otherwise use user's role
          if (savedRole && (savedRole === 'investor' || savedRole === 'mitra')) {
            user.role = savedRole;
          }
          
          setState({
            user,
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

  const loginWithWallet = useCallback(async (walletAddress: string, initialRole: UserRole = 'investor') => {
    // In a real app, this would call an API to register/login the wallet
    const user: User = {
      wallet_address: walletAddress,
      role: initialRole,
      username: `User_${walletAddress.slice(2, 8)}`,
      balance_idr: 125_000_000, // Default balance for demo
    };

    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(CURRENT_ROLE_KEY, initialRole);

    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const switchRole = useCallback((newRole: UserRole) => {
    setState((prev) => {
      if (!prev.user) return prev;
      
      const updatedUser = { ...prev.user, role: newRole };
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      localStorage.setItem(CURRENT_ROLE_KEY, newRole);
      
      return {
        ...prev,
        user: updatedUser,
      };
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(CURRENT_ROLE_KEY);
    
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const value: AuthContextType = {
    ...state,
    loginWithWallet,
    switchRole,
    logout,
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
