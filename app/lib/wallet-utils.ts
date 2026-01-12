// Wallet utilities for direct MetaMask/Ethereum wallet integration
// No external dependencies - uses window.ethereum directly

export interface EthereumProvider {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (event: string, handler: (...args: any[]) => void) => void;
    removeListener: (event: string, handler: (...args: any[]) => void) => void;
    isMetaMask?: boolean;
}

declare global {
    interface Window {
        ethereum?: any; // Using 'any' to match existing global types
    }
}

/**
 * Detect available wallet providers
 * Supports: MetaMask, Coinbase Wallet, Rabby, Trust Wallet, and more
 */
export interface WalletInfo {
    provider: EthereumProvider;
    name: string;
    icon: string;
}

export function detectWallet(): EthereumProvider | null {
    if (typeof window === 'undefined') return null;
    return window.ethereum || null;
}

/**
 * Detect all available wallet providers
 */
export function detectAllWallets(): WalletInfo[] {
    if (typeof window === 'undefined') return [];

    const wallets: WalletInfo[] = [];

    // Check for MetaMask
    if (window.ethereum?.isMetaMask) {
        wallets.push({
            provider: window.ethereum,
            name: 'MetaMask',
            icon: '🦊'
        });
    }

    // Check for Coinbase Wallet
    if (window.ethereum?.isCoinbaseWallet) {
        wallets.push({
            provider: window.ethereum,
            name: 'Coinbase Wallet',
            icon: '🔵'
        });
    }

    // Check for Rabby
    if (window.ethereum?.isRabby) {
        wallets.push({
            provider: window.ethereum,
            name: 'Rabby',
            icon: '🐰'
        });
    }

    // Check for Trust Wallet
    if (window.ethereum?.isTrust) {
        wallets.push({
            provider: window.ethereum,
            name: 'Trust Wallet',
            icon: '🛡️'
        });
    }

    // Fallback: Generic injected wallet
    if (window.ethereum && wallets.length === 0) {
        wallets.push({
            provider: window.ethereum,
            name: 'Web3 Wallet',
            icon: '🔗'
        });
    }

    return wallets;
}

/**
 * Get preferred wallet name for display
 */
export function getWalletName(): string {
    if (typeof window === 'undefined') return 'Wallet';

    if (window.ethereum?.isMetaMask) return 'MetaMask';
    if (window.ethereum?.isCoinbaseWallet) return 'Coinbase Wallet';
    if (window.ethereum?.isRabby) return 'Rabby';
    if (window.ethereum?.isTrust) return 'Trust Wallet';

    return 'Wallet';
}

/**
 * Check if wallet is installed
 */
export function isWalletInstalled(): boolean {
    return detectWallet() !== null;
}

/**
 * Connect to wallet and get user address
 */
export async function connectWallet(): Promise<string> {
    const ethereum = detectWallet();

    if (!ethereum) {
        throw new Error('MetaMask not installed. Please install MetaMask to continue.');
    }

    try {
        // Optimization: Check if already connected first
        const existingAccounts = await ethereum.request({ method: 'eth_accounts' });
        if (existingAccounts && existingAccounts.length > 0) {
            console.log('✅ Wallet already connected:', existingAccounts[0]);
            return existingAccounts[0];
        }

        const accounts = await ethereum.request({
            method: 'eth_requestAccounts'
        });

        if (!accounts || accounts.length === 0) {
            throw new Error('No accounts found');
        }

        console.log('✅ Wallet connected:', accounts[0]);
        return accounts[0];
    } catch (error: any) {
        if (error.code === 4001) {
            throw new Error('Connection cancelled. Please CHECK YOUR WALLET EXTENSION (it might be locked or have a pending request) and approve.');
        }
        throw error;
    }
}

/**
 * Get current chain ID
 */
export async function getCurrentChainId(): Promise<string> {
    const ethereum = detectWallet();
    if (!ethereum) throw new Error('Wallet not detected');

    const chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log('Current chain ID:', chainId);
    return chainId;
}

