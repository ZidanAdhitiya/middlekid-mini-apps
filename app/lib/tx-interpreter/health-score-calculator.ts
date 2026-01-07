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

export class HealthScoreCalculator {

    /**
     * Calculate overall wallet health score from analysis report
     */
    calculate(report: WalletAnalysisReport): WalletHealthScore {
        const breakdown = this.calculateBreakdown(report);

        // Sum all earned points
        const totalScore = this.sumPoints(breakdown);

        // Determine grade
        const grade = this.determineGrade(totalScore);

        // Calculate rank (mock for now, would use real data in production)
        const rank = this.calculateRank(totalScore);

        // Generate strengths & weaknesses
        const strengths = this.identifyStrengths(breakdown);
        const weaknesses = this.identifyWeaknesses(breakdown);

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
    private calculateBreakdown(report: WalletAnalysisReport): HealthScoreBreakdown {
        return {
            noScamTokens: this.scoreNoScamTokens(report),
            limitedApprovals: this.scoreLimitedApprovals(report),
            walletAge: this.scoreWalletAge(report),
            portfolioDiversity: this.scorePortfolioDiversity(report),
            noPhishingInteractions: this.scoreNoPhishing(report),
            healthyActivity: this.scoreHealthyActivity(report)
        };
    }

    // ==================== Individual Factor Scoring ====================

    private scoreNoScamTokens(report: WalletAnalysisReport): HealthScoreFactor {
        const maxPoints = 25;
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
            name: 'Bebas Token Scam',
            description: `${scamCount} token scam terdeteksi di wallet`,
            maxPoints,
            earnedPoints,
            status
        };
    }

