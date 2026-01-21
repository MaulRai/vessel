import { base, baseSepolia } from 'wagmi/chains';

export const ONCHAINKIT_CONFIG = {
  // Use Base Sepolia testnet for development, Base mainnet for production
  chain: process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? base : baseSepolia,
  
  // Coinbase Developer Platform API Key (get from https://portal.cdp.coinbase.com/)
  apiKey: process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || '',
  
  // App info for WalletConnect
  appName: 'Vessel Finance',
  appDescription: 'Platform pembiayaan ekspor berbasis blockchain untuk eksportir Indonesia',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://vessel.finance',
  appIcon: '/vessel-logo.png',
};

export const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '';
