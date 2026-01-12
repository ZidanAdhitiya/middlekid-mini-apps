'use client';

import { useState, useEffect } from 'react';
import TransactionInput from '../components/TransactionInput';
import WarningTranslation from '../components/WarningTranslation';
import WalletDetailsCard from '../components/WalletDetailsCard';
import TokenDetailsCard from '../components/TokenDetailsCard';
import TransactionDetailsCard from '../components/TransactionDetailsCard';
import { ConnectWalletButton, useWallet } from '../components/ConnectWalletButton';
import { txInterpreter } from '../lib/tx-interpreter/engine';
import { TranslatedWarning } from '../lib/tx-interpreter/types';
import { fetchRecentTransactions, FetchedTransaction } from '../lib/tx-interpreter/fetcher';
import { tokenSecurityAnalyzer, TokenSecurityReport } from '../lib/tx-interpreter/security';
import { walletSecurityAnalyzer } from '../lib/tx-interpreter/wallet-analyzer';
import { WalletAnalysisReport } from '../lib/tx-interpreter/wallet-types';
import { detectInputType, InputType } from '../lib/tx-interpreter/address-detector';
import { TransactionDetails } from '../lib/tx-interpreter/txLookup';
import { alchemyAPI } from '../lib/alchemy';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './page.module.css';

// Humanized Loading Messages Keys
const LOADING_MSG_KEYS = [
    'interpreter.loading.messages.0',
    'interpreter.loading.messages.1',
    'interpreter.loading.messages.2',
    'interpreter.loading.messages.3',
    'interpreter.loading.messages.4',
    'interpreter.loading.messages.5',
    'interpreter.loading.messages.6',
    'interpreter.loading.messages.7'
];

