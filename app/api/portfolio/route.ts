import { NextRequest, NextResponse } from 'next/server';
import { alchemyAPI, getNativeBalance } from '@/app/lib/alchemy';
import { coinGeckoAPI } from '@/app/lib/prices';
import { analyzePortfolio } from '@/app/lib/analyzer';
import { SUPPORTED_CHAINS } from '@/app/lib/chains';
import { StargateAdapter } from '@/app/lib/defi/adapters/stargate';
import type {
    PortfolioData,
    Token,
    NFT,
    Transaction,
} from '@/app/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');

    if (!address) {
        return NextResponse.json(
            { error: 'Wallet address is required' },
            { status: 400 }
        );
    }

    // Validate address format (Allow EVM 0x... and Bitcoin bc1.../1.../3...)
    const isEvm = /^0x[a-fA-F0-9]{40}$/.test(address);
    // Relaxed BTC regex: allow 25-62 chars after prefix. 
    // Real validation is complex (Bech32 checksum), but this prevents easy typos.
    const isBtc = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address);

    if (!isEvm && !isBtc) {
        return NextResponse.json(
            { error: 'Invalid wallet address format. Only EVM (0x...) and Bitcoin addresses supported.' },
            { status: 400 }
        );
    }

    try {
        const allTokens: Token[] = [];
        const allNfts: NFT[] = [];
        const allTransactions: Transaction[] = [];
        const errors: string[] = [];

        let stakingPositions: any[] = [];
        let totalDefiValue = 0;

        // HANDLE BITCOIN ADDRESSES
        if (isBtc) {
            try {
                // Using blockchain.info public API for demo purposes
                const response = await fetch(`https://blockchain.info/rawaddr/${address}`);
                if (!response.ok) throw new Error('Failed to fetch Bitcoin data');
                const data = await response.json();

                const btcPrice = await coinGeckoAPI.getTokenPrice('bitcoin');

                const balanceSatoshis = data.final_balance;
                const balanceBtc = balanceSatoshis / 100000000;

                const btcToken: Token = {
                    address: 'bitcoin',
                    symbol: 'BTC',
                    name: 'Bitcoin',
                    decimals: 8,
                    balance: balanceSatoshis.toString(),
                    balanceFormatted: balanceBtc.toString(),
                    logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
                    usdPrice: btcPrice.usd,
                    usdValue: balanceBtc * btcPrice.usd,
                    chainId: 'bitcoin'
                };

                if (balanceBtc > 0) {
                    allTokens.push(btcToken);
                }

                // Process Transactions
                const btcTxs = data.txs.slice(0, 20).map((tx: any) => {
                    const input = tx.inputs.find((i: any) => i.prev_out.addr === address);
                    const output = tx.out.find((o: any) => o.addr === address);
                    const isSent = !!input;

                    return {
                        hash: tx.hash,
                        chainId: 'bitcoin',
                        blockNumber: tx.block_height,
                        blockTimestamp: new Date(tx.time * 1000).toISOString(),
                        fromAddress: isSent ? address : (tx.inputs[0]?.prev_out?.addr || 'Unknown'),
                        toAddress: isSent ? (tx.out[0]?.addr || 'Unknown') : address,
                        value: isSent ? (input.prev_out.value / 100000000).toString() : (output.value / 100000000).toString(),
                        gas: '0',
                        gasPrice: '0',
                        methodLabel: 'Transfer',
                        category: 'external',
                        asset: 'BTC',
                        direction: isSent ? 'out' : 'in'
                    };
                });

                allTransactions.push(...btcTxs);

            } catch (err) {
                console.error('Error fetching Bitcoin data:', err);
                errors.push(`Failed to fetch Bitcoin data: ${(err as Error).message}`);
            }
        } else {
            // EVM Logic
            const chainResults = await Promise.all(SUPPORTED_CHAINS.map(async (chain) => {
                try {
                    // Fetch Native Balance, Token Balances, NFTs
                    const tokenBalancesData = await alchemyAPI.getTokenBalances(address, chain.id);
                    const nativeBalanceData = await getNativeBalance(address as `0x${string}`, chain);
                    const nftsData = await alchemyAPI.getNFTs(address, chain.id);

                    // Process Native Token
                    const nativePrice = await coinGeckoAPI.getTokenPrice(chain.id === 'polygon' ? 'matic-network' : (chain.id === 'base' ? 'ethereum' : 'ethereum')); // simplified mapping
                    const nativeToken: Token = {
                        address: '0x0000000000000000000000000000000000000000',
                        symbol: chain.nativeSymbol,
                        name: chain.nativeSymbol === 'ETH' ? 'Ethereum' : 'Polygon',
                        decimals: 18,
                        balance: nativeBalanceData.balance,
                        balanceFormatted: nativeBalanceData.formatted,
                        logo: chain.logo,
                        usdPrice: nativePrice.usd,
                        usdValue: parseFloat(nativeBalanceData.formatted) * nativePrice.usd,
                        chainId: chain.id
                    };

                    if (parseFloat(nativeToken.balanceFormatted) > 0) {
                        allTokens.push(nativeToken);
                    }

                    // Process ERC20s (Simplified for debugging)
                    const rawBalances = tokenBalancesData?.tokenBalances || [];
                    const nonZeroTokens = rawBalances.filter((tb: any) =>
                        tb.tokenBalance && tb.tokenBalance !== '0x0' && BigInt(tb.tokenBalance) > 0n
                    );

                    // Add non-zero tokens to list even without price (for visibility)
                    for (const tb of nonZeroTokens) {
                        allTokens.push({
                            address: tb.contractAddress,
                            symbol: 'UNKNOWN', // Metadata fetch skipped for speed
                            name: 'Unknown Token',
                            decimals: 18,
                            balance: tb.tokenBalance,
                            balanceFormatted: '?',
                            logo: '',
                            usdPrice: 0,
                            usdValue: 0,
                            chainId: chain.id
                        });
                    }

                    // Process NFTs
                    const chainNfts = (nftsData.ownedNfts || [])
                        .map((nft: any) => ({
                            tokenAddress: nft.contract?.address || '',
                            tokenId: nft.tokenId,
                            name: nft.name || nft.contract?.name || `#${nft.tokenId}`,
                            symbol: nft.contract?.symbol || 'NFT',
                            contractType: nft.contract?.tokenType || 'ERC721',
                            metadata: nft.raw?.metadata,
                            tokenUri: nft.tokenUri,
                            imageUrl: nft.image?.thumbnailUrl || nft.image?.cachedUrl || nft.image?.originalUrl,
                            fullImageUrl: nft.image?.cachedUrl || nft.image?.originalUrl,
                            collectionName: nft.contract?.name || 'Unknown Collection',
                            chainId: chain.id
                        }));
                    allNfts.push(...chainNfts);

                    // Fetch Transactions
                    const transfers = await alchemyAPI.getAssetTransfers({
                        fromAddress: address,
                        chainId: chain.id,
                        category: ['external', 'erc20', 'erc721', 'erc1155'],
                        maxCount: 20
                    });

                    if (transfers && transfers.transfers) {
                        const chainTxs = transfers.transfers.map((tx: any) => ({
                            hash: tx.hash,
                            chainId: chain.id,
                            blockNumber: parseInt(tx.blockNum, 16),
                            blockTimestamp: new Date().toISOString(),
                            fromAddress: tx.from,
                            toAddress: tx.to,
                            value: tx.value ? parseFloat(tx.value).toString() : '0',
                            gas: '0',
                            gasPrice: '0',
                            methodLabel: tx.category,
                            category: tx.category,
                            asset: tx.asset,
                            direction: tx.from.toLowerCase() === address.toLowerCase() ? 'out' : 'in'
                        }));
                        allTransactions.push(...chainTxs);
                    }

                    return {
                        chain: chain.id,
                        tokenCount: nonZeroTokens.length
                    };

                } catch (error) {
                    console.error(`Error fetching data for ${chain.name}:`, error);
                    errors.push(`Failed to fetch data for ${chain.name}: ${(error as Error).message}`);
                    return null;
                }
            }));

            // 2. Fetch DeFi Positions (EVM ONLY)
            const activeAdapters = [StargateAdapter];
            const defiPositionsPromises = activeAdapters.map(adapter => adapter.getPositions(address));
            const defiResults = await Promise.all(defiPositionsPromises);
            const allDefiPositions = defiResults.flat();

            stakingPositions = allDefiPositions.map(pos => ({
                id: pos.id,
                protocol: pos.protocolName,
                chain: pos.chain.name,
                tokens: pos.assets.map(a => ({ symbol: a.symbol, amount: a.amount, value: a.valueUsd })),
                totalValue: pos.totalValueUsd,
                apy: pos.apy
            }));

            totalDefiValue = stakingPositions.reduce((sum, p) => sum + p.totalValue, 0);
        }

        // Calculate Totals
        const totalTokenValue = allTokens.reduce((sum, t) => sum + (t.usdValue || 0), 0);
        const totalValue = totalTokenValue + totalDefiValue;

        // Build Portfolio Data
        const portfolioData: PortfolioData = {
            address,
            summary: {
                totalValueUsd: totalValue,
                change24h: 0,
                change24hPercentage: 0,
                totalTokens: allTokens.length,
                totalNFTs: allNfts.length,
                totalStakingPositions: stakingPositions.length,
                totalLPPositions: 0,
            },
            tokens: allTokens.sort((a, b) => (b.usdValue || 0) - (a.usdValue || 0)),
            nfts: allNfts,
            transactions: allTransactions.sort((a, b) => new Date(b.blockTimestamp).getTime() - new Date(a.blockTimestamp).getTime()),
            stakingPositions,
            lpPositions: [],
            insights: [],
            errors,
        };

        // Generate Insights
        const insights = analyzePortfolio({
            address,
            summary: portfolioData.summary,
            tokens: portfolioData.tokens,
            nfts: portfolioData.nfts,
            transactions: portfolioData.transactions,
            stakingPositions: portfolioData.stakingPositions,
            lpPositions: portfolioData.lpPositions
        });
        portfolioData.insights = insights;

        return NextResponse.json({
            ...portfolioData,
            debug: {
                errors,
                evmChainsChecked: !isBtc
            }
        });

    } catch (error) {
        console.error('Portfolio API error:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch portfolio data',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
