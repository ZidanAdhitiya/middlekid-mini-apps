'use client';

import { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
    ResponsiveContainer,
    Area,
    ComposedChart
} from 'recharts';
import {
    generatePayoffCurve,
    calculateBreakeven,
    calculateMaxLoss,
    formatCurrency,
    formatPrice,
    type OptionsParameters
} from '../lib/options/options-calculator';
import styles from './WhatIfSimulator.module.css';

interface WhatIfSimulatorProps {
    currentPrice: number;
    recommendedStrike: number;
    recommendedPremium: number;
    tokenSymbol: string;
}

export default function WhatIfSimulator({
    currentPrice,
    recommendedStrike,
    recommendedPremium,
    tokenSymbol
}: WhatIfSimulatorProps) {
    // State for adjustable parameters
    const [strikePrice, setStrikePrice] = useState(recommendedStrike);
    const [daysToExpiry, setDaysToExpiry] = useState(30);
    const [contracts, setContracts] = useState(1);
    const [premium, setPremium] = useState(recommendedPremium);

    // Calculated values
    const [payoffData, setPayoffData] = useState<any[]>([]);
    const [breakeven, setBreakeven] = useState(0);
    const [maxLoss, setMaxLoss] = useState(0);
    const [profitAt2x, setProfitAt2x] = useState(0);

    // Recalculate when parameters change
    useEffect(() => {
        const params: OptionsParameters = {
            currentPrice,
            strikePrice,
            premium,
            daysToExpiry,
            contracts
        };

        // Generate payoff curve
        const curve = generatePayoffCurve(params);

        // Format for recharts
        const chartData = curve.map(point => ({
            price: point.price,
            profit: point.profit,
            priceLabel: formatPrice(point.price),
            isBreakeven: point.isBreakeven,
            isCurrent: point.isCurrent
        }));

        setPayoffData(chartData);

        // Calculate key metrics
        setBreakeven(calculateBreakeven(strikePrice, premium));
        setMaxLoss(calculateMaxLoss(premium, contracts));

        // Profit if price doubles
        const doublePrice = currentPrice * 2;
        const profitAt2x = Math.max(doublePrice - strikePrice, 0) - premium;
        setProfitAt2x(profitAt2x * contracts);

    }, [currentPrice, strikePrice, premium, daysToExpiry, contracts]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>🔮 What If... You Bought Protection?</h3>
                <p className={styles.subtitle}>
                    Adjust parameters to see how your profit/loss changes
                </p>
            </div>

            {/* Controls */}
            <div className={styles.controls}>
                <div className={styles.control}>
                    <label className={styles.label}>
                        Strike Price: <span className={styles.value}>{formatPrice(strikePrice)}</span>
                    </label>
                    <input
                        type="range"
                        className={styles.slider}
                        min={currentPrice * 0.8}
                        max={currentPrice * 1.2}
                        step={currentPrice * 0.01}
                        value={strikePrice}
                        onChange={(e) => setStrikePrice(Number(e.target.value))}
                    />
                    <div className={styles.range}>
                        <span>{formatPrice(currentPrice * 0.8)}</span>
                        <span>{formatPrice(currentPrice * 1.2)}</span>
                    </div>
                </div>

                <div className={styles.control}>
                    <label className={styles.label}>
                        Days to Expiry: <span className={styles.value}>{daysToExpiry} days</span>
                    </label>
                    <input
                        type="range"
                        className={styles.slider}
                        min={7}
                        max={90}
                        step={1}
                        value={daysToExpiry}
                        onChange={(e) => setDaysToExpiry(Number(e.target.value))}
                    />
                    <div className={styles.range}>
                        <span>7 days</span>
                        <span>90 days</span>
                    </div>
                </div>

                <div className={styles.control}>
                    <label className={styles.label}>
                        Contracts: <span className={styles.value}>{contracts}</span>
                    </label>
                    <input
                        type="range"
                        className={styles.slider}
                        min={1}
                        max={10}
                        step={1}
                        value={contracts}
                        onChange={(e) => setContracts(Number(e.target.value))}
                    />
                    <div className={styles.range}>
                        <span>1</span>
                        <span>10</span>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className={styles.metrics}>
                <div className={styles.metric}>
                    <div className={styles.metricIcon}>💰</div>
                    <div className={styles.metricContent}>
                        <div className={styles.metricLabel}>If {tokenSymbol} Doubles</div>
                        <div className={styles.metricValue} style={{ color: profitAt2x > 0 ? '#10b981' : '#ef4444' }}>
                            {formatCurrency(profitAt2x)}
                        </div>
                    </div>
                </div>

                <div className={styles.metric}>
                    <div className={styles.metricIcon}>⚖️</div>
                    <div className={styles.metricContent}>
                        <div className={styles.metricLabel}>Breakeven Price</div>
                        <div className={styles.metricValue}>{formatPrice(breakeven)}</div>
                    </div>
                </div>

                <div className={styles.metric}>
                    <div className={styles.metricIcon}>📉</div>
                    <div className={styles.metricContent}>
                        <div className={styles.metricLabel}>Max Loss</div>
                        <div className={styles.metricValue} style={{ color: '#ef4444' }}>
                            {formatCurrency(-maxLoss)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className={styles.chartContainer}>
                <h4 className={styles.chartTitle}>Profit/Loss at Different Prices</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={payoffData}>
                        <defs>
                            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis
                            dataKey="priceLabel"
                            stroke="rgba(255,255,255,0.5)"
                            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                        />
                        <YAxis
                            stroke="rgba(255,255,255,0.5)"
                            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                            tickFormatter={(value) => formatCurrency(value)}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(0,0,0,0.9)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                borderRadius: '8px',
                                color: '#fff'
                            }}
                            formatter={(value: any) => [formatCurrency(value), 'P&L']}
                            labelFormatter={(label) => `Price: ${label}`}
                        />
                        <ReferenceLine
                            y={0}
                            stroke="rgba(255,255,255,0.3)"
                            strokeDasharray="3 3"
                        />
                        <ReferenceLine
                            x={formatPrice(currentPrice)}
                            stroke="#fbbf24"
                            strokeDasharray="5 5"
                            label={{ value: 'Current', fill: '#fbbf24', position: 'top' }}
                        />
                        <ReferenceLine
                            x={formatPrice(breakeven)}
                            stroke="#10b981"
                            strokeDasharray="5 5"
                            label={{ value: 'Breakeven', fill: '#10b981', position: 'top' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="profit"
                            stroke="none"
                            fill="url(#colorProfit)"
                        />
                        <Line
                            type="monotone"
                            dataKey="profit"
                            stroke="#10b981"
                            strokeWidth={3}
                            dot={false}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            <div className={styles.hint}>
                💡 <strong>Tip:</strong> Adjust sliders to see how different strike prices and expiry dates affect your potential profit!
            </div>
        </div>
    );
}
