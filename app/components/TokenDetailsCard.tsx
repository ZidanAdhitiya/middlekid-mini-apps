import { TokenSecurityReport } from '../lib/tx-interpreter/security';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './TokenDetailsCard.module.css';

interface TokenDetailsCardProps {
    report: TokenSecurityReport;
    tokenAddress: string;
}

export default function TokenDetailsCard({ report, tokenAddress }: TokenDetailsCardProps) {
    if (!report) return null;

    const { t } = useLanguage();

    const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    const getRiskColor = (risk: string) => {
        if (risk === 'safe') return '#10b981';
        if (risk === 'low') return '#4ecdc4';
        if (risk === 'medium') return '#f59e0b';
        if (risk === 'high') return '#ef4444';
        if (risk === 'critical') return '#dc2626';
        return '#6b7280';
    };

    const getRiskLabel = (risk: string) => {
        if (risk === 'safe') return t('wallet.risk.safe'); // Reusing wallet risk labels as they are similar
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
                <div className={styles.explainerIcon}>🪙</div>
                <div className={styles.explainerContent}>
                    <h3>{t('token.explainer.title')}</h3>
                    <p>{t('token.explainer.description')}</p>
                </div>
            </div>

            {/* Token Identity */}
            <div className={styles.identityCard}>
                <div className={styles.identityHeader}>
                    <h2>💳 {t('token.info.title')}</h2>
                </div>

                <div className={styles.identityGrid}>
                    <div className={styles.identityItem}>
                        <div className={styles.identityLabel}>
                            📋 {t('token.info.address')}
                            <span className={styles.tooltip}>{t('token.info.addressTooltip')}</span>
                        </div>
                        <div className={styles.identityValue}>
                            <code>{formatAddress(tokenAddress)}</code>
                            <button
                                className={styles.copyButton}
                                onClick={() => navigator.clipboard.writeText(tokenAddress)}
                            >
                                📋 {t('common.copy')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Risk Assessment */}
            <div className={styles.riskCard} style={{ borderColor: getRiskColor(report.overallRisk) }}>
                <div className={styles.riskHeader}>
                    <h3>🛡️ {t('token.risk.title')}</h3>
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
                        <p><strong>{t('token.risk.status')}</strong></p>
                        <p>{report.summary}</p>

                        {report.overallRisk === 'critical' && (
                            <div className={styles.scamWarning}>
                                <strong>⚠️ {t('token.risk.dangerWarning')}</strong><br />
                                {t('token.risk.dangerMessage')}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Security Checks */}
            <div className={styles.flagsSection}>
                <h3>🔍 {t('token.checks.title')}</h3>
                <div className={styles.flagsList}>
                    {report.checks.length > 0 ? (
                        report.checks.map((check, index) => (
                            <div key={index} className={`${styles.flagCard} ${styles[check.severity]}`}>
                                <div className={styles.flagIcon}>
                                    {check.severity === 'critical' && '🔴'}
                                    {check.severity === 'high' && '🟠'}
                                    {check.severity === 'medium' && '🟡'}
                                    {check.severity === 'low' && '🟢'}
                                </div>
                                <div className={styles.flagContent}>
                                    <div className={styles.flagTitle}>{check.name}</div>
                                    <div className={styles.flagMessage}>{check.message}</div>
                                    {check.humanExplanation && (
                                        <div className={styles.flagExplanation}>
                                            <strong>{t('token.checks.meaning')}</strong> {check.humanExplanation}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.noFlags}>
                            <div className={styles.noFlagsIcon}>✅</div>
                            <p>{t('token.checks.noIssues')}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Beginner Explanation Sections */}
            <div className={styles.explanationsSection}>
                <h3>📚 {t('token.education.title')}</h3>

                <details className={styles.explanationItem}>
                    <summary>🤔 {t('token.education.honeypot.question')}</summary>
                    <div className={styles.explanationContent}>
                        <p>{t('token.education.honeypot.answer1')}</p>
                        <p>{t('token.education.honeypot.answer2')}</p>
                    </div>
                </details>

                <details className={styles.explanationItem}>
                    <summary>💸 {t('token.education.tax.question')}</summary>
                    <div className={styles.explanationContent}>
                        <p>{t('token.education.tax.answer1')}</p>
                        <p>{t('token.education.tax.answer2')}</p>
                    </div>
                </details>

                <details className={styles.explanationItem}>
                    <summary>🔐 {t('token.education.verified.question')}</summary>
                    <div className={styles.explanationContent}>
                        <p>{t('token.education.verified.answer1')}</p>
                        <p>{t('token.education.verified.answer2')}</p>
                    </div>
                </details>

                <details className={styles.explanationItem}>
                    <summary>👥 {t('token.education.holders.question')}</summary>
                    <div className={styles.explanationContent}>
                        <p>{t('token.education.holders.answer1')}</p>
                        <p>{t('token.education.holders.answer2')}</p>
                    </div>
                </details>
            </div>

            {/* Recommendations */}
            {report.recommendations.length > 0 && (
                <div className={styles.recommendationsCard}>
                    <div className={styles.recommendationsHeader}>
                        <span className={styles.recommendationsIcon}>💡</span>
                        <h3>{t('token.recommendations.title')}</h3>
                    </div>
                    <ul className={styles.recommendationsList}>
                        {report.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Explorer Link */}
            <div className={styles.explorerCard}>
                <p>{t('token.explorer.question')}</p>
                <a
                    href={`https://basescan.org/token/${tokenAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.explorerButton}
                >
                    🔍 {t('token.explorer.button')}
                </a>
                <p className={styles.explorerNote}>
                    {t('token.explorer.note')}
                </p>
            </div>
        </div>
    );
}
