// Transaction fetcher using Blockscout API (free, no API key required)
// Replaced Alchemy which requires paid API key

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
    chainId: number = 8453
): Promise<FetchedTransaction[]> {
    try {
        console.log(`🔍 Fetching transactions for ${address} on chain ${chainId}`);

        // Use Blockscout for Base chain (primary supported chain)
        if (chainId === 8453) {
            return await fetchFromBlockscout(address);
        }

        // For other chains, return empty (would need different explorers)
        console.log(`⚠️ Chain ${chainId} not supported, returning empty array`);
        return [];

    } catch (error) {
        console.error('Failed to fetch transactions:', error);
        return [];
    }
}

async function fetchFromBlockscout(address: string): Promise<FetchedTransaction[]> {
    try {
        const url = `https://base.blockscout.com/api/v2/addresses/${address}/transactions`;
        console.log('📡 Calling Blockscout API...');

        const response = await fetch(url);
        const data = await response.json();

        if (!data.items || !Array.isArray(data.items)) {
            console.log('⚠️ No transactions found from Blockscout');
            return [];
        }

        console.log(`✅ Blockscout returned ${data.items.length} transactions`);

        // Transform to our format
        const transactions: FetchedTransaction[] = data.items.slice(0, 10).map((tx: any) => ({
            hash: tx.hash,
            from: tx.from?.hash || '',
            to: tx.to?.hash || null,
            data: tx.input || '0x',
            value: tx.value || '0',
            blockNumber: tx.block ? parseInt(tx.block) : null,
            timestamp: tx.timestamp ? new Date(tx.timestamp).getTime() / 1000 : null
        }));

        return transactions;
    } catch (error) {
        console.error('Blockscout API error:', error);
        return [];
    }
}
