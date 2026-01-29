import { base, baseSepolia, type Chain } from 'wagmi/chains';

// OnchainKit uses Base Sepolia as requested by user
const chain: Chain = baseSepolia;

export const ONCHAINKIT_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY ?? '',
  chain,
  appName: 'Vessel Finance',
  appIcon: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/vessel-logo.png`,
};

export const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? '';