export default function InterpreterPage() {
    const { t } = useLanguage();
    const [warnings, setWarnings] = useState<TranslatedWarning[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [fetchedTxs, setFetchedTxs] = useState<FetchedTransaction[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<string>('');
    const [securityReport, setSecurityReport] = useState<TokenSecurityReport | null>(null);
    const [walletReport, setWalletReport] = useState<WalletAnalysisReport | null>(null);
    const [txDetails, setTxDetails] = useState<TransactionDetails | null>(null);
    const [inputType, setInputType] = useState<InputType | null>(null);
    const [loadingMessage, setLoadingMessage] = useState<string>('');

    // Get connected wallet
    const { address: connectedAddress, isConnected } = useWallet();

    // Auto-analyze connected wallet
    useEffect(() => {
        if (isConnected && connectedAddress && !isAnalyzing) {
            console.log('✅ Wallet connected, auto-analyzing:', connectedAddress);
            handleAddressSubmit(connectedAddress);
        }
    }, [connectedAddress, isConnected]);

    const handleAnalyze = async (data: string) => {
        setIsAnalyzing(true);

        try {
            // Parse input
            const parsed = JSON.parse(data);

            // Interpret transaction
            const result = await txInterpreter.interpret(parsed);

            // Set warnings
            setWarnings(result.translations);
            setFetchedTxs([]);
        } catch (error) {
            console.error('Analysis error:', error);
            alert(t('interpreter.errors.invalidData'));
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAddressSubmit = async (address: string) => {
        setIsAnalyzing(true);
        setSelectedAddress(address);

        // Reset all reports
        setSecurityReport(null);
        setWalletReport(null);
        setFetchedTxs([]);
        setWarnings([]);

        // Set random loading message
        const randomKey = LOADING_MSG_KEYS[Math.floor(Math.random() * LOADING_MSG_KEYS.length)];
        setLoadingMessage(t(randomKey));

        try {
            // Step 1: Detect input type (WALLET, TOKEN_CONTRACT, or TRANSACTION)
            const detection = await detectInputType(address);
            setInputType(detection.type);

            console.log('🔍 Input detected as:', detection.type, '- Confidence:', detection.confidence + '%');
            console.log('📝 Reason:', detection.reason);

            // Step 2: Route to appropriate analyzer
            if (detection.type === 'WALLET') {
                // Analyze as WALLET
                setLoadingMessage(t('interpreter.loading.wallet'));
                const walletAnalysis = await walletSecurityAnalyzer.analyzeWallet(address, t);
                setWalletReport(walletAnalysis);

            } else if (detection.type === 'TOKEN_CONTRACT') {
                // Analyze as TOKEN
                setLoadingMessage(t('interpreter.loading.token'));
                const security = await tokenSecurityAnalyzer.analyzeToken(address, t);
                setSecurityReport(security);

                // Try to fetch recent transactions (optional)
                try {
                    const transactions = await fetchRecentTransactions(address);
                    if (transactions.length > 0) {
                        setFetchedTxs(transactions);

                        // Analyze first transaction as example
                        const firstTx = transactions[0];
                        const result = await txInterpreter.interpret({
                            to: firstTx.to || undefined,
                            from: firstTx.from,
                            data: firstTx.data,
                            value: firstTx.value
                        });

                        setWarnings(result.translations);
                    }
                } catch (txError) {
                    console.log('No transactions found, showing security report only');
                }

            } else if (detection.type === 'TRANSACTION') {
                // Handle transaction hash - call the existing handler
                console.log('📜 Detected as transaction hash, routing to tx analyzer...');
                setIsAnalyzing(false); // Reset since handleTxHashSubmit will set it again

                // Call the handleTxHashSubmit function (it already exists!)
                await handleTxHashSubmit(address);
                return;

            } else {
                // Invalid input
                alert(t('interpreter.errors.invalidInput'));
                setIsAnalyzing(false);
                return;
            }

        } catch (error) {
            console.error('Analysis error:', error);
            alert(t('interpreter.errors.analysisFailed'));
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleTxHashSubmit = async (hash: string, chainId?: number) => {
        setIsAnalyzing(true);
        setFetchedTxs([]);
        setSecurityReport(null);
        setWarnings([]);
        // IMPORTANT: Clear wallet state to prevent showing wallet analysis
        setWalletReport(null);
        setTxDetails(null); // Clear previous tx details
        setInputType('TRANSACTION'); // Set type immediately

        try {
            // Fetch transaction details by hash
            const { fetchTransactionByHash } = await import('../lib/tx-interpreter/txLookup');
            const txDetails = await fetchTransactionByHash(hash, chainId);

            if (!txDetails) {
                // Show more helpful error
                const networkName = chainId === 8453 ? 'Base' :
                    chainId === 1 ? 'Ethereum' :
                        chainId === 137 ? 'Polygon' :
                            chainId === 10 ? 'Optimism' :
                                chainId === 42161 ? 'Arbitrum' : 'selected';
                chainId === 42161 ? 'Arbitrum' : 'selected';
                alert(t('interpreter.errors.txNotFound', { network: networkName }));
                setIsAnalyzing(false);
                return;
            }

            console.log('Transaction details loaded:', txDetails);

            // Store transaction details for display
            setTxDetails(txDetails);

            // Always analyze the transaction, regardless of status
            const result = await txInterpreter.interpret({
                to: txDetails.to || undefined,
                from: txDetails.from,
                data: txDetails.data,
                value: txDetails.value
            });

            setWarnings(result.translations);

            // If there's a "to" address, also run security analysis
            if (txDetails.to) {
                const security = await tokenSecurityAnalyzer.analyzeToken(txDetails.to, t);
                setSecurityReport(security);
                setSelectedAddress(txDetails.to);
            }
        } catch (error: any) {
            console.error('Transaction lookup error:', error);
            alert(`${t('interpreter.errors.fetchFailed')}: ${error?.message}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1 className={styles.pageTitle}>
                    {t('interpreter.title')}
                </h1>
                <p className={styles.subtitle}>
                    {t('interpreter.subtitle')}
                </p>
            </header>

            <div className={styles.content}>
                <div className={styles.infoBox}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <h3>{t('interpreter.info.title')}</h3>
                        <p>
                            {t('interpreter.info.description')}
                        </p>
                    </div>
                </div>

                <TransactionInput
                    onAnalyze={handleAnalyze}
                    onAddressSubmit={handleAddressSubmit}
                    onTxHashSubmit={handleTxHashSubmit}
                />

                {/* Show Input Type Detection Badge */}
                {inputType && !isAnalyzing && (
                    <div className={styles.detectionBadge}>
                        <span className={styles.badgeLabel}>{t('interpreter.detection.mode')}</span>
                        <span className={styles.badgeValue}>
                            {inputType === 'WALLET' && t('interpreter.detection.personal')}
                            {inputType === 'TOKEN_CONTRACT' && t('interpreter.detection.token')}
                            {inputType === 'TRANSACTION' && t('interpreter.detection.tx')}
                        </span>
                    </div>
                )}

                {/* Show Wallet Details Card (new beginner-friendly display) */}
                {walletReport && inputType === 'WALLET' && (
                    <WalletDetailsCard
                        report={walletReport}
                        isPersonalWallet={isConnected && connectedAddress?.toLowerCase() === selectedAddress.toLowerCase()}
                    />
                )}

                {/* Show Transaction Details Card (new beginner-friendly display) */}
                {txDetails && inputType === 'TRANSACTION' && (
                    <TransactionDetailsCard transaction={txDetails} />
                )}

                {/* Show Token Details Card (new beginner-friendly display) */}
                {securityReport && inputType === 'TOKEN_CONTRACT' && (
                    <TokenDetailsCard
                        report={securityReport}
                        tokenAddress={selectedAddress}
                    />
                )}

                {fetchedTxs.length > 0 && (
                    <div className={`${styles.txList} glass`}>
                        <h3>{t('interpreter.results.found', { count: fetchedTxs.length })}</h3>
                        <p className={styles.txHint}>
                            {t('interpreter.results.hint')}
                        </p>
                        <div className={styles.txItems}>
                            {fetchedTxs.map((tx, index) => (
                                <div
                                    key={tx.hash}
                                    className={styles.txItem}
                                    onClick={async () => {
                                        setIsAnalyzing(true);
                                        const result = await txInterpreter.interpret({
                                            to: tx.to || undefined,
                                            from: tx.from,
                                            data: tx.data,
                                            value: tx.value
                                        });
                                        setWarnings(result.translations);
                                        setIsAnalyzing(false);
                                    }}
                                >
                                    <div className={styles.txHeader}>
                                        <span className={styles.txIndex}>#{index + 1}</span>
                                        <code className={styles.txHash}>
                                            {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                                        </code>
                                    </div>
                                    <div className={styles.txDetails}>
                                        <span>To: {tx.to?.slice(0, 6)}...{tx.to?.slice(-4)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {isAnalyzing ? (
                    <div className={`${styles.loading} glass`}>
                        <div className={styles.spinner}></div>
                        <p>{loadingMessage || t('interpreter.loading.default')}</p>
                    </div>
                ) : (
                    <WarningTranslation warnings={warnings} />
                )}
            </div>
        </div>
    );
}
