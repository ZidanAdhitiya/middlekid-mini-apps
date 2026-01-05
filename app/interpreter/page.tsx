'use client';

import { useState } from 'react';
import TransactionInput from '../components/TransactionInput';
import WarningTranslation from '../components/WarningTranslation';
import SecurityReport from '../components/SecurityReport';
import { txInterpreter } from '../lib/tx-interpreter/engine';
import { TranslatedWarning } from '../lib/tx-interpreter/types';
import { fetchRecentTransactions, FetchedTransaction } from '../lib/tx-interpreter/fetcher';
import { tokenSecurityAnalyzer, TokenSecurityReport } from '../lib/tx-interpreter/security';
import { alchemyAPI } from '../lib/alchemy';
import styles from './page.module.css';

export default function InterpreterPage() {
    const [warnings, setWarnings] = useState<TranslatedWarning[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [fetchedTxs, setFetchedTxs] = useState<FetchedTransaction[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<string>('');
    const [securityReport, setSecurityReport] = useState<TokenSecurityReport | null>(null);

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
            alert('Error: Data transaksi tidak valid. Pastikan format JSON benar.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAddressSubmit = async (address: string) => {
        setIsAnalyzing(true);
        setSelectedAddress(address);
        setSecurityReport(null);
        setFetchedTxs([]);
        setWarnings([]);

        try {
            // Run security analysis (always show this)
            const security = await tokenSecurityAnalyzer.analyzeToken(address);
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
                // If no transactions, just show security report (don't error)
            } catch (txError) {
                console.log('No transactions found, showing security report only');
            }
        } catch (error) {
            console.error('Security analysis error:', error);
            alert('Error: Gagal menganalisis address. Pastikan address valid.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleTxHashSubmit = async (hash: string, chainId?: number) => {
        setIsAnalyzing(true);
        setFetchedTxs([]);
        setSecurityReport(null);
        setWarnings([]);

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
                alert(`Transaction tidak ditemukan di ${networkName} network.\n\nTips:\n- Pastikan hash benar (64 karakter hex)\n- Pastikan pilih network yang sesuai\n- Pastikan transaksi sudah confirmed`);
                setIsAnalyzing(false);
                return;
            }

            console.log('Transaction details loaded:', txDetails);

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
                const security = await tokenSecurityAnalyzer.analyzeToken(txDetails.to);
                setSecurityReport(security);
                setSelectedAddress(txDetails.to);
            }
        } catch (error: any) {
            console.error('Transaction lookup error:', error);
            alert(`Error: ${error?.message || 'Gagal fetch transaction'}.\n\nPeriksa console untuk detail.`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1 className={styles.pageTitle}>
                    🔍 Web3 Transaction Interpreter
                </h1>
                <p className={styles.subtitle}>
                    Terjemahan warning teknis Web3 ke bahasa manusia yang mudah dipahami
                </p>
            </header>

            <div className={styles.content}>
                <div className={styles.infoBox}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <h3>Apa ini?</h3>
                        <p>
                            Tool ini <strong>bukan</strong> security auditor atau pendeteksi scam.
                            Ini adalah <strong>penerjemah</strong> yang menjelaskan apa yang diminta wallet Anda
                            dengan bahasa yang mudah dipahami.
                        </p>
                    </div>
                </div>

                <TransactionInput
                    onAnalyze={handleAnalyze}
                    onAddressSubmit={handleAddressSubmit}
                    onTxHashSubmit={handleTxHashSubmit}
                />

                <SecurityReport
                    report={securityReport}
                    tokenAddress={selectedAddress}
                />

                {fetchedTxs.length > 0 && (
                    <div className={`${styles.txList} glass`}>
                        <h3>Transaksi Ditemukan: {fetchedTxs.length}</h3>
                        <p className={styles.txHint}>
                            Menampilkan analisis untuk transaksi pertama.
                            Klik transaksi lain untuk melihat analisisnya.
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
                        <p>Menganalisis transaksi...</p>
                    </div>
                ) : (
                    <WarningTranslation warnings={warnings} />
                )}
            </div>
        </div>
    );
}
