'use client';

import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import styles from './ConnectWalletButton.module.css';

export function ConnectWalletButton() {
    const { open } = useAppKit();
    const { address, isConnected } = useAppKitAccount();

    const handleConnect = () => {
        open();
    };

    const formatAddress = (addr: string) => {
        if (!addr) return '';
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    return (
        <div className={styles.container}>
            <button
                className={styles.button}
                onClick={handleConnect}
                aria-label={isConnected ? 'Manage wallet' : 'Connect wallet'}
            >
                {isConnected && address ? (
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
        </div>
    );
}

// Export hook for other components to use
export function useWallet() {
    const { address, isConnected } = useAppKitAccount();

    return {
        address: address || '',
        isConnected
    };
}

