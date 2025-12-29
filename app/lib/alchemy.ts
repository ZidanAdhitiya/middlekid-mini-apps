// Alchemy API client using Viem for Base chain
import { createPublicClient, http, formatUnits, Address } from 'viem';
import { base } from 'viem/chains';

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const ALCHEMY_BASE_URL = `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

// Create Viem client with Alchemy transport
export const alchemyClient = createPublicClient({
    chain: base,
    transport: http(ALCHEMY_BASE_URL),
});

// Alchemy-specific RPC methods
class AlchemyAPI {
    private async request(method: string, params: any[]) {
        const response = await fetch(ALCHEMY_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method,
                params,
            }),
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(`Alchemy API error: ${data.error.message}`);
        }

        return data.result;
    }

    async getTokenBalances(address: string) {
        return this.request('alchemy_getTokenBalances', [address, 'erc20']);
    }

    async getTokenMetadata(contractAddress: string) {
        return this.request('alchemy_getTokenMetadata', [contractAddress]);
    }

    async getNFTs(address: string) {
        // Use Alchemy NFT API v3 REST endpoint (RPC method not supported)
        // Note: excludeFilters requires paid plan, so we filter spam manually
        const url = `https://base-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getNFTsForOwner?owner=${address}&withMetadata=true`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Alchemy NFT API error: ${response.statusText} - ${error}`);
        }

        return response.json();
    }

    async getAssetTransfers(address: string, options: {
        fromBlock?: string;
        toBlock?: string;
        category?: string[];
        maxCount?: string;
    } = {}) {
        return this.request('alchemy_getAssetTransfers', [
            {
                fromAddress: address,
                category: options.category || ['external', 'erc20', 'erc721', 'erc1155'],
                maxCount: options.maxCount || '0xa', // 10 in hex
                ...options,
            },
        ]);
    }
}

export const alchemyAPI = new AlchemyAPI();

// Helper function to get native ETH balance
export async function getNativeBalance(address: Address) {
    const balance = await alchemyClient.getBalance({ address });
    return {
        balance: balance.toString(),
        formatted: formatUnits(balance, 18),
    };
}

// Helper function to format token balance
export function formatTokenBalance(balance: string, decimals: number): string {
    try {
        const balanceNum = parseFloat(balance) / Math.pow(10, decimals);

        if (balanceNum === 0) return '0';
        if (balanceNum < 0.000001) return '< 0.000001';
        if (balanceNum < 1) return balanceNum.toFixed(6);
        if (balanceNum < 1000) return balanceNum.toFixed(4);
        if (balanceNum < 1000000) return balanceNum.toFixed(2);

        return balanceNum.toLocaleString('en-US', { maximumFractionDigits: 2 });
    } catch {
        return '0';
    }
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
