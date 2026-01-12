'use client';

import { TranslatedWarning } from '../lib/tx-interpreter/types';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './WarningTranslation.module.css';

interface WarningTranslationProps {
    warnings: TranslatedWarning[];
}

export default function WarningTranslation({ warnings }: WarningTranslationProps) {
    const { t } = useLanguage();

    if (warnings.length === 0) {
        return (
            <div className={`${styles.container} glass`}>
                <div className={styles.empty}>
                    <svg className={styles.emptyIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>{t('warningTranslation.empty')}</p>
                </div>
            </div>
        );
    }

    const getSeverityLabel = (severity: TranslatedWarning['severity']) => {
        switch (severity) {
            case 'warning': return t('warningTranslation.severity.warning');
            case 'caution': return t('warningTranslation.severity.caution');
            case 'info': return t('warningTranslation.severity.info');
            default: return severity;
        }
    };

    const getSeverityColor = (severity: TranslatedWarning['severity']) => {
        switch (severity) {
            case 'warning': return styles.warning;
            case 'caution': return styles.caution;
            case 'info': return styles.info;
            default: return '';
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('warningTranslation.title')}
            </h2>

            <div className={styles.warnings}>
                {warnings.map((warning, index) => (
                    <div key={index} className={`${styles.warningCard} glass ${getSeverityColor(warning.severity)}`}>
                        <div className={styles.warningHeader}>
                            <h3 className={styles.warningTitle}>{warning.title}</h3>
                            <span className={`${styles.badge} ${styles[warning.severity]}`}>
                                {getSeverityLabel(warning.severity)}
                            </span>
                        </div>

                        <div className={styles.warningContent}>
                            <div className={styles.section}>
                                <h4>{t('warningTranslation.whatHappened')}</h4>
                                <p dangerouslySetInnerHTML={{ __html: warning.explanation }} />
                            </div>

                            <div className={styles.section}>
                                <h4>{t('warningTranslation.impact')}</h4>
                                <p>{warning.impact}</p>
                            </div>

                            {warning.technicalDetails && (
                                <details className={styles.technical}>
                                    <summary>{t('warningTranslation.technicalDetails')}</summary>
                                    <code>{warning.technicalDetails}</code>
                                </details>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.disclaimer}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p>
                    {t('warningTranslation.disclaimer')}
                </p>
            </div>
        </div>
    );
}
