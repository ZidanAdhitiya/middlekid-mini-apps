// Transaction History Fetcher - Real Blockchain Data
// Fetches ERC20 transfer events and parses them into buy/sell transactions

import { alchemyAPI } from '../alchemy';
import { RegretTransaction } from './regret-types';

const USE_REAL_DATA = true; // process.env.NEXT_PUBLIC_USE_REAL_DATA === 'true';

export interface TokenTransfer {
    hash: string;
    from: string;
    to: string;
    value: string;
    asset: string; // token address
    rawContract: {
        address: string;
        decimal: string;
    };
    metadata: {
        blockTimestamp: string;
    };
    category: string;
}

export class TransactionHistoryFetcher {

    /**
     * Fetch wallet transaction history from blockchain
     */
    async fetchWalletTransactionHistory(
        address: string,
        chainId: number = 8453,
        daysBack: number = 30
    ): Promise<RegretTransaction[]> {
        if (!USE_REAL_DATA) {
            console.log('📭 Real data disabled - returning empty array (will use mock data)');
            return [];
        }

        console.log(`🔍 Fetching REAL transaction history for ${address}`);

        try {
            // Fetch ERC20 transfers using Alchemy
            const transfers = await this.fetchERC20Transfers(address, chainId, daysBack);

            if (transfers.length === 0) {
                console.log('📭 No ERC20 transfers found in selected period');
                return [];
            }

            console.log(`📊 Found ${transfers.length} ERC20 transfers`);

            // Parse transfers into buy/sell transactions
            const transactions = await this.parseTransfersToTransactions(
                transfers,
                address,
                chainId
            );

            console.log(`✅ Parsed into ${transactions.length} transactions`);

            return transactions;

        } catch (error) {
            console.error('❌ Error fetching transaction history:', error);
            return [];
        }
    }

