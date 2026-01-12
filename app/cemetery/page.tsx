'use client';

import { useEffect, useState } from 'react';
import { ScamTokenRecord, ScamType } from '../lib/tx-interpreter/gamification-types';
import { cemeteryAggregator } from '../lib/tx-interpreter/cemetery-aggregator';
import styles from './page.module.css';
import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';

export default function CemeteryPage() {
    const { t } = useLanguage();
    const [scams, setScams] = useState<ScamTokenRecord[]>([]);
    const [filteredScams, setFilteredScams] = useState<ScamTokenRecord[]>([]);
    const [filterType, setFilterType] = useState<ScamType | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'hall-of-fame' | 'trending'>('all');
    const [stats, setStats] = useState({
        totalScams: 0,
        totalLoss: 0,
        totalVictims: 0
    });

    useEffect(() => {
        // Load cemetery data
        const allScams = cemeteryAggregator.getAllScams();
        const cemeteryStats = cemeteryAggregator.getStats();

        // Generate mock losses for demo
        cemeteryAggregator.estimateMockLosses();

        setScams(allScams);
        setFilteredScams(allScams);
        setStats({
            totalScams: cemeteryStats.totalScams,
            totalLoss: cemeteryStats.totalLoss,
            totalVictims: cemeteryStats.totalVictims
        });
    }, []);

    useEffect(() => {
        // Apply filters
        let filtered = scams;

        // Filter by type
        if (filterType !== 'all') {
            filtered = filtered.filter(scam => scam.scamType === filterType);
        }

        // Filter by search query
        if (searchQuery) {
            filtered = cemeteryAggregator.searchScams(searchQuery);
        }

        setFilteredScams(filtered);
    }, [filterType, searchQuery, scams]);

    const formatUSD = (value: number) => {
        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
        return `$${value}`;
    };

    const getScamTypeBadgeColor = (type: ScamType): string => {
        switch (type) {
            case 'honeypot': return '#ff3333';
            case 'rug_pull': return '#ff6b35';
            case 'fake_token': return '#ffa500';
            case 'high_tax': return '#ffcc00';
            case 'blacklisted': return '#dc2626';
            default: return '#6b7280';
        }
    };

    const getScamTypeLabel = (type: ScamType) => {
        switch (type) {
            case 'honeypot': return t('cemetery.filter.honeypot');
            case 'rug_pull': return t('cemetery.filter.rugPull');
            case 'fake_token': return t('cemetery.filter.fakeToken');
            case 'high_tax': return t('cemetery.filter.highTax');
            case 'blacklisted': return '❌ BLACKLISTED';
            default: return '⚠️ SUSPICIOUS';
        }
    };

    return (
        <div className={styles.cemetery}>
            {/* Header */}
            {/* Header */}
            <div className={styles.cemeteryHeader}>
                <h1 className={styles.cemeteryTitle}>💀 {t('cemetery.title')}</h1>
                <p className={styles.cemeterySubtitle}>
                    {t('cemetery.subtitle')}
                </p>
                <Link href="/interpreter" className={styles.backLink}>
                    {t('cemetery.backToAnalyzer')}
                </Link>
            </div>

            {/* Stats Dashboard */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>💀</div>
                    <div className={styles.statValue}>{stats.totalScams}</div>
                    <div className={styles.statLabel}>{t('cemetery.stats.scamsDetected')}</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>💰</div>
                    <div className={styles.statValue}>{formatUSD(stats.totalLoss)}</div>
                    <div className={styles.statLabel}>{t('cemetery.stats.totalLoss')}</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>👥</div>
                    <div className={styles.statValue}>{stats.totalVictims.toLocaleString()}</div>
                    <div className={styles.statLabel}>{t('cemetery.stats.victims')}</div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className={styles.controls}>
                <input
                    type="text"
                    placeholder={t('cemetery.searchPlaceholder')}
                    className={styles.searchInput}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                <div className={styles.filterButtons}>
                    <button
                        className={`${styles.filterBtn} ${filterType === 'all' ? styles.active : ''}`}
                        onClick={() => setFilterType('all')}
                    >
                        {t('cemetery.filter.all', { count: scams.length })}
                    </button>
                    <button
                        className={`${styles.filterBtn} ${filterType === 'honeypot' ? styles.active : ''}`}
                        onClick={() => setFilterType('honeypot')}
                    >
                        {t('cemetery.filter.honeypot')}
                    </button>
                    <button
                        className={`${styles.filterBtn} ${filterType === 'rug_pull' ? styles.active : ''}`}
                        onClick={() => setFilterType('rug_pull')}
                    >
                        {t('cemetery.filter.rugPull')}
                    </button>
                    <button
                        className={`${styles.filterBtn} ${filterType === 'fake_token' ? styles.active : ''}`}
                        onClick={() => setFilterType('fake_token')}
                    >
                        {t('cemetery.filter.fakeToken')}
                    </button>
                    <button
                        className={`${styles.filterBtn} ${filterType === 'high_tax' ? styles.active : ''}`}
                        onClick={() => setFilterType('high_tax')}
                    >
                        {t('cemetery.filter.highTax')}
                    </button>
                </div>
            </div>

            {/* 🏆 Tab Navigation */}
            {/* 🏆 Tab Navigation */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'all' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    {t('cemetery.tabs.all')}
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'hall-of-fame' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('hall-of-fame')}
                >
                    {t('cemetery.tabs.hallOfFame')}
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'trending' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('trending')}
                >
                    {t('cemetery.tabs.trending')}
                </button>
            </div>

            {/* Tombstones Grid */}
            {/* Render based on active tab */}
            {activeTab === 'all' && (
                filteredScams.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>👻</div>
                        <h3>{t('cemetery.empty.title')}</h3>
                        <p>{t('cemetery.empty.description')}</p>
                    </div>
                ) : (
                    <div className={styles.tombstonesGrid}>
                        {filteredScams.map((scam) => (
                            <div key={scam.address} className={styles.tombstone}>
                                {/* Tombstone Header */}
                                <div className={styles.tombstoneHeader}>
                                    <div className={styles.skull}>💀</div>
                                    <div className={styles.rip}>{t('cemetery.card.rip')}</div>
                                </div>

                                {/* Token Info */}
                                <div className={styles.tokenInfo}>
                                    <div className={styles.tokenSymbol}>{scam.symbol}</div>
                                    <div className={styles.tokenName}>{scam.name}</div>
                                </div>

                                {/* Death Date */}
                                <div className={styles.deathDate}>
                                    † {new Date(scam.detectedAt).toLocaleDateString()}
                                </div>

                                {/* Scam Type Badge */}
                                <div
                                    className={styles.scamTypeBadge}
                                    style={{ backgroundColor: getScamTypeBadgeColor(scam.scamType) }}
                                >
                                    {getScamTypeLabel(scam.scamType)}
                                </div>

                                {/* Stats */}
                                {(scam.estimatedLoss || scam.estimatedVictims) && (
                                    <div className={styles.scamStats}>
                                        {scam.estimatedLoss && (
                                            <div className={styles.scamStat}>
                                                💰 {t('cemetery.card.loss')} {formatUSD(scam.estimatedLoss)}
                                            </div>
                                        )}
                                        {scam.estimatedVictims && (
                                            <div className={styles.scamStat}>
                                                👥 {scam.estimatedVictims} {t('cemetery.card.victims')}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Warnings */}
                                <div className={styles.warnings}>
                                    {scam.warnings.slice(0, 2).map((warning, idx) => (
                                        <div key={idx} className={styles.warning}>
                                            ⚠️ {warning}
                                        </div>
                                    ))}
                                </div>

                                {/* Address (truncated) */}
                                <div className={styles.address}>
                                    {scam.address.slice(0, 6)}...{scam.address.slice(-4)}
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}

            {/* 🏆 Hall of Fame View */}
            {activeTab === 'hall-of-fame' && (
                <div className={styles.hallOfFame}>
                    <h2 className={styles.hallTitle}>{t('cemetery.leaderboard.title')}</h2>
                    {scams.filter(s => s.estimatedLoss && s.estimatedLoss > 0)
                        .sort((a, b) => (b.estimatedLoss || 0) - (a.estimatedLoss || 0))
                        .slice(0, 10)
                        .map((scam, index) => (
                            <div key={scam.address} className={`${styles.leaderboardItem} ${index < 3 ? styles.topThree : ''}`}>
                                <div className={styles.rank}>
                                    {index === 0 && '👑'}
                                    {index === 1 && '🥈'}
                                    {index === 2 && '🥉'}
                                    {index > 2 && `#${index + 1}`}
                                </div>
                                <div className={styles.leaderboardInfo}>
                                    <div className={styles.leaderboardName}>
                                        {scam.symbol} - {scam.name}
                                    </div>
                                    <div className={styles.leaderboardType}>
                                        {getScamTypeLabel(scam.scamType)}
                                    </div>
                                </div>
                                <div className={styles.leaderboardLoss}>
                                    <div className={styles.lossAmount}>{formatUSD(scam.estimatedLoss || 0)}</div>
                                    <div className={styles.lossLabel}>{t('cemetery.leaderboard.totalLoss')}</div>
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {/* 📈 Trending View */}
            {activeTab === 'trending' && (
                <div className={styles.trending}>
                    <h2 className={styles.trendingTitle}>{t('cemetery.trending.title')}</h2>
                    {scams
                        .sort((a, b) => (b.reportCount || 0) - (a.reportCount || 0))
                        .slice(0, 10)
                        .map((scam, index) => (
                            <div key={scam.address} className={styles.trendingItem}>
                                <div className={styles.trendingBadge}>
                                    {index < 3 && '🔥'}
                                    {t('cemetery.trending.hot')}
                                </div>
                                <div className={styles.trendingInfo}>
                                    <div className={styles.trendingName}>
                                        {scam.symbol} - {scam.name}
                                    </div>
                                    <div className={styles.trendingStats}>
                                        {scam.reportCount || 0} {t('cemetery.trending.reports')} • {getScamTypeLabel(scam.scamType)}
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}
