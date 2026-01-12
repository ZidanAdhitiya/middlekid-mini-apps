// DeBank API Client
// Fetches DeFi positions across all protocols

export interface DeBankPosition {
    id: string;
    chain: string;
    name: string;
    site_url: string;
    logo_url: string;
    has_supported_portfolio: boolean;
    tvl: number;
    portfolio_item_list: DeBankPortfolioItem[];
}

export interface DeBankPortfolioItem {
    stats: {
        asset_usd_value: number;
        debt_usd_value: number;
        net_usd_value: number;
    };
    asset_token_list: DeBankToken[];
    detail_types: string[];
    name: string;
    pool?: {
        id: string;
    };
}

export interface DeBankToken {
    id: string;
    chain: string;
    name: string;
    symbol: string;
    display_symbol: string | null;
    optimized_symbol: string;
    decimals: number;
    logo_url: string;
    price: number;
    amount: number;
}

class DeBankAPI {
    private baseUrl = 'https://pro-openapi.debank.com/v1';
    private publicUrl = 'https://openapi.debank.com/v1';

    /**
     * Get all DeFi protocol positions for a wallet
     */
    async getUserProtocols(address: string): Promise<DeBankPosition[]> {
        try {
            // Using public API endpoint (no auth required for basic read)
            const url = `${this.publicUrl}/user/all_complex_protocol_list?id=${address}`;

            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                console.error(`DeBank API error: ${response.status}`);
                return [];
            }

            const data = await response.json();
            return data || [];
        } catch (error) {
            console.error('DeBank API fetch error:', error);
            return [];
        }
    }

    /**
     * Get simple token list (as fallback)
     */
    async getUserTokenList(address: string, chainId?: string): Promise<DeBankToken[]> {
        try {
            let url = `${this.publicUrl}/user/token_list?id=${address}&is_all=true`;
            if (chainId) {
                url += `&chain_id=${chainId}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                console.error(`DeBank token list error: ${response.status}`);
                return [];
            }

            const data = await response.json();
            return data || [];
        } catch (error) {
            console.error('DeBank token list error:', error);
            return [];
        }
    }

    /**
     * Convert DeBank chain ID to our chain ID
     */
    mapChainId(debankChain: string): string {
        const chainMap: Record<string, string> = {
            'eth': 'ethereum',
            'bsc': 'bsc',
            'polygon': 'polygon',
            'avax': 'avalanche',
            'arb': 'arbitrum',
            'op': 'optimism',
            'base': 'base',
            'ftm': 'fantom',
            'linea': 'linea',
            'zksync': 'zksync',
            'scroll': 'scroll'
        };

        return chainMap[debankChain.toLowerCase()] || debankChain;
    }
}

export const debankAPI = new DeBankAPI();
