'use client';

import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './TransactionInput.module.css';

interface TransactionInputProps {
    onAnalyze: (data: string) => void;
    onAddressSubmit?: (address: string) => void;
    onTxHashSubmit?: (hash: string, chainId?: number) => void;
}

export default function TransactionInput({ onAnalyze, onAddressSubmit, onTxHashSubmit }: TransactionInputProps) {
    const { t } = useLanguage();
    const [searchInput, setSearchInput] = useState('');
    const [searchType, setSearchType] = useState<'unknown' | 'address' | 'txhash' | 'contract'>('unknown');
    const [selectedChain, setSelectedChain] = useState<number>(8453); // Default to Base

    const chains = [
        { id: 1, name: 'Ethereum' },
        { id: 8453, name: 'Base' },
        { id: 137, name: 'Polygon' },
        { id: 10, name: 'Optimism' },
        { id: 42161, name: 'Arbitrum' },
    ];

    // Detect input type
    const detectInputType = (input: string): typeof searchType => {
        const cleaned = input.trim().toLowerCase();

        // Transaction hash (0x + 64 hex chars)
        if (cleaned.match(/^0x[a-f0-9]{64}$/)) {
            return 'txhash';
        }

        // Address (0x + 40 hex chars) - could be wallet or contract
        if (cleaned.match(/^0x[a-f0-9]{40}$/)) {
            return 'address'; // Will determine if contract or wallet later
        }

        return 'unknown';
    };

    const handleSearch = async () => {
        if (!searchInput.trim()) return;

        const type = detectInputType(searchInput);
        setSearchType(type);

        if (type === 'txhash' && onTxHashSubmit) {
            onTxHashSubmit(searchInput, selectedChain);
        } else if (type === 'address' && onAddressSubmit) {
            onAddressSubmit(searchInput);
        } else {
            alert(t('interpreter.errors.invalidInput'));
        }
    };

    const handleInputChange = (value: string) => {
        setSearchInput(value);
        if (value) {
            setSearchType(detectInputType(value));
        } else {
            setSearchType('unknown');
        }
    };

    return (
        <div className={`${styles.container} glass`}>
            <h2 className={styles.title}>🔍 {t('interpreter.search.title')}</h2>

            <div className={styles.searchBar}>
                <div className={styles.searchInputWrapper}>
                    <input
                        type="text"
                        className={styles.searchInput}
                        value={searchInput}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder={t('interpreter.search.placeholder')}
                    />

                    {searchType !== 'unknown' && searchInput && (
                        <span className={styles.detectedType}>
                            {searchType === 'txhash' ? `📜 ${t('interpreter.search.detect.tx')}` :
                                searchType === 'address' ? `👤 ${t('interpreter.search.detect.address')}` :
                                    `❓ ${t('interpreter.search.detect.unknown')}`}
                        </span>
                    )}
                </div>

                <button
                    className={styles.searchButton}
                    onClick={handleSearch}
                    disabled={!searchInput.trim()}
                >
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </button>
            </div>

            <div className={styles.examples}>
                <p className={styles.exampleLabel}>{t('interpreter.search.example')}</p>
                <div className={styles.exampleButtons}>
                    <button
                        className={styles.exampleTag}
                        onClick={() => {
                            const exampleAddress = '0xf7b10d603907658f690da534e9b7dbc4dab3e2d6';
                            setSearchInput(exampleAddress);
                            handleInputChange(exampleAddress);
                        }}
                    >
                        👤 Wallet Address
                    </button>
                    <button
                        className={styles.exampleTag}
                        onClick={() => {
                            // Real Base network transaction hash
                            const exampleHash = '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890';
                            setSearchInput(exampleHash);
                            handleInputChange(exampleHash);
                        }}
                    >
                        📜 Transaction Hash
                    </button>
                    <button
                        className={styles.exampleTag}
                        onClick={() => {
                            const exampleContract = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'; // USDC
                            setSearchInput(exampleContract);
                            handleInputChange(exampleContract);
                        }}
                    >
                        🪙 Token Contract
                    </button>
                </div>
            </div>

            <div className={styles.hint}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                    {t('interpreter.search.hint', { network: chains.find(c => c.id === selectedChain)?.name || 'Unknown' })}
                </span>
            </div>
        </div>
    );
}
