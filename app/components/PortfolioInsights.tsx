
'use client';

import { Insight } from '../lib/types';
import styles from './PortfolioInsights.module.css';

interface PortfolioInsightsProps {
    insights: Insight[];
    errors?: string[];
}

export default function PortfolioInsights({ insights, errors }: PortfolioInsightsProps) {
    if ((!insights || insights.length === 0) && (!errors || errors.length === 0)) return null;

    const getIcon = (type: Insight['type']) => {
        switch (type) {
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            case 'neutral': return '📊';
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <span>Portfolio Analysis</span>
            </div>
            <div className={styles.grid}>
                {insights.map((insight, index) => (
                    <div
                        key={index}
                        className={`${styles.card} ${styles[insight.type]}`}
                    >
                        <div className={styles.icon}>{getIcon(insight.type)}</div>
                        <div className={styles.content}>
                            <div className={styles.title}>{insight.title}</div>
                            <div className={styles.description}>{insight.description}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
