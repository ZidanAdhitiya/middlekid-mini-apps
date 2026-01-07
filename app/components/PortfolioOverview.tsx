'use client';

import { PortfolioSummary } from '../lib/types';
import { formatUSD, formatPercentage } from '../lib/moralis';
import styles from './PortfolioOverview.module.css';

interface PortfolioOverviewProps {
    summary: PortfolioSummary;
}

export default function PortfolioOverview({ summary }: PortfolioOverviewProps) {
    const isPositive = (summary.change24hPercentage || 0) >= 0;

    return (
        <div className={`${styles.container} glass card-hover`}>
            <div className={styles.header}>
                <h2 className={styles.title}>Portfolio Value</h2>
            </div>

            <div className={styles.mainValue}>
                <span className={styles.currency}>$</span>
                <span className={styles.amount}>
                    {summary.totalValueUsd.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                </span>
            </div>

            {summary.change24hPercentage !== undefined && (
                <div className={`${styles.change} ${isPositive ? styles.positive : styles.negative}`}>
                    <svg className={styles.changeIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {isPositive ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                        )}
                    </svg>
                    <span>{formatPercentage(summary.change24hPercentage || 0)}</span>
                    {summary.change24h !== undefined && (
                        <span className={styles.changeAmount}>
                            ({isPositive ? '+' : ''}{formatUSD(summary.change24h)})
                        </span>
                    )}
                </div>
            )}

            <div className={styles.stats}>
                <div className={styles.stat}>
                    <div className={styles.statIcon} style={{ background: 'var(--gradient-primary)' }}>
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{summary.totalTokens}</div>
                        <div className={styles.statLabel}>Tokens</div>
                    </div>
                </div>

                <div className={styles.stat}>
                    <div className={styles.statIcon} style={{ background: 'var(--gradient-secondary)' }}>
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{summary.totalNFTs}</div>
                        <div className={styles.statLabel}>NFTs</div>
                    </div>
                </div>

                <div className={styles.stat}>
                    <div className={styles.statIcon} style={{ background: 'var(--gradient-accent)' }}>
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{summary.totalStakingPositions}</div>
                        <div className={styles.statLabel}>Staking</div>
                    </div>
                </div>

                <div className={styles.stat}>
                    <div className={styles.statIcon} style={{ background: 'var(--gradient-success)' }}>
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{summary.totalLPPositions}</div>
                        <div className={styles.statLabel}>LP Pools</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
