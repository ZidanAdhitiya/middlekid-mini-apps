// Transaction Normalizer - Converts raw transaction data to standard format

import { TransactionInput, NormalizedTransaction, WarningContext } from './types';
import { KNOWN_FUNCTION_SIGNATURES, isUnlimitedApproval } from './dictionary';

export class TransactionNormalizer {
    normalize(input: TransactionInput): NormalizedTransaction {
        const contexts: WarningContext[] = [];
        const functionSig = input.data?.slice(0, 10);

        // Detect function type from signature
        let type: NormalizedTransaction['type'] = 'CONTRACT_INTERACTION';
        let functionName = input.functionName || 'unknown';

        if (functionSig && KNOWN_FUNCTION_SIGNATURES[functionSig]) {
            const knownFunc = KNOWN_FUNCTION_SIGNATURES[functionSig];
            functionName = knownFunc.name;
            type = knownFunc.type as any;
        }

        // Parse parameters
        const parameters = this.parseParameters(input.data, functionName);

        // Detect approval scope
        let allowanceScope: 'unlimited' | 'limited' | 'none' = 'none';
        if (type === 'APPROVAL' && parameters.amount) {
            if (isUnlimitedApproval(parameters.amount)) {
                allowanceScope = 'unlimited';
                contexts.push('UNLIMITED_APPROVAL');
            } else {
                allowanceScope = 'limited';
                contexts.push('LIMITED_APPROVAL');
            }
        }

        // Detect high value
        if (input.value && BigInt(input.value || 0) > BigInt(10) ** BigInt(18)) {
            contexts.push('HIGH_VALUE_TRANSFER');
        }

        // Detect signature requests
        if (type === 'PERMIT' || functionName === 'permit') {
            contexts.push('SIGNATURE_REQUEST');
            contexts.push('BROAD_PERMISSIONS');
        }

        // Unknown function
        if (functionName === 'unknown' && input.data) {
            contexts.push('UNKNOWN_FUNCTION');
        }

        return {
            type,
            context: contexts,
            data: {
                contractAddress: input.to,
                functionName,
                parameters,
                value: input.value,
                allowanceScope,
                chainId: input.chainId
            }
        };
    }

    private parseParameters(data?: string, functionName?: string): Record<string, any> {
        if (!data || data.length < 10) return {};

        // Simple parameter extraction (in production, use web3.js or ethers.js)
        const params: Record<string, any> = {};

        if (functionName === 'approve' || functionName === 'transfer') {
            // First 32 bytes after function sig = address
            if (data.length >= 74) {
                params.spender = '0x' + data.slice(34, 74);
            }
            // Next 32 bytes = amount
            if (data.length >= 138) {
                params.amount = '0x' + data.slice(74, 138);
            }
        }

        return params;
    }
}
