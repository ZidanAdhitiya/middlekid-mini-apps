'use client';

import { useState, useEffect } from 'react';
import TransactionInput from '../components/TransactionInput';
import WarningTranslation from '../components/WarningTranslation';
import SecurityReport from '../components/SecurityReport';
import WalletReport from '../components/WalletReport';
import RegretReport from '../components/RegretReport';
import { ConnectWalletButton, useWallet } from '../components/ConnectWalletButton';
import { txInterpreter } from '../lib/tx-interpreter/engine';
import { TranslatedWarning } from '../lib/tx-interpreter/types';
import { fetchRecentTransactions, FetchedTransaction } from '../lib/tx-interpreter/fetcher';
import { tokenSecurityAnalyzer, TokenSecurityReport } from '../lib/tx-interpreter/security';
import { walletSecurityAnalyzer } from '../lib/tx-interpreter/wallet-analyzer';
import { WalletAnalysisReport } from '../lib/tx-interpreter/wallet-types';
import { detectInputType, InputType } from '../lib/tx-interpreter/address-detector';
import { regretCalculator } from '../lib/tx-interpreter/regret-calculator';
import { RegretReport as RegretReportType } from '../lib/tx-interpreter/regret-types';
import { alchemyAPI } from '../lib/alchemy';
import styles from './page.module.css';

// Humanized Loading Messages
const LOADING_MESSAGES = [
    "Sedang mengintip isi dompet... 🔍",
    "Mengecek apakah ada tuyul digital... 👻",
    "Menghitung dosa-dosa transaksi... 📊",
    "Mencari jejak scammer... 🕵️",
    "Menganalisis pola bot... 🤖",
    "Memeriksa token mencurigakan... ⚠️",
    "Mengaudit riwayat jajanmu di blockchain... 💸",
    "Sedang nge-stalk wallet kamu... 👀"
];

// Time Machine specific loading messages
const TIME_MACHINE_MESSAGES = [
    "⏰ Time traveling ke masa lalu...",
    "📜 Fetching transaction history dari blockchain...",
    "💰 Getting prices untuk semua token...",
    "💔 Menghitung regret kamu...",
    "🧻 Detecting paper hands moments...",
    "💎 Mencari diamond hands wins...",
    "📊 Analyzing trading patterns..."
];

export default function InterpreterPage() {
    const [warnings, setWarnings] = useState<TranslatedWarning[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [fetchedTxs, setFetchedTxs] = useState<FetchedTransaction[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<string>('');
    const [securityReport, setSecurityReport] = useState<TokenSecurityReport | null>(null);
    const [walletReport, setWalletReport] = useState<WalletAnalysisReport | null>(null);
    const [regretReport, setRegretReport] = useState<RegretReportType | null>(null);
    const [inputType, setInputType] = useState<InputType | null>(null);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'security' | 'regret'>('security');

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
            alert('Error: Data transaksi tidak valid. Pastikan format JSON benar.');
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
        setRegretReport(null);
        setFetchedTxs([]);
        setWarnings([]);
        setActiveTab('security');

        // Set random loading message
        const randomMessage = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
        setLoadingMessage(randomMessage);

        try {
            // Step 1: Detect input type (WALLET, TOKEN_CONTRACT, or TRANSACTION)
            const detection = await detectInputType(address);
            setInputType(detection.type);

            console.log('🔍 Input detected as:', detection.type, '- Confidence:', detection.confidence + '%');
            console.log('📝 Reason:', detection.reason);

            // Step 2: Route to appropriate analyzer
            if (detection.type === 'WALLET') {
                // Analyze as WALLET
                setLoadingMessage('Menganalisis wallet personal... 👤');
                const walletAnalysis = await walletSecurityAnalyzer.analyzeWallet(address);
                setWalletReport(walletAnalysis);

                // Also run Time Machine Analysis
                setLoadingMessage(TIME_MACHINE_MESSAGES[0]);
                try {
                    // Show progress messages
                    const progressInterval = setInterval(() => {
                        const randomMsg = TIME_MACHINE_MESSAGES[Math.floor(Math.random() * TIME_MACHINE_MESSAGES.length)];
                        setLoadingMessage(randomMsg);
                    }, 3000);

                    const regretAnalysis = await regretCalculator.analyzeWalletRegrets(address, 8453, 30);
                    clearInterval(progressInterval);
                    setRegretReport(regretAnalysis);
                    console.log('🔮 Regret analysis complete:', regretAnalysis);
                } catch (regretError) {
                    console.error('Regret analysis failed:', regretError);
                    // Don't block the main flow if regret analysis fails
                }

            } else if (detection.type === 'TOKEN_CONTRACT') {
                // Analyze as TOKEN
                setLoadingMessage('Menganalisis token contract... 🪙');
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
                alert('Input tidak valid! Pastikan format address atau hash benar (0x...)');
                setIsAnalyzing(false);
                return;
            }

        } catch (error) {
            console.error('Analysis error:', error);
            alert('Error: Gagal menganalisis. Pastikan address valid dan coba lagi.');
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

                {/* Wallet Connect Button */}
                <div className={styles.walletConnectSection}>
                    <ConnectWalletButton />
                    {isConnected && connectedAddress && (
                        <div className={styles.connectedBanner}>
                            🔗 Analyzing YOUR wallet: {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
                        </div>
                    )}
                </div>

                <TransactionInput
                    onAnalyze={handleAnalyze}
                    onAddressSubmit={handleAddressSubmit}
                    onTxHashSubmit={handleTxHashSubmit}
                />

                {/* Show Input Type Detection Badge */}
                {inputType && !isAnalyzing && (
                    <div className={styles.detectionBadge}>
                        <span className={styles.badgeLabel}>Mode Analisis:</span>
                        <span className={styles.badgeValue}>
                            {inputType === 'WALLET' && '👤 Wallet Personal'}
                            {inputType === 'TOKEN_CONTRACT' && '🪙 Token Contract'}
                            {inputType === 'TRANSACTION' && '📜 Transaction Hash'}
                        </span>
                    </div>
                )}

                {/* Tab Switcher for Wallet Analysis */}
                {inputType === 'WALLET' && (walletReport || regretReport) && !isAnalyzing && (
                    <div className={styles.tabSwitcher}>
                        <button
                            className={`${styles.tab} ${activeTab === 'security' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('security')}
                        >
                            🛡️ Security Analysis
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'regret' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('regret')}
                        >
                            🔮 Time Machine Analysis
                        </button>
                    </div>
                )}

                {/* Conditional Rendering Based on Active Tab */}
                {walletReport && inputType === 'WALLET' && activeTab === 'security' && (
                    <WalletReport report={walletReport} />
                )}

                {regretReport && inputType === 'WALLET' && activeTab === 'regret' && (
                    <RegretReport report={regretReport} />
                )}

                {securityReport && inputType === 'TOKEN_CONTRACT' && (
                    <SecurityReport
                        report={securityReport}
                        tokenAddress={selectedAddress}
                    />
                )}

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
                        <p>{loadingMessage || 'Menganalisis transaksi...'}</p>
                    </div>
                ) : (
                    <WarningTranslation warnings={warnings} />
                )}
            </div>
        </div>
    );
}
