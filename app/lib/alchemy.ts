import { ChainConfig, SUPPORTED_CHAINS } from './chains';
import { createPublicClient, http, formatUnits, Address } from 'viem';
import { mainnet, base, optimism, arbitrum, polygon } from 'viem/chains';

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

// Map chain config to Viem chain definition
const getViemChain = (chainId: string) => {
    switch (chainId) {
        case 'ethereum': return mainnet;
        case 'base': return base;
        case 'optimism': return optimism;
        case 'arbitrum': return arbitrum;
        case 'polygon': return polygon;
        default: return base;
    }
};

class AlchemyAPI {
    private apiKey: string;

    constructor() {
        if (!ALCHEMY_API_KEY) {
            console.error('ALCHEMY_API_KEY is not defined');
            // Allow running without key, but requests will fail
            this.apiKey = 'dummy-key';
        } else {
            this.apiKey = ALCHEMY_API_KEY;
        }
    }

    private getRpcUrl(chainId: string) {
        const chain = SUPPORTED_CHAINS.find(c => c.id === chainId);
        if (!chain) throw new Error(`Unsupported chain: ${chainId}`);
        return `https://${chain.alchemyNetwork}.g.alchemy.com/v2/${this.apiKey}`;
    }

    private async fetch(url: string, options: RequestInit = {}): Promise<any> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                next: { revalidate: 60 } // Cache for 60 seconds
            });
            clearTimeout(timeoutId);

            const text = await response.text();
            try {
                const data = JSON.parse(text);
                if (!response.ok) {
                    throw new Error(data.error?.message || data.message || `HTTP ${response.status}`);
                }
                return data;
            } catch (e) {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${text.slice(0, 100)}`);
                }
                console.warn(`[Alchemy] Received non-JSON response from ${url}`);
                // Attempt to return text if JSON parse fails but status is 200 (edge case)
                throw new Error('Invalid JSON response');
            }
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    async getTokenBalances(address: string, chainId: string): Promise<any> {
        const url = this.getRpcUrl(chainId);
        const result = await this.fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'alchemy_getTokenBalances',
                params: [address, 'erc20']
            })
        });
        return result.result; // Alchemy generic response wrapper
    }

    async getTokenMetadata(contractAddress: string, chainId: string): Promise<any> {
        const url = this.getRpcUrl(chainId);
        const result = await this.fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'alchemy_getTokenMetadata',
                params: [contractAddress]
            })
        });
        return result.result;
    }

    async getNFTs(owner: string, chainId: string): Promise<any> {
        const chain = SUPPORTED_CHAINS.find(c => c.id === chainId);
        if (!chain) throw new Error(`Unsupported chain: ${chainId}`);

        const url = `https://${chain.alchemyNetwork}.g.alchemy.com/nft/v3/${this.apiKey}/getNFTsForOwner?owner=${owner}&withMetadata=true&pageSize=100`;
        return this.fetch(url);
    }

    async getAssetTransfers(params: {
        fromAddress?: string;
        toAddress?: string;
        chainId: string;
        category: string[];
        maxCount?: number;
    }): Promise<any> {
        const url = this.getRpcUrl(params.chainId);
        const bodyParams: any = {
            category: params.category,
            maxCount: hex(params.maxCount || 20),
            order: 'desc'
        };

        if (params.fromAddress) bodyParams.fromAddress = params.fromAddress;
        if (params.toAddress) bodyParams.toAddress = params.toAddress;

        const result = await this.fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'alchemy_getAssetTransfers',
                params: [bodyParams]
            })
        });
        return result.result;
    }
}

function hex(val: number): string {
    return '0x' + val.toString(16);
}

export const alchemyAPI = new AlchemyAPI();

// Helper functions
export async function getNativeBalance(address: Address, chain: ChainConfig) {
    const viemChain = getViemChain(chain.id);
    const client = createPublicClient({
        chain: viemChain,
        transport: http(`https://${chain.alchemyNetwork}.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
    });

    try {
        const balance = await client.getBalance({ address });
        return {
            balance: balance.toString(),
            formatted: formatUnits(balance, 18),
        };
    } catch (e) {
        console.error(`Failed to fetch native balance for ${chain.name}`, e);
        return { balance: '0', formatted: '0' };
    }
}

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

export function formatUSD(value: number): string {
    if (value === 0) return '$0.00';
    if (value < 0.01) return '< $0.01';
    if (value < 1000) return `$${value.toFixed(2)}`;
    if (value < 1000000) return `$${(value / 1000).toFixed(2)}K`;
    return `$${(value / 1000000).toFixed(2)}M`;
}

export function formatPercentage(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
}

export function shortenAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function isValidAddress(address: string): boolean {
    const isEvm = /^0x[a-fA-F0-9]{40}$/.test(address);
    const isBtc = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address);
    return isEvm || isBtc;
}

export function parseNFTMetadata(metadataString?: string) {
    if (!metadataString) return null;
    try {
        return JSON.parse(metadataString);
    } catch {
        return null;
    }
}
