// Wallet Health Score Calculator
// Calculates 0-100 health score based on 6 security factors

import {
    WalletHealthScore,
    HealthScoreBreakdown,
    HealthScoreFactor,
    Achievement,
    AchievementProgress,
    AchievementId
} from './gamification-types';
import { WalletAnalysisReport } from './wallet-types';

type TranslationFunction = (key: string, values?: Record<string, string | number>) => string;

export class HealthScoreCalculator {

    /**
     * Calculate overall wallet health score from analysis report
     */
    calculate(report: WalletAnalysisReport, t: (key: string, values?: Record<string, string | number>) => string): WalletHealthScore {
        const breakdown = this.calculateBreakdown(report, t);

        // Sum all earned points
        const totalScore = this.sumPoints(breakdown);

        // Determine grade
        const grade = this.determineGrade(totalScore);

        // Calculate rank (mock for now, would use real data in production)
        const rank = this.calculateRank(totalScore);

        // Generate strengths & weaknesses
        const strengths = this.identifyStrengths(breakdown, t);
        const weaknesses = this.identifyWeaknesses(breakdown, t);

        return {
            totalScore,
            grade,
            rank,
            breakdown,
            strengths,
            weaknesses,
            calculatedAt: new Date(),
            walletAddress: report.address
        };
    }

    /**
     * Calculate individual factor scores
     */
    private calculateBreakdown(report: WalletAnalysisReport, t: (key: string, values?: Record<string, string | number>) => string): HealthScoreBreakdown {
        return {
            noScamTokens: this.scoreNoScamTokens(report, t),
            limitedApprovals: this.scoreLimitedApprovals(report, t),
            walletAge: this.scoreWalletAge(report, t),
            portfolioDiversity: this.scorePortfolioDiversity(report, t),
            noPhishingInteractions: this.scoreNoPhishing(report, t),
            healthyActivity: this.scoreHealthyActivity(report, t)
        };
    }

    // ==================== Individual Factor Scoring ====================

    private scoreNoScamTokens(report: WalletAnalysisReport, t: TranslationFunction): HealthScoreFactor {
        const maxPoints = 25;
        // @ts-ignore - scamTokenCount exists at runtime
        const scamCount = report.scamTokenCount;

        let earnedPoints = maxPoints;
        let status: HealthScoreFactor['status'] = 'excellent';

        if (scamCount === 0) {
            earnedPoints = maxPoints;
            status = 'excellent';
        } else if (scamCount <= 2) {
            earnedPoints = 15;
            status = 'good';
        } else if (scamCount <= 5) {
            earnedPoints = 10;
            status = 'fair';
        } else if (scamCount <= 10) {
            earnedPoints = 5;
            status = 'poor';
        } else {
            earnedPoints = 0;
            status = 'critical';
        }

        return {
            name: t('analysis.health.factors.noScam.name'),
            description: t('analysis.health.factors.noScam.description', { count: scamCount }),
            maxPoints,
            earnedPoints,
            status
        };
    }

    private scoreLimitedApprovals(report: WalletAnalysisReport, t: TranslationFunction): HealthScoreFactor {
        const maxPoints = 20;
        const approvalCheck = report.checks.find(c => c.name === t('analysis.wallet.checks.approval.name'));

        let earnedPoints = maxPoints;
        let status: HealthScoreFactor['status'] = 'excellent';

        if (!approvalCheck || approvalCheck.status === 'pass') {
            earnedPoints = maxPoints;
            status = 'excellent';
        } else if (approvalCheck.status === 'warning') {
            earnedPoints = 10;
            status = 'fair';
        } else {
            earnedPoints = 0;
            status = 'critical';
        }

        return {
            name: t('analysis.health.factors.limitedApprovals.name'),
            description: t('analysis.health.factors.limitedApprovals.description'),
            maxPoints,
            earnedPoints,
            status
        };
    }

    private scoreWalletAge(report: WalletAnalysisReport, t: TranslationFunction): HealthScoreFactor {
        const maxPoints = 15;
        const ageInDays = report.statistics.ageInDays;

        let earnedPoints = 0;
        let status: HealthScoreFactor['status'] = 'critical';

        if (ageInDays >= 365) { // 1+ year
            earnedPoints = maxPoints;
            status = 'excellent';
        } else if (ageInDays >= 180) { // 6+ months
            earnedPoints = 12;
            status = 'good';
        } else if (ageInDays >= 90) { // 3+ months
            earnedPoints = 8;
            status = 'fair';
        } else if (ageInDays >= 30) { // 1+ month
            earnedPoints = 5;
            status = 'poor';
        } else {
            earnedPoints = 0;
            status = 'critical';
        }

        return {
            name: t('analysis.health.factors.walletAge.name'),
            description: t('analysis.health.factors.walletAge.description', { days: ageInDays }),
            maxPoints,
            earnedPoints,
            status
        };
    }

