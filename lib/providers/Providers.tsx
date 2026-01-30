'use client';

import { OnchainKitProvider } from '@coinbase/onchainkit';
import '@coinbase/onchainkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { ONCHAINKIT_CONFIG } from '../config/onchainkit';
import { wagmiConfig } from '../config/wagmi';
import { AuthProvider } from '../context/AuthContext';
import { InvestorWalletProvider } from '../context/InvestorWalletContext';
import { LanguageProvider } from '../i18n/LanguageContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <LanguageProvider>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <OnchainKitProvider apiKey={ONCHAINKIT_CONFIG.apiKey} chain={ONCHAINKIT_CONFIG.chain}>
            <AuthProvider>
              <InvestorWalletProvider>{children}</InvestorWalletProvider>
            </AuthProvider>
          </OnchainKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </LanguageProvider>
  );
}
