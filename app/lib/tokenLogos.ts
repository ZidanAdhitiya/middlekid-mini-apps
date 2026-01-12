// Enhanced Token Logo Helper
// Uses multiple sources to get the best token logo

/**
 * Get token logo from TrustWallet assets (has 1000s of token logos)
 * Returns logo URL or undefined if not found
 */
export function getTrustWalletLogo(chainId: string, tokenAddress: string): string {
    const chainMappings: Record<string, string> = {
        'ethereum': 'ethereum',
        'eth': 'ethereum',
        '1': 'ethereum',
        'base': 'base',
        '8453': 'base',
        'optimism': 'optimism',
        'op': 'optimism',
        '10': 'optimism',
        'arbitrum': 'arbitrum',
        'arb': 'arbitrum',
        '42161': 'arbitrum',
        'polygon': 'polygon',
        'matic': 'polygon',
        '137': 'polygon',
        'bsc': 'smartchain',
        'bnb': 'smartchain',
        '56': 'smartchain',
        'avalanche': 'avalanchec',
        'avax': 'avalanchec',
        '43114': 'avalanchec'
    };

    const chain = chainMappings[chainId.toLowerCase()] || 'ethereum';
    const checksumAddress = tokenAddress; // TrustWallet uses checksummed addresses

    return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chain}/assets/${checksumAddress}/logo.png`;
}

/**
 * Comprehensive token logo fallbacks
 * Using CoinGecko assets (reliable CDN, always available)
 */
export const TOKEN_LOGO_FALLBACKS: Record<string, string> = {
    // Native tokens
    'ETH': 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png',
    'WETH': 'https://assets.coingecko.com/coins/images/2518/standard/weth.png',
    'BTC': 'https://assets.coingecko.com/coins/images/1/standard/bitcoin.png',
    'WBTC': 'https://assets.coingecko.com/coins/images/7598/standard/wrapped_bitcoin_wbtc.png',

    // Layer 2s
    'OP': 'https://assets.coingecko.com/coins/images/25244/standard/Optimism.png',
    'ARB': 'https://assets.coingecko.com/coins/images/16547/standard/photo_2023-03-29_21.47.00.jpeg',

    // Stablecoins
    'USDC': 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png',
    'USDT': 'https://assets.coingecko.com/coins/images/325/standard/Tether.png',
    'DAI': 'https://assets.coingecko.com/coins/images/9956/standard/Badge_Dai.png',
    'BUSD': 'https://assets.coingecko.com/coins/images/9576/standard/BUSD.png',
    'FRAX': 'https://assets.coingecko.com/coins/images/13422/standard/FRAX_icon.png',
    'USDC.E': 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png',

    // DeFi Blue Chips
    'UNI': 'https://assets.coingecko.com/coins/images/12504/standard/uni.jpg',
    'AAVE': 'https://assets.coingecko.com/coins/images/12645/standard/AAVE.png',
    'COMP': 'https://assets.coingecko.com/coins/images/10775/standard/COMP.png',
    'MKR': 'https://assets.coingecko.com/coins/images/1364/standard/Mark_Maker.png',
    'CRV': 'https://assets.coingecko.com/coins/images/12124/standard/Curve.png',
    'SNX': 'https://assets.coingecko.com/coins/images/3406/standard/SNX.png',
    'LDO': 'https://assets.coingecko.com/coins/images/13573/standard/Lido_DAO.png',
    'LINK': 'https://assets.coingecko.com/coins/images/877/standard/chainlink-new-logo.png',
    'SUSHI': 'https://assets.coingecko.com/coins/images/12271/standard/512x512_Logo_no_chop.png',

    // Base Ecosystem
    'BRETT': 'https://assets.coingecko.com/coins/images/35494/standard/Hattieww.jpg',
    'DEGEN': 'https://assets.coingecko.com/coins/images/34515/standard/android-chrome-512x512.png',
    'TOSHI': 'https://assets.coingecko.com/coins/images/33758/standard/toshi.jpeg',
    'HIGHER': 'https://assets.coingecko.com/coins/images/38093/standard/higher.jpg',

    // Memecoins
    'PEPE': 'https://assets.coingecko.com/coins/images/29850/standard/pepe-token.jpeg',
    'SHIB': 'https://assets.coingecko.com/coins/images/11939/standard/shiba.png',
    'DOGE': 'https://assets.coingecko.com/coins/images/5/standard/dogecoin.png',
    'FLOKI': 'https://assets.coingecko.com/coins/images/16746/standard/PNG_image.png',
    'BONK': 'https://assets.coingecko.com/coins/images/28600/standard/bonk.jpg',

    // New Chains
    'MONAD': 'https://assets.coingecko.com/coins/images/33667/standard/monad.jpg',
    'MON': 'https://assets.coingecko.com/coins/images/33667/standard/monad.jpg',
    'SONIC': 'https://assets.coingecko.com/coins/images/44731/standard/sonic.png',
    'S': 'https://assets.coingecko.com/coins/images/44731/standard/sonic.png',

    // Other L1s
    'BNB': 'https://assets.coingecko.com/coins/images/825/standard/bnb-icon2_2x.png',
    'MATIC': 'https://assets.coingecko.com/coins/images/4713/standard/polygon.png',
    'POL': 'https://assets.coingecko.com/coins/images/4713/standard/polygon.png',
    'AVAX': 'https://assets.coingecko.com/coins/images/12559/standard/Avalanche_Circle_RedWhite_Trans.png',
    'FTM': 'https://assets.coingecko.com/coins/images/4001/standard/Fantom_round.png',
    'SOL': 'https://assets.coingecko.com/coins/images/4128/standard/solana.png',
    'ATOM': 'https://assets.coingecko.com/coins/images/1481/standard/cosmos_hub.png',
    'DOT': 'https://assets.coingecko.com/coins/images/12171/standard/polkadot.png',
    'ADA': 'https://assets.coingecko.com/coins/images/975/standard/cardano.png',

    // Liquid Staking Tokens
    'STETH': 'https://assets.coingecko.com/coins/images/13442/standard/steth_logo.png',
    'WSTETH': 'https://assets.coingecko.com/coins/images/18834/standard/wstETH.png',
    'RETH': 'https://assets.coingecko.com/coins/images/20764/standard/reth.png',
    'CBETH': 'https://assets.coingecko.com/coins/images/27008/standard/cbeth.png',
};

/**
 * Get best available token logo
 * Priority:
 * 1. Alchemy-provided logo (if available and valid)
 * 2. Symbol-based fallback from CoinGecko
 * 3. TrustWallet asset (if on supported chain)
 * 4. null (will use placeholder)
 */
export function getBestTokenLogo(
    alchemyLogo: string | undefined,
    symbol: string,
    tokenAddress: string,
    chainId: string
): string | null {
    // 1. Use Alchemy logo if provided
    if (alchemyLogo && alchemyLogo.trim() !== '') {
        return alchemyLogo;
    }

    // 2. Check symbol-based fallback
    const symbolUpper = symbol.toUpperCase();
    if (TOKEN_LOGO_FALLBACKS[symbolUpper]) {
        return TOKEN_LOGO_FALLBACKS[symbolUpper];
    }

    // 3. Try TrustWallet for contract address
    if (tokenAddress && tokenAddress !== '0x0000000000000000000000000000000000000000') {
        return getTrustWalletLogo(chainId, tokenAddress);
    }

    // 4. No logo found
    return null;
}

export function getTokenLogoFallback(symbol: string): string | undefined {
    return TOKEN_LOGO_FALLBACKS[symbol.toUpperCase()];
}
