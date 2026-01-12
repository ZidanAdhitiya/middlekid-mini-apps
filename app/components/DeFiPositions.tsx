'use client';

import { StakingPosition } from '../lib/types';
import styles from './DeFiPositions.module.css';

interface DeFiPositionsProps {
    positions: StakingPosition[];
}

export default function DeFiPositions({ positions }: DeFiPositionsProps) {
    if (!positions || positions.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.empty}>
                    <svg className={styles.emptyIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <p className={styles.emptyTitle}>No active DeFi positions found</p>
                    <p className={styles.emptyHint}>Connect to DeFi protocols to see your positions here</p>
                </div>
            </div>
        );
    }

    // Calculate total value
    const totalValue = positions.reduce((sum, pos) => sum + pos.totalValue, 0);

    return (
        <div className={styles.container}>
            {/* Total DeFi Value Header */}
            <div className={styles.totalHeader}>
                <h2 className={styles.totalTitle}>DeFi Positions</h2>
                <div className={styles.totalValue}>
                    ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
            </div>

            {/* Protocol Cards */}
            <div className={styles.protocolList}>
                {positions.map((pos) => (
                    <div key={pos.id} className={styles.protocolCard}>
                        {/* Card Header */}
                        <div className={styles.cardHeader}>
                            <div className={styles.protocolInfo}>
                                <div className={styles.protocolIcon}>
                                    {getProtocolIcon(pos.protocol)}
                                </div>
                                <div className={styles.protocolMeta}>
                                    <div className={styles.protocolName}>
                                        {pos.protocol}
                                        <a href={getProtocolUrl(pos.protocol)} target="_blank" rel="noopener noreferrer" className={styles.externalLink}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                                <polyline points="15 3 21 3 21 9" />
                                                <line x1="10" y1="14" x2="21" y2="3" />
                                            </svg>
                                        </a>
                                    </div>
                                    <div className={styles.protocolChain}>{pos.chain}</div>
                                </div>
                            </div>
                            <div className={styles.cardValue}>
                                ${pos.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>

                        {/* Category Badge */}
                        <div className={styles.categorySection}>
                            <span className={`${styles.categoryBadge} ${getCategoryClass(pos.protocol)}`}>
                                {getPositionType(pos.protocol)}
                            </span>
                        </div>

                        {/* Token Table */}
                        {pos.tokens && pos.tokens.length > 0 && (
                            <div className={styles.tokenSection}>
                                <div className={styles.tokenHeader}>
                                    <span className={styles.tokenHeaderCell}>Token</span>
                                    <span className={styles.tokenHeaderCell}>Balance</span>
                                    <span className={styles.tokenHeaderCell}>USD Value</span>
                                </div>
                                {pos.tokens.map((token, idx) => (
                                    <div key={idx} className={styles.tokenRow}>
                                        <div className={styles.tokenInfo}>
                                            <div className={styles.tokenIcon}>
                                                {getTokenIcon(token.symbol)}
                                            </div>
                                            <span className={styles.tokenSymbol}>{token.symbol}</span>
                                        </div>
                                        <div className={styles.tokenBalance}>
                                            {parseFloat(token.amount).toLocaleString(undefined, {
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 4
                                            })} {token.symbol}
                                        </div>
                                        <div className={styles.tokenValue}>
                                            ${token.value.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function getProtocolIcon(protocol: string): string {
    const lower = protocol.toLowerCase();
    if (lower.includes('aave')) return '👻';
    if (lower.includes('lido')) return '🌊';
    if (lower.includes('curve')) return '🔄';
    if (lower.includes('hyperlend')) return '⚡';
    if (lower.includes('kinetiq')) return '🌀';
    if (lower.includes('ether.fi')) return '💎';
    if (lower.includes('kelp')) return '🌿';
    if (lower.includes('compound')) return '🏦';
    if (lower.includes('uniswap')) return '🦄';
    if (lower.includes('moonwell')) return '🌙';
    if (lower.includes('benqi')) return '❄️';
    if (lower.includes('maker') || lower.includes('spark')) return '🏭';
    if (lower.includes('pendle')) return '📊';
    return '💰';
}

function getPositionType(protocol: string): string {
    const lower = protocol.toLowerCase();
    if (lower.includes('aave') || lower.includes('compound') || lower.includes('hyperlend') || lower.includes('moonwell') || lower.includes('benqi')) return 'Lending';
    if (lower.includes('lido') || lower.includes('ether.fi') || lower.includes('rocket') || lower.includes('kinetiq') || lower.includes('kelp')) return 'Staking';
    if (lower.includes('curve') || lower.includes('uniswap') || lower.includes('sushi')) return 'LP';
    if (lower.includes('pendle')) return 'Yield';
    return 'DeFi';
}

function getCategoryClass(protocol: string): string {
    const type = getPositionType(protocol);
    switch (type) {
        case 'Lending': return styles.categoryLending;
        case 'Staking': return styles.categoryStaking;
        case 'LP': return styles.categoryLP;
        case 'Yield': return styles.categoryYield;
        default: return styles.categoryDefault;
    }
}

function getTokenIcon(symbol: string): string {
    const lower = symbol.toLowerCase();
    if (lower.includes('usdc')) return '💵';
    if (lower.includes('usdt')) return '💴';
    if (lower.includes('eth') || lower.includes('weth')) return '⟠';
    if (lower.includes('btc') || lower.includes('wbtc')) return '₿';
    if (lower.includes('dai')) return '🟡';
    if (lower.includes('aave')) return '👻';
    if (lower.includes('crv')) return '🔄';
    if (lower.includes('steth') || lower.includes('wsteth')) return '🌊';
    if (lower.includes('gho')) return '🟣';
    if (lower.includes('hype') || lower.includes('khype')) return '🚀';
    if (lower.includes('eigen')) return '🔷';
    return '🪙';
}

function getProtocolUrl(protocol: string): string {
    const lower = protocol.toLowerCase();
    if (lower.includes('aave')) return 'https://app.aave.com';
    if (lower.includes('lido')) return 'https://stake.lido.fi';
    if (lower.includes('curve')) return 'https://curve.fi';
    if (lower.includes('hyperlend')) return 'https://hyperlend.finance';
    if (lower.includes('kinetiq')) return 'https://kinetiq.xyz';
    if (lower.includes('ether.fi')) return 'https://app.ether.fi';
    if (lower.includes('kelp')) return 'https://kelpdao.xyz';
    if (lower.includes('compound')) return 'https://app.compound.finance';
    if (lower.includes('uniswap')) return 'https://app.uniswap.org';
    if (lower.includes('moonwell')) return 'https://moonwell.fi';
    if (lower.includes('benqi')) return 'https://benqi.fi';
    return '#';
}
