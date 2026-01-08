// Historical Price Fetcher - CoinGecko Integration

import { PriceData } from './regret-types';

// Simple in-memory cache to avoid rate limits
const priceCache = new Map<string, PriceData>();

class PriceFetcher {
    private readonly COINGECKO_API = 'https://api.coingecko.com/api/v3';

    /**
     * Get current price for a token with multiple fallback sources
     */
    async getCurrentPrice(tokenAddress: string, chainId: number = 8453): Promise<number | null> {
        const cacheKey = `current_${tokenAddress}_${chainId}`;
        const cached = priceCache.get(cacheKey);

        // Use cache if less than 5 minutes old
        if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
            return cached.price;
        }

        // Try CoinGecko first (most reliable for major tokens)
        let price = await this.getPriceFromCoinGecko(tokenAddress, chainId);
        let source: 'coingecko' | 'dex' = 'coingecko';

        // Fallback to DEX if CoinGecko fails (for obscure tokens)
        if (!price) {
            console.log(`🔄 CoinGecko failed for ${tokenAddress}, trying DEX...`);
            price = await this.getPriceFromDEX(tokenAddress, chainId);
            source = 'dex';
        }

        // Cache the result
        if (price) {
            priceCache.set(cacheKey, {
                timestamp: Date.now(),
                price,
                source
            });
            console.log(`✅ Price for ${tokenAddress}: $${price} (source: ${source})`);
        } else {
            console.warn(`⚠️ No price found for ${tokenAddress} on chain ${chainId}`);
        }

        return price;
    }

    /**
     * Get price from CoinGecko API
     */
    private async getPriceFromCoinGecko(tokenAddress: string, chainId: number): Promise<number | null> {
        try {
            const platform = this.getPlatformId(chainId);

            const response = await fetch(
                `${this.COINGECKO_API}/simple/token_price/${platform}?contract_addresses=${tokenAddress}&vs_currencies=usd`,
                { headers: { 'Accept': 'application/json' } }
            );

            if (!response.ok) {
                return null;
            }

            const data = await response.json();
            return data[tokenAddress.toLowerCase()]?.usd || null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Get price from DEX pools (fallback for obscure tokens)
     * This implements a simple price lookup from Uniswap V2 style pools
     */
    private async getPriceFromDEX(tokenAddress: string, chainId: number): Promise<number | null> {
        try {
            // For Base chain, use Base DEX aggregators
            if (chainId === 8453) {
                // Try Aerodrome (popular Base DEX)
                return await this.getPriceFromAerodrome(tokenAddress);
            }

            // For other chains, could add Uniswap/Sushiswap lookups
            return null;
        } catch (error) {
            console.error('DEX price fetch error:', error);
            return null;
        }
    }

    /**
     * Get price from Aerodrome (Base chain DEX)
     */
    private async getPriceFromAerodrome(tokenAddress: string): Promise<number | null> {
        try {
            // Aerodrome API endpoint (if available)
            // Note: This is a simplified implementation
            // In production, you'd query the actual pool contracts

            const WETH_BASE = '0x4200000000000000000000000000000000000006';
            const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

            // For now, return null (would need actual pool contract calls)
            // This is a placeholder for future enhancement
            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Get historical price for a specific timestamp
     * Note: CoinGecko free tier has daily granularity
     */
    async getHistoricalPrice(
        tokenAddress: string,
        timestamp: number,
        chainId: number = 8453
    ): Promise<number | null> {
        const cacheKey = `hist_${tokenAddress}_${timestamp}_${chainId}`;
        const cached = priceCache.get(cacheKey);

        if (cached) {
            return cached.price;
        }

        try {
            const platform = this.getPlatformId(chainId);
            const date = this.timestampToDateString(timestamp);

            // CoinGecko historical endpoint
            const response = await fetch(
                `${this.COINGECKO_API}/coins/${platform}/contract/${tokenAddress}/market_chart/range?vs_currency=usd&from=${timestamp - 86400}&to=${timestamp + 86400}`,
                { headers: { 'Accept': 'application/json' } }
            );

            if (!response.ok) {
                console.warn('CoinGecko historical API error:', response.status);
                return null;
            }

            const data = await response.json();

            // Find closest price to timestamp
            if (data.prices && data.prices.length > 0) {
                const closestPrice = this.findClosestPrice(data.prices, timestamp);

                if (closestPrice) {
                    priceCache.set(cacheKey, {
                        timestamp: Date.now(),
                        price: closestPrice,
                        source: 'coingecko'
                    });
                    return closestPrice;
                }
            }

            return null;
        } catch (error) {
            console.error('Error fetching historical price:', error);
            return null;
        }
    }

    /**
     * Batch fetch current prices for multiple tokens
     */
    async getBatchCurrentPrices(
        tokenAddresses: string[],
        chainId: number = 8453
    ): Promise<Map<string, number>> {
        const prices = new Map<string, number>();

        // CoinGecko allows up to 10 addresses per request
        const chunks = this.chunkArray(tokenAddresses, 10);

        for (const chunk of chunks) {
            try {
                const platform = this.getPlatformId(chainId);
                const addresses = chunk.join(',');

                const response = await fetch(
                    `${this.COINGECKO_API}/simple/token_price/${platform}?contract_addresses=${addresses}&vs_currencies=usd`
                );

                if (response.ok) {
                    const data = await response.json();

                    Object.entries(data).forEach(([addr, priceData]: [string, any]) => {
                        if (priceData.usd) {
                            prices.set(addr.toLowerCase(), priceData.usd);
                        }
                    });
                }

                // Respect rate limits
                await this.sleep(1000);
            } catch (error) {
                console.error('Batch price fetch error:', error);
            }
        }

        return prices;
    }

    // Helper: Map chainId to CoinGecko platform
    private getPlatformId(chainId: number): string {
        const platforms: { [key: number]: string } = {
            1: 'ethereum',
            8453: 'base',
            137: 'polygon-pos',
            10: 'optimistic-ethereum',
            42161: 'arbitrum-one'
        };
        return platforms[chainId] || 'base';
    }

    // Helper: Convert timestamp to date string
    private timestampToDateString(timestamp: number): string {
        const date = new Date(timestamp * 1000);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    // Helper: Find closest price to target timestamp
    private findClosestPrice(prices: [number, number][], targetTimestamp: number): number | null {
        if (prices.length === 0) return null;

        let closest = prices[0];
        let minDiff = Math.abs(prices[0][0] / 1000 - targetTimestamp);

        for (const [ts, price] of prices) {
            const diff = Math.abs(ts / 1000 - targetTimestamp);
            if (diff < minDiff) {
                minDiff = diff;
                closest = [ts, price];
            }
        }

        return closest[1];
    }

    // Helper: Chunk array
    private chunkArray<T>(array: T[], size: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    // Helper: Sleep
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Singleton
export const priceFetcher = new PriceFetcher();
