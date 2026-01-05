// Type definitions for Web3 Transaction Interpreter

export type TransactionType =
    | 'APPROVAL'
    | 'SIGNATURE'
    | 'TRANSACTION'
    | 'CONTRACT_INTERACTION'
    | 'PERMIT';

export type WarningContext =
    | 'UNLIMITED_APPROVAL'
    | 'LIMITED_APPROVAL'
    | 'UNVERIFIED_CONTRACT'
    | 'HIGH_VALUE_TRANSFER'
    | 'BROAD_PERMISSIONS'
    | 'SIGNATURE_REQUEST'
    | 'UNKNOWN_FUNCTION';

export interface NormalizedTransaction {
    type: TransactionType;
    context: WarningContext[];
    data: {
        contractAddress?: string;
        functionName?: string;
        parameters?: Record<string, any>;
        value?: string;
        isVerified?: boolean;
        allowanceScope?: 'unlimited' | 'limited' | 'none';
        chainId?: number;
    };
}

export interface TranslatedWarning {
    title: string;
    explanation: string;
    impact: string;
    technicalDetails?: string;
    severity: 'info' | 'caution' | 'warning';
}

export interface TransactionInput {
    // Raw transaction data
    to?: string;
    from?: string;
    data?: string;
    value?: string;

    // Or human-readable
    functionName?: string;
    parameters?: any[];

    // Context
    chainId?: number;
}

export interface AnalysisResult {
    normalized: NormalizedTransaction;
    translations: TranslatedWarning[];
    rawData: TransactionInput;
}
