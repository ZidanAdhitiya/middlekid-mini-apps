'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './AppHeader.module.css';

export default function AppHeader() {
    const pathname = usePathname();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const { open } = useAppKit();
    const { address, isConnected } = useAppKitAccount();
    const { language, setLanguage, t } = useLanguage();

    const navLinks = [
        { href: '/', label: t('header.nav.home') },
        { href: '/interpreter', label: t('header.nav.interpreter') },
        { href: '/time-machine', label: t('header.nav.timeMachine') },
        { href: '/cemetery', label: t('header.nav.cemetery') },
    ];

    const formatAddress = (addr: string) => {
        if (!addr) return '';
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    const handleConnectWallet = () => {
        open();
        setShowProfileMenu(false);
    };

    const toggleLanguage = () => {
        setLanguage(language === 'id' ? 'en' : 'id');
    };

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                {/* Logo/Brand */}
                <Link href="/" className={styles.brand}>
                    {t('header.title')}
                </Link>

                {/* Center Navigation */}
                <nav className={styles.nav}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Right Section: Language Toggle + Profile Menu */}
                <div className={styles.profileSection}>
                    {/* Language Toggle Button */}
                    <button
                        className={styles.languageButton}
                        onClick={toggleLanguage}
                        title={t('header.language.switch')}
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 1C5.03 1 1 5.03 1 10C1 14.97 5.03 19 10 19C14.97 19 19 14.97 19 10C19 5.03 14.97 1 10 1ZM17.26 11H14.82C14.72 12.63 14.39 14.16 13.88 15.54C15.46 14.75 16.74 13.13 17.26 11ZM10 17C9.31 17 8.19 15.38 7.73 13H12.27C11.81 15.38 10.69 17 10 17ZM7.5 11C7.41 10.36 7.35 9.69 7.35 9C7.35 8.31 7.41 7.64 7.5 7H12.5C12.59 7.64 12.65 8.31 12.65 9C12.65 9.69 12.59 10.36 12.5 11H7.5ZM2.74 11C3.26 13.13 4.54 14.75 6.12 15.54C5.61 14.16 5.28 12.63 5.18 11H2.74ZM2.74 9H5.18C5.28 7.37 5.61 5.84 6.12 4.46C4.54 5.25 3.26 6.87 2.74 9ZM10 3C10.69 3 11.81 4.62 12.27 7H7.73C8.19 4.62 9.31 3 10 3ZM13.88 4.46C14.39 5.84 14.72 7.37 14.82 9H17.26C16.74 6.87 15.46 5.25 13.88 4.46Z" fill="currentColor" />
                        </svg>
                        <span className={styles.langFlag}>{language === 'id' ? '🇮🇩' : '🇬🇧'}</span>
                    </button>

                    {/* Profile Button */}
                    <button
                        className={styles.profileButton}
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 10C12.21 10 14 8.21 14 6C14 3.79 12.21 2 10 2C7.79 2 6 3.79 6 6C6 8.21 7.79 10 10 10ZM10 12C7.33 12 2 13.34 2 16V18H18V16C18 13.34 12.67 12 10 12Z" fill="currentColor" />
                        </svg>
                        {isConnected && address && (
                            <span className={styles.addressBadge}>
                                {formatAddress(address)}
                            </span>
                        )}
                    </button>

                    {showProfileMenu && (
                        <div className={styles.profileDropdown}>
                            {isConnected ? (
                                <>
                                    <div className={styles.menuItem}>
                                        <span className={styles.menuLabel}>Connected</span>
                                        <span className={styles.menuValue}>
                                            {formatAddress(address || '')}
                                        </span>
                                    </div>
                                    <div className={styles.menuDivider} />
                                    <button
                                        className={styles.menuButton}
                                        onClick={handleConnectWallet}
                                    >
                                        Switch Wallet
                                    </button>
                                    <button
                                        className={`${styles.menuButton} ${styles.danger}`}
                                        onClick={() => {
                                            open();
                                            setShowProfileMenu(false);
                                        }}
                                    >
                                        Disconnect
                                    </button>
                                </>
                            ) : (
                                <button
                                    className={styles.menuButton}
                                    onClick={handleConnectWallet}
                                >
                                    Connect Wallet
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Overlay to close menu */}
            {showProfileMenu && (
                <div
                    className={styles.overlay}
                    onClick={() => setShowProfileMenu(false)}
                />
            )}
        </header>
    );
}
