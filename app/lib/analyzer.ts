
import { PortfolioData, Insight, Token } from './types';

export function analyzePortfolio(data: Omit<PortfolioData, 'insights'>): Insight[] {
    const insights: Insight[] = [];
    const { tokens, nfts, summary } = data;
    const totalValue = summary.totalValueUsd;

    // 1. Concentration Analysis
    if (totalValue > 0) {
        const sortedTokens = [...tokens].sort((a, b) => (b.usdValue || 0) - (a.usdValue || 0));
        const topToken = sortedTokens[0];

        if (topToken && topToken.usdValue) {
            const concentration = (topToken.usdValue / totalValue) * 100;

            if (concentration > 75) {
                insights.push({
                    type: 'warning',
                    title: `High Concentration in ${topToken.symbol}`,
                    description: `${concentration.toFixed(1)}% of your portfolio value is in a single asset. Diversification could reduce risk.`,
                    relatedAsset: topToken.symbol,
                    score: 80
                });
            } else if (concentration > 50) {
                insights.push({
                    type: 'neutral',
                    title: `Major Holding: ${topToken.symbol}`,
                    description: `${topToken.symbol} makes up the majority (${concentration.toFixed(1)}%) of your portfolio.`,
                    relatedAsset: topToken.symbol,
                    score: 50
                });
            }
        }
    }

    // 2. Volatility Check (Assets with > 10% change)
    const volatileTokens = tokens.filter(t => Math.abs(t.percentChange24h || 0) > 10);
    if (volatileTokens.length > 0) {
        const mostVolatile = volatileTokens.sort((a, b) => Math.abs(b.percentChange24h || 0) - Math.abs(a.percentChange24h || 0))[0];
        const change = mostVolatile.percentChange24h || 0;
        const direction = change > 0 ? 'up' : 'down';

        insights.push({
            type: 'info',
            title: `High Volatility Detected`,
            description: `${mostVolatile.symbol} is ${direction} ${Math.abs(change).toFixed(2)}% in the last 24h.`,
            relatedAsset: mostVolatile.symbol,
            score: 60
        });
    }

    // 3. Stablecoin Exposure
    const stablecoins = ['USDC', 'USDT', 'DAI', 'USDbC'];
    const stableValue = tokens
        .filter(t => stablecoins.includes(t.symbol.toUpperCase()))
        .reduce((sum, t) => sum + (t.usdValue || 0), 0);

    if (totalValue > 100 && stableValue === 0) {
        insights.push({
            type: 'neutral',
            title: 'No Stablecoin Exposure',
            description: 'You currently hold no stablecoins. Consider keeping some dry powder for opportunities.',
            score: 30
        });
    }

    // 4. Activity/New Wallet Check
    if (data.transactions.length === 0 && totalValue === 0) {
        insights.push({
            type: 'neutral',
            title: 'New or Inactive Wallet',
            description: 'This wallet has no recent activity or value on Base chain.',
            score: 10
        });
    }

    // 5. NFT Collector Check
    if (nfts.length > 10) {
        insights.push({
            type: 'info',
            title: 'NFT Enthusiast',
            description: `You hold ${nfts.length} NFTs in your collection.`,
            score: 20
        });
    }

    // Sort by score/impact
    return insights.sort((a, b) => (b.score || 0) - (a.score || 0));
}
