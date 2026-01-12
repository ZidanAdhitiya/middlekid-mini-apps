// Strategy Recommendation Mapper
// Maps wallet regret patterns to options strategies

import type { RegretReport } from '../tx-interpreter/regret-types';

export interface StrategyRecommendation {
    name: string;
    type: 'CALL' | 'PUT';
    reason: string;
    userFriendlyExplanation: string;
    emoji: string;
}

/**
 * Map regret analysis to options strategy recommendation
 * Simple rule-based logic (no AI needed)
 */
export function mapRegretToStrategy(regret: RegretReport): StrategyRecommendation | null {
    // Rule 1: Paper hands detected (sold too early due to fear)
    // → Recommend CALL option for upside protection
    if (regret.stats.paperHandsCount > 0 && regret.totalMissedProfit > 100) {
        return {
            name: "Upside Protection Strategy",
            type: "CALL",
            reason: "You have a pattern of selling too early (paper hands)",
            userFriendlyExplanation: "Dengan biaya premium kecil, kamu bisa tetap dapat profit jika harga naik lagi, tanpa harus hold token aslinya. Ini cocok untuk kamu yang sering takut rugi dan jual terlalu cepat.",
            emoji: "🛡️"
        };
    }

    // Rule 2: Diamond hands only (no regrets, only wins)
    // → Recommend Downside Protection (PUT) to protect gains
    if (regret.stats.paperHandsCount === 0 && regret.stats.diamondHandsCount > 0) {
        return {
            name: "Downside Protection Strategy",
            type: "PUT",
            reason: "You are a strong holder (Diamond Hands). Protect your gains!",
            userFriendlyExplanation: "Lindungi nilai portofoliomu dari penurunan pasar dengan membeli Put Option (Thetanuts Basic Put). Ini bekerja seperti asuransi - jika harga jatuh, kamu tetap aman.",
            emoji: "🛡️"
        };
    }

    // Rule 3: Not enough data
    if (regret.stats.totalTransactions < 3) {
        return null;
    }

    // Default: No clear pattern
    return null;
}

/**
 * Get recommended parameters for the strategy
 */
export function getStrategyParameters(
    regret: RegretReport,
    strategy: StrategyRecommendation
): {
    underlying: string;
    strike: number;
    expiry: string;
    size: number;
} {
    // Use the biggest regret token OR best hold as the underlying
    const token = regret.biggestRegret?.token.symbol || regret.bestHold?.token.symbol || 'ETH';
    const currentPrice = regret.biggestRegret?.currentPrice || regret.bestHold?.currentPrice || 2000;

    // Strike: at-the-money (current price)
    const strike = Math.round(currentPrice);

    // Expiry: 30 days (standard)
    const expiry = "30d";

    // Size: 1 contract
    const size = 1;

    return {
        underlying: token,
        strike,
        expiry,
        size
    };
}
