'use client';

import { useEffect, useState } from 'react';
import type { RegretReport } from '../lib/tx-interpreter/regret-types';
import { mapRegretToStrategy, getStrategyParameters } from '../lib/options/strategy-mapper';
import type { StrategyRecommendation } from '../lib/options/strategy-mapper';
import { fetchThetanutsQuote } from '../lib/options/thetanuts-pricing';
import type { ThetanutsQuote } from '../lib/options/thetanuts-pricing';
import OptionRecommendationCard from './OptionRecommendationCard';
import styles from './RegretReport.module.css';

interface RegretReportProps {
    report: RegretReport;
}

export default function RegretReportComponent({ report }: RegretReportProps) {
    if (!report) return null;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const handleShare = () => {
        const tweetText = encodeURIComponent(report.shareableText);
        const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
        window.open(tweetUrl, '_blank');
    };

    // Thetanuts Integration: Strategy recommendation and pricing
    const [strategy, setStrategy] = useState<StrategyRecommendation | null>(null);
    const [quote, setQuote] = useState<ThetanutsQuote | null>(null);
    const [isLoadingQuote, setIsLoadingQuote] = useState(false);

    useEffect(() => {
        // Get strategy recommendation based on regret analysis
        const recommendedStrategy = mapRegretToStrategy(report);
        setStrategy(recommendedStrategy);

        // If strategy exists, fetch pricing from Thetanuts
        if (recommendedStrategy && report.biggestRegret) {
            setIsLoadingQuote(true);

            const params = getStrategyParameters(report, recommendedStrategy);

            fetchThetanutsQuote({
                underlying: params.underlying,
                strike: params.strike,
                expiry: params.expiry,
                type: recommendedStrategy.type.toLowerCase() as 'call' | 'put',
                size: params.size
            })
                .then(setQuote)
                .catch(err => {
                    console.error('Failed to fetch quote:', err);
                    setQuote(null);
                })
                .finally(() => setIsLoadingQuote(false));
        }
    }, [report]);

    // Check for empty wallet (no transactions)
    const isEmpty = report.stats.totalTransactions === 0 ||
        (report.allRegrets.length === 0 && report.allWins.length === 0);

    // Show empty state
    if (isEmpty) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🕳️</div>
                    <h2 className={styles.emptyTitle}>Wallet Kosong / Tidak Ada Transaksi</h2>
                    <p className={styles.emptyText}>
                        Wallet ini tidak memiliki riwayat transaksi token dalam periode yang dianalisis.
                    </p>
                    <div className={styles.emptyHint}>
                        💡 Tips: Coba wallet lain yang punya transaksi swap/trading untuk melihat Time Machine Analysis!
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className={styles.container}>
            {/* Data Mode Indicator */}
            <div style={{
                backgroundColor: process.env.NEXT_PUBLIC_USE_REAL_DATA === 'true' ? '#10b981' : '#f59e0b',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                marginBottom: '16px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: '600'
            }}>
                {process.env.NEXT_PUBLIC_USE_REAL_DATA === 'true'
                    ? '🔗 Real Blockchain Data Mode'
                    : '🎭 Demo Mode (Mock Data)'}
            </div>

            {/* Emotional Damage Hero Card */}
            <div className={styles.heroCard}>
                <div className={styles.damageEmoji}>{report.emotionalDamage.emoji}</div>
                <h2 className={styles.heroTitle}>Emotional Damage Score</h2>
                <div className={styles.damageScore}>
                    {report.emotionalDamage.overall}
                    <span className={styles.scoreMax}>/100</span>
                </div>
                <div className={styles.rank}>{report.emotionalDamage.rank}</div>

                {/* Damage Breakdown */}
                <div className={styles.breakdown}>
                    <div className={styles.breakdownItem}>
                        <span className={styles.breakdownLabel}>🧻 Paper Hands Pain</span>
                        <span className={styles.breakdownValue}>{report.emotionalDamage.breakdown.paperHandsPain}</span>
                    </div>
                    <div className={styles.breakdownItem}>
                        <span className={styles.breakdownLabel}>⏱️ Timing Fails</span>
                        <span className={styles.breakdownValue}>{report.emotionalDamage.breakdown.timingFails}</span>
                    </div>
                </div>

                {/* Share Button */}
                <button className={styles.shareButton} onClick={handleShare}>
                    🐦 Share Pain to Twitter
                </button>
            </div>

            {/* Summary Stats */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>💔</div>
                    <div className={styles.statValue}>{formatCurrency(report.totalMissedProfit)}</div>
                    <div className={styles.statLabel}>Total Missed Profit</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>💎</div>
                    <div className={styles.statValue}>{formatCurrency(report.totalUnrealizedGain)}</div>
                    <div className={styles.statLabel}>Unrealized Gains</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>🧻</div>
                    <div className={styles.statValue}>{report.stats.paperHandsCount}</div>
                    <div className={styles.statLabel}>Paper Hands Moments</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>⏱️</div>
                    <div className={styles.statValue}>{report.stats.averageHoldTime} days</div>
                    <div className={styles.statLabel}>Average Hold Time</div>
                </div>
            </div>

            {/* Biggest Regret */}
            {report.biggestRegret && (
                <div className={styles.biggestRegret}>
                    <h3 className={styles.sectionTitle}>
                        💔 Your Biggest Regret
                    </h3>
                    <div className={styles.regretCard}>
                        <div className={styles.regretHeader}>
                            <span className={styles.tokenSymbol}>{report.biggestRegret.token.symbol}</span>
                            <span className={styles.tokenName}>{report.biggestRegret.token.name}</span>
                        </div>

                        <div className={styles.regretTimeline}>
                            <div className={styles.timelineEvent}>
                                <span className={styles.eventLabel}>📅 Bought</span>
                                <span className={styles.eventDate}>{report.biggestRegret.bought.date}</span>
                                <span className={styles.eventValue}>{formatCurrency(report.biggestRegret.bought.totalSpent)}</span>
                            </div>
                            <div className={styles.timelineDivider}>
                                <span className={styles.holdDuration}>
                                    Held for {report.biggestRegret.holdDuration} days
                                </span>
                            </div>
                            <div className={styles.timelineEvent}>
                                <span className={styles.eventLabel}>💸 Sold</span>
                                <span className={styles.eventDate}>{report.biggestRegret.sold.date}</span>
                                <span className={styles.eventValue}>{formatCurrency(report.biggestRegret.sold.totalReceived)}</span>
                            </div>
                        </div>

                        <div className={styles.regretCalculation}>
                            <div className={styles.calcRow}>
                                <span>Profit Made:</span>
                                <span className={styles.profitMade}>+{formatCurrency(report.biggestRegret.profitMade)}</span>
                            </div>
                            <div className={styles.calcRow}>
                                <span>Would Be Worth Now:</span>
                                <span className={styles.wouldBe}>{formatCurrency(report.biggestRegret.wouldBeWorth)}</span>
                            </div>
                            <div className={`${styles.calcRow} ${styles.missedRow}`}>
                                <span>Missed Profit:</span>
                                <span className={styles.missed}>💔 {formatCurrency(report.biggestRegret.missedProfit)}</span>
                            </div>
                        </div>

                        <div className={styles.roastMessage}>
                            😭 {report.biggestRegret.roastMessage}
                        </div>
                    </div>
                </div>
            )}

            {/* Thetanuts Option Recommendation */}
            {strategy && (
                <div className={styles.optionRecommendation}>
                    <OptionRecommendationCard
                        strategy={strategy}
                        quote={quote}
                        isLoading={isLoadingQuote}
                        currentPrice={report.biggestRegret?.currentPrice}
                        tokenSymbol={report.biggestRegret?.token.symbol}
                    />
                </div>
            )}

            {/* All Regrets List */}
            {report.allRegrets.length > 1 && (
                <div className={styles.allRegrets}>
                    <h3 className={styles.sectionTitle}>
                        🧻 All Paper Hands Moments ({report.allRegrets.length})
                    </h3>
                    <div className={styles.regretsList}>
                        {report.allRegrets.slice(1).map((regret, index) => (
                            <div key={index} className={styles.miniRegretCard}>
                                <div className={styles.miniHeader}>
                                    <span className={styles.miniToken}>{regret.token.symbol}</span>
                                    <span className={styles.miniMissed}>{formatCurrency(regret.missedProfit)}</span>
                                </div>
                                <div className={styles.miniDetails}>
                                    Held {regret.holdDuration} days • Regret score: {regret.regretScore}/100
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Diamond Hands Wins */}
            {report.allWins.length > 0 && (
                <div className={styles.diamondHands}>
                    <h3 className={styles.sectionTitle}>
                        💎 Diamond Hands Wins ({report.allWins.length})
                    </h3>
                    <div className={styles.winsList}>
                        {report.allWins.map((win, index) => (
                            <div key={index} className={styles.winCard}>
                                <div className={styles.winHeader}>
                                    <span className={styles.winToken}>{win.token.symbol}</span>
                                    <span className={styles.winGain}>+{win.unrealizedGainPercent.toFixed(0)}%</span>
                                </div>
                                <div className={styles.winDetails}>
                                    <div className={styles.winRow}>
                                        <span>Invested:</span>
                                        <span>{formatCurrency(win.bought.totalSpent)}</span>
                                    </div>
                                    <div className={styles.winRow}>
                                        <span>Current Value:</span>
                                        <span>{formatCurrency(win.currentValue)}</span>
                                    </div>
                                    <div className={styles.winRow}>
                                        <span>Unrealized Gain:</span>
                                        <span className={styles.gainValue}>+{formatCurrency(win.unrealizedGain)}</span>
                                    </div>
                                </div>
                                <div className={styles.praiseMessage}>
                                    {win.praisMessage}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Patience Score */}
            <div className={styles.patienceCard}>
                <h3>⏱️ Patience Score</h3>
                <div className={styles.patienceScore}>
                    {report.stats.patienceScore}
                    <span className={styles.scoreMax}>/100</span>
                </div>
                <div className={styles.patienceBar}>
                    <div
                        className={styles.patienceFill}
                        style={{ width: `${report.stats.patienceScore}%` }}
                    />
                </div>
                <p className={styles.patienceText}>
                    Average hold time: {report.stats.averageHoldTime} days
                    {report.stats.patienceScore < 40 && " - You need to chill bro! 🧘"}
                    {report.stats.patienceScore >= 40 && report.stats.patienceScore < 70 && " - Not bad! Keep it up 👍"}
                    {report.stats.patienceScore >= 70 && " - Diamond hands confirmed! 💎"}
                </p>
            </div>

            {/* Summary */}
            <div className={styles.summary}>
                <p>{report.summary}</p>
            </div>
        </div>
    );
}
