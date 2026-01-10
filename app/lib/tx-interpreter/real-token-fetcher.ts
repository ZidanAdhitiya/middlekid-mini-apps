// Real Token Holdings Fetcher
// Fetches actual token holdings from blockchain using BaseScan API and on-chain calls

import { TokenHolding } from './wallet-types';

const BASESCAN_API_KEY = process.env.NEXT_PUBLIC_BASESCAN_API_KEY || 'YourApiKeyToken';
const GOPLUS_API_URL = 'https://api.gopluslabs.io/api/v1/token_security';

interface BaseScanTokenTransfer {
    contractAddress: string;
    tokenName: string;
    tokenSymbol: string;
    tokenDecimal: string;
}

interface GoPlusSecurityData {
    is_honeypot: string;
    buy_tax: string;
    sell_tax: string;
    is_blacklisted: string;
    is_whitelisted: string;
    is_open_source: string;
    honeypot_with_same_creator: string;
    fake_token: string;
}

export class RealTokenFetcher {

    /**
     * Fetch real token holdings from BaseScan API
     */
    async fetchTokenHoldings(walletAddress: string, chainId: number = 8453): Promise<TokenHolding[]> {
        try {
            console.log('🔍 Fetching REAL token holdings for:', walletAddress);

            // Step 1: Get list of tokens from BaseScan
            const tokens = await this.getTokenListFromBaseScan(walletAddress, chainId);

            if (tokens.length === 0) {
                console.log('📭 No tokens found in wallet');
                return [];
            }

            console.log(`📊 Found ${tokens.length} unique tokens`);

            // Step 2: Get balances and check security for each token
            const holdings: TokenHolding[] = [];

            for (const token of tokens) {
                try {
                    // Get current balance
                    const balance = await this.getTokenBalance(
                        walletAddress,
                        token.contractAddress,
                        chainId
                    );

                    // Skip if balance is 0
                    if (balance === '0' || balance === '0x0') {
                        continue;
                    }

                    // Check security status
                    const securityData = await this.checkTokenSecurity(
                        token.contractAddress,
                        chainId
                    );

                    const decimals = parseInt(token.tokenDecimal) || 18;
                    const balanceNum = parseInt(balance);
                    const formattedBalance = (balanceNum / Math.pow(10, decimals)).toFixed(4);

                    holdings.push({
                        address: token.contractAddress,
                        symbol: token.tokenSymbol || '???',
                        name: token.tokenName || 'Unknown Token',
                        balance: balance,
                        balanceFormatted: `${formattedBalance} ${token.tokenSymbol}`,
                        decimals,
                        isScam: securityData.isScam,
                        riskScore: securityData.riskScore,
                        warnings: securityData.warnings
                    });

                } catch (error) {
                    console.error(`Error processing token ${token.contractAddress}:`, error);
                    // Continue with next token
                }
            }

            console.log(`✅ Processed ${holdings.length} tokens with balances`);
            console.log(`⚠️ Found ${holdings.filter(h => h.isScam).length} scam tokens`);

            return holdings;

        } catch (error) {
            console.error('❌ Error fetching token holdings:', error);
            throw error;
        }
    }

