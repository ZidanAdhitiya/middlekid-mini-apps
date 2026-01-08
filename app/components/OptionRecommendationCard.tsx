'use client';

import { useEffect, useState } from 'react';
import type { StrategyRecommendation } from '../lib/options/strategy-mapper';
import type { ThetanutsQuote } from '../lib/options/thetanuts-pricing';
import { formatPremium, formatExpiry } from '../lib/options/thetanuts-pricing';
import WhatIfSimulator from './WhatIfSimulator';
import styles from './OptionRecommendationCard.module.css';

interface OptionRecommendationCardProps {
    strategy: StrategyRecommendation;
    quote: ThetanutsQuote | null;
    isLoading: boolean;
    currentPrice?: number;
    tokenSymbol?: string;
}

export default function OptionRecommendationCard({
    strategy,
    quote,
    isLoading,
    currentPrice,
    tokenSymbol
}: OptionRecommendationCardProps) {
    const [showCTAModal, setShowCTAModal] = useState(false);
    const [showSimulator, setShowSimulator] = useState(false);

    const handleProtectClick = () => {
        console.log('🔒 Protect Next Trade clicked');
        console.log('Strategy:', strategy);
        console.log('Quote:', quote);

        // For now, just show a modal or log
        // In production, this would redirect to Thetanuts platform
        setShowCTAModal(true);

        // Auto-close modal after 3 seconds
        setTimeout(() => setShowCTAModal(false), 3000);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <span className={styles.emoji}>{strategy.emoji}</span>
                <h3 className={styles.title}>{strategy.name}</h3>
            </div>

            <div className={styles.whySection}>
                <h4 className={styles.sectionTitle}>💡 Kenapa ini cocok buat kamu?</h4>
                <p className={styles.explanation}>{strategy.userFriendlyExplanation}</p>
            </div>

            {isLoading ? (
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Mengambil harga dari Thetanuts...</p>
                </div>
            ) : quote ? (
                <div className={styles.priceSection}>
                    <div className={styles.priceRow}>
                        <span className={styles.priceLabel}>💰 Premium:</span>
                        <span className={styles.priceValue}>{formatPremium(quote.premium)}</span>
                    </div>
                    <div className={styles.priceRow}>
                        <span className={styles.priceLabel}>📉 Max Loss:</span>
                        <span className={styles.priceValue}>{formatPremium(quote.maxLoss || quote.premium)}</span>
                    </div>
                    <div className={styles.priceRow}>
                        <span className={styles.priceLabel}>📈 Max Upside:</span>
                        <span className={styles.priceValue}>{quote.maxUpside || 'Unlimited'}</span>
                    </div>
                    <div className={styles.priceRow}>
                        <span className={styles.priceLabel}>⏰ Expiry:</span>
                        <span className={styles.priceValue}>{formatExpiry(quote.expiry)}</span>
                    </div>
                </div>
            ) : (
                <div className={styles.error}>
                    ⚠️ Tidak bisa mengambil harga saat ini
                </div>
            )}

            <button
                className={styles.ctaButton}
                onClick={handleProtectClick}
                disabled={isLoading || !quote}
            >
                <span className={styles.ctaIcon}>🔒</span>
                Protect Next Trade
            </button>

            {/* What-If Simulator Toggle */}
            {quote && currentPrice && tokenSymbol && (
                <button
                    className={styles.simulatorToggle}
                    onClick={() => setShowSimulator(!showSimulator)}
                >
                    {showSimulator ? '▼' : '▶'} {showSimulator ? 'Hide' : 'Show'} What-If Simulator
                </button>
            )}

            {/* What-If Simulator */}
            {showSimulator && quote && currentPrice && tokenSymbol && (
                <WhatIfSimulator
                    currentPrice={currentPrice}
                    recommendedStrike={quote.strike}
                    recommendedPremium={quote.premium}
                    tokenSymbol={tokenSymbol}
                />
            )}

            <div className={styles.footer}>
                <span className={styles.poweredBy}>Powered by</span>
                <span className={styles.brand}>Thetanuts V4 🥜</span>
            </div>

            {/* CTA Modal */}
            {showCTAModal && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <span className={styles.modalIcon}>✅</span>
                        <p className={styles.modalText}>Feature coming soon!</p>
                        <p className={styles.modalSubtext}>Integration with Thetanuts platform in progress</p>
                    </div>
                </div>
            )}
        </div>
    );
}
