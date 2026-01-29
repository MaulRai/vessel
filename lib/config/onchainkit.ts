import { base, baseSepolia, type Chain } from 'wagmi/chains';

// OnchainKit uses Base Mainnet for identity/basename resolution
// Transactions are handled by Wagmi which uses the configured chain (baseSepolia for dev)
const chain: Chain = base;

export const ONCHAINKIT_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY ?? '',
  chain,
  appName: 'Vessel Finance',
  appIcon: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/vessel-logo.png`,
};

export const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? '';
