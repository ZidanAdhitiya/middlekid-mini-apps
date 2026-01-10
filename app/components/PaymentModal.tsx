'use client';

import { useState } from 'react';
import type { ThetanutsQuote } from '../lib/options/thetanuts-pricing';
import {
    isWalletInstalled,
    connectWallet,
    isOnBaseSepolia,
    switchToBaseSepolia,
    sendTransaction,
    waitForTransactionConfirmation,
    getExplorerUrl,
    ethToWei
} from '../lib/wallet-utils';
import styles from './PaymentModal.module.css';

interface PaymentModalProps {
    quote: ThetanutsQuote;
    tokenSymbol: string;
    currentPrice: number;
    onClose: () => void;
    onSuccess: (txHash: string) => void;
}

enum TxState {
    IDLE = 'idle',
    NO_WALLET = 'no_wallet',
    CONNECTING = 'connecting',
    SWITCHING_NETWORK = 'switching_network',
    PENDING = 'pending',
    CONFIRMING = 'confirming',
    SUCCESS = 'success',
    ERROR = 'error'
}

export function PaymentModal({
    quote,
    tokenSymbol,
    currentPrice,
    onClose,
    onSuccess
}: PaymentModalProps) {
    const [txState, setTxState] = useState<TxState>(TxState.IDLE);
    const [txHash, setTxHash] = useState('');
    const [error, setError] = useState('');
    const [userAddress, setUserAddress] = useState('');

    // Mock contract address for testing (replace with real Thetanuts contract)
    const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_THETANUTS_CONTRACT ||
        '0x0000000000000000000000000000000000000000';

    const handlePurchase = async () => {
        try {
            setError('');

            // Step 1: Check wallet installation
            if (!isWalletInstalled()) {
                setTxState(TxState.NO_WALLET);
                setError('No wallet detected. Please install MetaMask, Coinbase Wallet, or another Web3 wallet.');
                return;
            }

            // Step 2: Connect wallet
            setTxState(TxState.CONNECTING);
            const address = await connectWallet();
            setUserAddress(address);

            // Step 3: Check/switch network
            const onCorrectNetwork = await isOnBaseSepolia();
            if (!onCorrectNetwork) {
                setTxState(TxState.SWITCHING_NETWORK);
                await switchToBaseSepolia();
            }

            // Step 4: Send transaction
            setTxState(TxState.PENDING);

            // Convert premium to Wei
            const premiumWei = ethToWei(quote.premium);

            // Send simple ETH transfer (mock payment)
            // In production, this would call contract function with encoded data
            const hash = await sendTransaction(
                address,
                CONTRACT_ADDRESS,
                premiumWei
            );

            setTxHash(hash);

            // Step 5: Wait for confirmation
            setTxState(TxState.CONFIRMING);
            await waitForTransactionConfirmation(hash);

            // Step 6: Success
            setTxState(TxState.SUCCESS);
            onSuccess(hash);

        } catch (err: any) {
            console.error('❌ Payment error:', err);
            setTxState(TxState.ERROR);
            setError(err.message || 'Transaction failed. Please try again.');
        }
    };

    const handleInstallWallet = () => {
        window.open('https://metamask.io/download/', '_blank');
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Confirm Protection Purchase</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <div className={styles.details}>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Token:</span>
                        <span className={styles.value}>{tokenSymbol}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Current Price:</span>
                        <span className={styles.value}>${currentPrice.toFixed(2)}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Strike Price:</span>
                        <span className={styles.value}>${quote.strike.toFixed(2)}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Expiry:</span>
                        <span className={styles.value}>{quote.expiry} days</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Max Loss:</span>
                        <span className={styles.value}>{quote.maxLoss} ETH</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Network:</span>
                        <span className={styles.value}>Base Sepolia Testnet</span>
                    </div>
                    <div className={`${styles.detailRow} ${styles.premium}`}>
                        <span className={styles.label}>Premium:</span>
                        <span className={styles.value}>{quote.premium} ETH</span>
                    </div>
                </div>

                {/* Idle State */}
                {txState === TxState.IDLE && (
                    <>
                        <div className={styles.warning}>
                            ⚠️ This will execute a real transaction on Base Sepolia testnet
                        </div>
                        <div className={styles.actions}>
                            <button className={styles.cancelButton} onClick={onClose}>
                                Cancel
                            </button>
                            <button className={styles.confirmButton} onClick={handlePurchase}>
                                Pay {quote.premium} ETH
                            </button>
                        </div>
                    </>
                )}

                {/* No Wallet */}
                {txState === TxState.NO_WALLET && (
                    <div className={styles.statusBox}>
                        <div className={styles.errorIcon}>🦊</div>
                        <div className={styles.statusText}>{error}</div>
                        <button className={styles.confirmButton} onClick={handleInstallWallet}>
                            Install Web3 Wallet
                        </button>
                    </div>
                )}

                {/* Connecting */}
                {txState === TxState.CONNECTING && (
                    <div className={styles.statusBox}>
                        <div className={styles.loadingIcon}>🔗</div>
                        <div className={styles.statusText}>Connecting to wallet...</div>
                    </div>
                )}

                {/* Switching Network */}
                {txState === TxState.SWITCHING_NETWORK && (
                    <div className={styles.statusBox}>
                        <div className={styles.loadingIcon}>🔄</div>
                        <div className={styles.statusText}>Switching to Base Sepolia...</div>
                        <div className={styles.statusSubtext}>Please approve in your wallet</div>
                    </div>
                )}

                {/* Transaction Pending */}
                {txState === TxState.PENDING && (
                    <div className={styles.statusBox}>
                        <div className={styles.loadingIcon}>📝</div>
                        <div className={styles.statusText}>Awaiting transaction approval...</div>
                        <div className={styles.statusSubtext}>Please confirm in your wallet</div>
                    </div>
                )}

                {/* Confirming */}
                {txState === TxState.CONFIRMING && (
                    <div className={styles.statusBox}>
                        <div className={styles.loadingIcon}>⏳</div>
                        <div className={styles.statusText}>Transaction confirming...</div>
                        {txHash && (
                            <a
                                href={getExplorerUrl(txHash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.explorerLink}
                            >
                                View on BaseScan ↗
                            </a>
                        )}
                    </div>
                )}

                {/* Success */}
                {txState === TxState.SUCCESS && (
                    <div className={styles.statusBox}>
                        <div className={styles.successIcon}>✅</div>
                        <div className={styles.statusText}>Protection Activated!</div>
                        <div className={styles.statusSubtext}>
                            Your {tokenSymbol} position is now protected
                        </div>
                        {txHash && (
                            <a
                                href={getExplorerUrl(txHash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.explorerLink}
                            >
                                View Transaction ↗
                            </a>
                        )}
                        <button className={styles.confirmButton} onClick={onClose}>
                            Close
                        </button>
                    </div>
                )}

                {/* Error */}
                {txState === TxState.ERROR && (
                    <div className={styles.statusBox}>
                        <div className={styles.errorIcon}>❌</div>
                        <div className={styles.statusText}>Transaction Failed</div>
                        <div className={styles.errorText}>{error}</div>
                        <div className={styles.actions}>
                            <button className={styles.cancelButton} onClick={onClose}>
                                Close
                            </button>
                            <button className={styles.confirmButton} onClick={handlePurchase}>
                                Try Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