    private scoreLimitedApprovals(report: WalletAnalysisReport): HealthScoreFactor {
        const maxPoints = 20;
        const approvalCheck = report.checks.find(c => c.name === 'Exposure Approval Tinggi');

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
            name: 'Approval Terkontrol',
            description: 'Tidak ada unlimited approval berbahaya',
            maxPoints,
            earnedPoints,
            status
        };
    }

    private scoreWalletAge(report: WalletAnalysisReport): HealthScoreFactor {
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
            name: 'Umur Wallet',
            description: `Wallet berumur ${ageInDays} hari`,
            maxPoints,
            earnedPoints,
            status
        };
    }

    private scorePortfolioDiversity(report: WalletAnalysisReport): HealthScoreFactor {
        const maxPoints = 15;
        const tokenCount = report.tokenHoldings.length;
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
            name: 'Diversifikasi Portfolio',
            description: `${legitTokens} token legitimate di wallet`,
            maxPoints,
            earnedPoints,
            status
        };
    }

    private scoreNoPhishing(report: WalletAnalysisReport): HealthScoreFactor {
        const maxPoints = 15;
        const phishingCheck = report.checks.find(c => c.name === 'Interaksi dengan Situs Phishing');

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
            name: 'Tidak Ada Phishing',
            description: 'Tidak pernah interaksi dengan situs phishing',
            maxPoints,
            earnedPoints,
            status
        };
    }

    private scoreHealthyActivity(report: WalletAnalysisReport): HealthScoreFactor {
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
            name: 'Aktivitas Sehat',
            description: 'Pola transaksi normal seperti manusia',
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

    private identifyStrengths(breakdown: HealthScoreBreakdown): string[] {
        const strengths: string[] = [];

        Object.entries(breakdown).forEach(([key, factor]) => {
            if (factor.status === 'excellent') {
                strengths.push(`✅ ${factor.name} - Perfect!`);
            }
        });

        if (strengths.length === 0) {
            strengths.push('⚡ Masih banyak ruang untuk improvement');
        }

        return strengths;
    }

    private identifyWeaknesses(breakdown: HealthScoreBreakdown): string[] {
        const weaknesses: string[] = [];

        Object.entries(breakdown).forEach(([key, factor]) => {
            if (factor.status === 'critical' || factor.status === 'poor') {
                weaknesses.push(`⚠️ ${factor.name} - Perlu perbaikan`);
            }
        });

        if (weaknesses.length === 0) {
            weaknesses.push('🎉 Tidak ada kelemahan signifikan!');
        }

        return weaknesses;
    }

    // ==================== Achievement System ====================

    getAchievements(healthScore: WalletHealthScore, report: WalletAnalysisReport): AchievementProgress {
        const achievements: Achievement[] = [
            this.checkScamAvoider(report),
            this.checkApprovalMaster(report),
            this.checkOGHolder(report),
            this.checkDiversified(report),
            this.checkActiveTrader(report)
        ];

        const totalUnlocked = achievements.filter(a => a.unlocked).length;
        const totalAvailable = achievements.length;
        const completionPercentage = (totalUnlocked / totalAvailable) * 100;

        return {
            achievements,
            totalUnlocked,
            totalAvailable,
            completionPercentage
        };
    }

    private checkScamAvoider(report: WalletAnalysisReport): Achievement {
        const unlocked = report.scamTokenCount === 0;

        return {
            id: 'scam_avoider',
            name: 'Penghindaran Scam',
            description: 'Tidak pernah pegang token scam',
            emoji: '🛡️',
            unlocked,
            unlockedAt: unlocked ? new Date() : undefined,
            progress: unlocked ? 100 : Math.max(0, 100 - (report.scamTokenCount * 20)),
            requirement: 'Tidak ada token scam di wallet',
            rarity: 'rare',
            scoreBonus: 5
        };
    }

    private checkApprovalMaster(report: WalletAnalysisReport): Achievement {
        const approvalCheck = report.checks.find(c => c.name === 'Exposure Approval Tinggi');
        const unlocked = !approvalCheck || approvalCheck.status === 'pass';

        return {
            id: 'approval_master',
            name: 'Master Approval',
            description: 'Tidak ada unlimited approval berbahaya',
            emoji: '🔐',
            unlocked,
            unlockedAt: unlocked ? new Date() : undefined,
            progress: unlocked ? 100 : 50,
            requirement: 'Semua approval terkontrol',
            rarity: 'epic',
            scoreBonus: 10
        };
    }

    private checkOGHolder(report: WalletAnalysisReport): Achievement {
        const unlocked = report.statistics.ageInDays >= 1095; // 3 years
        const progress = Math.min(100, (report.statistics.ageInDays / 1095) * 100);

        return {
            id: 'og_holder',
            name: 'OG Holder',
            description: 'Wallet berumur lebih dari 3 tahun',
            emoji: '💎',
            unlocked,
            unlockedAt: unlocked ? new Date() : undefined,
            progress,
            requirement: 'Wallet age > 3 tahun',
            rarity: 'legendary',
            scoreBonus: 15
        };
    }

    private checkDiversified(report: WalletAnalysisReport): Achievement {
        const legitTokens = report.tokenHoldings.filter(t => !t.isScam).length;
        const unlocked = legitTokens >= 10;
        const progress = Math.min(100, (legitTokens / 10) * 100);

        return {
            id: 'diversified',
            name: 'Portfolio Diversifikasi',
            description: 'Memegang 10+ token berbeda',
            emoji: '📊',
            unlocked,
            unlockedAt: unlocked ? new Date() : undefined,
            progress,
            requirement: '10+ token legitimate',
            rarity: 'rare',
            scoreBonus: 5
        };
    }

    private checkActiveTrader(report: WalletAnalysisReport): Achievement {
        const unlocked = report.statistics.totalTransactions >= 100 && !report.botDetection.isBot;
        const progress = Math.min(100, (report.statistics.totalTransactions / 100) * 100);

        return {
            id: 'active_trader',
            name: 'Trader Aktif',
            description: '100+ transaksi tanpa bot behavior',
            emoji: '⚡',
            unlocked,
            unlockedAt: unlocked ? new Date() : undefined,
            progress,
            requirement: '100+ transaksi (bukan bot)',
            rarity: 'common',
            scoreBonus: 3
        };
    }
}

// Singleton instance
export const healthScoreCalculator = new HealthScoreCalculator();
