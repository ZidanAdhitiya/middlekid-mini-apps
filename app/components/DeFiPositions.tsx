
'use client';

import { StakingPosition } from '../lib/types';
import styles from './DeFiPositions.module.css';

interface DeFiPositionsProps {
    positions: StakingPosition[];
}

export default function DeFiPositions({ positions }: DeFiPositionsProps) {
    if (!positions || positions.length === 0) {
        return (
            <div className={styles.empty}>
                <p>No active DeFi positions found.</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {positions.map((pos) => (
                <div key={pos.id} className={styles.tokenItem}>
                    <div className={styles.tokenInfo}>
                        <div className={styles.tokenDetails}>
                            <span className={styles.tokenName}>{pos.protocol} • {pos.chain}</span>
                            {pos.tokens.map((t, i) => (
                                <span key={i} className={styles.tokenSymbol}>
                                    {t.symbol}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className={styles.tokenBalance}>
                        <div className={styles.balanceValue}>
                            ${pos.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </div>
                        {pos.apy && (
                            <div className={styles.balanceAmount} style={{ color: '#00ff80' }}>
                                APY: {pos.apy}%
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
