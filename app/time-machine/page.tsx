'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './page.module.css';
import AchievementDashboard from '../components/AchievementDashboard';
import RegretReportComponent from '../components/RegretReport';
import { analyzeWalletAction } from '../actions/analyze-wallet';
import { PersonalAchievementData } from '../lib/tx-interpreter/profile-achievement-system';

export default function TimeMachinePage() {
    // Client-side hydration guard
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const { address, isConnected } = useAccount();
    const { t, language } = useLanguage();
    const [regretReport, setRegretReport] = useState<any>(null);
    const [achievementData, setAchievementData] = useState<PersonalAchievementData | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Auto-analyze when wallet connects
    useEffect(() => {
        if (mounted && isConnected && address && !regretReport && !achievementData && !isAnalyzing) {
            analyzeWallet();
        }
    }, [mounted, isConnected, address]);

    const analyzeWallet = async () => {
        if (!address) {
            setError(t('common.connectWallet'));
            return;
        }

        setIsAnalyzing(true);
        setError(null);

        try {
            console.log('Using Server Action for analysis...');
            const { regrets, achievements } = await analyzeWalletAction(address, language);

            setRegretReport(regrets);
            setAchievementData(achievements);
        } catch (err) {
            console.error('Time Machine analysis failed:', err);
            setError(t('timeMachine.error'));
        } finally {
            setIsAnalyzing(false);
        }
    };

    // If not mounted (SSR), render partial or null to avoid hydration mismatch
    if (!mounted) {
        // Return a stable shell (e.g. without wallet connection dependent text)
        // Or simple null if acceptable (flicker)
        return null;
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1 className={styles.pageTitle}>⏰ {t('timeMachine.title')}</h1>
                <p className={styles.subtitle}>
                    {t('timeMachine.subtitle')}
                </p>
            </header>

            <div className={styles.content}>
                {!isConnected && (
                    <div className={styles.connectPrompt}>
                        <div className={styles.promptIcon}>🔗</div>
                        <h3>{t('common.connectWallet')}</h3>
                        <p>{t('timeMachine.connectPrompt')}</p>
                    </div>
                )}

                {isConnected && !regretReport && !isAnalyzing && (
                    <div className={styles.analyzePrompt}>
                        <button className={styles.analyzeButton} onClick={analyzeWallet}>
                            {t('timeMachine.analyzeButton')}
                        </button>
                    </div>
                )}

                {isAnalyzing && (
                    <div className={styles.loading}>
                        <div className={styles.spinner}></div>
                        <p>{t('timeMachine.loading')}</p>
                        <p className={styles.loadingHint}>{t('timeMachine.loadingHint')}</p>
                    </div>
                )}

                {error && (
                    <div className={styles.error}>
                        <p>{error}</p>
                        <button onClick={analyzeWallet}>{t('common.tryAgain')}</button>
                    </div>
                )}

                {regretReport && (
                    <div className={styles.results}>
                        <RegretReportComponent report={regretReport} />

                        {/* Achievement Dashboard Section */}
                        {achievementData && (
                            <div className={styles.achievementsWrapper}>
                                <AchievementDashboard data={achievementData} />
                            </div>
                        )}

                        <div className={styles.actions}>
                            <button className={styles.refreshButton} onClick={analyzeWallet}>
                                {t('timeMachine.refresh')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