    /**
     * Get list of tokens from BaseScan API
     */
    private async getTokenListFromBaseScan(
        address: string,
        chainId: number
    ): Promise<BaseScanTokenTransfer[]> {

        // Map chainId to BaseScan API URL
        const apiUrls: { [key: number]: string } = {
            8453: 'https://api.basescan.org/api',
            1: 'https://api.etherscan.io/api',
            137: 'https://api.polygonscan.com/api',
            42161: 'https://api.arbiscan.io/api',
            10: 'https://api-optimistic.etherscan.io/api'
        };

        const apiUrl = apiUrls[chainId];
        if (!apiUrl) {
            throw new Error(`ChainId ${chainId} not supported for token fetching`);
        }

        const url = `${apiUrl}?module=account&action=tokentx&address=${address}&startblock=0&endblock=999999999&sort=desc&apikey=${BASESCAN_API_KEY}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.status !== '1') {
                console.warn('BaseScan API returned error:', data.message);
                return [];
            }

            // Extract unique tokens
            const uniqueTokens = new Map<string, BaseScanTokenTransfer>();

            for (const tx of data.result) {
                if (!uniqueTokens.has(tx.contractAddress)) {
                    uniqueTokens.set(tx.contractAddress, {
                        contractAddress: tx.contractAddress,
                        tokenName: tx.tokenName,
                        tokenSymbol: tx.tokenSymbol,
                        tokenDecimal: tx.tokenDecimal
                    });
                }
            }

            return Array.from(uniqueTokens.values());

        } catch (error) {
            console.error('Error calling BaseScan API:', error);
            return [];
        }
    }

    /**
     * Get token balance using on-chain RPC call
     */
    private async getTokenBalance(
        walletAddress: string,
        tokenAddress: string,
        chainId: number
    ): Promise<string> {

        const rpcUrls: { [key: number]: string } = {
            8453: 'https://mainnet.base.org',
            1: 'https://eth.llamarpc.com',
            137: 'https://polygon-rpc.com',
            42161: 'https://arb1.arbitrum.io/rpc',
            10: 'https://mainnet.optimism.io'
        };

        const rpcUrl = rpcUrls[chainId] || rpcUrls[8453];

        // ERC20 balanceOf function signature
        const balanceOfSignature = '0x70a08231';
        const paddedAddress = walletAddress.replace('0x', '').padStart(64, '0');
        const data = balanceOfSignature + paddedAddress;

        try {
            const response = await fetch(rpcUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'eth_call',
                    params: [
                        {
                            to: tokenAddress,
                            data: data
                        },
                        'latest'
                    ]
                })
            });

            const result = await response.json();
            return result.result || '0';

        } catch (error) {
            console.error(`Error getting balance for ${tokenAddress}:`, error);
            return '0';
        }
    }

    /**
     * Check token security using GoPlus API
     */
    private async checkTokenSecurity(
        tokenAddress: string,
        chainId: number
    ): Promise<{ isScam: boolean; riskScore: number; warnings: string[] }> {

        try {
            const url = `${GOPLUS_API_URL}/${chainId}?contract_addresses=${tokenAddress}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.code !== 1 || !data.result || !data.result[tokenAddress.toLowerCase()]) {
                // No data available, assume unknown
                return {
                    isScam: false,
                    riskScore: 50,
                    warnings: ['Tidak ada data keamanan tersedia']
                };
            }

            const security: GoPlusSecurityData = data.result[tokenAddress.toLowerCase()];
            const warnings: string[] = [];
            let riskScore = 0;

            // Analyze security data
            if (security.is_honeypot === '1') {
                warnings.push('🚨 HONEYPOT - Token tidak bisa dijual!');
                riskScore += 90;
            }

            if (security.fake_token === '1') {
                warnings.push('⚠️ Fake Token - Imitasi token populer');
                riskScore += 80;
            }

            const buyTax = parseFloat(security.buy_tax || '0');
            const sellTax = parseFloat(security.sell_tax || '0');

            if (buyTax > 10 || sellTax > 10) {
                warnings.push(`💸 Tax tinggi: Buy ${buyTax}% / Sell ${sellTax}%`);
                riskScore += 40;
            }

            if (security.is_blacklisted === '1') {
                warnings.push('❌ Masuk blacklist scam database');
                riskScore += 100;
            }

            if (security.is_open_source === '0') {
                warnings.push('⚠️ Kode contract tidak open source');
                riskScore += 20;
            }

            if (security.honeypot_with_same_creator === '1') {
                warnings.push('🚩 Creator pernah buat honeypot lain');
                riskScore += 60;
            }

            const isScam = riskScore >= 70;

            return {
                isScam,
                riskScore: Math.min(100, riskScore),
                warnings
            };

        } catch (error) {
            console.error('Error checking token security:', error);
            return {
                isScam: false,
                riskScore: 0,
                warnings: ['Gagal mengecek keamanan token']
            };
        }
    }
}

// Singleton instance
export const realTokenFetcher = new RealTokenFetcher();
