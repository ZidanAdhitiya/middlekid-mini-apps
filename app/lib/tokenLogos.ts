// Token logo fallbacks for when Alchemy doesn't provide logo URLs
// Using cryptologos.cc as a reliable CDN source

export const TOKEN_LOGO_FALLBACKS: Record<string, string> = {
    // Native tokens - using CoinGecko assets (more reliable)
    'ETH': 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png',
    'BTC': 'https://assets.coingecko.com/coins/images/1/standard/bitcoin.png',
    'BNB': 'https://assets.coingecko.com/coins/images/825/standard/bnb-icon2_2x.png',
    'MATIC': 'https://assets.coingecko.com/coins/images/4713/standard/polygon.png',
    'AVAX': 'https://assets.coingecko.com/coins/images/12559/standard/Avalanche_Circle_RedWhite_Trans.png',
    'FTM': 'https://assets.coingecko.com/coins/images/4001/standard/Fantom_round.png',
    'OP': 'https://assets.coingecko.com/coins/images/25244/standard/Optimism.png',
    'ARB': 'https://assets.coingecko.com/coins/images/16547/standard/photo_2023-03-29_21.47.00.jpeg',

    // New/small chains
    'MON': 'https://assets.coingecko.com/coins/images/33667/standard/monad.jpg',
    'S': 'https://assets.coingecko.com/coins/images/44731/standard/sonic.png', // Sonic
    'xDAI': 'https://assets.coingecko.com/coins/images/9956/standard/Badge_Dai.png',

    // Common stablecoins
    'USDC': 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png',
    'USDT': 'https://assets.coingecko.com/coins/images/325/standard/Tether.png',
    'DAI': 'https://assets.coingecko.com/coins/images/9956/standard/Badge_Dai.png',

    // Common DeFi tokens
    'WETH': 'https://assets.coingecko.com/coins/images/2518/standard/weth.png',
    'WBTC': 'https://assets.coingecko.com/coins/images/7598/standard/wrapped_bitcoin_wbtc.png',
};

export function getTokenLogoFallback(symbol: string): string | undefined {
    return TOKEN_LOGO_FALLBACKS[symbol.toUpperCase()];
}
