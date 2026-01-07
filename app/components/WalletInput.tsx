'use client';

import { useState } from 'react';
import { isValidAddress } from '../lib/alchemy';
import styles from './WalletInput.module.css';

interface WalletInputProps {
    onSearch: (address: string) => void;
    isLoading?: boolean;
}

export default function WalletInput({ onSearch, isLoading }: WalletInputProps) {
    const [address, setAddress] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!address.trim()) {
            setError('Please enter a wallet address');
            return;
        }

        if (!isValidAddress(address.trim())) {
            setError('Invalid wallet address format');
            return;
        }

        onSearch(address.trim());
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    <span className="gradient-text">MiddleKid</span>
                </h1>
                <p className={styles.subtitle}>
                    Track your Base chain portfolio in real-time
                </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputWrapper}>
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter wallet address (0x... or bc1...)"
                        className={styles.input}
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className={styles.button}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className={styles.spinner}></span>
                                Loading...
                            </>
                        ) : (
                            <>
                                <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Analyze
                            </>
                        )}
                    </button>
                </div>
                {error && <p className={styles.error}>{error}</p>}
            </form>

            <div className={styles.examples}>
                <p className={styles.examplesLabel}>Try an example:</p>
                <button
                    onClick={() => setAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')}
                    className={styles.exampleButton}
                    disabled={isLoading}
                >
                    Sample Wallet
                </button>
            </div>
        </div>
    );
}
