// CoinGecko API client for token prices
// Free tier: 10-50 calls/minute

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

interface TokenPrice {
    usd: number;
    usd_24h_change?: number;
}

interface PriceData {
    [address: string]: TokenPrice;
}

class CoinGeckoAPI {
    private cache: Map<string, { data: PriceData; timestamp: number }> = new Map();
    private cacheTTL = 5 * 60 * 1000; // 5 minutes

    async getTokenPrices(addresses: string[]): Promise<PriceData> {
        if (addresses.length === 0) return {};

        // Check cache
        const cacheKey = addresses.sort().join(',');
        const cached = this.cache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
            return cached.data;
        }

        try {
            // CoinGecko uses lowercase addresses
            const addressList = addresses.map(addr => addr.toLowerCase()).join(',');

            const response = await fetch(
                `${COINGECKO_API_URL}/simple/token_price/base?contract_addresses=${addressList}&vs_currencies=usd&include_24hr_change=true`,
                {
                    headers: {
                        'Accept': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                console.warn('CoinGecko API error:', response.statusText);
                return {};
            }

            const data: PriceData = await response.json();

            // Cache the result
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now(),
            });

            return data;
        } catch (error) {
            console.error('Failed to fetch token prices:', error);
            return {};
        }
    }

    async getEthPrice(): Promise<number> {
        try {
            const response = await fetch(
                `${COINGECKO_API_URL}/simple/price?ids=ethereum&vs_currencies=usd`
            );

            if (!response.ok) return 0;

            const data = await response.json();
            return data.ethereum?.usd || 0;
        } catch (error) {
            console.error('Failed to fetch ETH price:', error);
            return 0;
        }
    }
}

export const coinGeckoAPI = new CoinGeckoAPI();
