// Time Machine Analysis - Regret Calculator Types

export interface RegretTransaction {
    hash: string;
    type: 'BUY' | 'SELL';
    token: {
        address: string;
        symbol: string;
        name: string;
    };
    amount: string;
    priceAtTime: number; // USD per token
    totalValue: number; // USD total
    timestamp: number;
    blockNumber: number;
}

export interface TokenRegret {
    token: {
        address: string;
        symbol: string;
        name: string;
    };
    bought: {
        date: string;
        price: number;
        amount: string;
        totalSpent: number;
    };
    sold: {
        date: string;
        price: number;
        amount: string;
        totalReceived: number;
    };
    currentPrice: number;

    // Calculations
    profitMade: number; // Actual profit from sell
    wouldBeWorth: number; // If held to now
    missedProfit: number; // Difference
    holdDuration: number; // Days held

    // Emotions
    regretScore: number; // 0-100 (higher = more regret)
    roastMessage: string;
}

export interface DiamondHandsWin {
    token: {
        address: string;
        symbol: string;
        name: string;
    };
    bought: {
        date: string;
        price: number;
        amount: string;
        totalSpent: number;
    };
    currentPrice: number;
    currentValue: number;
    unrealizedGain: number;
    unrealizedGainPercent: number;
    holdDuration: number; // Days
    praisMessage: string;
}

export interface MissedAirdrop {
    protocol: string;
    symbol: string;
    reason: string; // "Interacted but didn't claim"
    eligibleAmount: number; // Estimated tokens
    valueAtClaim: number; // USD value when claimable
    currentValue: number; // USD value now
    missedValue: number;
}

export interface EmotionalDamageScore {
    overall: number; // 0-100
    breakdown: {
        paperHandsPain: number; // From selling too early
        airdropRegret: number; // From missed airdrops
        timingFails: number; // From bad timing
    };
    rank: string; // "Paper Hands Rookie" | "Regret Warrior" | "FOMO Legend"
    emoji: string;
}

export interface RegretReport {
    address: string;
    analyzedPeriod: {
        from: string;
        to: string;
        days: number;
    };

    // Main regrets
    biggestRegret: TokenRegret | null;
    allRegrets: TokenRegret[];
    totalMissedProfit: number;

    // Positive side
    bestHold: DiamondHandsWin | null;
    allWins: DiamondHandsWin[];
    totalUnrealizedGain: number;

    // Airdrops
    missedAirdrops: MissedAirdrop[];

    // Gamification
    emotionalDamage: EmotionalDamageScore;

    // Statistics
    stats: {
        totalTransactions: number;
        paperHandsCount: number; // Sold too early
        diamondHandsCount: number; // Still holding
        averageHoldTime: number; // Days
        patienceScore: number; // 0-100
    };

    // Shareable
    shareableText: string; // Pre-generated tweet
    summary: string;
}

export interface PriceData {
    timestamp: number;
    price: number;
    source: 'coingecko' | 'dex' | 'defillama' | 'cache';
}
