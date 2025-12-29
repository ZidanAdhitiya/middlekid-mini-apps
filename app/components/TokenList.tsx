'use client';

import { useState } from 'react';
import { Token } from '../lib/types';
import { formatUSD, formatPercentage } from '../lib/moralis';
import styles from './TokenList.module.css';

interface TokenListProps {
    tokens: Token[];
}

type SortField = 'value' | 'balance' | 'change';
type SortDirection = 'asc' | 'desc';

export default function TokenList({ tokens }: TokenListProps) {
    const [sortField, setSortField] = useState<SortField>('value');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const sortedTokens = [...tokens].sort((a, b) => {
        let aValue, bValue;

        switch (sortField) {
            case 'value':
                aValue = a.usdValue || 0;
                bValue = b.usdValue || 0;
                break;
            case 'balance':
                aValue = parseFloat(a.balanceFormatted);
                bValue = parseFloat(b.balanceFormatted);
                break;
            case 'change':
                aValue = a.percentChange24h || 0;
                bValue = b.percentChange24h || 0;
                break;
        }

        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });

    if (tokens.length === 0) {
        return (
            <div className={`${styles.container} glass`}>
                <h2 className={styles.title}>Tokens</h2>
                <div className={styles.empty}>
                    <svg className={styles.emptyIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p>No tokens found</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`${styles.container} glass`}>
            <h2 className={styles.title}>Tokens ({tokens.length})</h2>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.headerCell}>Asset</th>
                            <th
                                className={`${styles.headerCell} ${styles.sortable}`}
                                onClick={() => handleSort('balance')}
                            >
                                Balance
                                {sortField === 'balance' && (
                                    <span className={styles.sortIcon}>{sortDirection === 'desc' ? '↓' : '↑'}</span>
                                )}
                            </th>
                            <th
                                className={`${styles.headerCell} ${styles.sortable}`}
                                onClick={() => handleSort('value')}
                            >
                                Value
                                {sortField === 'value' && (
                                    <span className={styles.sortIcon}>{sortDirection === 'desc' ? '↓' : '↑'}</span>
                                )}
                            </th>
                            <th
                                className={`${styles.headerCell} ${styles.sortable}`}
                                onClick={() => handleSort('change')}
                            >
                                24h %
                                {sortField === 'change' && (
                                    <span className={styles.sortIcon}>{sortDirection === 'desc' ? '↓' : '↑'}</span>
                                )}
                            </th>
                            <th className={styles.headerCell}>Portfolio %</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTokens.map((token, index) => {
                            const isPositive = (token.percentChange24h || 0) >= 0;
                            return (
                                <tr key={`${token.address}-${index}`} className={styles.row}>
                                    <td className={styles.cell}>
                                        <div className={styles.asset}>
                                            {token.logo ? (
                                                <img src={token.logo} alt={token.symbol} className={styles.logo} />
                                            ) : (
                                                <div className={styles.logoPlaceholder}>
                                                    {token.symbol.charAt(0)}
                                                </div>
                                            )}
                                            <div className={styles.assetInfo}>
                                                <div className={styles.symbol}>{token.symbol}</div>
                                                <div className={styles.name}>{token.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={styles.cell}>
                                        <div className={styles.balance}>{token.balanceFormatted}</div>
                                    </td>
                                    <td className={styles.cell}>
                                        <div className={styles.value}>
                                            {token.usdValue ? formatUSD(token.usdValue) : '-'}
                                        </div>
                                        {token.usdPrice && (
                                            <div className={styles.price}>
                                                ${token.usdPrice.toLocaleString('en-US', { maximumFractionDigits: 6 })}
                                            </div>
                                        )}
                                    </td>
                                    <td className={styles.cell}>
                                        {token.percentChange24h !== undefined ? (
                                            <div className={`${styles.change} ${isPositive ? styles.positive : styles.negative}`}>
                                                {formatPercentage(token.percentChange24h)}
                                            </div>
                                        ) : (
                                            <div className={styles.noData}>-</div>
                                        )}
                                    </td>
                                    <td className={styles.cell}>
                                        <div className={styles.portfolioPercent}>
                                            {token.portfolioPercentage?.toFixed(2)}%
                                        </div>
                                        <div className={styles.progressBar}>
                                            <div
                                                className={styles.progressFill}
                                                style={{ width: `${Math.min(token.portfolioPercentage || 0, 100)}%` }}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