    private scorePortfolioDiversity(report: WalletAnalysisReport, t: TranslationFunction): HealthScoreFactor {
        const maxPoints = 15;
        // @ts-ignore - tokenHoldings exists at runtime
        const tokenCount = report.tokenHoldings.length;
        // @ts-ignore - tokenHoldings exists at runtime
        const legitTokens = report.tokenHoldings.filter(t => !t.isScam).length;

        let earnedPoints = 0;
        let status: HealthScoreFactor['status'] = 'critical';

        if (legitTokens >= 10) {
            earnedPoints = maxPoints;
            status = 'excellent';
        } else if (legitTokens >= 5) {
            earnedPoints = 12;
            status = 'good';
        } else if (legitTokens >= 3) {
            earnedPoints = 8;
            status = 'fair';
        } else if (legitTokens >= 1) {
            earnedPoints = 5;
            status = 'poor';
        } else {
            earnedPoints = 0;
            status = 'critical';
        }

        return {
            name: t('analysis.health.factors.diversity.name'),
            description: t('analysis.health.factors.diversity.description', { count: legitTokens }),
            maxPoints,
            earnedPoints,
            status
        };
    }

    private scoreNoPhishing(report: WalletAnalysisReport, t: TranslationFunction): HealthScoreFactor {
        const maxPoints = 15;
        const phishingCheck = report.checks.find(c => c.name === t('analysis.wallet.checks.phishing.name'));

        let earnedPoints = maxPoints;
        let status: HealthScoreFactor['status'] = 'excellent';

        if (!phishingCheck || phishingCheck.status === 'pass') {
            earnedPoints = maxPoints;
            status = 'excellent';
        } else if (phishingCheck.status === 'warning') {
            earnedPoints = 5;
            status = 'poor';
        } else {
            earnedPoints = 0;
            status = 'critical';
        }

        return {
            name: t('analysis.health.factors.noPhishing.name'),
            description: t('analysis.health.factors.noPhishing.description'),
            maxPoints,
            earnedPoints,
            status
        };
    }

    private scoreHealthyActivity(report: WalletAnalysisReport, t: TranslationFunction): HealthScoreFactor {
        const maxPoints = 10;
        const { botDetection, statistics } = report;

        let earnedPoints = maxPoints;
        let status: HealthScoreFactor['status'] = 'excellent';

        // Healthy activity = not bot AND active
        if (botDetection.isBot) {
            earnedPoints = 0;
            status = 'critical';
        } else if (statistics.averageTxPerDay > 50) {
            // Too active, suspicious
            earnedPoints = 5;
            status = 'fair';
        } else if (statistics.averageTxPerDay >= 1) {
            // Good activity
            earnedPoints = maxPoints;
            status = 'excellent';
        } else if (statistics.averageTxPerDay >= 0.1) {
            // Moderate activity
            earnedPoints = 8;
            status = 'good';
        } else {
            // Too inactive
            earnedPoints = 5;
            status = 'poor';
        }

        return {
            name: t('analysis.health.factors.activity.name'),
            description: t('analysis.health.factors.activity.description'),
            maxPoints,
            earnedPoints,
            status
        };
    }

    // ==================== Helper Methods ====================

    private sumPoints(breakdown: HealthScoreBreakdown): number {
        return Object.values(breakdown).reduce((sum, factor) => sum + factor.earnedPoints, 0);
    }

    private determineGrade(score: number): WalletHealthScore['grade'] {
        if (score >= 95) return 'S';
        if (score >= 85) return 'A';
        if (score >= 70) return 'B';
        if (score >= 50) return 'C';
        if (score >= 30) return 'D';
        return 'F';
    }

    private calculateRank(score: number): string {
        // Mock percentile ranking (would use real data in production)
        if (score >= 95) return 'Top 1%';
        if (score >= 90) return 'Top 5%';
        if (score >= 80) return 'Top 10%';
        if (score >= 70) return 'Top 25%';
        if (score >= 50) return 'Top 50%';
        return 'Bottom 50%';
    }

    private identifyStrengths(breakdown: HealthScoreBreakdown, t: TranslationFunction): string[] {
        const strengths: string[] = [];

        Object.entries(breakdown).forEach(([key, factor]) => {
            if (factor.status === 'excellent') {
                strengths.push(t('analysis.health.strengths.perfect', { name: factor.name }));
            }
        });

        if (strengths.length === 0) {
            strengths.push(t('analysis.health.strengths.empty'));
        }

        return strengths;
    }

