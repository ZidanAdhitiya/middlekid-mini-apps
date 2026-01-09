'use client';

import styles from './PaymentProgress.module.css';

interface ProgressStepProps {
    currentStep: number;
    totalSteps: number;
}

export function ProgressSteps({ currentStep, totalSteps }: ProgressStepProps) {
    const steps = [
        { label: 'Wallet', icon: '🔗' },
        { label: 'Connect', icon: '✓' },
        { label: 'Network', icon: '🌐' },
        { label: 'Approve', icon: '✓' },
        { label: 'Confirm', icon: '⏳' }
    ];

    const progress = (currentStep / totalSteps) * 100;

    return (
        <div className={styles.progressContainer}>
            <div className={styles.progressSteps}>
                <div className={styles.progressBar}>
                    <div 
                        className={styles.progressBarFill} 
                        style={{ width: `${progress}%` }}
                    />
                </div>
                
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = stepNumber < currentStep;
                    const isActive = stepNumber === currentStep;
                    
                    return (
                        <div key={index} className={styles.step}>
                            <div 
                                className={`
                                    ${styles.stepCircle}
                                    ${isActive ? styles.active : ''}
                                    ${isCompleted ? styles.completed : ''}
                                `}
                            >
                                {isCompleted ? '✓' : stepNumber}
                            </div>
                            <div 
                                className={`
                                    ${styles.stepLabel}
                                    ${isActive ? styles.active : ''}
                                    ${isCompleted ? styles.completed : ''}
                                `}
                            >
                                {step.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

interface HintBoxProps {
    message: string;
}

export function HintBox({ message }: HintBoxProps) {
    if (!message) return null;
    
    return (
        <div className={styles.hintBox}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{message}</span>
        </div>
    );
}

interface GasEstimateProps {
    premiumETH: number;
    gasETH: number;
    gasUSD: number;
}

export function GasEstimate({ premiumETH, gasETH, gasUSD }: GasEstimateProps) {
    const totalETH = premiumETH + gasETH;
    
    return (
        <div className={styles.gasEstimate}>
            <h4>💰 Cost Breakdown</h4>
            <div className={styles.gasRow}>
                <span>Premium:</span>
                <span>{premiumETH.toFixed(4)} ETH</span>
            </div>
            <div className={styles.gasRow}>
                <span>Estimated Gas:</span>
                <span>{gasETH.toFixed(4)} ETH (≈${gasUSD.toFixed(2)})</span>
            </div>
            <div className={`${styles.gasRow} ${styles.total}`}>
                <span>Total Cost:</span>
                <span>{totalETH.toFixed(4)} ETH</span>
            </div>
        </div>
    );
}

interface SuccessCelebrationProps {
    tokenSymbol: string;
    txHash: string;
    nextSteps: string[];
}

export function SuccessCelebration({ tokenSymbol, txHash, nextSteps }: SuccessCelebrationProps) {
    return (
        <div className={styles.celebration}>
            <div className={styles.celebrationIcon}>🎉</div>
            <div className={styles.statusText}>Protection Activated!</div>
            <div className={styles.statusSubtext}>
                Your {tokenSymbol} position is now protected
            </div>
            
            {nextSteps && nextSteps.length > 0 && (
                <div className={styles.nextSteps}>
                    <h4>What's next?</h4>
                    <ul>
                        {nextSteps.map((step, index) => (
                            <li key={index}>{step}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
