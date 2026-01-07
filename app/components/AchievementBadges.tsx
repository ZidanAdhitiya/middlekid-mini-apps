'use client';

import { AchievementProgress } from '../lib/tx-interpreter/gamification-types';
import styles from './AchievementBadges.module.css';
import { useState } from 'react';

interface AchievementBadgesProps {
    achievements: AchievementProgress;
}

export default function AchievementBadges({ achievements }: AchievementBadgesProps) {
    const [selectedBadge, setSelectedBadge] = useState<string | null>(null);

    const getRarityColor = (rarity: string): string => {
        switch (rarity) {
            case 'legendary': return '#fbbf24'; // gold
            case 'epic': return '#a78bfa'; // purple
            case 'rare': return '#3b82f6'; // blue
            default: return '#6b7280'; // gray
        }
    };

    const getRarityGlow = (rarity: string): string => {
        switch (rarity) {
            case 'legendary': return '0 0 20px rgba(251, 191, 36, 0.5)';
            case 'epic': return '0 0 15px rgba(167, 139, 250, 0.4)';
            case 'rare': return '0 0 10px rgba(59, 130, 246, 0.3)';
            default: return 'none';
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>🏆 Achievements</h3>
                <div className={styles.progress}>
                    <span>{achievements.totalUnlocked} / {achievements.totalAvailable} Unlocked</span>
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${achievements.completionPercentage}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className={styles.badgesGrid}>
                {achievements.achievements.map((achievement) => (
                    <div
                        key={achievement.id}
                        className={`${styles.badgeCard} ${achievement.unlocked ? styles.unlocked : styles.locked}`}
                        onClick={() => setSelectedBadge(selectedBadge === achievement.id ? null : achievement.id)}
                        style={{
                            borderColor: achievement.unlocked ? getRarityColor(achievement.rarity) : 'rgba(255, 255, 255, 0.1)',
                            boxShadow: achievement.unlocked ? getRarityGlow(achievement.rarity) : 'none'
                        }}
                    >
                        {/* Badge Icon */}
                        <div className={styles.badgeIcon}>
                            <span className={styles.emoji}>{achievement.emoji}</span>
                            {achievement.unlocked && (
                                <div className={styles.shimmer} />
                            )}
                            {!achievement.unlocked && (
                                <div className={styles.lockOverlay}>🔒</div>
                            )}
                        </div>

                        {/* Badge Info */}
                        <div className={styles.badgeInfo}>
                            <div className={styles.badgeName}>{achievement.name}</div>
                            <div className={styles.badgeRarity} style={{ color: getRarityColor(achievement.rarity) }}>
                                {achievement.rarity.toUpperCase()}
                            </div>
                        </div>

                        {/* Progress Bar (if not unlocked) */}
                        {!achievement.unlocked && achievement.progress !== undefined && (
                            <div className={styles.achievementProgress}>
                                <div className={styles.achievementProgressBar}>
                                    <div
                                        className={styles.achievementProgressFill}
                                        style={{ width: `${achievement.progress}%` }}
                                    />
                                </div>
                                <span className={styles.progressText}>{Math.round(achievement.progress)}%</span>
                            </div>
                        )}

                        {/* Expanded Details */}
                        {selectedBadge === achievement.id && (
                            <div className={styles.badgeDetails}>
                                <p className={styles.description}>{achievement.description}</p>
                                <div className={styles.requirement}>
                                    <strong>Requirement:</strong> {achievement.requirement}
                                </div>
                                {achievement.scoreBonus > 0 && (
                                    <div className={styles.bonus}>
                                        +{achievement.scoreBonus} Score Bonus
                                    </div>
                                )}
                                {achievement.unlocked && achievement.unlockedAt && (
                                    <div className={styles.unlockedDate}>
                                        Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Fun Stat */}
            {achievements.completionPercentage === 100 && (
                <div className={styles.completionBanner}>
                    🎉 <strong>Achievement Master!</strong> Semua achievements telah di-unlock!
                </div>
            )}
        </div>
    );
}
