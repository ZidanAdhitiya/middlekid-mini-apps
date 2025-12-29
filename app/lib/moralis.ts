// Moralis API client utilities for Base chain

const MORALIS_API_KEY = process.env.MORALIS_API_KEY;
const BASE_CHAIN_ID = '0x2105'; // Base mainnet chain ID (8453 in hex)

export class MoralisClient {
    private baseUrl = 'https://deep-index.moralis.io/api/v2.2';

    private async request(endpoint: string, params?: Record<string, string>) {
        const url = new URL(`${this.baseUrl}${endpoint}`);

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, value);
            });
        }

        const response = await fetch(url.toString(), {
            headers: {
                'X-API-Key': MORALIS_API_KEY || '',
                'accept': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(`Moralis API error: ${error.message || response.statusText}`);
        }

        return response.json();
    }

    async getTokenBalances(address: string) {
        return this.request(`/${address}/erc20`, {
            chain: BASE_CHAIN_ID,
        });
    }

    async getNativeBalance(address: string) {
        return this.request(`/${address}/balance`, {
            chain: BASE_CHAIN_ID,
        });
    }

    async getNFTs(address: string) {
        return this.request(`/${address}/nft`, {
            chain: BASE_CHAIN_ID,
            format: 'decimal',
            media_items: 'true',
        });
    }

    async getTransactions(address: string, limit: number = 10) {
        return this.request(`/${address}`, {
            chain: BASE_CHAIN_ID,
            limit: limit.toString(),
        });
    }

    async getTokenPrice(tokenAddress: string) {
        return this.request(`/erc20/${tokenAddress}/price`, {
            chain: BASE_CHAIN_ID,
        });
    }

    async getWalletNetWorth(address: string) {
        return this.request(`/wallets/${address}/net-worth`, {
            chains: BASE_CHAIN_ID,
        });
    }
}

export const moralisClient = new MoralisClient();

// Helper function to format token balance
export function formatTokenBalance(balance: string, decimals: number): string {
    const balanceNum = parseFloat(balance) / Math.pow(10, decimals);

    if (balanceNum === 0) return '0';
    if (balanceNum < 0.000001) return '< 0.000001';
    if (balanceNum < 1) return balanceNum.toFixed(6);
    if (balanceNum < 1000) return balanceNum.toFixed(4);
    if (balanceNum < 1000000) return balanceNum.toFixed(2);

    return balanceNum.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

// Helper function to format USD value
export function formatUSD(value: number): string {
    if (value === 0) return '$0.00';
    if (value < 0.01) return '< $0.01';
    if (value < 1000) return `$${value.toFixed(2)}`;
    if (value < 1000000) return `$${(value / 1000).toFixed(2)}K`;

    return `$${(value / 1000000).toFixed(2)}M`;
}

// Helper function to format percentage
export function formatPercentage(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
}

// Helper function to shorten address
export function shortenAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Helper function to validate Ethereum address
export function isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Helper function to parse NFT metadata
export function parseNFTMetadata(metadataString?: string) {
    if (!metadataString) return null;

    try {
        return JSON.parse(metadataString);
    } catch {
        return null;
    }
}
