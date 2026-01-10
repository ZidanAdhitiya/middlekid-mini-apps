// Payment validation utilities

export interface ValidationResult {
    isValid: boolean;
    error?: string;
    warning?: string;
}

/**
 * Validate premium amount
 */
export function validatePremium(premiumETH: number): ValidationResult {
    const MIN_PREMIUM = 0.0001;
    const MAX_PREMIUM = 1.0;
    const HIGH_AMOUNT = 0.1;

    if (premiumETH < MIN_PREMIUM) {
        return {
            isValid: false,
            error: `💰 Premium too small. Minimum is ${MIN_PREMIUM} ETH.`
        };
    }

    if (premiumETH > MAX_PREMIUM) {
        return {
            isValid: false,
            error: `⚠️ Premium too large. Maximum is ${MAX_PREMIUM} ETH for safety.`
        };
    }

    if (premiumETH > HIGH_AMOUNT) {
        return {
            isValid: true,
            warning: `⚠️ This is a large amount (${premiumETH} ETH). Please double-check before confirming.`
        };
    }

    return { isValid: true };
}

/**
 * Get user-friendly error message
 */
export function getFriendlyErrorMessage(error: any): string {
    const errorMsg = error?.message || error?.toString() || '';

    // User rejected/cancelled
    if (errorMsg.includes('rejected') || errorMsg.includes('denied') || errorMsg.includes('cancel')) {
        return '🚫 You cancelled the transaction. Your funds are safe. Feel free to try again when ready.';
    }

    //  Insufficient funds
    if (errorMsg.includes('insufficient')) {
        return '💰 Insufficient funds. You need more ETH in your wallet.\n\n💡 Tip: Get testnet ETH from faucet.quicknode.com/base/sepolia';
    }

    // Network issues
    if (errorMsg.includes('network') || errorMsg.includes('switch') || errorMsg.includes('chain')) {
        return '🌐 Network issue. Please make sure you\'re on Base Sepolia network and try again.';
    }

    // Timeout
    if (errorMsg.includes('timeout') || errorMsg.includes('timed out')) {
        return '⏱️ Transaction took too long. It might still complete. Check BaseScan in a few minutes.';
    }

    // RPC/Connection errors
    if (errorMsg.includes('rpc') || errorMsg.includes('connection') || errorMsg.includes('fetch')) {
        return '🔌 Connection error. Please check your internet and try again.';
    }

    // Gas errors
    if (errorMsg.includes('gas')) {
        return '⛽ Gas estimation failed. The network might be congested. Try again in a moment.';
    }

    // Generic error
    return '😔 Something went wrong. Please try again or contact support if this persists.\n\n' + (errorMsg || 'Unknown error');
}

/**
 * Format progress step message
 */
export function getStepMessage(step: number, totalSteps: number): string {
    const steps = [
        '1️⃣ Checking wallet...',
        '2️⃣ Connecting wallet...',
        '3️⃣ Switching network...',
        '4️⃣ Sending transaction...',
        '5️⃣ Confirming on blockchain...'
    ];

    return steps[step - 1] || `Step ${step}/${totalSteps}`;
}

/**
 * Estimate gas cost (simplified)
 * In production, this should call estimateGas from provider
 */
export async function estimateGasCost(): Promise<{ gasETH: number; gasUSD: number }> {
    // Simplified estimation
    // In production: const gasLimit = await contract.estimateGas.function()
    // const gasPrice = await provider.getGasPrice()

    // Base Sepolia average gas cost for simple transfer
    const estimatedGasETH = 0.0003; // ~21000 gas * 15 gwei
    const ethPriceUSD = 2000; // Simplified, should fetch real price

    return {
        gasETH: estimatedGasETH,
        gasUSD: estimatedGasETH * ethPriceUSD
    };
}

/**
 * Check if wallet has sufficient balance
 */
export async function checkSufficientBalance(
    walletAddress: string,
    requiredAmount: number
): Promise<ValidationResult> {
    try {
        // This would need actual balance check with provider
        // For now, return valid as we can't check without provider instance
        return { isValid: true };
    } catch (error) {
        return {
            isValid: false,
            error: '❌ Could not check wallet balance. Please try again.'
        };
    }
}

/**
 * Get helpful hints based on context
 */
export function getContextualHint(context: 'idle' | 'connecting' | 'network' | 'pending'): string {
    const hints = {
        idle: '💡 Make sure you have enough testnet ETH before starting.',
        connecting: '💡 Your wallet extension should pop up. Check your browser toolbar if you don\'t see it.',
        network: '💡 Base Sepolia is a testnet. Switch networks in your wallet settings if needed.',
        pending: '💡 Don\'t close this window until the transaction completes.'
    };

    return hints[context] || '';
}

/**
 * Format success message with next steps
 */
export function getSuccessMessage(tokenSymbol: string, txHash: string): {
    title: string;
    message: string;
    nextSteps: string[];
} {
    return {
        title: '🎉 Protection Activated!',
        message: `Your ${tokenSymbol} position is now protected with Thetanuts options.`,
        nextSteps: [
            '✅ View transaction on BaseScan',
            '📊 Monitor your protected position',
            '💰 Exercise option if price drops below strike',
            '🔄 Set up protection for other tokens'
        ]
    };
}
