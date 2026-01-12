import { WalletAnalysisReport } from '../lib/tx-interpreter/wallet-types';
import styles from './WalletReport.module.css';

interface WalletReportProps {
    report: WalletAnalysisReport;
    isPersonalWallet?: boolean; // Flag to indicate if this is user's connected wallet
}

export default function WalletReport({ report, isPersonalWallet = false }: WalletReportProps) {
    if (!report) return null;

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'critical': return '#ff3333';
            case 'high': return '#ff6b35';
            case 'medium': return '#ffa500';
            case 'low': return '#4ecdc4';
            case 'safe': return '#45b7d1';
            default: return '#888';
        }
    };

    const getWalletTypeLabel = (type: string) => {
        switch (type) {
            case 'BOT': return '🤖 Bot';
            case 'HUMAN': return '👤 Manusia';
            case 'EXCHANGE': return '🏦 Exchange';
            case 'CONTRACT': return '📜 Contract';
            default: return '❓ Tidak Diketahui';
        }
    };

    return (
        <div className={styles.container}>
            {/* Main Translation Card */}
            <div className={styles.heroCard} style={{ borderColor: getRiskColor(report.overallRisk) }}>
                <div className={styles.heroEmoji}>{report.humanTranslation.emoji}</div>
                <h2 className={styles.heroTitle}>{report.humanTranslation.title}</h2>
                <p className={styles.heroDescription}>{report.humanTranslation.description}</p>
                <div className={styles.heroAction}>
                    <strong>💡 Yang Harus Kamu Lakukan:</strong>
                    <p>{report.humanTranslation.action}</p>
                </div>
            </div>



            {/* Risk Score Bar */}
            <div className={styles.riskScore}>
                <div className={styles.riskHeader}>
                    <span>Skor Risiko</span>
                    <span className={styles.riskValue} style={{ color: getRiskColor(report.overallRisk) }}>
                        {report.riskScore}/100
                    </span>
                </div>
                <div className={styles.riskBar}>
                    <div
                        className={styles.riskFill}
                        style={{
                            width: `${report.riskScore}%`,
                            backgroundColor: getRiskColor(report.overallRisk)
                        }}
                    />
                </div>
                <div className={styles.riskLabel}>
                    {report.overallRisk.toUpperCase()}
                </div>
            </div>

            {/* Wallet Info Grid */}
            <div className={styles.infoGrid}>
                <div className={styles.infoCard}>
                    <div className={styles.infoIcon}>👤</div>
                    <div className={styles.infoLabel}>Tipe Wallet</div>
                    <div className={styles.infoValue}>{getWalletTypeLabel(report.walletType)}</div>
                </div>

                <div className={styles.infoCard}>
                    <div className={styles.infoIcon}>🎂</div>
                    <div className={styles.infoLabel}>Umur</div>
                    <div className={styles.infoValue}>{report.statistics.ageInDays} hari</div>
                </div>

                <div className={styles.infoCard}>
                    <div className={styles.infoIcon}>📊</div>
                    <div className={styles.infoLabel}>Total Transaksi</div>
                    <div className={styles.infoValue}>{report.statistics.totalTransactions.toLocaleString()}</div>
                </div>

                <div className={styles.infoCard}>
                    <div className={styles.infoIcon}>⚡</div>
                    <div className={styles.infoLabel}>Aktivitas/Hari</div>
                    <div className={styles.infoValue}>{report.statistics.averageTxPerDay.toFixed(1)}</div>
                </div>
            </div>

            {/* Bot Detection */}
            {report.botDetection.isBot && (
                <div className={styles.botAlert}>
                    <div className={styles.botHeader}>
                        <span className={styles.botIcon}>🤖</span>
                        <span className={styles.botTitle}>Bot Terdeteksi!</span>
                        <span className={styles.botConfidence}>
                            Keyakinan: {report.botDetection.confidence}%
                        </span>
                    </div>
                    <p className={styles.botReason}>{report.botDetection.reason}</p>

                    <div className={styles.botIndicators}>
                        {report.botDetection.indicators.highFrequency && (
                            <span className={styles.indicator}>📈 Frekuensi Tinggi</span>
                        )}
                        {report.botDetection.indicators.uniformTiming && (
                            <span className={styles.indicator}>⏱️ Waktu Teratur</span>
                        )}
                        {report.botDetection.indicators.mevActivity && (
                            <span className={styles.indicator}>⚡ MEV Activity</span>
                        )}
                        {report.botDetection.indicators.flashInteractions && (
                            <span className={styles.indicator}>💨 Flash Loan</span>
                        )}
                    </div>
                </div>
            )}

            {/* Security Checks */}
            <div className={styles.checksSection}>
                <h3>Pemeriksaan Keamanan</h3>
                <div className={styles.checksList}>
                    {report.checks.map((check, index) => (
                        <div
                            key={index}
                            className={`${styles.check} ${styles[check.status]}`}
                        >
                            <span className={styles.checkEmoji}>{check.emoji}</span>
                            <div className={styles.checkContent}>
                                <div className={styles.checkName}>{check.name}</div>
                                <div className={styles.checkMessage}>{check.message}</div>
                            </div>
                            <span className={`${styles.checkBadge} ${styles[check.severity]}`}>
                                {check.severity.toUpperCase()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>



            {/* Recommendations */}
            <div className={styles.recommendations}>
                <h3>💡 Rekomendasi</h3>
                <ul>
                    {report.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                    ))}
                </ul>
            </div>

            {/* Address Info */}
            <div className={styles.addressInfo}>
                <div className={styles.addressLabel}>Alamat Wallet:</div>
                <code className={styles.address}>{report.address}</code>
            </div>
        </div>
    );
}
