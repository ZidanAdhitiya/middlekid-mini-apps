// Gamification Types for Wallet Health Score & Scam Cemetery
// Defines all interfaces for scoring, achievements, and scam tracking

export type ScamType = 'honeypot' | 'rug_pull' | 'fake_token' | 'high_tax' | 'blacklisted' | 'suspicious';

export interface ScamTokenRecord {
    // Token identification
    address: string;
    name: string;
    symbol: string;
    chainId: number;

    // Scam classification
    scamType: ScamType;
    riskScore: number; // 0-100

    // Timeline
    detectedAt: Date;
    rugPullDate?: Date; // If known
    createdAt?: Date; // Token creation date

    // Impact metrics
    estimatedVictims?: number;
    estimatedLoss?: number; // in USD

    // Creator tracking
    creatorAddress?: string;
    creatorIsKnownScammer?: boolean;

    // Evidence
    warnings: string[];
    evidenceLinks?: string[]; // Block explorer, social media, etc

    // Community
    reportCount?: number;
    lastReportedAt?: Date;
}

export interface CemeteryStats {
    totalScams: number;
    totalLoss: number; // in USD
    totalVictims: number;
    scamsByType: {
        honeypot: number;
        rug_pull: number;
        fake_token: number;
        high_tax: number;
        blacklisted: number;
        suspicious: number;
    };
    recentScams: ScamTokenRecord[]; // Last 10
    topLosses: ScamTokenRecord[]; // Top 10 by loss
}

// ==================== Health Score System ====================

export interface HealthScoreFactor {
    name: string;
    description: string;
    maxPoints: number;
    earnedPoints: number;
    status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
}

export interface HealthScoreBreakdown {
    // 6 core factors
    noScamTokens: HealthScoreFactor;
    limitedApprovals: HealthScoreFactor;
    walletAge: HealthScoreFactor;
    portfolioDiversity: HealthScoreFactor;
    noPhishingInteractions: HealthScoreFactor;
    healthyActivity: HealthScoreFactor;
}

export interface WalletHealthScore {
    // Overall score
    totalScore: number; // 0-100
    grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
    rank: string; // "Top 5%", "Top 25%", etc

    // Breakdown
    breakdown: HealthScoreBreakdown;

    // Summary
    strengths: string[]; // Things done well
    weaknesses: string[]; // Things to improve

    // Metadata
    calculatedAt: Date;
    walletAddress: string;
}

// ==================== Achievement System ====================

export type AchievementId =
    | 'scam_avoider'
    | 'approval_master'
    | 'og_holder'
    | 'diversified'
    | 'active_trader'
    | 'security_conscious'
    | 'early_adopter'
    | 'whale_watcher';

export interface Achievement {
    id: AchievementId;
    name: string;
    description: string;
    emoji: string;

    // Unlock criteria
    unlocked: boolean;
    unlockedAt?: Date;
    progress?: number; // 0-100 for partial completion

    // Requirements
    requirement: string;

    // Rarity
    rarity: 'common' | 'rare' | 'epic' | 'legendary';

    // Rewards (future: NFT minting)
    scoreBonus: number;
}

export interface AchievementProgress {
    achievements: Achievement[]; // All achievements
    earned: Achievement[]; // Unlocked achievements only
    locked: Achievement[]; // Locked achievements only
    totalUnlocked: number;
    totalAvailable: number;
    completionPercentage: number;
}

// ==================== Leaderboard (Future) ====================

export interface LeaderboardEntry {
    rank: number;
    walletAddress: string; // Anonymized: 0x1234...5678
    healthScore: number;
    achievementCount: number;
    badge?: string; // Special badge for top ranks
}

export interface Leaderboard {
    global: LeaderboardEntry[];
    weekly: LeaderboardEntry[];
    monthly: LeaderboardEntry[];
    updatedAt: Date;
}

// ==================== Export all ====================

export interface GamificationData {
    healthScore: WalletHealthScore;
    achievements: AchievementProgress;
    scamTokensFound: ScamTokenRecord[];
    cemeteryStats?: CemeteryStats;
}
