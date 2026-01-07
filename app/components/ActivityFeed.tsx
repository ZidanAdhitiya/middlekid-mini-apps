
'use client';

import { Transaction } from '../lib/types';
import { formatDistanceToNow } from 'date-fns';
import styles from './ActivityFeed.module.css';

interface ActivityFeedProps {
    transactions: Transaction[];
}

export default function ActivityFeed({ transactions }: ActivityFeedProps) {
    if (!transactions || transactions.length === 0) {
        return (
            <div className={styles.empty}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No transactions found</p>
            </div>
        );
    }

    const formatAmount = (value: string) => {
        const num = parseFloat(value);
        if (isNaN(num)) return '0';
        if (num < 0.0001) return '< 0.0001';
        return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
    };

    return (
        <div className={styles.container}>
            {transactions.map((tx) => (
                <a
                    key={tx.hash}
                    href={`https://basescan.org/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.item}
                >
                    <div className={styles.left}>
                        <div className={`${styles.iconWrapper} ${styles[tx.direction || 'out']}`}>
                            {tx.direction === 'in' ? '↓' : '↑'}
                        </div>
                        <div className={styles.info}>
                            <div className={styles.type}>
                                {tx.direction === 'in' ? 'Received' : 'Sent'} {tx.asset || 'ETH'}
                            </div>
                            <div className={styles.date}>
                                {tx.blockTimestamp ? formatDistanceToNow(new Date(tx.blockTimestamp), { addSuffix: true }) : 'Unknown date'}
                            </div>
                        </div>
                    </div>
                    <div className={styles.right}>
                        <div className={`${styles.amount} ${styles[tx.direction || 'out']}`}>
                            {tx.direction === 'in' ? '+' : '-'}{formatAmount(tx.value)}
                        </div>
                        <div className={styles.asset}>{tx.asset || 'ETH'}</div>
                    </div>
                </a>
            ))}
        </div>
    );
}
