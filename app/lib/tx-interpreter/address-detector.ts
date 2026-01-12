// Smart Input Type Detector
// Determines if input is a Transaction Hash, Wallet Address, or Token Contract

export type InputType = 'TRANSACTION' | 'WALLET' | 'TOKEN_CONTRACT' | 'INVALID';

export interface InputDetectionResult {
    type: InputType;
    confidence: number;
    reason: string;
}

/**
 * Detects what type of input the user provided
 * @param input - User input (address or tx hash)
 * @returns InputType
 */
export async function detectInputType(input: string): Promise<InputDetectionResult> {
    // Clean input
    const cleaned = input.trim().toLowerCase();

    // 1. Check if it looks like a transaction hash (64 hex chars + 0x)
    if (cleaned.length === 66 && cleaned.startsWith('0x')) {
        return {
            type: 'TRANSACTION',
            confidence: 95,
            reason: 'Length matches transaction hash format (66 characters)'
        };
    }

    // 2. Check if it's a valid Ethereum address (40 hex chars + 0x)
    if (cleaned.length === 42 && cleaned.startsWith('0x')) {
        const isValidHex = /^0x[a-f0-9]{40}$/i.test(cleaned);

        if (!isValidHex) {
            return {
                type: 'INVALID',
                confidence: 100,
                reason: 'Invalid hexadecimal format'
            };
        }

        // Try to determine if it's a wallet or contract
        // We'll need to check on-chain, but for now use heuristics
        try {
            const result = await checkIfContract(cleaned);
            return result;
        } catch (error) {
            // Fallback: assume it's a wallet if we can't check
            return {
                type: 'WALLET',
                confidence: 50,
                reason: 'Valid address format, unable to verify if contract'
            };
        }
    }

    // 3. Invalid input
    return {
        type: 'INVALID',
        confidence: 100,
        reason: 'Does not match transaction hash or address format'
    };
}

/**
 * Checks if an address is a smart contract or regular wallet
 * Uses server-side API to bypass CORS restrictions
 */
async function checkIfContract(address: string, chainId: number = 8453): Promise<InputDetectionResult> {
    try {
        // Call server-side API for contract detection
        const response = await fetch('/api/check-contract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, chainId })
        });

        if (response.ok) {
            const data = await response.json();

            console.log(`[Detection] Contract check result: ${data.type}, isContract: ${data.isContract}`);

            if (data.isContract) {
                return {
                    type: 'TOKEN_CONTRACT',
                    confidence: 95,
                    reason: 'Verified as contract (has bytecode) via server-side RPC'
                };
            } else {
                return {
                    type: 'WALLET',
                    confidence: 95,
                    reason: 'Verified as wallet (no contract code) via server-side RPC'
                };
            }
        }
    } catch (error) {
        console.error('Contract check API failed:', error);
    }

    // Fallback: Default to WALLET with low confidence
    return {
        type: 'WALLET',
        confidence: 50,
        reason: 'Unable to verify on-chain, defaulting to wallet address'
    };
}

/**
 * Quick validation without async calls
 */
export function quickValidate(input: string): boolean {
    const cleaned = input.trim();

    // Check transaction hash format
    if (cleaned.length === 66 && cleaned.startsWith('0x')) {
        return /^0x[a-f0-9]{64}$/i.test(cleaned);
    }

    // Check address format
    if (cleaned.length === 42 && cleaned.startsWith('0x')) {
        return /^0x[a-f0-9]{40}$/i.test(cleaned);
    }

    return false;
}
