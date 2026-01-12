import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { address, chainId = 8453 } = await request.json();

        if (!address) {
            return NextResponse.json({ error: 'Address required' }, { status: 400 });
        }

        // Chain RPC URLs
        const rpcUrls: { [key: number]: string } = {
            1: 'https://eth-mainnet.g.alchemy.com/v2/' + (process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || ''),
            8453: 'https://mainnet.base.org',
            137: 'https://polygon-rpc.com',
            10: 'https://mainnet.optimism.io',
            42161: 'https://arb1.arbitrum.io/rpc',
        };

        const rpcUrl = rpcUrls[chainId];
        if (!rpcUrl) {
            return NextResponse.json({ error: 'Unsupported chain' }, { status: 400 });
        }

        // Call eth_getCode
        const response = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_getCode',
                params: [address, 'latest'],
                id: 1
            })
        });

        const data = await response.json();
        const code = data.result;

        // Check if contract
        const isContract = code && code !== '0x' && code !== '0x0' && code.length > 2;

        return NextResponse.json({
            address,
            chainId,
            isContract,
            code: code || '0x',
            type: isContract ? 'TOKEN_CONTRACT' : 'WALLET'
        });

    } catch (error) {
        console.error('Contract check error:', error);
        return NextResponse.json(
            { error: 'Failed to check contract' },
            { status: 500 }
        );
    }
}
