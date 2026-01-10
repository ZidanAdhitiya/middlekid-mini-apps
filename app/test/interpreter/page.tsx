'use client';

import { useState } from 'react';
import { WalletAnalysisReport } from '@/lib/tx-interpreter/wallet-types';
import styles from './page.module.css';

export default function InterpreterTestPage() {
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<WalletAnalysisReport | null>(null);

    const generateRandom = () => {
        const chars = '0123456789abcdef';
        let addr = '0x';
        for (let i = 0; i < 40; i++) {
            addr += chars[Math.floor(Math.random() * 16)];
        }
        setAddress(addr);
    };

    const analyze = async () => {
        if (!address) return;
        setLoading(true);
        setReport(null);
        try {
            const res = await fetch(`/api/test/interpreter?address=${address}`);
            const data = await res.json();
            setReport(data);
        } catch (e) {
            console.error(e);
            alert('Failed to analyze');
        } finally {
            setLoading(false);
        }
    };

    const getRiskClass = (risk: string) => {
        if (risk === 'safe' || risk === 'low') return 'safe';
        if (risk === 'high' || risk === 'critical') return 'danger';
        return 'warning';
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <h1 className="gradient-text">Interpreter Testing</h1>
                    <p>Test the Wallet Security Analyzer interpretation logic.</p>
                </div>

                <div className={`glass ${styles.inputCard}`}>
                    <label>Wallet Address</label>
                    <div className={styles.inputRow}>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="0x..."
                            className={styles.input}
                        />
                        <button
                            onClick={generateRandom}
                            className={`${styles.button} ${styles.buttonSecondary}`}
                        >
                            Random
                        </button>
                        <button
                            onClick={analyze}
                            disabled={loading || !address}
                            className={`${styles.button} ${styles.buttonPrimary}`}
                        >
                            {loading ? 'Analyzing...' : 'Analyze'}
                        </button>
                    </div>
                </div>

                {report && (
                    <div className={styles.results}>
                        {/* Human Translation Card */}
                        <div className={`glass ${styles.translationCard} ${styles[getRiskClass(report.overallRisk)]}`}>
                            <div className={styles.emoji}>{report.humanTranslation.emoji}</div>
                            <div className={styles.translationContent}>
                                <h2>{report.humanTranslation.title}</h2>
                                <p>{report.humanTranslation.description}</p>
                                <div className={styles.actionBox}>
                                    <span className={styles.actionLabel}>Action: </span>
                                    {report.humanTranslation.action}
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className={styles.statsGrid}>
                            <div className={`glass ${styles.statCard}`}>
                                <h3>RISK SCORE</h3>
                                <div className={styles.statValue}>{report.riskScore}/100</div>
                                <div className={`${styles.statSubtext} ${styles[getRiskClass(report.overallRisk)]}`}>
                                    {report.overallRisk}
                                </div>
                            </div>

                            <div className={`glass ${styles.statCard}`}>
                                <h3>HEALTH SCORE (Gamified)</h3>
                                <div className={`${styles.statValue} gradient-text`}>{report.healthScore.score}</div>
                                <div className={`${styles.statSubtext} ${styles.secondary}`}>
                                    Level {report.healthScore.level} • {report.healthScore.rank}
                                </div>
                            </div>
                        </div>

                        {/* Raw JSON */}
                        <div className={`glass ${styles.rawCard}`}>
                            <h3>RAW REPORT DATA</h3>
                            <pre>
                                {JSON.stringify(report, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
