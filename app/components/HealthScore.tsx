'use client';

import { WalletHealthScore } from '../lib/tx-interpreter/gamification-types';
import styles from './HealthScore.module.css';
import { useState } from 'react';

interface HealthScoreProps {
    score: WalletHealthScore;
}

export default function HealthScore({ score }: HealthScoreProps) {
    const [showBreakdown, setShowBreakdown] = useState(false);

    // Determine color based on score
    const getScoreColor = (totalScore: number): string => {
        if (totalScore >= 85) return '#10b981'; // green
        if (totalScore >= 70) return '#22c55e'; // light green
        if (totalScore >= 50) return '#f59e0b'; // orange
        if (totalScore >= 30) return '#ef4444'; // red
        return '#dc2626'; // dark red
    };

    const scoreColor = getScoreColor(score.totalScore);

    // Calculate SVG circle values for animation
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score.totalScore / 100) * circumference;

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h3>🏆 Wallet Health Score</h3>
                    <span className={styles.rank}>{score.rank}</span>
                </div>

                <div className={styles.scoreSection}>
                    {/* Circular Progress */}
                    <div className={styles.circularProgress}>
                        <svg width="180" height="180">
                            {/* Background circle */}
                            <circle
                                cx="90"
                                cy="90"
                                r={radius}
                                fill="none"
                                stroke="#1e293b"
                                strokeWidth="12"
                            />
                            {/* Progress circle */}
                            <circle
                                cx="90"
                                cy="90"
                                r={radius}
                                fill="none"
                                stroke={scoreColor}
                                strokeWidth="12"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                strokeLinecap="round"
                                className={styles.progressCircle}
                            />
                        </svg>

                        <div className={styles.scoreText}>
                            <div className={styles.scoreNumber} style={{ color: scoreColor }}>
                                {score.totalScore}
                            </div>
                            <div className={styles.scoreLabel}>/ 100</div>
                            <div className={styles.grade} style={{ color: scoreColor }}>
                                Grade {score.grade}
                            </div>
                        </div>
                    </div>

                    {/* Score Info */}
                    <div className={styles.scoreInfo}>
                        {/* Share to Twitter Button */}
                        <button
                            className={styles.shareButton}
                            onClick={() => shareToTwitter(score)}
                        >
                            🐦 Share to Twitter
                        </button>

                        <button
                            className={styles.breakdownButton}
                            onClick={() => setShowBreakdown(!showBreakdown)}
                        >
                            {showBreakdown ? '🔽' : '🔼'} Score Breakdown
                        </button>

                        {/* Strengths & Weaknesses */}
                        <div className={styles.insights}>
                            {score.strengths.length > 0 && (
                                <div className={styles.strengthsSection}>
                                    <h4>💪 Kekuatan</h4>
                                    <ul>
                                        {score.strengths.map((strength, idx) => (
                                            <li key={idx}>{strength}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {score.weaknesses.length > 0 && score.weaknesses[0] !== '🎉 Tidak ada kelemahan signifikan!' && (
                                <div className={styles.weaknessesSection}>
                                    <h4>⚠️ Perlu Perbaikan</h4>
                                    <ul>
                                        {score.weaknesses.map((weakness, idx) => (
                                            <li key={idx}>{weakness}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Breakdown Details */}
                {showBreakdown && (
                    <div className={styles.breakdown}>
                        <h4>📊 Detail Perhitungan Score</h4>
                        <div className={styles.factorsGrid}>
                            {Object.entries(score.breakdown).map(([key, factor]) => (
                                <div key={key} className={styles.factor}>
                                    <div className={styles.factorHeader}>
                                        <span className={styles.factorName}>{factor.name}</span>
                                        <span className={styles.factorPoints}>
                                            {factor.earnedPoints}/{factor.maxPoints}
                                        </span>
                                    </div>
                                    <div className={styles.factorBar}>
                                        <div
                                            className={styles.factorProgress}
                                            style={{
                                                width: `${(factor.earnedPoints / factor.maxPoints) * 100}%`,
                                                backgroundColor: getFactorColor(factor.status)
                                            }}
                                        />
                                    </div>
                                    <div className={styles.factorDescription}>
                                        {factor.description}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function getFactorColor(status: string): string {
    switch (status) {
        case 'excellent': return '#10b981';
        case 'good': return '#22c55e';
        case 'fair': return '#f59e0b';
        case 'poor': return '#ef4444';
        case 'critical': return '#dc2626';
        default: return '#6b7280';
    }
}

// Twitter Share Function
function shareToTwitter(score: WalletHealthScore) {
    // Generate personalized message based on score
    let scoreMessage = '';
    if (score.totalScore >= 90) {
        scoreMessage = '💪 My wallet is Fort Knox!';
    } else if (score.totalScore >= 70) {
        scoreMessage = '🔒 Working on my security game!';
    } else if (score.totalScore >= 50) {
        scoreMessage = '⚠️ Found some issues, fixing them!';
    } else {
        scoreMessage = '🚨 Time for a security upgrade!';
    }

    const text = `🏆 ${scoreMessage}

Wallet Health Score: ${score.totalScore}/100 (Grade ${score.grade})
🛡️ Security Rating: ${score.rank}

Check your Web3 wallet security 👇
${window.location.origin}

#Web3Security #CryptoSafety #DeFi`;

    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=600,height=400,noopener,noreferrer');
}
