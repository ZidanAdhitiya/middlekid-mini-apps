'use client';

import { SecurityCheck, TokenSecurityReport } from '../lib/tx-interpreter/security';
import styles from './SecurityReport.module.css';

interface SecurityReportProps {
    report: TokenSecurityReport | null;
    tokenAddress?: string;
}

export default function SecurityReport({ report, tokenAddress }: SecurityReportProps) {
    if (!report) return null;

    const getRiskColor = (risk: TokenSecurityReport['overallRisk']) => {
        switch (risk) {
            case 'critical': return styles.critical;
            case 'high': return styles.high;
            case 'medium': return styles.medium;
            case 'low': return styles.low;
            case 'safe': return styles.safe;
        }
    };

    const getStatusIcon = (status: SecurityCheck['status']) => {
        switch (status) {
            case 'pass': return '✅';
            case 'fail': return '❌';
            case 'warning': return '⚠️';
            case 'unknown': return '❓';
        }
    };

    return (
        <div className={`${styles.container} glass`}>
            <h2 className={styles.title}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Analisis Keamanan Token
            </h2>

            {/* Overall Risk Score */}
            <div className={`${styles.riskCard} ${getRiskColor(report.overallRisk)}`}>
                <div className={styles.riskHeader}>
                    <div>
                        <div className={styles.riskLabel}>Tingkat Risiko</div>
                        <div className={styles.riskLevel}>{report.overallRisk.toUpperCase()}</div>
                    </div>
                    <div className={styles.riskScore}>
                        <div className={styles.scoreNumber}>{report.riskScore}</div>
                        <div className={styles.scoreLabel}>/100</div>
                    </div>
                </div>
                <p className={styles.summary}>{report.summary}</p>
            </div>

            {/* Security Checks */}
            <div className={styles.checksSection}>
                <h3>Pemeriksaan Keamanan</h3>
                <div className={styles.checks}>
                    {report.checks.map((check, index) => (
                        <div
                            key={index}
                            className={`${styles.checkItem} ${styles[check.status]}`}
                        >
                            <div className={styles.checkHeader}>
                                <span className={styles.checkIcon}>{getStatusIcon(check.status)}</span>
                                <span className={styles.checkName}>{check.name}</span>
                                <span className={`${styles.severityBadge} ${styles[check.severity]}`}>
                                    {check.severity === 'low' ? 'RENDAH' :
                                        check.severity === 'medium' ? 'SEDANG' :
                                            check.severity === 'high' ? 'TINGGI' : 'KRITIS'}
                                </span>
                            </div>
                            <p className={styles.checkMessage}>{check.message}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recommendations */}
            {report.recommendations.length > 0 && (
                <div className={styles.recommendations}>
                    <h3>
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Rekomendasi
                    </h3>
                    <ul>
                        {report.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Disclaimer */}
            <div className={styles.disclaimer}>
                <strong>⚠️ Disclaimer:</strong> Analisis ini menggunakan data yang tersedia dan algoritma.
                Ini BUKAN jaminan 100%. Tetap lakukan riset sendiri (DYOR) sebelum invest.
            </div>
        </div>
    );
}
