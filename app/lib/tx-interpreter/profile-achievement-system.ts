// Profile Achievement System - Personal Wallet Analysis
// Calculates achievements, health score, and points for connected wallet only

import {
    WalletStatistics,
    BotDetectionResult,
    WalletCheck,
    WalletType
} from './wallet-types';
import { healthScoreCalculator } from './health-score-calculator';
import { WalletHealthScore, Achievement, AchievementProgress } from './gamification-types';

type TranslationFunction = (key: string, values?: Record<string, string | number>) => string;

export interface PersonalAchievementData {
    walletAddress: string;
    totalPoints: number;
    level: number;
    healthScore: WalletHealthScore;
    achievements: AchievementProgress;
    statistics: WalletStatistics;
    botDetection: BotDetectionResult;
    checks: WalletCheck[];
    lastUpdated: Date;
}

export class ProfileAchievementSystem {

    /**
     * Analyze personal wallet and calculate achievements, health score, and points
     *  This is ONLY for the connected wallet (personal use)
     */
    async analyzePersonalWallet(address: string, t: TranslationFunction): Promise<PersonalAchievementData> {
        console.log('🎮 Analyzing personal wallet for achievements:', address);

        // Get wallet statistics and security data
        const [statistics, botDetection, checks] = await Promise.all([
            this.fetchRealWalletStats(address),
            this.detectRealBotBehavior(address, t),
            this.runRealSecurityChecks(address, t)
        ]);

        // Build minimal report for health score calculation
        // NOTE: healthScoreCalculator still expects tokenHoldings and scamTokenCount
        // These will be properly implemented with real blockchain data in Phase 3
        const tempReport: any = {
            address,
            walletType: this.determineWalletType(statistics, botDetection),
            overallRisk: 'low' as const,
            riskScore: 0,
            botDetection,
            statistics,
            checks,
            tokenHoldings: [], // Dummy for now - Phase 3 will add real token data
            scamTokenCount: 0, // Dummy for now - Phase 3 will detect real scams
            humanTranslation: {
                title: '',
                emoji: '',
                description: '',
                action: ''
            },
            summary: '',
            recommendations: []
        };

        // Calculate health score using existing calculator
        const healthScore = healthScoreCalculator.calculate(tempReport, t);

        // Get achievements
        const achievements = healthScoreCalculator.getAchievements(healthScore, tempReport, t);

        // Calculate points and level
        const totalPoints = this.calculatePoints(achievements);
        const level = this.calculateLevel(totalPoints);

        return {
            walletAddress: address,
            totalPoints,
            level,
            healthScore,
            achievements,
            statistics,
            botDetection,
            checks,
            lastUpdated: new Date()
        };
    }

    /**
     * Fetch real wallet statistics from blockchain
     * TODO: Replace mock with real Alchemy API calls
     */
    private async fetchRealWalletStats(address: string): Promise<WalletStatistics> {
        // TODO: Use Alchemy API for real data
        // const { alchemyAPI } = await import('../../lib/alchemy');

        // For now, use simple placeholder
        // This will be replaced with real blockchain data in Phase 3
        const ageInDays = Math.floor(Math.random() * 1000) + 1;
        const totalTransactions = Math.floor(Math.random() * 5000);
        const lastActivityDays = Math.floor(Math.random() * 30);

        return {
            address,
            ageInDays,
            firstTransaction: new Date(Date.now() - ageInDays * 24 * 60 * 60 * 1000).toISOString(),
            totalTransactions,
            totalGasUsed: (Math.random() * 10).toFixed(4) + ' ETH',
            averageTxPerDay: totalTransactions / ageInDays,
            uniqueContractsInteracted: Math.floor(Math.random() * 100),
            lastActivityDays
        };
    }

    /**
     * Detect bot behavior from real transaction patterns
     * TODO: Implement real bot detection algorithm
     */
    private async detectRealBotBehavior(address: string, t: TranslationFunction): Promise<BotDetectionResult> {
        // TODO: Analyze real transaction history from blockchain
        // const txHistory = await alchemyAPI.getRecentTransactions(address, 1000);

        // Placeholder for now - will be real in Phase 3
        const hash = this.hashAddress(address);
        const isBot = hash % 10 < 2;

        const indicators = {
            highFrequency: hash % 5 === 0,
            uniformTiming: hash % 7 === 0,
            mevActivity: hash % 11 === 0,
            flashInteractions: hash % 13 === 0,
            noHumanPattern: hash % 17 === 0
        };

        const indicatorCount = Object.values(indicators).filter(Boolean).length;
        const confidence = isBot ? Math.min(50 + indicatorCount * 10, 95) : Math.max(80 - indicatorCount * 10, 60);

        const reasons = [];
        if (indicators.highFrequency) reasons.push(t('analysis.wallet.botDetection.highFrequency'));
        if (indicators.uniformTiming) reasons.push(t('analysis.wallet.botDetection.uniformTiming'));
        if (indicators.mevActivity) reasons.push(t('analysis.wallet.botDetection.mevActivity'));
        if (indicators.flashInteractions) reasons.push(t('analysis.wallet.botDetection.flashInteractions'));
        if (indicators.noHumanPattern) reasons.push(t('analysis.wallet.botDetection.noHumanPattern'));

        return {
            isBot,
            confidence,
            indicators,
            reason: isBot
                ? t('analysis.wallet.botDetection.detected', { '1': reasons.join(', ') })
                : t('analysis.wallet.botDetection.normal')
        };
    }

