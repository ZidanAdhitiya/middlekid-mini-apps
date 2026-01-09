// Regret Calculator - Main Analysis Engine

import {
    RegretReport,
    RegretTransaction,
    TokenRegret,
    DiamondHandsWin,
    EmotionalDamageScore,
    MissedAirdrop
} from './regret-types';
import { priceFetcher } from './price-fetcher';

class RegretCalculator {

    /**
     * Main analysis function
     */
    async analyzeWalletRegrets(
        address: string,
        chainId: number = 8453,
        daysBack: number = 30
    ): Promise<RegretReport> {
        console.log(`🔮 Analyzing regrets for ${address} (${daysBack} days back)`);

        const fromTimestamp = Math.floor(Date.now() / 1000) - (daysBack * 86400);
        const toTimestamp = Math.floor(Date.now() / 1000);

        // Step 1: Fetch transaction history
        const transactions = await this.fetchTransactionHistory(address, chainId, fromTimestamp, toTimestamp);
        console.log(`📊 Found ${transactions.length} transactions`);

        // Step 2: Match buy/sell pairs
        const { regrets, wins } = await this.matchBuySellPairs(transactions);
        console.log(`💔 Found ${regrets.length} regrets, 💎 ${wins.length} wins`);

        // Step 3: Calculate emotional damage
        const emotionalDamage = this.calculateEmotionalDamage(regrets, wins);

        // Step 4: Generate statistics
        const stats = this.calculateStatistics(transactions, regrets, wins);

        // Step 5: Find biggest regret
        const biggestRegret = regrets.length > 0
            ? regrets.reduce((max, r) => r.missedProfit > max.missedProfit ? r : max)
            : null;

        // Step 6: Find best hold
        const bestHold = wins.length > 0
            ? wins.reduce((max, w) => w.unrealizedGain > max.unrealizedGain ? w : max)
            : null;

        // Step 7: Calculate totals
        const totalMissedProfit = regrets.reduce((sum, r) => sum + r.missedProfit, 0);
        const totalUnrealizedGain = wins.reduce((sum, w) => sum + w.unrealizedGain, 0);

        // Step 8: Generate shareable text
        const shareableText = this.generateShareableText(biggestRegret, emotionalDamage);

        return {
            address,
            analyzedPeriod: {
                from: new Date(fromTimestamp * 1000).toISOString(),
                to: new Date(toTimestamp * 1000).toISOString(),
                days: daysBack
            },
            biggestRegret,
            allRegrets: regrets,
            totalMissedProfit,
            bestHold,
            allWins: wins,
            totalUnrealizedGain,
            missedAirdrops: [], // TODO: Implement airdrop detection
            emotionalDamage,
            stats,
            shareableText,
            summary: this.generateSummary(regrets, wins, emotionalDamage)
        };
    }

    /**
     * Fetch transaction history (Real or Mock based on env)
     */
    private async fetchTransactionHistory(
        address: string,
        chainId: number,
        fromTimestamp: number,
        toTimestamp: number
    ): Promise<RegretTransaction[]> {
        const USE_REAL_DATA = process.env.NEXT_PUBLIC_USE_REAL_DATA === 'true';

        if (USE_REAL_DATA) {
            console.log('🔍 Fetching REAL transaction history from blockchain...');

            try {
                // Import the transaction history fetcher
                const { txHistoryFetcher } = await import('./tx-history-fetcher');

                // Fetch real transactions
                const daysBack = Math.floor((toTimestamp - fromTimestamp) / 86400);
                const realTransactions = await txHistoryFetcher.fetchWalletTransactionHistory(
                    address,
                    chainId,
                    daysBack
                );

                if (realTransactions.length > 0) {
                    // Enrich with historical prices
                    for (const tx of realTransactions) {
                        const price = await priceFetcher.getHistoricalPrice(
                            tx.token.address,
                            tx.timestamp,
                            chainId
                        );

                        if (price) {
                            tx.priceAtTime = price;
                            const amount = parseFloat(tx.amount);
                            tx.totalValue = amount * price;
                        }
                    }

                    // Fetch token metadata
                    const enriched = await txHistoryFetcher.enrichWithMetadata(
                        realTransactions,
                        chainId
                    );

                    console.log(`✅ Fetched ${enriched.length} real transactions with prices`);
                    return enriched;
                }

                console.log('⚠️ No real transactions found for this wallet');

                // Only use mock data if explicitly enabled in development
                const USE_MOCK_FALLBACK = process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK === 'true';
                if (process.env.NODE_ENV === 'development' && USE_MOCK_FALLBACK) {
                    console.log('📭 Development mode + USE_MOCK_FALLBACK enabled - using MOCK data');
                    return this.generateMockTransactions(address, fromTimestamp, toTimestamp);
                }

                // Production: return empty array
                return [];
            } catch (error) {
                console.error('❌ Error fetching real data:', error);

                // Only use mock data if explicitly enabled in development
                const USE_MOCK_FALLBACK = process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK === 'true';
                if (process.env.NODE_ENV === 'development' && USE_MOCK_FALLBACK) {
                    console.log('📭 Error in development mode + USE_MOCK_FALLBACK enabled - falling back to MOCK data');
                    return this.generateMockTransactions(address, fromTimestamp, toTimestamp);
                }

                // Production: return empty array
                return [];
            }
        }

        // Real data mode not enabled
        console.log('⚠️ NEXT_PUBLIC_USE_REAL_DATA not enabled');
        return [];
    }

