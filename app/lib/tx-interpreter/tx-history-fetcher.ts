// Transaction History Fetcher - Real Blockchain Data
// Fetches ERC20 transfer events and parses them into buy/sell transactions

import { alchemyAPI } from '../alchemy';
import { RegretTransaction } from './regret-types';

const USE_REAL_DATA = process.env.NEXT_PUBLIC_USE_REAL_DATA === 'true';

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

        try {
            // Fetch transfers FROM wallet (sells)
            const outgoing = await alchemyAPI.getAssetTransfers({
                fromAddress: address,
                chainId: chainIdStr,
                category: ['erc20'],
                maxCount: 100
            });

            // Fetch transfers TO wallet (buys)
            const incoming = await alchemyAPI.getAssetTransfers({
                toAddress: address,
                chainId: chainIdStr,
                category: ['erc20'],
                maxCount: 100
            });

            // Combine and filter by time period
            const allTransfers = [
                ...(outgoing?.transfers || []),
                ...(incoming?.transfers || [])
            ];

            // Filter by date
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysBack);

            const filtered = allTransfers.filter((tx: any) => {
                const txDate = new Date(tx.metadata.blockTimestamp);
                return txDate >= cutoffDate;
            });

            return filtered as TokenTransfer[];

        } catch (error) {
            console.error('Error fetching from Alchemy:', error);
            // Try BaseScan fallback if needed
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
            const tokenAddr = tx.rawContract.address.toLowerCase();
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
                    const decimals = parseInt(tx.rawContract.decimal) || 18;
                    const amount = parseFloat(tx.value) || 0;

                    // Get timestamp
                    const timestamp = Math.floor(
                        new Date(tx.metadata.blockTimestamp).getTime() / 1000
                    );

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
