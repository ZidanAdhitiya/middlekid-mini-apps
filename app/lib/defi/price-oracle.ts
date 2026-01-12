// Simple free price oracle using CoinGecko API
// NO API key needed for basic usage

interface PriceCache {
    [key: string]: { price: number; timestamp: number };
}

const priceCache: PriceCache = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getTokenPrice(tokenSymbol: string): Promise<number> {
    const symbol = tokenSymbol.toLowerCase();

    // Check cache
    const cached = priceCache[symbol];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.price;
    }

    // Map common symbols to CoinGecko IDs
    const symbolToId: Record<string, string> = {
        'eth': 'ethereum',
        'weth': 'ethereum',
        'btc': 'bitcoin',
        'wbtc': 'bitcoin',
        'usdc': 'usd-coin',
        'usdt': 'tether',
        'dai': 'dai',
        'matic': 'matic-network',
        'wmatic': 'matic-network',
        'avax': 'avalanche-2',
        'wavax': 'avalanche-2',
        'bnb': 'binancecoin',
        'wbnb': 'binancecoin',
        'op': 'optimism',
        'arb': 'arbitrum',
        'steth': 'staked-ether',
        'wsteth': 'wrapped-steth',
        'reth': 'rocket-pool-eth',
        'eeth': 'ether-fi-staked-eth',
        'crv': 'curve-dao-token',
        'frxeth': 'frax-ether',
        'sfrxeth': 'staked-frax-ether',
        'bal': 'balancer',
        'sushi': 'sushi',
        'cvx': 'convex-finance',
        'stg': 'stargate-finance',
        'yvusdc': 'yearn-finance',
        'sdai': 'savings-dai',
        'aura': 'aura-finance',
        'gmx': 'gmx',
        'hype': 'hyperliquid',
        'eigen': 'eigenlayer'
    };

    const coinId = symbolToId[symbol] || symbol;

    try {
        const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
            { next: { revalidate: 300 } } // Cache for 5 min
        );

        if (!response.ok) return 0;

        const data = await response.json();
        const price = data[coinId]?.usd || 0;

        // Cache the result
        priceCache[symbol] = { price, timestamp: Date.now() };

        return price;
    } catch (error) {
        console.error(`Price fetch error for ${symbol}:`, error);
        return 0;
    }
}

// Batch price fetcher for multiple tokens
export async function getTokenPrices(symbols: string[]): Promise<Record<string, number>> {
    const prices: Record<string, number> = {};

    // Process in batches of 10 to avoid rate limits
    for (let i = 0; i < symbols.length; i += 10) {
        const batch = symbols.slice(i, i + 10);
        const results = await Promise.all(
            batch.map(async symbol => ({
                symbol,
                price: await getTokenPrice(symbol)
            }))
        );

        results.forEach(({ symbol, price }) => {
            prices[symbol] = price;
        });
    }

    return prices;
}
