'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

declare global {
    interface Window {
        ethereum?: {
            isMetaMask?: boolean;
            request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
            on: (event: string, callback: (...args: unknown[]) => void) => void;
            removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
        };
    }
}

interface InvestorUser {
    walletAddress: string;
    role: 'investor';
    connectedAt: string;
}

interface InvestorWalletContextType {
    investor: InvestorUser | null;
    walletAddress: string | null;
    isConnecting: boolean;
    isConnected: boolean;
    isMetaMaskInstalled: boolean;
    error: string | null;
    chainId: number | null;
    idrxBalance: string;
    connectWallet: () => Promise<boolean>;
    disconnectWallet: () => void;
    switchToCorrectChain: () => Promise<boolean>;
    refreshBalance: () => Promise<void>;
}

const InvestorWalletContext = createContext<InvestorWalletContextType | undefined>(undefined);

const INVESTOR_WALLET_KEY = 'vessel_investor_wallet';
const EXPECTED_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '31337', 10);

export function InvestorWalletProvider({ children }: { children: React.ReactNode }) {
    const isMock = process.env.NEXT_PUBLIC_WALLET_MOCK === '1';
    const [investor, setInvestor] = useState<InvestorUser | null>(null);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [chainId, setChainId] = useState<number | null>(null);
    const [idrxBalance, setIdrxBalance] = useState<string>('0');

    const isConnected = investor !== null && walletAddress !== null;

    // IDRX contract address from env
    const IDRX_ADDRESS = process.env.NEXT_PUBLIC_IDRX_ADDRESS || '';

    // Fetch IDRX balance
    const fetchBalance = useCallback(async (address: string) => {
        if (!address || !IDRX_ADDRESS || isMock) {
            if (isMock) setIdrxBalance('1000000000'); // 1000 IDRX for demo
            return;
        }

        try {
            if (!window.ethereum) return;

            // ERC20 balanceOf(address) function selector
            const data = `0x70a08231000000000000000000000000${address.slice(2)}`;

            const result = await window.ethereum.request({
                method: 'eth_call',
                params: [{ to: IDRX_ADDRESS, data }, 'latest'],
            }) as string;

            // Parse the result (it's in wei/smallest unit)
            const balanceWei = BigInt(result);
            // IDRX typically has 6 or 18 decimals - assuming 6 for stablecoin
            const balance = Number(balanceWei) / 1e6;
            setIdrxBalance(balance.toLocaleString('id-ID'));
        } catch (err) {
            console.error('Failed to fetch IDRX balance:', err);
            setIdrxBalance('0');
        }
    }, [IDRX_ADDRESS, isMock]);

    const refreshBalance = useCallback(async () => {
        if (walletAddress) {
            await fetchBalance(walletAddress);
        }
    }, [walletAddress, fetchBalance]);

    // Load saved investor state on mount
    useEffect(() => {
        if (isMock) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsMetaMaskInstalled(true);
            const saved = typeof window !== 'undefined' ? localStorage.getItem(INVESTOR_WALLET_KEY) : null;
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setInvestor(parsed);
                    setWalletAddress(parsed.walletAddress);
                } catch {
                    localStorage.removeItem(INVESTOR_WALLET_KEY);
                }
            }
            return;
        }

        if (typeof window !== 'undefined' && window.ethereum?.isMetaMask) {
            setIsMetaMaskInstalled(true);

            // Check if already connected
            window.ethereum.request({ method: 'eth_accounts' })
                .then((accounts) => {
                    const accountList = accounts as string[];
                    if (accountList.length > 0) {
                        const saved = localStorage.getItem(INVESTOR_WALLET_KEY);
                        if (saved) {
                            try {
                                const parsed = JSON.parse(saved);
                                if (parsed.walletAddress.toLowerCase() === accountList[0].toLowerCase()) {
                                    setInvestor(parsed);
                                    setWalletAddress(accountList[0]);
                                }
                            } catch {
                                localStorage.removeItem(INVESTOR_WALLET_KEY);
                            }
                        }
                    }
                })
                .catch(console.error);

            // Get current chain ID
            window.ethereum.request({ method: 'eth_chainId' })
                .then((id) => {
                    setChainId(parseInt(id as string, 16));
                })
                .catch(console.error);
        }
    }, [isMock]);

    // Fetch balance when wallet connects
    useEffect(() => {
        if (walletAddress) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchBalance(walletAddress);
        }
    }, [walletAddress, fetchBalance]);

    // Listen for account changes
    useEffect(() => {
        if (isMock || typeof window === 'undefined' || !window.ethereum) return;

        const handleAccountsChanged = (accounts: unknown) => {
            const accountList = accounts as string[];
            if (accountList.length === 0) {
                // User disconnected
                setInvestor(null);
                setWalletAddress(null);
                localStorage.removeItem(INVESTOR_WALLET_KEY);
            } else if (accountList[0].toLowerCase() !== walletAddress?.toLowerCase()) {
                // Account changed
                const newInvestor: InvestorUser = {
                    walletAddress: accountList[0],
                    role: 'investor',
                    connectedAt: new Date().toISOString(),
                };
                setInvestor(newInvestor);
                setWalletAddress(accountList[0]);
                localStorage.setItem(INVESTOR_WALLET_KEY, JSON.stringify(newInvestor));
            }
        };

        const handleChainChanged = (newChainId: unknown) => {
            setChainId(parseInt(newChainId as string, 16));
        };

        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);

        return () => {
            window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
            window.ethereum?.removeListener('chainChanged', handleChainChanged);
        };
    }, [walletAddress, isMock]);

    const switchToCorrectChain = useCallback(async (): Promise<boolean> => {
        if (isMock) return true;
        if (!window.ethereum) return false;

        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${EXPECTED_CHAIN_ID.toString(16)}` }],
            });
            return true;
        } catch (switchError: unknown) {
            const err = switchError as { code?: number };
            // Chain not added, try to add it
            if (err.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: `0x${EXPECTED_CHAIN_ID.toString(16)}`,
                            chainName: EXPECTED_CHAIN_ID === 31337 ? 'Hardhat Local' : 'Custom Network',
                            nativeCurrency: {
                                name: 'ETH',
                                symbol: 'ETH',
                                decimals: 18,
                            },
                            rpcUrls: [process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8545'],
                        }],
                    });
                    return true;
                } catch {
                    setError('Gagal menambahkan jaringan');
                    return false;
                }
            }
            setError('Gagal berganti jaringan');
            return false;
        }
    }, [isMock]);

    const connectWallet = useCallback(async (): Promise<boolean> => {
        setIsConnecting(true);
        setError(null);

        if (isMock) {
            const mockAddress = '0xdEAdbeEF0000000000000000000000000000dEaD';
            const newInvestor: InvestorUser = {
                walletAddress: mockAddress,
                role: 'investor',
                connectedAt: new Date().toISOString(),
            };
            setInvestor(newInvestor);
            setWalletAddress(mockAddress);
            localStorage.setItem(INVESTOR_WALLET_KEY, JSON.stringify(newInvestor));
            setIsConnecting(false);
            return true;
        }

        if (!window.ethereum?.isMetaMask) {
            setError('MetaMask tidak terdeteksi. Silakan install MetaMask terlebih dahulu.');
            setIsConnecting(false);
            return false;
        }

        try {
            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts',
            }) as string[];

            if (accounts.length === 0) {
                setError('Tidak ada akun yang dipilih');
                setIsConnecting(false);
                return false;
            }

            const address = accounts[0];

            // Check chain ID
            const currentChainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;
            const currentChainIdNum = parseInt(currentChainId, 16);
            setChainId(currentChainIdNum);

            // Switch chain if needed
            if (currentChainIdNum !== EXPECTED_CHAIN_ID) {
                const switched = await switchToCorrectChain();
                if (!switched) {
                    setIsConnecting(false);
                    return false;
                }
            }

            // Create investor user
            const newInvestor: InvestorUser = {
                walletAddress: address,
                role: 'investor',
                connectedAt: new Date().toISOString(),
            };

            setInvestor(newInvestor);
            setWalletAddress(address);
            localStorage.setItem(INVESTOR_WALLET_KEY, JSON.stringify(newInvestor));
            setIsConnecting(false);
            return true;
        } catch (err: unknown) {
            const error = err as { code?: number; message?: string };
            if (error.code === 4001) {
                setError('Koneksi wallet dibatalkan');
            } else {
                setError(error.message || 'Gagal menghubungkan wallet');
            }
            setIsConnecting(false);
            return false;
        }
    }, [isMock, switchToCorrectChain]);

    const disconnectWallet = useCallback(() => {
        setInvestor(null);
        setWalletAddress(null);
        localStorage.removeItem(INVESTOR_WALLET_KEY);
    }, []);

    const value: InvestorWalletContextType = {
        investor,
        walletAddress,
        isConnecting,
        isConnected,
        isMetaMaskInstalled,
        error,
        chainId,
        idrxBalance,
        connectWallet,
        disconnectWallet,
        switchToCorrectChain,
        refreshBalance,
    };

    return <InvestorWalletContext.Provider value={value}>{children}</InvestorWalletContext.Provider>;
}

export function useInvestorWallet() {
    const context = useContext(InvestorWalletContext);

    if (context === undefined) {
        throw new Error('useInvestorWallet must be used within an InvestorWalletProvider');
    }

    return context;
}
