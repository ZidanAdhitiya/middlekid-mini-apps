import { TransactionDetails as TxDetails } from '../lib/tx-interpreter/txLookup';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './TransactionDetailsCard.module.css';

interface TransactionDetailsCardProps {
    transaction: TxDetails;
}

export default function TransactionDetailsCard({ transaction }: TransactionDetailsCardProps) {
    if (!transaction) return null;

    const { t, language } = useLanguage();

    // Helper functions
    const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    const getNetworkName = (chainId: number) => {
        const names: Record<number, string> = {
            1: 'Ethereum',
            8453: 'Base',
            137: 'Polygon',
            10: 'Optimism',
            42161: 'Arbitrum'
        };
        return names[chainId] || `Chain ${chainId}`;
    };

    const getStatusEmoji = (status: string) => {
        if (status === 'success') return '✅';
        if (status === 'failed') return '❌';
        return '⏳';
    };

    const getStatusText = (status: string) => {
        if (status === 'success') return t('transaction.status.success');
        if (status === 'failed') return t('transaction.status.failed');
        return t('transaction.status.pending');
    };

    const getStatusExplanation = (status: string) => {
        if (status === 'success') return t('transaction.status.successExplain');
        if (status === 'failed') return t('transaction.status.failedExplain');
        return t('transaction.status.pendingExplain');
    };

    const formatValue = (value: string) => {
        const eth = parseFloat(value) / 1e18;
        if (eth === 0) return '0 ETH';
        return `${eth.toFixed(6)} ETH`;
    };

    return (
        <div className={styles.container}>
            {/* Header: Simple Explanation */}
            <div className={styles.explainerCard}>
                <div className={styles.explainerIcon}>🔍</div>
                <div className={styles.explainerContent}>
                    <h3>{t('transaction.explainer.title')}</h3>
                    <p>{t('transaction.explainer.description')}</p>
                </div>
            </div>

            {/* Status Card */}
            <div className={`${styles.statusCard} ${styles[transaction.status]}`}>
                <div className={styles.statusHeader}>
                    <span className={styles.statusEmoji}>{getStatusEmoji(transaction.status)}</span>
                    <span className={styles.statusLabel}>{t('transaction.status.label')}</span>
                </div>
                <div className={styles.statusValue}>{getStatusText(transaction.status)}</div>
                <div className={styles.statusExplanation}>{getStatusExplanation(transaction.status)}</div>
            </div>

            {/* Main Details */}
            <div className={styles.detailsGrid}>
                {/* Nomor Resi (Hash) */}
                <div className={styles.detailCard}>
                    <div className={styles.detailLabel}>
                        📋 {t('transaction.fields.hash')}
                        <span className={styles.tooltip}>
                            {t('transaction.fields.hashTooltip')}
                        </span>
                    </div>
                    <div className={styles.detailValue}>
                        <code>{formatAddress(transaction.hash)}</code>
                        <button
                            className={styles.copyButton}
                            onClick={() => navigator.clipboard.writeText(transaction.hash)}
                            title={t('common.copy')}
                        >
                            📋 {t('common.copy')}
                        </button>
                    </div>
                </div>

                {/* Dari Siapa */}
                <div className={styles.detailCard}>
                    <div className={styles.detailLabel}>
                        👤 {t('transaction.fields.from')}
                        <span className={styles.tooltip}>
                            {t('transaction.fields.fromTooltip')}
                        </span>
                    </div>
                    <div className={styles.detailValue}>
                        <code>{formatAddress(transaction.from)}</code>
                        <a
                            href={`https://basescan.org/address/${transaction.from}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.linkButton}
                        >
                            🔗 {t('transaction.fields.viewProfile')}
                        </a>
                    </div>
                </div>

                {/* Ke Siapa */}
                <div className={styles.detailCard}>
                    <div className={styles.detailLabel}>
                        🎯 {t('transaction.fields.to')}
                        <span className={styles.tooltip}>
                            {t('transaction.fields.toTooltip')}
                        </span>
                    </div>
                    <div className={styles.detailValue}>
                        <code>{transaction.to ? formatAddress(transaction.to) : 'Contract Creation'}</code>
                        {transaction.to && (
                            <a
                                href={`https://basescan.org/address/${transaction.to}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.linkButton}
                            >
                                🔗 {t('transaction.fields.viewProfile')}
                            </a>
                        )}
                    </div>
                </div>

                {/* Berapa Uang yang Dikirim */}
                <div className={styles.detailCard}>
                    <div className={styles.detailLabel}>
                        💰 {t('transaction.fields.value')}
                        <span className={styles.tooltip}>
                            {t('transaction.fields.valueTooltip')}
                        </span>
                    </div>
                    <div className={styles.detailValue}>
                        <span className={styles.valueAmount}>{formatValue(transaction.value)}</span>
                    </div>
                    <div className={styles.detailHint}>
                        {transaction.value === '0' ?
                            t('transaction.hints.noValue') :
                            t('transaction.hints.valueNote')
                        }
                    </div>
                </div>

                {/* Block Number */}
                {transaction.blockNumber && (
                    <div className={styles.detailCard}>
                        <div className={styles.detailLabel}>
                            📦 {t('transaction.fields.blockNumber')}
                            <span className={styles.tooltip}>
                                {t('transaction.fields.blockTooltip')}
                            </span>
                        </div>
                        <div className={styles.detailValue}>
                            <span className={styles.blockNumber}>#{transaction.blockNumber.toLocaleString()}</span>
                        </div>
                        <div className={styles.detailHint}>
                            {t('transaction.hints.blockLocation', { number: transaction.blockNumber })}
                        </div>
                    </div>
                )}

                {/* Network */}
                <div className={styles.detailCard}>
                    <div className={styles.detailLabel}>
                        🌐 {t('transaction.fields.network')}
                        <span className={styles.tooltip}>
                            {t('transaction.fields.networkTooltip')}
                        </span>
                    </div>
                    <div className={styles.detailValue}>
                        <span className={styles.networkBadge}>{getNetworkName(transaction.chainId)}</span>
                    </div>
                    <div className={styles.detailHint}>
                        {t('transaction.hints.networkLocation', { network: getNetworkName(transaction.chainId) })}
                    </div>
                </div>
            </div>

            {/* Function Call Explanation */}
            {transaction.data && transaction.data !== '0x' && (
                <div className={styles.functionCard}>
                    <div className={styles.functionHeader}>
                        <span className={styles.functionIcon}>🔧</span>
                        <h3>{t('transaction.function.title')}</h3>
                    </div>
                    <div className={styles.functionExplanation}>
                        {transaction.functionName ? (
                            <>
                                <p>
                                    {t('transaction.function.known', { name: transaction.functionName })}
                                </p>
                                <p className={styles.analogy}>
                                    <strong>{t('transaction.function.analogy').split(':')[0]}:</strong> {t('transaction.function.analogy').split(':')[1]}
                                </p>
                            </>
                        ) : (
                            <>
                                <p>{t('transaction.function.unknown')}</p>
                                <p className={styles.warning}>
                                    <strong>{t('transaction.function.warningTitle')}</strong> {t('transaction.function.warning')}
                                </p>
                            </>
                        )}
                    </div>

                    <details className={styles.technicalDetails}>
                        <summary>{t('transaction.function.technicalDetails')}</summary>
                        <div className={styles.technicalContent}>
                            <p><strong>{t('transaction.function.inputData')}</strong></p>
                            <code className={styles.dataHex}>{transaction.data.slice(0, 100)}...</code>
                            <p className={styles.technicalNote}>
                                {t('transaction.function.inputNote')}
                            </p>
                        </div>
                    </details>
                </div>
            )}

            {/* Gas Fee Explanation */}
            {transaction.gasUsed && (
                <div className={styles.gasFeeCard}>
                    <div className={styles.gasFeeHeader}>
                        <span className={styles.gasFeeIcon}>⛽</span>
                        <h3>{t('transaction.gas.title')}</h3>
                    </div>
                    <div className={styles.gasFeeExplanation}>
                        <p>{t('transaction.gas.description')}</p>
                        <div className={styles.gasFeeAmount}>
                            <span className={styles.gasFeeValue}>{t('transaction.gas.used', { gas: transaction.gasUsed })}</span>
                        </div>
                        <p className={styles.gasNote}>{t('transaction.gas.note')}</p>
                    </div>
                </div>
            )}

            {/* Final Explorer Link */}
            <div className={styles.explorerCard}>
                <p>{t('transaction.explorer.question')}</p>
                <a
                    href={`https://basescan.org/tx/${transaction.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.explorerButton}
                >
                    {t('transaction.explorer.button')}
                </a>
                <p className={styles.explorerNote}>
                    {t('transaction.explorer.note')}
                </p>
            </div>
        </div>
    );
}
