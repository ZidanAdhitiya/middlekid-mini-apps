// Transaction fetcher using Alchemy API

import { alchemyAPI } from '../alchemy';

export interface FetchedTransaction {
    hash: string;
    from: string;
    to: string | null;
    data: string;
    value: string;
    blockNumber: number | null;
    timestamp: number | null;
}

export async function fetchRecentTransactions(
    address: string,
    chainId: number = 1
): Promise<FetchedTransaction[]> {
    try {
        // Map chainId to Alchemy network
        const networkMap: Record<number, string> = {
            1: 'eth-mainnet',
            137: 'polygon-mainnet',
            10: 'opt-mainnet',
            42161: 'arb-mainnet',
            8453: 'base-mainnet',
        };

        const network = networkMap[chainId] || 'eth-mainnet';

        // Fetch transfers using Alchemy
        const transfers = await alchemyAPI.getAssetTransfers({
            fromAddress: address,
            category: ['external', 'erc20', 'erc721', 'erc1155'],
            maxCount: 10,
            order: 'desc'
        });

        // Transform to our format
        const transactions: FetchedTransaction[] = transfers.transfers.map((transfer: any) => ({
            hash: transfer.hash,
            from: transfer.from,
            to: transfer.to,
            data: transfer.rawContract?.value || '0x',
            value: transfer.value?.toString() || '0',
            blockNumber: parseInt(transfer.blockNum, 16),
            timestamp: null // Would need additional API call for timestamp
        }));

        return transactions;
    } catch (error) {
        console.error('Failed to fetch transactions:', error);
        return [];
    }
}
