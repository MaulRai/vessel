'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { walletAPI } from '../api/user';
import { useAuth } from './AuthContext';

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

interface WalletContextType {
  walletAddress: string | null;
  isConnecting: boolean;
  isMetaMaskInstalled: boolean;
  error: string | null;
  connectWallet: () => Promise<boolean>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const isMock = process.env.NEXT_PUBLIC_WALLET_MOCK === '1';
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isMock) {
      setIsMetaMaskInstalled(true);
      const saved = typeof window !== 'undefined' ? localStorage.getItem('demo_wallet_address') : null;
      if (saved) setWalletAddress(saved);
      return;
    }

    if (typeof window !== 'undefined' && window.ethereum?.isMetaMask) {
      setIsMetaMaskInstalled(true);
    }
  }, []);

  useEffect(() => {
    if (!isMock && !isMetaMaskInstalled) {
      setWalletAddress(null);
    }
  }, [isMock, isMetaMaskInstalled]);

  useEffect(() => {
    if (isMock) return;
    if (user?.wallet_address) {
      setWalletAddress(user.wallet_address);
    } else {
      setWalletAddress(null);
    }
  }, [user?.wallet_address, isMock]);

  useEffect(() => {
    if (isMock) return;
    if (typeof window === 'undefined' || !window.ethereum) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const accountList = accounts as string[];
      if (accountList.length === 0) {
        setWalletAddress(null);
      } else if (accountList[0] !== walletAddress) {
        setWalletAddress(accountList[0]);
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, [walletAddress]);

  const connectWallet = useCallback(async (): Promise<boolean> => {
    setIsConnecting(true);
    setError(null);

    if (isMock) {
      const mockAddress = '0xdEAdbeEF0000000000000000000000000000dEaD';
      setWalletAddress(mockAddress);
      if (typeof window !== 'undefined') {
        localStorage.setItem('demo_wallet_address', mockAddress);
      }
      setIsConnecting(false);
      return true;
    }

    if (!window.ethereum?.isMetaMask) {
      setError('MetaMask tidak terdeteksi. Silakan install MetaMask terlebih dahulu.');
      setIsConnecting(false);
      return false;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (accounts.length === 0) {
        setError('Tidak ada akun yang dipilih');
        setIsConnecting(false);
        return false;
      }

      const address = accounts[0];

      const res = await walletAPI.updateWallet(address);

      if (res.success) {
        setWalletAddress(address);
        setIsConnecting(false);
        return true;
      } else {
        setError(res.error?.message || 'Gagal menyimpan wallet address');
        setIsConnecting(false);
        return false;
      }
    } catch (err: unknown) {
      const error = err as { code?: number; message?: string };
      if (error.code === 4001) {
        setError('Koneksi wallet dibatalkan');
      } else {
        setError(error.message || 'Gagal menghubungkan wallet');
      }
      setIsConnecting(false);
      return false;
    }
  }, [isMock]);

  const disconnectWallet = useCallback(() => {
    setWalletAddress(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('demo_wallet_address');
    }
  }, []);

  const value: WalletContextType = {
    walletAddress,
    isConnecting,
    isMetaMaskInstalled,
    error,
    connectWallet,
    disconnectWallet,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);

  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }

  return context;
}
