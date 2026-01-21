'use client';

import { AuthProvider } from '../context/AuthContext';

import { InvestorWalletProvider } from '../context/InvestorWalletContext';
import { LanguageProvider } from '../i18n/LanguageContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <InvestorWalletProvider>{children}</InvestorWalletProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
