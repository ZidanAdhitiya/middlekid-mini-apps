// Wallet Analysis Types

export type WalletType = 'HUMAN' | 'BOT' | 'EXCHANGE' | 'CONTRACT' | 'UNKNOWN';

export interface TokenHolding {
    address: string;
    symbol: string;
    name: string;
    balance: string;
    balanceFormatted: string;
    decimals: number;
    isScam: boolean;
    riskScore: number;
    warnings: string[];
}

export interface WalletStatistics {
    address: string;
    ageInDays: number;
    firstTransaction?: string;
    totalTransactions: number;
    totalGasUsed: string;
    averageTxPerDay: number;
    uniqueContractsInteracted: number;
    lastActivityDays: number;
}

export interface BotDetectionResult {
    isBot: boolean;
    confidence: number; // 0-100
    indicators: {
        highFrequency: boolean;
        uniformTiming: boolean;
        mevActivity: boolean;
        flashInteractions: boolean;
        noHumanPattern: boolean;
    };
    reason: string;
}

export interface WalletCheck {
    name: string;
    status: 'pass' | 'warning' | 'fail' | 'unknown';
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    emoji?: string;
}

export interface HumanTranslation {
    title: string;
    emoji: string;
    description: string;
    action: string;
}

export interface WalletAnalysisReport {
    address: string;
    walletType: WalletType;
    overallRisk: 'safe' | 'low' | 'medium' | 'high' | 'critical';
    riskScore: number; // 0-100

    // Core Analysis - Bot Detection & Behavior
    botDetection: BotDetectionResult;
    statistics: WalletStatistics;

    // Security Checks
    checks: WalletCheck[];

    // Human-readable
    humanTranslation: HumanTranslation;
    summary: string;
    recommendations: string[];
}