    /**
     * Generate mock transactions for testing (DEPRECATED - DO NOT USE)
     * @deprecated This method generates fake transactions and should not be used in production
     */
    private generateMockTransactions(
        address: string,
        fromTimestamp: number,
        toTimestamp: number
    ): RegretTransaction[] {
        const mockTokens = [
            { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', symbol: 'USDC', name: 'USD Coin' },
            { address: '0x4200000000000000000000000000000000000006', symbol: 'WETH', name: 'Wrapped Ether' },
            { address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', symbol: 'DAI', name: 'Dai Stablecoin' },
            { address: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', symbol: 'USDbC', name: 'USD Base Coin' }
        ];

        const hash = this.hashAddress(address);
        const txCount = (hash % 10) + 5; // 5-15 transactions

        const transactions: RegretTransaction[] = [];
        let timestamp = fromTimestamp;

        for (let i = 0; i < txCount; i++) {
            const token = mockTokens[i % mockTokens.length];
            const isBuy = i % 3 !== 2; // 2/3 buys, 1/3 sells
            const amount = (Math.random() * 1000 + 100).toFixed(2);
            const priceAtTime = token.symbol === 'USDC' ? 1 :
                token.symbol === 'WETH' ? 2000 + Math.random() * 500 :
                    token.symbol === 'DAI' ? 1 : 1;

            timestamp += Math.floor(Math.random() * 86400 * 5); // Random 0-5 days

            transactions.push({
                hash: `0x${Math.random().toString(16).slice(2, 66)}`,
                type: isBuy ? 'BUY' : 'SELL',
                token,
                amount,
                priceAtTime,
                totalValue: parseFloat(amount) * priceAtTime,
                timestamp,
                blockNumber: 10000000 + i
            });
        }

        return transactions.sort((a, b) => a.timestamp - b.timestamp);
    }

    /**
     * Match buy/sell pairs and calculate regrets
     */
    private async matchBuySellPairs(
        transactions: RegretTransaction[]
    ): Promise<{ regrets: TokenRegret[], wins: DiamondHandsWin[] }> {
        const regrets: TokenRegret[] = [];
        const wins: DiamondHandsWin[] = [];

        // Group by token
        const byToken = new Map<string, RegretTransaction[]>();
        transactions.forEach(tx => {
            const key = tx.token.address.toLowerCase();
            if (!byToken.has(key)) {
                byToken.set(key, []);
            }
            byToken.get(key)!.push(tx);
        });

        // Analyze each token
        for (const [tokenAddr, txs] of byToken.entries()) {
            const buys = txs.filter(t => t.type === 'BUY');
            const sells = txs.filter(t => t.type === 'SELL');

            // Get current price
            const currentPrice = await priceFetcher.getCurrentPrice(tokenAddr);

            if (!currentPrice) {
                console.warn(`No price data for ${txs[0].token.symbol}`);
                continue;
            }

            // Match sells with buys (FIFO)
            for (const sell of sells) {
                const matchingBuy = buys.find(b => b.timestamp < sell.timestamp);

                if (matchingBuy) {
                    const regret = this.calculateRegret(matchingBuy, sell, currentPrice);
                    regrets.push(regret);
                }
            }

            // Find still-held positions (buys without sells)
            const unsoldBuys = buys.filter(buy =>
                !sells.some(sell => sell.timestamp > buy.timestamp)
            );

            for (const buy of unsoldBuys) {
                const win = this.calculateDiamondHands(buy, currentPrice);
                if (win.unrealizedGain > 0) { // Only count actual gains
                    wins.push(win);
                }
            }
        }

        return { regrets, wins };
    }

    /**
     * Calculate regret for a buy/sell pair
     */
    private calculateRegret(
        buy: RegretTransaction,
        sell: RegretTransaction,
        currentPrice: number
    ): TokenRegret {
        const amount = parseFloat(buy.amount);
        const profitMade = sell.totalValue - buy.totalValue;
        const wouldBeWorth = amount * currentPrice;
        const missedProfit = wouldBeWorth - sell.totalValue;
        const holdDuration = Math.floor((sell.timestamp - buy.timestamp) / 86400);

        const regretScore = this.calculateRegretScore(missedProfit, holdDuration, profitMade);
        const roastMessage = this.generateRoastMessage(buy.token.symbol, missedProfit, holdDuration, profitMade);

        return {
            token: buy.token,
            bought: {
                date: new Date(buy.timestamp * 1000).toLocaleDateString('id-ID'),
                price: buy.priceAtTime,
                amount: buy.amount,
                totalSpent: buy.totalValue
            },
            sold: {
                date: new Date(sell.timestamp * 1000).toLocaleDateString('id-ID'),
                price: sell.priceAtTime,
                amount: sell.amount,
                totalReceived: sell.totalValue
            },
            currentPrice,
            profitMade,
            wouldBeWorth,
            missedProfit,
            holdDuration,
            regretScore,
            roastMessage
        };
    }

    /**
     * Calculate diamond hands win
     */
    private calculateDiamondHands(
        buy: RegretTransaction,
        currentPrice: number
    ): DiamondHandsWin {
        const amount = parseFloat(buy.amount);
        const currentValue = amount * currentPrice;
        const unrealizedGain = currentValue - buy.totalValue;
        const unrealizedGainPercent = (unrealizedGain / buy.totalValue) * 100;
        const holdDuration = Math.floor((Date.now() / 1000 - buy.timestamp) / 86400);

        const praisMessage = this.generatePraiseMessage(
            buy.token.symbol,
            unrealizedGainPercent,
            holdDuration
        );

        return {
            token: buy.token,
            bought: {
                date: new Date(buy.timestamp * 1000).toLocaleDateString('id-ID'),
                price: buy.priceAtTime,
                amount: buy.amount,
                totalSpent: buy.totalValue
            },
            currentPrice,
            currentValue,
            unrealizedGain,
            unrealizedGainPercent,
            holdDuration,
            praisMessage
        };
    }

    /**
     * Calculate regret score (0-100)
     */
    private calculateRegretScore(missedProfit: number, holdDuration: number, profitMade: number): number {
        let score = 0;

        // Missed profit impact
        if (missedProfit > 10000) score += 40;
        else if (missedProfit > 5000) score += 30;
        else if (missedProfit > 1000) score += 20;
        else if (missedProfit > 100) score += 10;

        // Hold duration impact (shorter = more regret)
        if (holdDuration < 7) score += 30;
        else if (holdDuration < 30) score += 20;
        else if (holdDuration < 90) score += 10;

        // Profit ratio (how much more you could have made)
        const ratio = profitMade > 0 ? missedProfit / profitMade : 10;
        if (ratio > 10) score += 30;
        else if (ratio > 5) score += 20;
        else if (ratio > 2) score += 10;

        return Math.min(score, 100);
    }

    /**
     * Generate roast message
     */
    private generateRoastMessage(
        symbol: string,
        missedProfit: number,
        holdDuration: number,
        profitMade: number
    ): string {
        const messages = [
            `Sabar dikit bro! Kamu hold ${symbol} cuma ${holdDuration} hari terus jual. Sekarang kamu kehilangan $${missedProfit.toFixed(0)}. Tangan kertas banget! 🧻`,
            `Paper hands detected! Jual ${symbol} terlalu cepat (${holdDuration} hari). Missed profit: $${missedProfit.toFixed(0)}. That's a certified L. 💔`,
            `Kamu dapet profit $${profitMade.toFixed(0)} dari ${symbol}, tapi kalau HOLD bisa dapet $${(profitMade + missedProfit).toFixed(0)}. Sabar adalah kunci! 🔑`,
            `${holdDuration} hari doang hold ${symbol}? Bro, ini investasi bukan slot machine. Kehilangan $${missedProfit.toFixed(0)} karena gak sabar. 😭`
        ];

        return messages[Math.floor(Math.random() * messages.length)];
    }

    /**
     * Generate praise message for diamond hands
     */
    private generatePraiseMessage(symbol: string, gainPercent: number, holdDuration: number): string {
        const messages = [
            `💎 DIAMOND HANDS! Hold ${symbol} selama ${holdDuration} hari = +${gainPercent.toFixed(0)}% gain. Ini baru namanya sabar! 👑`,
            `🚀 Legend move! ${symbol} up ${gainPercent.toFixed(0)}% dan kamu masih hold. ${holdDuration} hari patience paying off! 💪`,
            `⭐ Smart holder! Unrealized gain ${gainPercent.toFixed(0)}% on ${symbol}. Keep holding, champ! 🏆`,
            `🔥 ${holdDuration} hari hold ${symbol} = ${gainPercent.toFixed(0)}% profit. Sabar memang pahala! 💰`
        ];

        return messages[Math.floor(Math.random() * messages.length)];
    }

    /**
     * Calculate emotional damage score
     */
    private calculateEmotionalDamage(
        regrets: TokenRegret[],
        wins: DiamondHandsWin[]
    ): EmotionalDamageScore {
        const totalRegret = regrets.reduce((sum, r) => sum + r.regretScore, 0);
        const avgRegret = regrets.length > 0 ? totalRegret / regrets.length : 0;

        const totalMissed = regrets.reduce((sum, r) => sum + r.missedProfit, 0);

        const paperHandsPain = Math.min((avgRegret / 100) * 50, 50);
        const airdropRegret = 0; // TODO: Implement
        const timingFails = Math.min((totalMissed / 10000) * 50, 50);

        const overall = Math.min(paperHandsPain + airdropRegret + timingFails, 100);

        let rank = 'Paper Hands Rookie';
        let emoji = '🧻';

        if (overall >= 80) {
            rank = 'Emotional Damage Legend';
            emoji = '😭';
        } else if (overall >= 60) {
            rank = 'FOMO Master';
            emoji = '💔';
        } else if (overall >= 40) {
            rank = 'Regret Warrior';
            emoji = '😢';
        } else if (overall >= 20) {
            rank = 'Paper Hands Apprentice';
            emoji = '🧻';
        }

        return {
            overall: Math.round(overall),
            breakdown: {
                paperHandsPain: Math.round(paperHandsPain),
                airdropRegret: Math.round(airdropRegret),
                timingFails: Math.round(timingFails)
            },
            rank,
            emoji
        };
    }

    /**
     * Calculate statistics
     */
    private calculateStatistics(
        transactions: RegretTransaction[],
        regrets: TokenRegret[],
        wins: DiamondHandsWin[]
    ): RegretReport['stats'] {
        const buyTxs = transactions.filter(t => t.type === 'BUY');
        const avgHoldTime = regrets.length > 0
            ? regrets.reduce((sum, r) => sum + r.holdDuration, 0) / regrets.length
            : 0;

        const patienceScore = avgHoldTime > 90 ? 100 :
            avgHoldTime > 60 ? 80 :
                avgHoldTime > 30 ? 60 :
                    avgHoldTime > 14 ? 40 : 20;

        return {
            totalTransactions: transactions.length,
            paperHandsCount: regrets.length,
            diamondHandsCount: wins.length,
            averageHoldTime: Math.round(avgHoldTime),
            patienceScore
        };
    }

    /**
     * Generate shareable text for Twitter
     */
    private generateShareableText(
        biggestRegret: TokenRegret | null,
        emotionalDamage: EmotionalDamageScore
    ): string {
        if (!biggestRegret) {
            return `I checked my crypto regrets and I'm doing okay! 💎\n\nEmotional Damage Score: ${emotionalDamage.overall}/100\n\nCheck yours at [link]`;
        }

        return `I sold ${biggestRegret.token.symbol} after ${biggestRegret.holdDuration} days 🧻\n\nProfit made: $${biggestRegret.profitMade.toFixed(0)}\nCould have: $${biggestRegret.wouldBeWorth.toFixed(0)}\nMissed: $${biggestRegret.missedProfit.toFixed(0)} 💔\n\nEmotional Damage: ${emotionalDamage.overall}/100 ${emotionalDamage.emoji}\nRank: ${emotionalDamage.rank}\n\nCheck your regrets at [link]`;
    }

    /**
     * Generate summary
     */
    private generateSummary(
        regrets: TokenRegret[],
        wins: DiamondHandsWin[],
        emotionalDamage: EmotionalDamageScore
    ): string {
        if (regrets.length === 0 && wins.length === 0) {
            return '✅ Belum ada transaksi yang cukup untuk analisis regret. Keep trading!';
        }

        const totalMissed = regrets.reduce((sum, r) => sum + r.missedProfit, 0);
        const totalGain = wins.reduce((sum, w) => sum + w.unrealizedGain, 0);

        if (totalMissed > totalGain) {
            return `💔 Emotional Damage: ${emotionalDamage.overall}/100. Kamu kehilangan $${totalMissed.toFixed(0)} dari paper hands. Sabar adalah kunci!`;
        } else {
            return `💎 Nice! Unrealized gains: $${totalGain.toFixed(0)}. Kamu lebih diamond hands daripada paper hands. Keep it up!`;
        }
    }

    // Helper: Hash address untuk deterministic random
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

// Singleton
export const regretCalculator = new RegretCalculator();
