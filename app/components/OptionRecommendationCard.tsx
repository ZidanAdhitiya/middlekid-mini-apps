'use client';

import { useEffect, useState } from 'react';
import type { StrategyRecommendation } from '../lib/options/strategy-mapper';
import type { ThetanutsQuote } from '../lib/options/thetanuts-pricing';
import { formatPremium, formatExpiry } from '../lib/options/thetanuts-pricing';
import WhatIfSimulator from './WhatIfSimulator';
import { PaymentModal } from './PaymentModal';
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
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showSimulator, setShowSimulator] = useState(false);
    const [purchaseSuccess, setPurchaseSuccess] = useState(false);
    const [txHash, setTxHash] = useState('');

    const handleProtectClick = () => {
        console.log('🔒 Protect Next Trade clicked');
        console.log('Strategy:', strategy);
        console.log('Quote:', quote);

        // Show payment modal
        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = (hash: string) => {
        console.log('✅ Payment successful:', hash);
        setTxHash(hash);
        setPurchaseSuccess(true);
        setShowPaymentModal(false);
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

            {/* Payment Modal */}
            {showPaymentModal && quote && currentPrice && tokenSymbol && (
                <PaymentModal
                    quote={quote}
                    tokenSymbol={tokenSymbol}
                    currentPrice={currentPrice}
                    onClose={() => setShowPaymentModal(false)}
                    onSuccess={handlePaymentSuccess}
                />
            )}

            {/* Purchase Success Banner */}
            {purchaseSuccess && txHash && (
                <div className={styles.successBanner}>
                    <div className={styles.successIcon}>✅</div>
                    <div>
                        <div className={styles.successText}>Protection Activated!</div>
                        <div className={styles.successSubtext}>
                            Your {tokenSymbol} position is now protected
                        </div>
                    </div>
                    <a
                        href={`https://sepolia.basescan.org/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.successLink}
                    >
                        View TX ↗
                    </a>
                </div>
            )}
        </div>
    );
}
