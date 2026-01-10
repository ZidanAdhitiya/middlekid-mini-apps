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
 * Uses contract code detection with multiple fallbacks
 */
async function checkIfContract(address: string): Promise<InputDetectionResult> {
    // Method 1: Try Blockscout API
    try {
        const response = await fetch(`https://base.blockscout.com/api/v2/addresses/${address}`);

        if (response.ok) {
            const data = await response.json();

            // If it has contract code, it's a contract
            if (data.is_contract) {
                return {
                    type: 'TOKEN_CONTRACT',
                    confidence: 95,
                    reason: 'Verified as smart contract via Blockscout API'
                };
            } else {
                return {
                    type: 'WALLET',
                    confidence: 95,
                    reason: 'Verified as Externally Owned Account (EOA) via Blockscout API'
                };
            }
        }
    } catch (error) {
        console.log('Blockscout API unavailable, trying RPC fallback');
    }

    // Method 2: Try RPC eth_getCode check
    try {
        const rpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org';
        const rpcResponse = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_getCode',
                params: [address, 'latest'],
                id: 1
            })
        });

        if (rpcResponse.ok) {
            const rpcData = await rpcResponse.json();
            const code = rpcData.result;

            // "0x" means no code = EOA/Wallet
            // Anything else means contract
            if (code === '0x' || code === '0x0') {
                return {
                    type: 'WALLET',
                    confidence: 90,
                    reason: 'Verified as wallet (no contract code) via RPC'
                };
            } else {
                return {
                    type: 'TOKEN_CONTRACT',
                    confidence: 90,
                    reason: 'Verified as contract (has bytecode) via RPC'
                };
            }
        }
    } catch (error) {
        console.log('RPC check failed, using default assumption');
    }

    // Fallback: Default to WALLET
    // Most user inputs are wallet addresses, not contracts
    // Better UX to assume wallet than wrongly label as contract
    return {
        type: 'WALLET',
        confidence: 60,
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
