// Transaction lookup by hash using server-side API route

export interface TransactionDetails {
    hash: string;
    from: string;
    to: string | null;
    data: string;
    value: string;
    blockNumber: number | null;
    timestamp: number | null;
    status: 'success' | 'failed' | 'pending';
    gasUsed?: string;
    functionName?: string;
    chainId: number;
}

export async function fetchTransactionByHash(
    hash: string,
    chainId: number = 8453 // Default to Base since user is using Basescan
): Promise<TransactionDetails | null> {
    try {
        console.log('Fetching transaction:', hash, 'on chain:', chainId);

        // Call server-side API route to keep API key secure
        const response = await fetch('/api/transaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ txHash: hash, chainId })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch transaction');
        }

        const { transaction, receipt } = await response.json();

        console.log('Transaction response:', transaction);
        console.log('Receipt response:', receipt);

        if (!transaction) {
            console.error('Transaction not found in response');
            return null;
        }

        // Determine status
        let status: TransactionDetails['status'] = 'pending';
        if (receipt) {
            // Handle both decimal and hex format
            if (receipt.status === 1 || receipt.status === '0x1' || receipt.status === '1') {
                status = 'success';
            } else if (receipt.status === 0 || receipt.status === '0x0' || receipt.status === '0') {
                status = 'failed';
            }
        }

        const result = {
            hash: transaction.hash,
            from: transaction.from,
            to: transaction.to,
            data: transaction.input || transaction.data || '0x',
            value: transaction.value?.toString() || '0',
            blockNumber: transaction.blockNumber ?
                (typeof transaction.blockNumber === 'string' ? parseInt(transaction.blockNumber, 16) : transaction.blockNumber)
                : null,
            timestamp: null,
            status,
            gasUsed: receipt?.gasUsed?.toString(),
            chainId
        };

        console.log('Parsed transaction details:', result);
        return result;
    } catch (error) {
        console.error('Failed to fetch transaction:', error);
        return null;
    }
}
