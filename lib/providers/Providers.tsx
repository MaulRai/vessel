'use client';

import { AuthProvider } from '../context/AuthContext';
import { WalletProvider } from '../context/WalletContext';
import { InvestorWalletProvider } from '../context/InvestorWalletContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WalletProvider>
        <InvestorWalletProvider>{children}</InvestorWalletProvider>
      </WalletProvider>
    </AuthProvider>
  );
}
