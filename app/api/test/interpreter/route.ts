import { NextRequest, NextResponse } from 'next/server';
import { walletSecurityAnalyzer } from '@/lib/tx-interpreter/wallet-analyzer';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');

    if (!address) {
        return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    try {
        const report = await walletSecurityAnalyzer.analyzeWallet(address);
        return NextResponse.json(report);
    } catch (error) {
        console.error('Error in interpreter test route:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
    }
}
