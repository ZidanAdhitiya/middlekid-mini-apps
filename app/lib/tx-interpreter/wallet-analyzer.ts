// Wallet Security Analyzer - Main Engine
// Detects bot wallets and provides comprehensive wallet behavior analysis

import {
    WalletAnalysisReport,
    WalletStatistics,
    BotDetectionResult,
    WalletCheck,
    WalletType,
    HumanTranslation
} from './wallet-types';

type TranslationFunction = (key: string, values?: Record<string, string | number>) => string;

export class WalletSecurityAnalyzer {

    async analyzeWallet(address: string, t: TranslationFunction): Promise<WalletAnalysisReport> {
        console.log('🔍 Analyzing wallet:', address);

        // Run core analysis in parallel (removed token holdings)
        const [statistics, botDetection, checks] = await Promise.all([
            this.getWalletStatistics(address),
            this.detectBotBehavior(address, t),
            this.runSecurityChecks(address, t)
        ]);

        // Calculate risk score (without token holdings)
        const riskScore = this.calculateWalletRiskScore(checks, botDetection);
        const overallRisk = this.determineOverallRisk(riskScore);

        // Determine wallet type
        const walletType = this.determineWalletType(statistics, botDetection);

        // Generate human translation (without scam token count)
        const humanTranslation = this.translateToHuman(
            walletType,
            statistics,
            botDetection,
            checks,
            t
        );

        // Return simplified report (no achievements, no health score, no tokens)
        return {
            address,
            walletType,
            overallRisk,
            riskScore,
            botDetection,
            statistics,
            checks,
            humanTranslation,
            summary: this.generateSummary(overallRisk, checks, t),
            recommendations: this.generateRecommendations(checks, botDetection, t)
        };
    }

