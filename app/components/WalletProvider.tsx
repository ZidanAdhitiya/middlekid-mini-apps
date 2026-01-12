'use client';

import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { walletConnect, injected, coinbaseWallet } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

// Define Base chains manually since wagmi/chains might not export them
const base = {
    id: 8453,
    name: 'Base',
    network: 'base',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://mainnet.base.org'] },
        public: { http: ['https://mainnet.base.org'] }
    },
    blockExplorers: {
        default: { name: 'BaseScan', url: 'https://basescan.org' }
    }
} as const;

const baseSepolia = {
    id: 84532,
    name: 'Base Sepolia',
    network: 'base-sepolia',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://sepolia.base.org'] },
        public: { http: ['https://sepolia.base.org'] }
    },
    blockExplorers: {
        default: { name: 'BaseScan', url: 'https://sepolia.basescan.org' }
    },
    testnet: true
} as const;

// Get Project ID from environment
// Project ID: 1667f7c89ecfe0bb53a4ab830081d203 (from cloud.reown.com)
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '1667f7c89ecfe0bb53a4ab830081d203';

// Define metadata for your app
const metadata = {
    name: 'MiddleKid',
    description: 'Multi-chain crypto portfolio tracker and DeFi analyzer',
    url: 'http://localhost:3000',
    icons: ['http://localhost:3000/icon.png']
};

// Configure wagmi with networks
const networks = [base, baseSepolia];

// Create wagmi adapter
const wagmiAdapter = new WagmiAdapter({
    networks,
    projectId
});

// Create modal
createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks,
    metadata,
    features: {
        analytics: true,
        email: true,
        socials: ['google', 'x', 'discord', 'github']
    },
    themeMode: 'dark',
    themeVariables: {
        '--w3m-accent': '#667eea',
        '--w3m-border-radius-master': '8px'
    }
});

// Query client for React Query
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
            staleTime: 60000 // 1 minute
        }
    }
});

interface WalletProviderProps {
    children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
    return (
        <WagmiProvider config={wagmiAdapter.wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
}

// Re-export useful hooks
export { useAccount, useConnect, useDisconnect } from 'wagmi';
export { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
