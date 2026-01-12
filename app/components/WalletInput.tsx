'use client';

import { useState, useEffect, useRef } from 'react';
import { isValidAddress } from '../lib/alchemy';
import styles from './WalletInput.module.css';

interface WalletInputProps {
    onSearch: (address: string) => void;
    isLoading?: boolean;
}

export default function WalletInput({ onSearch, isLoading }: WalletInputProps) {
    const [address, setAddress] = useState('');
    const [error, setError] = useState('');
    const layersRef = useRef<HTMLDivElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!address.trim()) {
            setError('Please enter a wallet address');
            return;
        }

        if (!isValidAddress(address.trim())) {
            setError('Invalid address format');
            return;
        }

        onSearch(address.trim());
    };

    const handleExampleClick = () => {
        const exampleAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'; // Vitalik's address
        setAddress(exampleAddress);
        onSearch(exampleAddress);
    };

    // Mouse parallax effect
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!layersRef.current) return;

            const x = (e.clientX / window.innerWidth) - 0.5;
            const y = (e.clientY / window.innerHeight) - 0.5;

            const layers = layersRef.current.querySelectorAll('.layer');
            layers.forEach((layer, index) => {
                const speed = (index + 1) * 10;
                const moveX = x * speed;
                const moveY = y * speed;
                (layer as HTMLElement).style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
        };

        document.addEventListener('mousemove', handleMouseMove);
        return () => document.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className={styles.hero}>
            {/* Animated Background Layers */}
            <div className={styles.heroBg} ref={layersRef}>
                <div className={`layer ${styles.layer} ${styles.layer1}`} />
                <div className={`layer ${styles.layer} ${styles.layer2}`} />
                <div className={`layer ${styles.layer} ${styles.layer3}`} />
            </div>

            {/* Hero Content */}
            <div className={styles.heroContent}>
                <h1>Track your Base portfolio</h1>
                <p>Enter a wallet address to analyze holdings and transactions</p>

                <form onSubmit={handleSubmit}>
                    <div className={styles.searchBox}>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="0x... or bc1..."
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? 'Loading...' : 'Analyze'}
                        </button>
                    </div>
                    {error && <p className={styles.error}>{error}</p>}
                </form>

                <div className={styles.example}>
                    <a onClick={handleExampleClick}>Try an example</a>
                </div>
            </div>
        </div>
    );
}
