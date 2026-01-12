import { WalletAnalysisReport } from '../lib/tx-interpreter/wallet-types';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './WalletDetailsCard.module.css';

interface WalletDetailsCardProps {
    report: WalletAnalysisReport;
    isPersonalWallet?: boolean;
}

export default function WalletDetailsCard({ report, isPersonalWallet = false }: WalletDetailsCardProps) {
    if (!report) return null;

    const { t, language } = useLanguage();

    const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    const getWalletTypeEmoji = (type: string) => {
        if (type === 'BOT') return '🤖';
        if (type === 'HUMAN') return '👤';
        if (type === 'EXCHANGE') return '🏦';
        return '❓';
    };

    const getWalletTypeLabel = (type: string) => {
        if (type === 'BOT') return t('wallet.types.bot');
        if (type === 'HUMAN') return t('wallet.types.human');
        if (type === 'EXCHANGE') return t('wallet.types.exchange');
        return t('wallet.types.unknown');
    };

    const getRiskColor = (risk: string) => {
        if (risk === 'safe') return '#10b981';
        if (risk === 'low') return '#4ecdc4';
        if (risk === 'medium') return '#f59e0b';
        if (risk === 'high') return '#ef4444';
        if (risk === 'critical') return '#dc2626';
        return '#6b7280';
    };

    const getRiskLabel = (risk: string) => {
        if (risk === 'safe') return t('wallet.risk.safe');
        if (risk === 'low') return t('wallet.risk.low');
        if (risk === 'medium') return t('wallet.risk.medium');
        if (risk === 'high') return t('wallet.risk.high');
        if (risk === 'critical') return t('wallet.risk.critical');
        return t('wallet.types.unknown');
    };

    return (
        <div className={styles.container}>
            {/* Explainer Card */}
            <div className={styles.explainerCard}>
                <div className={styles.explainerIcon}>👛</div>
                <div className={styles.explainerContent}>
                    <h3>{t('wallet.explainer.title')}</h3>
                    <p>{t('wallet.explainer.description')}</p>
                </div>
            </div>

            {/* Wallet Identity Card */}
            <div className={styles.identityCard}>
                <div className={styles.identityHeader}>
                    <h2>
                        {getWalletTypeEmoji(report.walletType)} {t('wallet.profile.title')}
                        {isPersonalWallet && <span className={styles.personalBadge}>📌 {t('wallet.profile.personal')}</span>}
                    </h2>
                </div>

                <div className={styles.identityGrid}>
                    <div className={styles.identityItem}>
                        <div className={styles.identityLabel}>
                            📋 {t('wallet.fields.address')}
                            <span className={styles.tooltip}>{t('wallet.fields.addressTooltip')}</span>
                        </div>
                        <div className={styles.identityValue}>
                            <code>{formatAddress(report.address)}</code>
                            <button
                                className={styles.copyButton}
                                onClick={() => navigator.clipboard.writeText(report.address)}
                            >
                                📋 {t('common.copy')}
                            </button>
                        </div>
                    </div>

                    <div className={styles.identityItem}>
                        <div className={styles.identityLabel}>
                            👥 {t('wallet.fields.type')}
                            <span className={styles.tooltip}>{t('wallet.fields.typeTooltip')}</span>
                        </div>
                        <div className={styles.identityValue}>
                            <span className={styles.walletTypeBadge}>
                                {getWalletTypeEmoji(report.walletType)} {getWalletTypeLabel(report.walletType)}
                            </span>
                        </div>
                        <div className={styles.identityHint}>
                            {report.walletType === 'HUMAN' && t('wallet.types.human')}
                            {report.walletType === 'BOT' && t('wallet.types.bot')}
                            {report.walletType === 'EXCHANGE' && t('wallet.types.exchange')}
                        </div>
                    </div>

                    <div className={styles.identityItem}>
                        <div className={styles.identityLabel}>
                            🎂 {t('wallet.fields.age')}
                            <span className={styles.tooltip}>{t('wallet.fields.ageTooltip')}</span>
                        </div>
                        <div className={styles.identityValue}>
                            <span className={styles.ageValue}>{report.statistics.ageInDays} {language === 'id' ? 'hari' : 'days'}</span>
                        </div>
                        <div className={styles.identityHint}>
                            {report.statistics.ageInDays < 7 && t('wallet.ageHints.newWallet')}
                            {report.statistics.ageInDays >= 7 && report.statistics.ageInDays < 30 && t('wallet.ageHints.youngWallet')}
                            {report.statistics.ageInDays >= 30 && report.statistics.ageInDays < 365 && t('wallet.ageHints.matureWallet')}
                            {report.statistics.ageInDays >= 365 && t('wallet.ageHints.veteranWallet')}
                        </div>
                    </div>

                    <div className={styles.identityItem}>
                        <div className={styles.identityLabel}>
                            📊 {t('wallet.fields.totalTx')}
                            <span className={styles.tooltip}>{t('wallet.fields.totalTxTooltip')}</span>
                        </div>
                        <div className={styles.identityValue}>
                            <span className={styles.txValue}>{report.statistics.totalTransactions.toLocaleString()}</span>
                        </div>
                        <div className={styles.identityHint}>
                            {t('wallet.txHint', { avg: report.statistics.averageTxPerDay.toFixed(1) })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Risk Score Card */}
            <div className={styles.riskCard} style={{ borderColor: getRiskColor(report.overallRisk) }}>
                <div className={styles.riskHeader}>
                    <h3>🛡️ {t('wallet.risk.title')}</h3>
                </div>
                <div className={styles.riskContent}>
                    <div className={styles.riskScoreDisplay}>
                        <div className={styles.riskScoreCircle} style={{ borderColor: getRiskColor(report.overallRisk) }}>
                            <span className={styles.riskScoreValue} style={{ color: getRiskColor(report.overallRisk) }}>
                                {report.riskScore}
                            </span>
                            <span className={styles.riskScoreMax}>/100</span>
                        </div>
                        <div className={styles.riskLabel} style={{ color: getRiskColor(report.overallRisk) }}>
                            {getRiskLabel(report.overallRisk)}
                        </div>
                    </div>
                    <div className={styles.riskExplanation}>
                        <p><strong>{t('wallet.risk.meaning')}</strong></p>
                        <p>{report.humanTranslation.description}</p>
                        <p className={styles.riskAction}>
                            <strong>💡 {t('wallet.risk.action')}</strong><br />
                            {report.humanTranslation.action}
                        </p>
                    </div>
                </div>
            </div>

            {/* Bot Detection Card */}
            {report.botDetection.isBot && (
                <div className={styles.botCard}>
                    <div className={styles.botHeader}>
                        <span className={styles.botIcon}>🤖</span>
                        <h3>{t('wallet.bot.title')}</h3>
                    </div>
                    <div className={styles.botContent}>
                        <div className={styles.botConfidence}>
                            {t('wallet.bot.confidence', { percent: report.botDetection.confidence })}
                        </div>
                        <p>{report.botDetection.reason}</p>
                        <div className={styles.botIndicators}>
                            {report.botDetection.indicators.highFrequency &&
                                <span className={styles.indicator}>{t('wallet.bot.indicators.highFrequency')}</span>}
                            {report.botDetection.indicators.uniformTiming &&
                                <span className={styles.indicator}>{t('wallet.bot.indicators.uniformTiming')}</span>}
                            {report.botDetection.indicators.mevActivity &&
                                <span className={styles.indicator}>{t('wallet.bot.indicators.mevActivity')}</span>}
                        </div>
                        <div className={styles.botExplanation}>
                            <p><strong>{t('wallet.bot.whatIsBot')}</strong></p>
                            <p>{t('wallet.bot.botExplanation')}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Security Checks */}
            <div className={styles.checksSection}>
                <h3>🔍 {t('wallet.security.title')}</h3>
                <div className={styles.checksList}>
                    {report.checks.map((check, index) => (
                        <div key={index} className={`${styles.checkCard} ${styles[check.status]} `}>
                            <div className={styles.checkIcon}>{check.emoji}</div>
                            <div className={styles.checkContent}>
                                <div className={styles.checkName}>{check.name}</div>
                                <div className={styles.checkMessage}>{check.message}</div>
                            </div>
                            <div className={`${styles.checkBadge} ${styles[check.severity]} `}>
                                {check.severity === 'critical' && t('wallet.security.severity.critical')}
                                {check.severity === 'high' && t('wallet.security.severity.high')}
                                {check.severity === 'medium' && t('wallet.security.severity.medium')}
                                {check.severity === 'low' && t('wallet.security.severity.low')}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recommendations */}
            <div className={styles.recommendationsCard}>
                <div className={styles.recommendationsHeader}>
                    <span className={styles.recommendationsIcon}>💡</span>
                    <h3>{t('wallet.recommendations.title')}</h3>
                </div>
                <ul className={styles.recommendationsList}>
                    {report.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                    ))}
                </ul>
            </div>

            {/* Explorer Link */}
            <div className={styles.explorerCard}>
                <p>{t('wallet.explorer.question')}</p>
                <a
                    href={`https://basescan.org/address/${report.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.explorerButton}
                >
                    🔍 {t('wallet.explorer.button')}
                </a >
                <p className={styles.explorerNote}>
                    {t('wallet.explorer.note')}
                </p>
            </div>
        </div >
    );
}
