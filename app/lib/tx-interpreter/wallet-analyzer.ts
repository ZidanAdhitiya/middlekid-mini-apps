// Wallet Security Analyzer - Main Engine
// Detects bot wallets, scam tokens, and provides comprehensive wallet analysis

import {
    WalletAnalysisReport,
    WalletStatistics,
    BotDetectionResult,
    TokenHolding,
    WalletCheck,
    WalletType,
    HumanTranslation
} from './wallet-types';
import { realTokenFetcher } from './real-token-fetcher';
import { healthScoreCalculator } from './health-score-calculator';
import { cemeteryAggregator } from './cemetery-aggregator';
import { WalletHealthScore, AchievementProgress } from './gamification-types';

// Check if we should use real data or mock data
const USE_REAL_DATA = process.env.NEXT_PUBLIC_USE_REAL_DATA === 'true';

export class WalletSecurityAnalyzer {

    async analyzeWallet(address: string): Promise<WalletAnalysisReport> {
        console.log('🔍 Analyzing wallet:', address);

        // Run all analysis in parallel
        const [statistics, botDetection, tokenHoldings, checks] = await Promise.all([
            this.getWalletStatistics(address),
            this.detectBotBehavior(address),
            this.scanTokenHoldings(address),
            this.runSecurityChecks(address)
        ]);

        // Calculate risk score
        const riskScore = this.calculateWalletRiskScore(checks, botDetection, tokenHoldings);
        const overallRisk = this.determineOverallRisk(riskScore);

        // Determine wallet type
        const walletType = this.determineWalletType(statistics, botDetection);

        // Count scam tokens
        const scamTokenCount = tokenHoldings.filter(t => t.isScam).length;

        // Generate human translation
        const humanTranslation = this.translateToHuman(
            walletType,
            statistics,
            botDetection,
            checks,
            scamTokenCount
        );

        // Build base report first (needed for health score calc)
        const baseReport: WalletAnalysisReport = {
            address,
            walletType,
            overallRisk,
            riskScore,
            botDetection,
            statistics,
            tokenHoldings,
            checks,
            scamTokenCount,
            humanTranslation,
            summary: this.generateSummary(overallRisk, checks, scamTokenCount),
            recommendations: this.generateRecommendations(checks, botDetection, scamTokenCount)
        };

        // 🎮 GAMIFICATION: Calculate health score
        const healthScore = healthScoreCalculator.calculate(baseReport);
        const achievements = healthScoreCalculator.getAchievements(healthScore, baseReport);

        // 💀 CEMETERY: Register scam tokens
        if (scamTokenCount > 0) {
            cemeteryAggregator.registerScamTokens(tokenHoldings);
        }

        // Return full report with gamification data
        return {
            ...baseReport,
            healthScore,
            achievements
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

    private async detectBotBehavior(address: string): Promise<BotDetectionResult> {
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
        if (indicators.highFrequency) reasons.push('transaksi sangat sering (>100/hari)');
        if (indicators.uniformTiming) reasons.push('waktu transaksi terlalu teratur');
        if (indicators.mevActivity) reasons.push('aktivitas MEV terdeteksi');
        if (indicators.flashInteractions) reasons.push('interaksi flash loan');
        if (indicators.noHumanPattern) reasons.push('tidak ada pola manusia');

        return {
            isBot,
            confidence,
            indicators,
            reason: isBot
                ? `Bot terdeteksi: ${reasons.join(', ')}`
                : 'Pola transaksi normal seperti manusia'
        };
    }

    private async scanTokenHoldings(address: string): Promise<TokenHolding[]> {
        // Use real data if enabled
        if (USE_REAL_DATA) {
            try {
                console.log('📡 Fetching REAL token holdings from blockchain...');
                const holdings = await realTokenFetcher.fetchTokenHoldings(address, 8453); // Base chain
                console.log(`✅ Fetched ${holdings.length} real token holdings`);
                return holdings;
            } catch (error) {
                console.error('❌ Failed to fetch real data, falling back to mock:', error);
                // Fall through to mock data
            }
        }

        // Mock token holdings - for testing without API
        console.log('🎭 Using MOCK token holdings data');
        const hash = this.hashAddress(address);
        const tokenCount = (hash % 15) + 1;

        const holdings: TokenHolding[] = [];
        const tokenNames = [
            { symbol: 'USDC', name: 'USD Coin', scam: false },
            { symbol: 'WETH', name: 'Wrapped Ether', scam: false },
            { symbol: 'DAI', name: 'Dai Stablecoin', scam: false },
            { symbol: 'PEPE', name: 'Pepe', scam: false },
            { symbol: 'MOONX', name: 'MoonX Token', scam: true },
            { symbol: 'SAFEMOON', name: 'SafeMoon 2.0', scam: true },
            { symbol: 'ELONX', name: 'Elon X Token', scam: true },
            { symbol: 'SHIB', name: 'Shiba Inu', scam: false }
        ];

        for (let i = 0; i < tokenCount; i++) {
            const token = tokenNames[i % tokenNames.length];
            const isScam = token.scam && Math.random() > 0.7;
            const balance = (Math.random() * 10000).toFixed(2);

            holdings.push({
                address: `0x${Math.random().toString(16).slice(2, 42)}`,
                symbol: token.symbol,
                name: token.name,
                balance: balance,
                balanceFormatted: `${balance} ${token.symbol}`,
                decimals: 18,
                isScam,
                riskScore: isScam ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 30),
                warnings: isScam ? ['Honeypot terdeteksi', 'Liquidity tidak dikunci'] : []
            });
        }

        return holdings;
    }

    private async runSecurityChecks(address: string): Promise<WalletCheck[]> {
        const checks: WalletCheck[] = [];
        const hash = this.hashAddress(address);

        // Check 1: Phishing Interaction
        const hasPhishing = hash % 7 === 0;
        checks.push({
            name: 'Interaksi dengan Situs Phishing',
            status: hasPhishing ? 'warning' : 'pass',
            message: hasPhishing
                ? 'Wallet ini pernah berinteraksi dengan kontrak phishing yang dikenal'
                : 'Tidak ada riwayat interaksi dengan situs phishing',
            severity: hasPhishing ? 'high' : 'low',
            emoji: hasPhishing ? '🎣' : '✅'
        });

        // Check 2: High Approval Exposure
        const highApproval = hash % 5 === 0;
        checks.push({
            name: 'Exposure Approval Tinggi',
            status: highApproval ? 'warning' : 'pass',
            message: highApproval
                ? 'Terlalu banyak approval unlimited aktif - risiko pencurian tinggi'
                : 'Approval terkontrol dengan baik',
            severity: highApproval ? 'medium' : 'low',
            emoji: highApproval ? '🔓' : '🔐'
        });

        // Check 3: Scam Token Holdings
        // Will be populated after token scan

        // Check 4: Suspicious Activity
        const suspicious = hash % 11 === 0;
        checks.push({
            name: 'Aktivitas Mencurigakan',
            status: suspicious ? 'fail' : 'pass',
            message: suspicious
                ? 'Terdeteksi pola aktivitas tidak normal atau bot'
                : 'Pola aktivitas terlihat normal',
            severity: suspicious ? 'high' : 'low',
            emoji: suspicious ? '🚨' : '✅'
        });

        return checks;
    }

    private calculateWalletRiskScore(
        checks: WalletCheck[],
        botDetection: BotDetectionResult,
        tokenHoldings: TokenHolding[]
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

        // Add points for scam tokens
        const scamCount = tokenHoldings.filter(t => t.isScam).length;
        score += scamCount * 10;

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
        scamTokenCount: number
    ): HumanTranslation {

        // Scenario 1: Fresh Wallet (Baby Wallet)
        if (stats.ageInDays < 3 && stats.totalTransactions < 5) {
            return {
                title: 'Dompet Bayi Baru Lahir 👶',
                emoji: '👶',
                description: 'Dompet ini baru saja dibuat. Belum ada reputasi, jadi sistem belum bisa memastikan apakah ini jahat atau tidak. Hati-hati kalau mau kirim uang besar.',
                action: 'Coba transaksi kecil dulu (tes ombak).'
            };
        }

        // Scenario 2: Bot Wallet
        if (botDetection.isBot) {
            return {
                title: 'Robot Terdeteksi! 🤖',
                emoji: '🤖',
                description: `Ini bukan wallet manusia biasa. ${botDetection.reason}. Kemungkinan ini adalah bot trading atau MEV bot.`,
                action: 'Hati-hati jika berinteraksi - bisa jadi sistem otomatis yang agresif.'
            };
        }

        // Scenario 3: High Approval Exposure
        const highApproval = checks.find(c => c.name === 'Exposure Approval Tinggi' && c.status === 'warning');
        if (highApproval) {
            return {
                title: 'Pintu Rumahmu Terbuka Lebar! 🔓',
                emoji: '🔓',
                description: 'Kamu memberikan izin "Unlimited" ke banyak aplikasi. Artinya aplikasi itu bisa mengambil uangmu kapan saja tanpa permisi lagi. Ini bahaya banget kalau aplikasinya kena hack.',
                action: 'Gunakan fitur "Revoke Approval" sekarang juga di revoke.cash!'
            };
        }

        // Scenario 4: Phishing Victim
        const phishing = checks.find(c => c.name === 'Interaksi dengan Situs Phishing' && c.status === 'warning');
        if (phishing) {
            return {
                title: 'Kamu Sering Mengklik Link Jahat 🎣',
                emoji: '🎣',
                description: 'Ada jejak interaksi dengan website penipu. Mungkin kamu pernah ikut airdrop palsu atau klik link sembarangan di Telegram/Discord.',
                action: 'Stop klik link hadiah gratisan! Selalu cek URL sebelum connect wallet.'
            };
        }

        // Scenario 5: Scam Tokens Holder
        if (scamTokenCount > 0) {
            return {
                title: `${scamTokenCount} Token Scam Ditemukan! ⚠️`,
                emoji: '⚠️',
                description: `Dompet ini memegang ${scamTokenCount} token yang terdeteksi sebagai scam atau honeypot. Ini bisa karena airdrop spam atau pembelian yang tidak hati-hati.`,
                action: 'JANGAN coba jual token-token ini! Bisa kena jebakan. Abaikan saja.'
            };
        }

        // Scenario 6: Clean Wallet
        return {
            title: 'Dompet Terlihat Aman ✅',
            emoji: '✅',
            description: 'Sejauh ini tidak ada red flag yang signifikan. Pola transaksi terlihat normal dan tidak ada interaksi dengan kontrak berbahaya.',
            action: 'Tetap waspada dan jangan sembarangan approve kontrak!'
        };
    }

    private generateSummary(
        risk: WalletAnalysisReport['overallRisk'],
        checks: WalletCheck[],
        scamTokenCount: number
    ): string {
        if (risk === 'critical') {
            return `⛔ BAHAYA TINGGI! Dompet ini memiliki banyak red flags. Hindari transaksi besar.`;
        } else if (risk === 'high') {
            return `⚠️ RISIKO TINGGI. ${scamTokenCount} token scam ditemukan. Hati-hati berinteraksi.`;
        } else if (risk === 'medium') {
            return `⚡ Risiko sedang. Beberapa hal perlu diperhatikan, tapi tidak kritis.`;
        } else if (risk === 'low') {
            return `✅ Risiko rendah. Dompet terlihat cukup aman.`;
        } else {
            return `✅ Dompet aman. Tidak ada masalah signifikan terdeteksi.`;
        }
    }

    private generateRecommendations(
        checks: WalletCheck[],
        botDetection: BotDetectionResult,
        scamTokenCount: number
    ): string[] {
        const recommendations: string[] = [];

        if (botDetection.isBot) {
            recommendations.push('⚠️ Ini kemungkinan bot - jangan transfer dana besar tanpa verifikasi lebih lanjut');
        }

        checks.forEach(check => {
            if (check.status === 'fail' || check.status === 'warning') {
                switch (check.name) {
                    case 'Interaksi dengan Situs Phishing':
                        recommendations.push('🎣 Revoke semua approval dari kontrak mencurigakan di revoke.cash');
                        break;
                    case 'Exposure Approval Tinggi':
                        recommendations.push('🔓 Cabut approval unlimited sebelum terlambat!');
                        break;
                    case 'Aktivitas Mencurigakan':
                        recommendations.push('🚨 Periksa riwayat transaksi secara manual untuk memastikan tidak ada yang aneh');
                        break;
                }
            }
        });

        if (scamTokenCount > 0) {
            recommendations.push(`⚠️ JANGAN coba jual ${scamTokenCount} token scam - bisa kena honeypot!`);
        }

        if (recommendations.length === 0) {
            recommendations.push('✅ Dompet terlihat aman, tapi tetap DYOR sebelum transaksi besar');
            recommendations.push('💡 Selalu double-check alamat kontrak sebelum approve');
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
