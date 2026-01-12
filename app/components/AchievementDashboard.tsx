import { PersonalAchievementData } from '../lib/tx-interpreter/profile-achievement-system';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './AchievementDashboard.module.css';

interface AchievementDashboardProps {
    data: PersonalAchievementData;
}

export default function AchievementDashboard({ data }: AchievementDashboardProps) {
    if (!data) return null;

    const { t } = useLanguage();
    const { totalPoints, level, healthScore, achievements, statistics } = data;

    return (
        <div className={styles.container}>
            {/* Header: Points & Level */}
            <div className={styles.header}>
                <div className={styles.levelCard}>
                    <div className={styles.levelBadge}>{t('dashboard.level')} {level}</div>
                    <div className={styles.pointsDisplay}>
                        <span className={styles.pointsIcon}>⭐</span>
                        <span className={styles.pointsValue}>{totalPoints}</span>
                        <span className={styles.pointsLabel}>{t('dashboard.points')}</span>
                    </div>
                    <div className={styles.levelProgress}>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{ width: `${(totalPoints % 100)}%` }}
                            />
                        </div>
                        <div className={styles.progressLabel}>
                            {totalPoints % 100}/100 {t('dashboard.toLevel')} {level + 1}
                        </div>
                    </div>
                </div>

                {/* Health Score */}
                <div className={styles.healthCard}>
                    <h3>{t('dashboard.healthScore')}</h3>
                    <div className={styles.scoreCircle}>
                        <svg viewBox="0 0 100 100">
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="#e0e0e0"
                                strokeWidth="8"
                            />
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="#45b7d1"
                                strokeWidth="8"
                                strokeDasharray={`${(healthScore.totalScore / 100) * 283} 283`}
                                strokeLinecap="round"
                                transform="rotate(-90 50 50)"
                            />
                        </svg>
                        <div className={styles.scoreValue}>{healthScore.totalScore}</div>
                    </div>
                    <div className={styles.scoreGrade}>{healthScore.grade}</div>
                    <div className={styles.scoreRank}>{healthScore.rank}</div>
                </div>
            </div>

            {/* Achievements Grid */}
            <div className={styles.achievementsSection}>
                <h2>🏆 {t('dashboard.achievements.title')}</h2>

                {/* Earned Achievements */}
                {achievements.earned.length > 0 && (
                    <div className={styles.earnedSection}>
                        <h3>{t('dashboard.achievements.unlocked')} ({achievements.earned.length})</h3>
                        <div className={styles.achievementGrid}>
                            {achievements.earned.map((achievement) => (
                                <div key={achievement.id} className={`${styles.achievementCard} ${styles.earned}`}>
                                    <div className={styles.achievementIcon}>{achievement.emoji}</div>
                                    <div className={styles.achievementName}>{achievement.name}</div>
                                    <div className={styles.achievementDescription}>{achievement.description}</div>
                                    <div className={styles.earnedBadge}>{t('dashboard.achievements.unlockedBadge')}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Locked Achievements */}
                {achievements.locked.length > 0 && (
                    <div className={styles.lockedSection}>
                        <h3>{t('dashboard.achievements.locked')} ({achievements.locked.length})</h3>
                        <div className={styles.achievementGrid}>
                            {achievements.locked.map((achievement) => (
                                <div key={achievement.id} className={`${styles.achievementCard} ${styles.locked}`}>
                                    <div className={styles.achievementIcon}>🔒</div>
                                    <div className={styles.achievementName}>{achievement.name}</div>
                                    <div className={styles.achievementDescription}>{achievement.description}</div>
                                    {achievement.progress && (
                                        <div className={styles.achievementProgress}>
                                            <div className={styles.progressBar}>
                                                <div
                                                    className={styles.progressFill}
                                                    style={{ width: `${achievement.progress}%` }}
                                                />
                                            </div>
                                            <div className={styles.progressText}>{achievement.progress}%</div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Wallet Stats Summary */}
            <div className={styles.statsSection}>
                <h3>📊 {t('dashboard.stats.title')}</h3>
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>🎂</div>
                        <div className={styles.statValue}>{statistics.ageInDays}</div>
                        <div className={styles.statLabel}>{t('dashboard.stats.daysOld')}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>📊</div>
                        <div className={styles.statValue}>{statistics.totalTransactions.toLocaleString()}</div>
                        <div className={styles.statLabel}>{t('dashboard.stats.transactions')}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>⚡</div>
                        <div className={styles.statValue}>{statistics.averageTxPerDay.toFixed(1)}</div>
                        <div className={styles.statLabel}>{t('dashboard.stats.txPerDay')}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>🔗</div>
                        <div className={styles.statValue}>{statistics.uniqueContractsInteracted}</div>
                        <div className={styles.statLabel}>{t('dashboard.stats.contracts')}</div>
                    </div>
                </div>
            </div>

            {/* Health Score Breakdown */}
            <div className={styles.breakdownSection}>
                <h3>📈 {t('dashboard.healthBreakdown.title')}</h3>
                <div className={styles.factorsList}>
                    {Object.entries(healthScore.breakdown).map(([key, factor]) => (
                        <div key={key} className={styles.factorCard}>
                            <div className={styles.factorHeader}>
                                <span className={styles.factorName}>{factor.name}</span>
                                <span className={styles.factorPoints}>{factor.pointsEarned}/{factor.maxPoints}</span>
                            </div>
                            <div className={styles.factorBar}>
                                <div
                                    className={styles.factorFill}
                                    style={{
                                        width: `${(factor.pointsEarned / factor.maxPoints) * 100}%`,
                                        backgroundColor: factor.pointsEarned === factor.maxPoints ? '#4ecdc4' : '#ffa500'
                                    }}
                                />
                            </div>
                            <div className={styles.factorDescription}>{factor.description}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
