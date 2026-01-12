import { NextRequest, NextResponse } from 'next/server';

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

export async function POST(request: NextRequest) {
    try {
        const { txHash, chainId } = await request.json();

        if (!txHash || !chainId) {
            return NextResponse.json(
                { error: 'Missing txHash or chainId' },
                { status: 400 }
            );
        }

        if (!ALCHEMY_API_KEY) {
            console.error('❌ ALCHEMY_API_KEY not configured');
            return NextResponse.json(
                { error: 'API key not configured' },
                { status: 500 }
            );
        }

        // Map chainId to Alchemy network
        const networkMap: { [key: string]: string } = {
            '1': 'eth-mainnet',
            '8453': 'base-mainnet',
            '137': 'polygon-mainnet',
            '10': 'opt-mainnet',
            '42161': 'arb-mainnet',
        };

        const network = networkMap[chainId.toString()];
        if (!network) {
            console.error(`❌ Unsupported chain: ${chainId}`);
            return NextResponse.json(
                { error: `Unsupported chain: ${chainId}` },
                { status: 400 }
            );
        }

        const url = `https://${network}.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
        console.log(`🔍 Fetching transaction ${txHash} from ${network}...`);

        // Fetch transaction and receipt
        const [txResponse, receiptResponse] = await Promise.all([
            fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'eth_getTransactionByHash',
                    params: [txHash]
                })
            }),
            fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 2,
                    method: 'eth_getTransactionReceipt',
                    params: [txHash]
                })
            })
        ]);

        const txData = await txResponse.json();
        const receiptData = await receiptResponse.json();

        console.log('📡 Alchemy TX Response:', JSON.stringify(txData, null, 2));
        console.log('📡 Alchemy Receipt Response:', JSON.stringify(receiptData, null, 2));

        // Check if transaction exists
        if (!txData.result) {
            console.error(`❌ Transaction not found: ${txHash} on ${network}`);
            return NextResponse.json(
                {
                    error: `Transaction tidak ditemukan di ${network.replace('-mainnet', '')} network. Pastikan hash benar dan network sesuai.`,
                    transaction: null,
                    receipt: null
                },
                { status: 404 }
            );
        }

        console.log(`✅ Transaction found successfully`);
        return NextResponse.json({
            transaction: txData.result,
            receipt: receiptData.result
        });
    } catch (error: any) {
        console.error('❌ Transaction API error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch transaction' },
            { status: 500 }
        );
    }
}
