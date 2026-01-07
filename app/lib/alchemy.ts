import { ChainConfig, SUPPORTED_CHAINS } from './chains';
import { createPublicClient, http, formatUnits, Address } from 'viem';
import { mainnet, base, optimism, arbitrum, polygon, bsc, avalanche, fantom, gnosis, linea, zksync, scroll, blast, mantle, cronos, zora } from 'viem/chains';

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

// Map chain config to Viem chain definition
const getViemChain = (chainId: string) => {
    // 1. Try to find in supported/curated chains
    const chain = SUPPORTED_CHAINS.find(c => c.id === chainId);
    if (chain && chain.viemChain) {
        return chain.viemChain;
    }

    // 2. Special overrides (Monad/Viction hardcoded before) can still exist or be merged
    switch (chainId) {
        case 'monad': return {
            id: 143,
            name: 'Monad Mainnet',
            network: 'monad',
            nativeCurrency: { decimals: 18, name: 'Monad', symbol: 'MON' },
            rpcUrls: { default: { http: ['https://rpc.monad.xyz'] }, public: { http: ['https://rpc.monad.xyz'] } }
        } as any;
        // Viction is actually already in viem/chains usually, but keeping fallback just in case
        case 'sonic': return {
            id: 146,
            name: 'Sonic Mainnet',
            network: 'sonic',
            nativeCurrency: { decimals: 18, name: 'Sonic', symbol: 'S' },
            rpcUrls: { default: { http: ['https://rpc.soniclabs.com'] }, public: { http: ['https://rpc.soniclabs.com'] } }
        } as any;
        default: return mainnet;
    }
};

class AlchemyAPI {
    private apiKey: string;

    constructor() {
        if (!ALCHEMY_API_KEY) {
            // Silently use dummy key for development/testing
            console.warn('⚠️ ALCHEMY_API_KEY not set - using mock data mode');
            this.apiKey = 'demo-key-for-testing';
        } else {
            this.apiKey = ALCHEMY_API_KEY;
        }
    }

    private getRpcUrl(chainId: string): string {
        // Try to find chain by numeric chainId first
        const numericId = parseInt(chainId);
        let chain = SUPPORTED_CHAINS.find(c => c.chainId === numericId);

        // Fallback to string ID match
        if (!chain) {
            chain = SUPPORTED_CHAINS.find(c => c.id === chainId);
        }

        if (!chain) {
            throw new Error(`Unsupported chain: ${chainId}`);
        }

        // Map chainId to Alchemy network name
        const networkMap: { [key: string]: string } = {
            '1': 'eth-mainnet',
            '137': 'polygon-mainnet',
            '10': 'opt-mainnet',
            '42161': 'arb-mainnet',
            '8453': 'base-mainnet',  // Base support
            '56': 'bnb-mainnet',
            '43114': 'avax-mainnet',
            '250': 'fantom-mainnet',
            '100': 'gnosis-mainnet',
            '324': 'zksync-mainnet',
        };

        const network = networkMap[chainId];
        if (network) {
            return `https://${network}.g.alchemy.com/v2/${this.apiKey}`;
        }

        // Fallback to chain's own RPC if available
        if (chain.rpcUrl) {
            return chain.rpcUrl;
        }

        throw new Error(`No RPC URL available for chain: ${chainId}`);
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

    async getTransactionReceipt(txHash: string, chainId: string = '1'): Promise<any> {
        const url = this.getRpcUrl(chainId);
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_getTransactionReceipt',
                params: [txHash]
            })
        });
        const data = await response.json();
        return data.result;
    }

    async getTransaction(txHash: string, chainId: string = '1'): Promise<any> {
        const url = this.getRpcUrl(chainId);
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_getTransactionByHash',
                params: [txHash]
            })
        });
        const data = await response.json();
        return data.result;
    }
}

function hex(val: number): string {
    return '0x' + val.toString(16);
}

export const alchemyAPI = new AlchemyAPI();

// Helper functions
export async function getNativeBalance(address: Address, chain: ChainConfig) {
    const viemChain = getViemChain(chain.id);

    // Determine Transport URL
    let transportUrl = '';
    if (chain.alchemyNetwork) {
        transportUrl = `https://${chain.alchemyNetwork}.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
    } else if (chain.rpcUrl) {
        transportUrl = chain.rpcUrl;
    } else {
        // Fallback or error
        return { balance: '0', formatted: '0' };
    }

    const client = createPublicClient({
        chain: viemChain,
        transport: http(transportUrl),
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

export function formatBalance(balance: string, decimals: number): string {
    try {
        const balanceNum = parseFloat(formatUnits(BigInt(balance), decimals));
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
