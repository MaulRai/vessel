import { base, baseSepolia, type Chain } from 'wagmi/chains';

const network = process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? 'mainnet' : 'testnet';

const chain: Chain = network === 'mainnet' ? base : baseSepolia;

export const ONCHAINKIT_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY ?? '',
  chain,
  appName: 'Vessel Finance',
  appIcon: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/vessel-logo.png`,
};

export const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? '';
