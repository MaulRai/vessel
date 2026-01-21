'use client';

import { OnchainKitProvider } from '@coinbase/onchainkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';
import { ONCHAINKIT_CONFIG, WALLET_CONNECT_PROJECT_ID } from '../config/onchainkit';
import { AuthProvider } from '../context/AuthContext';
import { useState } from 'react';

// Create wagmi config
const wagmiConfig = createConfig({
  chains: [ONCHAINKIT_CONFIG.chain],
  connectors: [
    injected(), // MetaMask and other injected wallets
    coinbaseWallet({
      appName: ONCHAINKIT_CONFIG.appName,
      appLogoUrl: ONCHAINKIT_CONFIG.appIcon,
    }),
    walletConnect({
      projectId: WALLET_CONNECT_PROJECT_ID,
    }),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  ssr: true,
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={ONCHAINKIT_CONFIG.apiKey}
          chain={ONCHAINKIT_CONFIG.chain}
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