    private identifyWeaknesses(breakdown: HealthScoreBreakdown, t: TranslationFunction): string[] {
        const weaknesses: string[] = [];

        Object.entries(breakdown).forEach(([key, factor]) => {
            if (factor.status === 'critical' || factor.status === 'poor') {
                weaknesses.push(t('analysis.health.weaknesses.issue', { name: factor.name }));
            }
        });

        if (weaknesses.length === 0) {
            weaknesses.push(t('analysis.health.weaknesses.empty'));
        }

        return weaknesses;
    }

    // ==================== Achievement System ====================

    getAchievements(healthScore: WalletHealthScore, report: any, t: TranslationFunction): AchievementProgress {
        const achievements: Achievement[] = [
            this.checkScamAvoider(report, t),
            this.checkApprovalMaster(report, t),
            this.checkOGHolder(report, t),
            this.checkDiversified(report, t),
            this.checkActiveTrader(report, t)
        ];

        const earned = achievements.filter(a => a.unlocked);
        const locked = achievements.filter(a => !a.unlocked);
        const totalUnlocked = earned.length;
        const totalAvailable = achievements.length;
        const completionPercentage = (totalUnlocked / totalAvailable) * 100;

        return {
            achievements,
            earned,
            locked,
            totalUnlocked,
            totalAvailable,
            completionPercentage
        };
    }

    private checkScamAvoider(report: any, t: TranslationFunction): Achievement {
        const unlocked = report.scamTokenCount === 0;

        return {
            id: 'scam_avoider',
            name: t('analysis.health.achievements.scamAvoider.name'),
            description: t('analysis.health.achievements.scamAvoider.description'),
            emoji: '🛡️',
            unlocked,
            unlockedAt: unlocked ? new Date() : undefined,
            progress: unlocked ? 100 : Math.max(0, 100 - (report.scamTokenCount * 20)),
            requirement: t('analysis.health.achievements.scamAvoider.requirement'),
            rarity: 'rare',
            scoreBonus: 5
        };
    }

    private checkApprovalMaster(report: any, t: TranslationFunction): Achievement {
        const approvalCheck = report.checks.find((c: any) => c.name === t('analysis.wallet.checks.approval.name'));
        const unlocked = !approvalCheck || approvalCheck.status === 'pass';

        return {
            id: 'approval_master',
            name: t('analysis.health.achievements.approvalMaster.name'),
            description: t('analysis.health.achievements.approvalMaster.description'),
            emoji: '🔐',
            unlocked,
            unlockedAt: unlocked ? new Date() : undefined,
            progress: unlocked ? 100 : 50,
            requirement: t('analysis.health.achievements.approvalMaster.requirement'),
            rarity: 'epic',
            scoreBonus: 10
        };
    }

    private checkOGHolder(report: any, t: TranslationFunction): Achievement {
        const unlocked = report.statistics.ageInDays >= 1095; // 3 years
        const progress = Math.min(100, (report.statistics.ageInDays / 1095) * 100);

        return {
            id: 'og_holder',
            name: t('analysis.health.achievements.ogHolder.name'),
            description: t('analysis.health.achievements.ogHolder.description'),
            emoji: '💎',
            unlocked,
            unlockedAt: unlocked ? new Date() : undefined,
            progress,
            requirement: t('analysis.health.achievements.ogHolder.requirement'),
            rarity: 'legendary',
            scoreBonus: 15
        };
    }

    private checkDiversified(report: any, t: TranslationFunction): Achievement {
        const legitTokens = report.tokenHoldings.filter((t: any) => !t.isScam).length;
        const unlocked = legitTokens >= 10;
        const progress = Math.min(100, (legitTokens / 10) * 100);

        return {
            id: 'diversified',
            name: t('analysis.health.achievements.diversified.name'),
            description: t('analysis.health.achievements.diversified.description'),
            emoji: '📊',
            unlocked,
            unlockedAt: unlocked ? new Date() : undefined,
            progress,
            requirement: t('analysis.health.achievements.diversified.requirement'),
            rarity: 'rare',
            scoreBonus: 5
        };
    }

    private checkActiveTrader(report: any, t: TranslationFunction): Achievement {
        const unlocked = report.statistics.totalTransactions >= 100 && !report.botDetection.isBot;
        const progress = Math.min(100, (report.statistics.totalTransactions / 100) * 100);

        return {
            id: 'active_trader',
            name: t('analysis.health.achievements.activeTrader.name'),
            description: t('analysis.health.achievements.activeTrader.description'),
            emoji: '⚡',
            unlocked,
            unlockedAt: unlocked ? new Date() : undefined,
            progress,
            requirement: t('analysis.health.achievements.activeTrader.requirement'),
            rarity: 'common',
            scoreBonus: 3
        };
    }
}

// Singleton instance
export const healthScoreCalculator = new HealthScoreCalculator();
