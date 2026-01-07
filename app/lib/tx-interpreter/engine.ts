// Main Transaction Interpreter Engine - Orchestrates all components

import { TransactionInput, AnalysisResult, TranslatedWarning } from './types';
import { TransactionNormalizer } from './normalizer';
import { ContextAnalyzer } from './analyzer';
import { TRANSLATION_DICTIONARY } from './dictionary';

export class TransactionInterpreter {
    private normalizer: TransactionNormalizer;
    private analyzer: ContextAnalyzer;

    constructor() {
        this.normalizer = new TransactionNormalizer();
        this.analyzer = new ContextAnalyzer();
    }

    async interpret(input: TransactionInput): Promise<AnalysisResult> {
        // Step 1: Normalize transaction data
        const normalized = this.normalizer.normalize(input);

        // Step 2: Add additional context (verification, etc)
        const fullContexts = await this.analyzer.analyze(normalized);
        normalized.context = fullContexts;

        // Step 3: Translate contexts to human language
        const translations: TranslatedWarning[] = fullContexts
            .map(context => TRANSLATION_DICTIONARY[context])
            .filter(Boolean);

        // Step 4: Add technical details if available
        if (normalized.data.functionName) {
            translations.forEach(translation => {
                translation.technicalDetails = this.formatTechnicalDetails(normalized);
            });
        }

        return {
            normalized,
            translations,
            rawData: input
        };
    }

    private formatTechnicalDetails(normalized: any): string {
        const details: string[] = [];

        if (normalized.data.contractAddress) {
            details.push(`Contract: ${normalized.data.contractAddress}`);
        }

        if (normalized.data.functionName) {
            details.push(`Function: ${normalized.data.functionName}()`);
        }

        if (normalized.data.allowanceScope) {
            details.push(`Scope: ${normalized.data.allowanceScope}`);
        }

        return details.join(' | ');
    }
}

// Singleton instance
export const txInterpreter = new TransactionInterpreter();