    private async getWalletStatistics(address: string): Promise<WalletStatistics> {
        // Mock implementation - would use Etherscan/Alchemy API
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

    private async detectBotBehavior(address: string, t: TranslationFunction): Promise<BotDetectionResult> {
        // Mock bot detection - would analyze transaction patterns
        const hash = this.hashAddress(address);
        const isBot = hash % 10 < 2; // 20% chance for demo

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
        if (indicators.highFrequency) reasons.push(t('analysis.wallet.bot.reasons.frequency'));
        if (indicators.uniformTiming) reasons.push(t('analysis.wallet.bot.reasons.timing'));
        if (indicators.mevActivity) reasons.push(t('analysis.wallet.bot.reasons.mev'));
        if (indicators.flashInteractions) reasons.push(t('analysis.wallet.bot.reasons.flash'));
        if (indicators.noHumanPattern) reasons.push(t('analysis.wallet.bot.reasons.pattern'));

        return {
            isBot,
            confidence,
            indicators,
            reason: isBot
                ? t('analysis.wallet.bot.detected', { reasons: reasons.join(', ') })
                : t('analysis.wallet.bot.clean')
        };
    }


    private async runSecurityChecks(address: string, t: TranslationFunction): Promise<WalletCheck[]> {
        const checks: WalletCheck[] = [];
        const hash = this.hashAddress(address);

        // Check 1: Phishing Interaction
        const hasPhishing = hash % 7 === 0;
        checks.push({
            name: t('analysis.wallet.checks.phishing.name'),
            status: hasPhishing ? 'warning' : 'pass',
            message: hasPhishing
                ? t('analysis.wallet.checks.phishing.detected')
                : t('analysis.wallet.checks.phishing.clean'),
            severity: hasPhishing ? 'high' : 'low',
            emoji: hasPhishing ? '🎣' : '✅'
        });

        // Check 2: High Approval Exposure
        const highApproval = hash % 5 === 0;
        checks.push({
            name: t('analysis.wallet.checks.approval.name'),
            status: highApproval ? 'warning' : 'pass',
            message: highApproval
                ? t('analysis.wallet.checks.approval.high')
                : t('analysis.wallet.checks.approval.safe'),
            severity: highApproval ? 'medium' : 'low',
            emoji: highApproval ? '🔓' : '🔐'
        });

        // Check 3: Scam Token Holdings
        // Will be populated after token scan

        // Check 4: Suspicious Activity
        const suspicious = hash % 11 === 0;
        checks.push({
            name: t('analysis.wallet.checks.suspicious.name'),
            status: suspicious ? 'fail' : 'pass',
            message: suspicious
                ? t('analysis.wallet.checks.suspicious.detected')
                : t('analysis.wallet.checks.suspicious.clean'),
            severity: suspicious ? 'high' : 'low',
            emoji: suspicious ? '🚨' : '✅'
        });

        return checks;
    }

    private calculateWalletRiskScore(
        checks: WalletCheck[],
        botDetection: BotDetectionResult
    ): number {
        let score = 0;

        // Add points for failed checks
        checks.forEach(check => {
            if (check.status === 'fail') {
                score += check.severity === 'critical' ? 30 : 20;
            } else if (check.status === 'warning') {
                score += check.severity === 'high' ? 15 : check.severity === 'medium' ? 10 : 5;
            }
        });

        // Add points for bot detection
        if (botDetection.isBot) {
            score += (botDetection.confidence / 100) * 25;
        }

        return Math.min(100, score);
    }

    private determineOverallRisk(score: number): WalletAnalysisReport['overallRisk'] {
        if (score >= 70) return 'critical';
        if (score >= 50) return 'high';
        if (score >= 30) return 'medium';
        if (score >= 10) return 'low';
        return 'safe';
    }

    private determineWalletType(
        stats: WalletStatistics,
        botDetection: BotDetectionResult
    ): WalletType {
        if (botDetection.isBot && botDetection.confidence > 80) return 'BOT';
        if (stats.totalTransactions > 10000) return 'EXCHANGE';
        if (stats.averageTxPerDay > 100) return 'BOT';
        return 'HUMAN';
    }

    private translateToHuman(
        walletType: WalletType,
        stats: WalletStatistics,
        botDetection: BotDetectionResult,
        checks: WalletCheck[],
        t: TranslationFunction
    ): HumanTranslation {

        // Scenario 1: Fresh Wallet (Baby Wallet)
        if (stats.ageInDays < 3 && stats.totalTransactions < 5) {
            return {
                title: t('analysis.wallet.human.fresh.title'),
                emoji: '👶',
                description: t('analysis.wallet.human.fresh.description'),
                action: t('analysis.wallet.human.fresh.action')
            };
        }

        // Scenario 2: Bot Wallet
        if (botDetection.isBot) {
            return {
                title: t('analysis.wallet.human.bot.title'),
                emoji: '🤖',
                description: t('analysis.wallet.human.bot.description', { reason: botDetection.reason }),
                action: t('analysis.wallet.human.bot.action')
            };
        }

        // Scenario 3: High Approval Exposure
        const highApproval = checks.find(c => c.name === t('analysis.wallet.checks.approval.name') && c.status === 'warning');
        if (highApproval) {
            return {
                title: t('analysis.wallet.human.highApproval.title'),
                emoji: '🔓',
                description: t('analysis.wallet.human.highApproval.description'),
                action: t('analysis.wallet.human.highApproval.action')
            };
        }

        // Scenario 4: Phishing Victim
        const phishing = checks.find(c => c.name === t('analysis.wallet.checks.phishing.name') && c.status === 'warning');
        if (phishing) {
            return {
                title: t('analysis.wallet.human.phishing.title'),
                emoji: '🎣',
                description: t('analysis.wallet.human.phishing.description'),
                action: t('analysis.wallet.human.phishing.action')
            };
        }

        // Scenario 5: Clean Wallet (default)
        return {
            title: t('analysis.wallet.human.clean.title'),
            emoji: '✅',
            description: t('analysis.wallet.human.clean.description'),
            action: t('analysis.wallet.human.clean.action')
        };
    }

    private generateSummary(
        risk: WalletAnalysisReport['overallRisk'],
        checks: WalletCheck[],
        t: TranslationFunction
    ): string {
        if (risk === 'critical') {
            return t('analysis.wallet.risk.critical');
        } else if (risk === 'high') {
            return t('analysis.wallet.risk.high');
        } else if (risk === 'medium') {
            return t('analysis.wallet.risk.medium');
        } else if (risk === 'low') {
            return t('analysis.wallet.risk.low');
        } else {
            return t('analysis.wallet.risk.safe');
        }
    }

    private generateRecommendations(
        checks: WalletCheck[],
        botDetection: BotDetectionResult,
        t: TranslationFunction
    ): string[] {
        const recommendations: string[] = [];

        if (botDetection.isBot) {
            recommendations.push(t('analysis.wallet.bot.recommendation'));
        }

        checks.forEach(check => {
            if (check.status === 'fail' || check.status === 'warning') {
                // We compare check names - ideally this should be ID based but for now we look up by translated name which is risky if T changes.
                // Better approach: Check `name` against known keys?
                // Or just loop through logic.
                // The check objects were CREATED with `name: t('key')`.
                // So now we match `check.name` against `t('key')`.

                if (check.name === t('analysis.wallet.checks.phishing.name')) {
                    recommendations.push(t('analysis.wallet.checks.phishing.recommendation'));
                } else if (check.name === t('analysis.wallet.checks.approval.name')) {
                    recommendations.push(t('analysis.wallet.checks.approval.recommendation'));
                } else if (check.name === t('analysis.wallet.checks.suspicious.name')) {
                    recommendations.push(t('analysis.wallet.checks.suspicious.recommendation'));
                }
            }
        });

        if (recommendations.length === 0) {
            recommendations.push(t('analysis.wallet.recommendations.default'));
            recommendations.push(t('analysis.wallet.recommendations.check'));
        }

        return recommendations;
    }

    // Helper: Create deterministic hash from address for consistent random data
    private hashAddress(address: string): number {
        let hash = 0;
        for (let i = 0; i < address.length; i++) {
            const char = address.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }
}

// Singleton instance
export const walletSecurityAnalyzer = new WalletSecurityAnalyzer();