/**
 * Check if currently on Base Sepolia network
 */
export async function isOnBaseSepolia(): Promise<boolean> {
    try {
        const chainId = await getCurrentChainId();
        return chainId === '0x14a34'; // 84532 in hex
    } catch {
        return false;
    }
}

/**
 * Switch to Base Sepolia network
 */
export async function switchToBaseSepolia(): Promise<void> {
    const ethereum = detectWallet();
    if (!ethereum) throw new Error('Wallet not detected');

    const BASE_SEPOLIA_CHAIN_ID = '0x14a34'; // 84532

    try {
        console.log('🔄 Switching to Base Sepolia...');

        await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: BASE_SEPOLIA_CHAIN_ID }]
        });

        console.log('✅ Switched to Base Sepolia');
    } catch (error: any) {
        // Network not added, add it
        if (error.code === 4902) {
            console.log('📝 Adding Base Sepolia network...');

            try {
                await ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: BASE_SEPOLIA_CHAIN_ID,
                        chainName: 'Base Sepolia',
                        nativeCurrency: {
                            name: 'Ether',
                            symbol: 'ETH',
                            decimals: 18
                        },
                        rpcUrls: ['https://sepolia.base.org'],
                        blockExplorers: [{
                            name: 'BaseScan',
                            url: 'https://sepolia.basescan.org'
                        }]
                    }]
                });

                console.log('✅ Base Sepolia network added');
            } catch (addError) {
                throw new Error('Failed to add Base Sepolia network');
            }
        } else if (error.code === 4001) {
            throw new Error('Network switch rejected by user');
        } else {
            throw error;
        }
    }
}

/**
 * Send ETH transaction
 */
export async function sendTransaction(
    from: string,
    to: string,
    valueInWei: string,
    data?: string
): Promise<string> {
    const ethereum = detectWallet();
    if (!ethereum) throw new Error('Wallet not detected');

    try {
        console.log('📤 Sending transaction...', { from, to, value: valueInWei });

        const txHash = await ethereum.request({
            method: 'eth_sendTransaction',
            params: [{
                from,
                to,
                value: valueInWei,
                data: data || '0x'
            }]
        });

        console.log('✅ Transaction sent:', txHash);
        return txHash;
    } catch (error: any) {
        if (error.code === 4001) {
            throw new Error('Transaction rejected by user');
        }
        throw error;
    }
}

/**
 * Wait for transaction confirmation
 */
export async function waitForTransactionConfirmation(
    txHash: string,
    timeoutMs: number = 120000
): Promise<any> {
    const ethereum = detectWallet();
    if (!ethereum) throw new Error('Wallet not detected');

    console.log('⏳ Waiting for transaction confirmation...', txHash);

    return new Promise((resolve, reject) => {
        const startTime = Date.now();

        const checkReceipt = async () => {
            try {
                const receipt = await ethereum.request({
                    method: 'eth_getTransactionReceipt',
                    params: [txHash]
                });

                if (receipt) {
                    console.log('✅ Transaction confirmed:', receipt);
                    if (receipt.status === '0x1') {
                        resolve(receipt);
                    } else {
                        reject(new Error('Transaction failed'));
                    }
                    return;
                }

                // Check timeout
                if (Date.now() - startTime > timeoutMs) {
                    reject(new Error('Transaction confirmation timeout'));
                    return;
                }

                // Check again in 2 seconds
                setTimeout(checkReceipt, 2000);
            } catch (error) {
                reject(error);
            }
        };

        checkReceipt();
    });
}

/**
 * Get Base Sepolia explorer URL for transaction
 */
export function getExplorerUrl(txHash: string): string {
    return `https://sepolia.basescan.org/tx/${txHash}`;
}

/**
 * Convert ETH amount to Wei (hex string)
 */
export function ethToWei(ethAmount: number): string {
    const weiAmount = Math.floor(ethAmount * 1e18);
    return '0x' + weiAmount.toString(16);
}

/**
 * Format address for display (0x1234...5678)
 */
export function formatAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
