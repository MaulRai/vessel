'use client';

import { OnchainKitProvider } from '@coinbase/onchainkit';
import '@coinbase/onchainkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';
import { ONCHAINKIT_CONFIG, WALLET_CONNECT_PROJECT_ID } from '../config/onchainkit';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../i18n/LanguageContext';

const wagmiConfig = createConfig({
  chains: [baseSepolia, base],
  connectors: [
    injected({ shimDisconnect: true }),
    coinbaseWallet({
      appName: ONCHAINKIT_CONFIG.appName,
      appLogoUrl: ONCHAINKIT_CONFIG.appIcon,
      preference: 'all',
    }),
    walletConnect({
      projectId: WALLET_CONNECT_PROJECT_ID,
      showQrModal: true,
      metadata: {
        name: ONCHAINKIT_CONFIG.appName,
        description: 'Vessel Finance dApp',
        url: ONCHAINKIT_CONFIG.appIcon?.replace('/vessel-logo.png', '') || 'https://vessel.local',
        icons: [ONCHAINKIT_CONFIG.appIcon || ''],
      },
    }),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http('https://base-sepolia.drpc.org'),
  },
  ssr: true,
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <LanguageProvider>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <OnchainKitProvider apiKey={ONCHAINKIT_CONFIG.apiKey} chain={ONCHAINKIT_CONFIG.chain}>
            <AuthProvider>{children}</AuthProvider>
          </OnchainKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </LanguageProvider>
  );
}