    /**
     * Fetch ERC20 transfers using Alchemy API
     */
    private async fetchERC20Transfers(
        address: string,
        chainId: number,
        daysBack: number
    ): Promise<TokenTransfer[]> {
        const chainIdStr = chainId.toString();

        // For Base chain, always use BaseScan directly (Alchemy key may not be configured)
        if (chainId === 8453) {
            console.log('🔍 Using Blockscout for Base chain...');
            return await this.fetchFromBlockscout(address, chainId, daysBack);
        }

        try {
            console.log(`🔍 Fetching ERC20 transfers for ${address} on chain ${chainId}`);

            // Fetch transfers FROM wallet (sells)
            const outgoing = await alchemyAPI.getAssetTransfers({
                fromAddress: address,
                chainId: chainIdStr,
                category: ['erc20', 'external'],
                maxCount: 1000
            });

            // Fetch transfers TO wallet (buys)
            const incoming = await alchemyAPI.getAssetTransfers({
                toAddress: address,
                chainId: chainIdStr,
                category: ['erc20', 'external'],
                maxCount: 1000
            });

            console.log(`✅ Alchemy API success:`, {
                outgoing: outgoing?.transfers?.length || 0,
                incoming: incoming?.transfers?.length || 0
            });

            // Combine and filter by time period
            const allTransfers = [
                ...(outgoing?.transfers || []),
                ...(incoming?.transfers || [])
            ];

            if (allTransfers.length === 0) {
                console.log('⚠️ No transfers from Alchemy, trying Blockscout fallback...');
                return await this.fetchFromBlockscout(address, chainId, daysBack);
            }

            // Filter by date
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysBack);

            const filtered = allTransfers.filter((tx: any) => {
                // Skip transfers with missing metadata
                if (!tx.metadata || !tx.metadata.blockTimestamp) {
                    return true; // Include anyway - better than dropping
                }
                const txDate = new Date(tx.metadata.blockTimestamp);
                return txDate >= cutoffDate;
            });

            console.log(`📊 Filtered ${filtered.length} transfers within ${daysBack} days`);
            return filtered as TokenTransfer[];

        } catch (error) {
            console.error('❌ Alchemy API error:', error);
            console.log('🔄 Trying Blockscout fallback...');

            try {
                return await this.fetchFromBlockscout(address, chainId, daysBack);
            } catch (fallbackError) {
                console.error('❌ Blockscout fallback also failed:', fallbackError);
                return [];
            }
        }
    }

    /**
     * Fallback: Fetch transactions from Blockscout API
     * More reliable without API key than BaseScan
     */
    private async fetchFromBlockscout(
        address: string,
        chainId: number,
        daysBack: number
    ): Promise<TokenTransfer[]> {
        // Only works for Base network (chainId 8453)
        if (chainId !== 8453) {
            console.log('⚠️ Blockscout only supports Base network, skipping fallback');
            return [];
        }

        console.log('🔍 Fetching from Blockscout API...');

        try {
            // Blockscout API (compatible with Etherscan)
            // https://base.blockscout.com/api?module=account&action=tokentx&address={address}
            const baseUrl = 'https://base.blockscout.com/api';

            const erc20Url = `${baseUrl}?module=account&action=tokentx&address=${address}&sort=desc`;
            const normalUrl = `${baseUrl}?module=account&action=txlist&address=${address}&sort=desc`;

            console.log('📡 Calling Blockscout endpoints...');
            const [erc20Res, normalRes] = await Promise.all([
                fetch(erc20Url),
                fetch(normalUrl)
            ]);

            const erc20Data = await erc20Res.json();
            const normalData = await normalRes.json();

            console.log('📊 Blockscout Response:', {
                erc20Status: erc20Data.status,
                erc20Message: erc20Data.message,
                erc20Count: Array.isArray(erc20Data.result) ? erc20Data.result.length : 0,
                normalStatus: normalData.status,
                normalMessage: normalData.message,
                normalCount: Array.isArray(normalData.result) ? normalData.result.length : 0
            });

            // Check results (Blockscout returns '1' for success, similar to Etherscan)
            const erc20List = (erc20Data.status === '1' && Array.isArray(erc20Data.result)) ? erc20Data.result : [];
            const normalList = (normalData.status === '1' && Array.isArray(normalData.result)) ? normalData.result : [];

            console.log(`✅ Blockscout API success: ${erc20List.length} ERC20, ${normalList.length} Native found`);

            // Convert Blockscout format (standard Etherscan format) to TokenTransfer
            const cutoffTimestamp = Math.floor(Date.now() / 1000) - (daysBack * 24 * 60 * 60);

            // Process ERC20 transfers
            const erc20Transfers: TokenTransfer[] = erc20List
                .filter((tx: any) => parseInt(tx.timeStamp) >= cutoffTimestamp)
                .map((tx: any) => ({
                    hash: tx.hash,
                    from: tx.from,
                    to: tx.to,
                    value: tx.value,
                    asset: tx.tokenSymbol || 'UNKNOWN',
                    rawContract: {
                        address: tx.contractAddress,
                        decimal: tx.tokenDecimal
                    },
                    metadata: {
                        blockTimestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString()
                    },
                    category: 'erc20'
                }));

            // Process Native ETH transfers
            const normalTransfers: TokenTransfer[] = normalList
                .filter((tx: any) => parseInt(tx.timeStamp) >= cutoffTimestamp && tx.value !== '0' && tx.isError === '0')
                .map((tx: any) => ({
                    hash: tx.hash,
                    from: tx.from,
                    to: tx.to,
                    value: tx.value,
                    asset: 'ETH',
                    rawContract: {
                        address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', // Native ETH placeholder
                        decimal: '18'
                    },
                    metadata: {
                        blockTimestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString()
                    },
                    category: 'external'
                }));

            const combined = [...erc20Transfers, ...normalTransfers];
            console.log(`📊 Blockscout filtered: ${combined.length} transfers within ${daysBack} days`);
            return combined;

        } catch (error) {
            console.error('❌ Blockscout API fetch error:', error);
            return [];
        }
    }

    /**
     * Parse transfers into RegretTransaction format
     */
    private async parseTransfersToTransactions(
        transfers: TokenTransfer[],
        walletAddress: string,
        chainId: number
    ): Promise<RegretTransaction[]> {
        const transactions: RegretTransaction[] = [];

        // Group by token
        const byToken = new Map<string, TokenTransfer[]>();

        transfers.forEach(tx => {
            // Handle Native ETH (external) which has no contract address
            const tokenAddr = tx.rawContract?.address
                ? tx.rawContract.address.toLowerCase()
                : '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'; // Native ETH placeholder

            if (!byToken.has(tokenAddr)) {
                byToken.set(tokenAddr, []);
            }
            byToken.get(tokenAddr)!.push(tx);
        });

        // Parse each token's transfers
        for (const [tokenAddr, txs] of byToken.entries()) {
            for (const tx of txs) {
                try {
                    // Determine if BUY or SELL
                    const isBuy = tx.to.toLowerCase() === walletAddress.toLowerCase();
                    const type = isBuy ? 'BUY' : 'SELL';

                    // Get token metadata
                    // Get token metadata
                    const decimals = tx.rawContract?.decimal ? parseInt(tx.rawContract.decimal) : 18;
                    const amount = parseFloat(tx.value) || 0;

                    // Get timestamp (with null safety)
                    let timestamp = Math.floor(Date.now() / 1000); // Default to now
                    if (tx.metadata && tx.metadata.blockTimestamp) {
                        timestamp = Math.floor(
                            new Date(tx.metadata.blockTimestamp).getTime() / 1000
                        );
                    }

                    // We'll fetch price later in regret calculator
                    const priceAtTime = 0; // Placeholder

                    transactions.push({
                        hash: tx.hash,
                        type,
                        token: {
                            address: tokenAddr,
                            symbol: tx.asset || '???',
                            name: tx.asset || 'Unknown'
                        },
                        amount: amount.toString(),
                        priceAtTime,
                        totalValue: 0, // Will be calculated with price
                        timestamp,
                        blockNumber: 0 // Not critical for regret calc
                    });

                } catch (error) {
                    console.error(`Error parsing transfer ${tx.hash}:`, error);
                }
            }
        }

        // Sort by timestamp
        return transactions.sort((a, b) => a.timestamp - b.timestamp);
    }

    /**
     * Enrich transactions with token metadata
     */
    async enrichWithMetadata(
        transactions: RegretTransaction[],
        chainId: number
    ): Promise<RegretTransaction[]> {
        const chainIdStr = chainId.toString();

        for (const tx of transactions) {
            try {
                // Fetch token metadata from Alchemy
                const metadata = await alchemyAPI.getTokenMetadata(
                    tx.token.address,
                    chainIdStr
                );

                if (metadata) {
                    tx.token.symbol = metadata.symbol || tx.token.symbol;
                    tx.token.name = metadata.name || tx.token.name;
                }
            } catch (error) {
                // Continue with existing data
                console.warn(`Could not fetch metadata for ${tx.token.address}`);
            }
        }

        return transactions;
    }
}

// Singleton
export const txHistoryFetcher = new TransactionHistoryFetcher();