    /**
     * Run real security checks on wallet
     * TODO: Implement real security checks with blockchain data
     */
    private async runRealSecurityChecks(address: string, t: TranslationFunction): Promise<WalletCheck[]> {
        const checks: WalletCheck[] = [];
        const hash = this.hashAddress(address);

        // TODO: Replace with real security checks
        // - Check real phishing contract interactions
        // - Check actual approval counts from blockchain
        // - Detect suspicious patterns from transaction history

        // Placeholder checks
        const hasPhishing = hash % 7 === 0;
        checks.push({
            name: t('analysis.wallet.checks.phishing.name'),
            status: hasPhishing ? 'warning' : 'pass',
            message: hasPhishing
                ? t('analysis.wallet.checks.phishing.message')
                : t('analysis.wallet.checks.phishing.noHistory'),
            severity: hasPhishing ? 'high' : 'low',
            emoji: hasPhishing ? t('analysis.wallet.checks.phishing.emojiFail') : t('analysis.wallet.checks.phishing.emojiPass')
        });

        const highApproval = hash % 5 === 0;
        checks.push({
            name: t('analysis.wallet.checks.approval.name'),
            status: highApproval ? 'warning' : 'pass',
            message: highApproval
                ? t('analysis.wallet.checks.approval.message')
                : t('analysis.wallet.checks.approval.noHistory'),
            severity: highApproval ? 'medium' : 'low',
            emoji: highApproval ? t('analysis.wallet.checks.approval.emojiFail') : t('analysis.wallet.checks.approval.emojiPass')
        });

        const suspicious = hash % 11 === 0;
        checks.push({
            name: t('analysis.wallet.checks.suspicious.name'),
            status: suspicious ? 'fail' : 'pass',
            message: suspicious
                ? t('analysis.wallet.checks.suspicious.message')
                : t('analysis.wallet.checks.suspicious.noHistory'),
            severity: suspicious ? 'high' : 'low',
            emoji: suspicious ? t('analysis.wallet.checks.suspicious.emojiFail') : t('analysis.wallet.checks.suspicious.emojiPass')
        });

        return checks;
    }

    /**
     * Calculate total points from earned achievements
     */
    private calculatePoints(achievements: AchievementProgress): number {
        const pointsPerAchievement: Record<string, number> = {
            'scam-avoider': 100,
            'approval-master': 150,
            'og-holder': 200,
            'diversified': 120,
            'active-trader': 80
        };

        let totalPoints = 0;
        achievements.earned.forEach(achievement => {
            totalPoints += pointsPerAchievement[achievement.id] || 50;
        });

        return totalPoints;
    }

    /**
     * Calculate level based on total points
     * Level system: Every 100 points = 1 level
     */
    private calculateLevel(points: number): number {
        return Math.floor(points / 100) + 1;
    }

    /**
     * Determine wallet type from stats and bot detection
     */
    private determineWalletType(
        stats: WalletStatistics,
        botDetection: BotDetectionResult
    ): WalletType {
        if (botDetection.isBot && botDetection.confidence > 80) return 'BOT';
        if (stats.totalTransactions > 10000) return 'EXCHANGE';
        if (stats.averageTxPerDay > 100) return 'BOT';
        return 'HUMAN';
    }

    /**
     * Helper: Create deterministic hash from address for consistent random data
     */
    private hashAddress(address: string): number {
        let hash = 0;
        for (let i = 0; i < address.length; i++) {
            const char = address.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    /**
     * Get top 3 badges for profile header preview
     */
    getTopBadges(achievements: AchievementProgress, limit: number = 3): Achievement[] {
        return achievements.earned.slice(0, limit);
    }
}

// Singleton instance
export const profileAchievementSystem = new ProfileAchievementSystem();
