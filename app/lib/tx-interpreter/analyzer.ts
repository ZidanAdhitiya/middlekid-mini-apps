// Context Analyzer - Determines contract verification and additional context

import { NormalizedTransaction, WarningContext } from './types';

export class ContextAnalyzer {
    async analyze(normalized: NormalizedTransaction): Promise<WarningContext[]> {
        const additionalContexts: WarningContext[] = [];

        // Check contract verification (mock for now, would use Etherscan API)
        if (normalized.data.contractAddress) {
            const isVerified = await this.checkContractVerification(
                normalized.data.contractAddress,
                normalized.data.chainId
            );

            if (!isVerified) {
                additionalContexts.push('UNVERIFIED_CONTRACT');
            }
        }

        return [...normalized.context, ...additionalContexts];
    }

    private async checkContractVerification(
        address: string,
        chainId?: number
    ): Promise<boolean> {
        // Mock implementation
        // In production, call Etherscan API:
        // https://api.etherscan.io/api?module=contract&action=getabi&address=${address}

        // For now, return true to avoid false warnings
        return true;
    }

    // Future: Add more analysis methods
    // - checkKnownScamAddress
    // - checkTokenContract
    // - checkProxyPattern
}
