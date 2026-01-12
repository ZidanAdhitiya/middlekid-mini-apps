import { NextRequest, NextResponse } from 'next/server';
import { alchemyAPI, getNativeBalance, formatTokenBalance } from '@/app/lib/alchemy';
import { coinGeckoAPI } from '@/app/lib/prices';
import { analyzePortfolio } from '@/app/lib/analyzer';
import { SUPPORTED_CHAINS } from '@/app/lib/chains';
import { getTokenLogoFallback } from '@/app/lib/tokenLogos';
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
                    const supportsAlchemyIndexer = !['viction', 'monad', 'cronos', 'mantle', 'sonic'].includes(chain.id);

                    // Fetch Native Balance 
                    const nativeBalanceData = await getNativeBalance(address as `0x${string}`, chain);

                    let tokenBalancesData: any = { tokenBalances: [] };
                    let nftsData: any = { ownedNfts: [] };

                    if (supportsAlchemyIndexer) {
                        try {
                            tokenBalancesData = await alchemyAPI.getTokenBalances(address, chain.id);
                            nftsData = await alchemyAPI.getNFTs(address, chain.id);
                        } catch (err) {
                            console.log(`Alchemy Indexer failed for ${chain.name}`, err);
                        }
                    }

                    // Process Native Token
                    let geckoId = 'ethereum';
                    if (chain.id === 'polygon') geckoId = 'matic-network';
                    else if (chain.id === 'avalanche') geckoId = 'avalanche-2';
                    else if (chain.id === 'bsc') geckoId = 'binancecoin';
                    else if (chain.id === 'fantom') geckoId = 'fantom';
                    else if (chain.id === 'gnosis') geckoId = 'dai';
                    else if (chain.id === 'viction') geckoId = 'tomochain';
                    else if (chain.id === 'monad') geckoId = 'monad';
                    else if (chain.id === 'mantle') geckoId = 'mantle';
                    else if (chain.id === 'cronos') geckoId = 'crypto-com-chain';
                    else if (chain.id === 'sonic') geckoId = 'fantom'; // Sonic is FTM upgrade
                    else if (chain.id === 'blast') geckoId = 'ethereum';
                    else if (chain.id === 'linea') geckoId = 'ethereum';
                    else if (chain.id === 'zksync') geckoId = 'ethereum';
                    else if (chain.id === 'scroll') geckoId = 'ethereum';
                    else if (chain.id === 'zora') geckoId = 'ethereum';

                    const nativePrice = await coinGeckoAPI.getTokenPrice(geckoId);

                    const nativeToken: Token = {
                        address: '0x0000000000000000000000000000000000000000',
                        symbol: chain.nativeSymbol,
                        name: chain.name,
                        decimals: 18,
                        balance: nativeBalanceData.balance,
                        balanceFormatted: nativeBalanceData.formatted,
                        logo: chain.logo || getTokenLogoFallback(chain.nativeSymbol) || '',
                        usdPrice: nativePrice.usd,
                        usdValue: parseFloat(nativeBalanceData.formatted) * nativePrice.usd,
                        chainId: chain.id
                    };

                    if (parseFloat(nativeToken.balanceFormatted) > 0) {
                        allTokens.push(nativeToken);
                    }

                    // Process ERC20s (HYBRID APPROACH)
                    const rawBalances = tokenBalancesData?.tokenBalances || [];
                    const nonZeroTokens = rawBalances.filter((tb: any) =>
                        tb.tokenBalance && tb.tokenBalance !== '0x0' && BigInt(tb.tokenBalance) > BigInt(0)
                    );

                    // Map all tokens
                    const tokenPromises = nonZeroTokens.map(async (tb: any, index: number) => {
                        // Only fetch metadata for top 20 to avoid rate limits
                        if (index < 20) {
                            try {
                                // Timeout metadata fetch to 2s max
                                const metadataPromise = alchemyAPI.getTokenMetadata(tb.contractAddress, chain.id);
                                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000));
                                const metadata: any = await Promise.race([metadataPromise, timeoutPromise]);

                                const decimals = metadata.decimals || 18;
                                // If logo missing, try to generate generic one or use placeholder

                                const symbol = metadata.symbol || 'UNK';
                                return {
                                    address: tb.contractAddress,
                                    symbol,
                                    name: metadata.name || 'Unknown Token',
                                    decimals: decimals,
                                    balance: tb.tokenBalance,
                                    balanceFormatted: formatTokenBalance(tb.tokenBalance, decimals),
                                    logo: metadata.logo || getTokenLogoFallback(symbol) || '',
                                    usdPrice: 0,
                                    usdValue: 0,
                                    chainId: chain.id
                                };
                            } catch (e) {
                                return {
                                    address: tb.contractAddress,
                                    symbol: 'UNK',
                                    name: 'Unknown Token',
                                    decimals: 18,
                                    balance: tb.tokenBalance,
                                    balanceFormatted: formatTokenBalance(tb.tokenBalance, 18),
                                    logo: getTokenLogoFallback('UNK') || '',
                                    usdPrice: 0,
                                    usdValue: 0,
                                    chainId: chain.id
                                };
                            }
                        } else {
                            // Generic fallback for rest
                            return {
                                address: tb.contractAddress,
                                symbol: 'TKN',
                                name: `Token ${tb.contractAddress.slice(0, 6)}...`,
                                decimals: 18,
                                balance: tb.tokenBalance,
                                balanceFormatted: formatTokenBalance(tb.tokenBalance, 18), // Guess 18
                                logo: '',
                                usdPrice: 0,
                                usdValue: 0,
                                chainId: chain.id
                            };
                        }
                    });

                    const processedTokens = await Promise.all(tokenPromises);

                    // --- RESCUE SCANNER ---
                    // Explicitly check for "Retail DAO" on Base if not found
                    if (chain.id === 'base') {
                        const retailAddress = '0xc7167e360bd63696a7870c0ef66939e882249f20';
                        const alreadyFound = processedTokens.some(t => t.address.toLowerCase() === retailAddress.toLowerCase());
                        if (!alreadyFound) {
                            try {
                                console.log('[Rescue] Checking Retail DAO on Base...');
                                const balance = await alchemyAPI.getTokenBalances(address, chain.id);
                                // Alchemy returns all, check if we missed it in filter
                                const processedRetail = balance.tokenBalances.find((tb: any) => tb.contractAddress.toLowerCase() === retailAddress.toLowerCase());
                                if (processedRetail && BigInt(processedRetail.tokenBalance) > BigInt(0)) {
                                    console.log('[Rescue] FOUND Retail DAO!');
                                    processedTokens.push({
                                        address: retailAddress,
                                        symbol: 'RETAIL',
                                        name: 'Retail DAO',
                                        decimals: 18,
                                        balance: processedRetail.tokenBalance,
                                        balanceFormatted: formatTokenBalance(processedRetail.tokenBalance, 18),
                                        logo: '',
                                        usdPrice: 0,
                                        usdValue: 0,
                                        chainId: chain.id
                                    });
                                }
                            } catch (e) {
                                console.error('[Rescue] Failed to rescue Retail DAO', e);
                            }
                        }
                    }

                    // Explicitly check for "stS" or "Beets" on Sonic/Fantom if active
                    // (Adding placeholder checks to force visibility if hidden by spam filter)

                    // DEBUG: Log found tokens
                    const foundSymbols = processedTokens.map(t => t.symbol).join(', ');
                    if (foundSymbols.length > 0) {
                        console.log(`[${chain.name}] Found Tokens: ${foundSymbols}`);
                    }

                    allTokens.push(...processedTokens);

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

                    return { chain: chain.id, tokenCount: nonZeroTokens.length };

                } catch (error) {
                    console.error(`Error fetching data for ${chain.name}:`, error);
                    errors.push(`Failed to fetch data for ${chain.name}: ${(error as Error).message}`);
                    return null;
                }
            }));

            // 2. Fetch DeFi Positions - UNIVERSAL Scanner
            if (isEvm) {
                try {
                    console.log('🔍 Scanning DeFi positions...');

                    // Debug: Show tokens with non-zero balances
                    const tokensWithBalance = allTokens.filter(t => parseFloat(t.balanceFormatted || '0') > 0);
                    const tokenSample = tokensWithBalance.slice(0, 30).map(t => `${t.symbol}(${parseFloat(t.balanceFormatted).toFixed(2)})`).join(', ');
                    errors.push(`DEBUG: Scanning ${allTokens.length} tokens, ${tokensWithBalance.length} have balance`);
                    errors.push(`DEBUG: Tokens with balance: ${tokenSample}`);

                    const { scanDeFiPositions } = await import('../../lib/defi/free-scanner');

                    const defiPositions = await scanDeFiPositions(address, allTokens, errors);
                    console.log(`✅ Found ${defiPositions.length} DeFi positions`);
                    errors.push(`DEBUG: DeFi scanner returned ${defiPositions.length} positions`);

                    stakingPositions = defiPositions.map(pos => ({
                        id: pos.id,
                        protocol: pos.protocol,
                        chain: pos.chain,
                        tokens: pos.tokens,
                        totalValue: pos.totalValue,
                        apy: pos.apy
                    }));

                    totalDefiValue = stakingPositions.reduce((sum, p) => sum + p.totalValue, 0);
                    console.log(`💰 Total DeFi value: $${totalDefiValue.toFixed(2)}`);
                    errors.push(`DEBUG: Total DeFi value = $${totalDefiValue.toFixed(2)}`);
                } catch (error) {
                    console.error('❌ DeFi scan error:', error);
                    errors.push(`DeFi scan error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    stakingPositions = [];
                    totalDefiValue = 0;
                }
            }
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
                evmChainsChecked: !isBtc,
                defiScanned: true
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
