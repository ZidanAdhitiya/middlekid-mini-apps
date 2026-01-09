'use client';

import { useState, useEffect } from 'react';
import { connectWallet, detectWallet, formatAddress } from '../lib/wallet-utils';
import styles from './ConnectWalletButton.module.css';

export function ConnectWalletButton() {
    const [address, setAddress] = useState<string>('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState('');

    // Check if already connected on mount
    useEffect(() => {
        checkConnection();

        // Listen for account changes
        const ethereum = detectWallet();
        if (ethereum) {
            ethereum.on('accountsChanged', handleAccountsChanged);
            ethereum.on('chainChanged', () => window.location.reload());
        }

        return () => {
            if (ethereum) {
                ethereum.removeListener('accountsChanged', handleAccountsChanged);
            }
        };
    }, []);

    const checkConnection = async () => {
        try {
            const ethereum = detectWallet();
            if (!ethereum) return;

            const accounts = await ethereum.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
                setAddress(accounts[0]);
            }
        } catch (err) {
            console.error('Error checking connection:', err);
        }
    };

    const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
            setAddress('');
        } else {
            setAddress(accounts[0]);
        }
    };

    const handleConnect = async () => {
        try {
            setIsConnecting(true);
            setError('');

            const connectedAddress = await connectWallet();
            setAddress(connectedAddress);
        } catch (err: any) {
            setError(err.message || 'Failed to connect');
            console.error('Connection error:', err);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDisconnect = () => {
        setAddress('');
        // Note: Can't actually disconnect from MetaMask programmatically
        // User must do it manually from MetaMask
    };

    const isConnected = !!address;

    return (
        <div className={styles.container}>
            <button
                className={styles.button}
                onClick={isConnected ? handleDisconnect : handleConnect}
                disabled={isConnecting}
                aria-label={isConnected ? 'Manage wallet' : 'Connect wallet'}
            >
                {isConnecting ? (
                    <>
                        <span className={styles.spinner}></span>
                        <span>Connecting...</span>
                    </>
                ) : isConnected ? (
                    <>
                        <span className={styles.indicator}></span>
                        <span className={styles.address}>
                            {formatAddress(address)}
                        </span>
                    </>
                ) : (
                    <>
                        <span className={styles.icon}>🔗</span>
                        <span>Connect Wallet</span>
                    </>
                )}
            </button>

            {error && (
                <div className={styles.error}>
                    {error}
                </div>
            )}
        </div>
    );
}

// Export hook for other components to use
export function useWallet() {
    const [address, setAddress] = useState<string>('');

    useEffect(() => {
        const checkConnection = async () => {
            try {
                const ethereum = detectWallet();
                if (!ethereum) return;

                const accounts = await ethereum.request({ method: 'eth_accounts' });
                if (accounts && accounts.length > 0) {
                    setAddress(accounts[0]);
                }
            } catch (err) {
                console.error('Error checking connection:', err);
            }
        };

        checkConnection();

        const ethereum = detectWallet();
        if (ethereum) {
            ethereum.on('accountsChanged', (accounts: string[]) => {
                setAddress(accounts.length > 0 ? accounts[0] : '');
            });
        }
    }, []);

    return {
        address,
        isConnected: !!address
    };
}
