import { createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';
import { ONCHAINKIT_CONFIG, WALLET_CONNECT_PROJECT_ID } from './onchainkit';

const createWagmiConfig = () => {
    return createConfig({
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
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const globalForWagmi = global as unknown as { wagmiConfig: any };

export const wagmiConfig = globalForWagmi.wagmiConfig || createWagmiConfig();

if (process.env.NODE_ENV !== 'production') {
    globalForWagmi.wagmiConfig = wagmiConfig;
}
