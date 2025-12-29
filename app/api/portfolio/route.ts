import { NextRequest, NextResponse } from 'next/server';
import { alchemyAPI, getNativeBalance, formatTokenBalance } from '@/app/lib/alchemy';
import { coinGeckoAPI } from '@/app/lib/prices';
import type {
    PortfolioData,
    Token,
    NFT,
    Transaction,
} from '@/app/lib/types';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');

    if (!address) {
        return NextResponse.json(
            { error: 'Wallet address is required' },
            { status: 400 }
        );
    }

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return NextResponse.json(
            { error: 'Invalid wallet address format' },
            { status: 400 }
        );
    }

    try {
        // Fetch all data in parallel
        const [nativeBalanceData, tokenBalancesData, nftsData] = await Promise.all([
            getNativeBalance(address as `0x${string}`),
            alchemyAPI.getTokenBalances(address),
            alchemyAPI.getNFTs(address),
        ]);

        // Get ETH price
        const ethPrice = await coinGeckoAPI.getEthPrice();

        // Process native ETH balance
        const ethBalance: Token = {
            address: '0x0000000000000000000000000000000000000000',
            symbol: 'ETH',
            name: 'Ethereum',
            decimals: 18,
            balance: nativeBalanceData.balance,
            balanceFormatted: nativeBalanceData.formatted,
            logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
            usdPrice: ethPrice,
            usdValue: parseFloat(nativeBalanceData.formatted) * ethPrice,
        };

        // Process ERC20 tokens
        const tokenAddresses: string[] = [];
        const tokenDataMap = new Map();

        for (const tokenBalance of tokenBalancesData.tokenBalances || []) {
            if (!tokenBalance.contractAddress || tokenBalance.tokenBalance === '0x0') continue;

            tokenAddresses.push(tokenBalance.contractAddress);
            tokenDataMap.set(tokenBalance.contractAddress, tokenBalance);
        }

        // Fetch token metadata and prices in parallel
        const [tokenMetadataPromises, priceData] = await Promise.all([
            Promise.all(
                tokenAddresses.map(addr =>
                    alchemyAPI.getTokenMetadata(addr).catch(() => null)
                )
            ),
            coinGeckoAPI.getTokenPrices(tokenAddresses),
        ]);

        // Build tokens array
        const tokens: Token[] = [];

        for (let i = 0; i < tokenAddresses.length; i++) {
            const address = tokenAddresses[i];
            const tokenBalance = tokenDataMap.get(address);
            const metadata = tokenMetadataPromises[i];

            if (!metadata) continue;

            const decimals = metadata.decimals || 18;
            const balance = tokenBalance.tokenBalance;
            const balanceFormatted = formatTokenBalance(
                parseInt(balance, 16).toString(),
                decimals
            );

            const priceInfo = priceData[address.toLowerCase()];
            const usdPrice = priceInfo?.usd || 0;
            const usdValue = parseFloat(balanceFormatted.replace(/,/g, '')) * usdPrice;

            tokens.push({
                address,
                symbol: metadata.symbol || 'UNKNOWN',
                name: metadata.name || 'Unknown Token',
                decimals,
                balance: parseInt(balance, 16).toString(),
                balanceFormatted,
                logo: metadata.logo,
                usdPrice,
                usdValue,
                percentChange24h: priceInfo?.usd_24h_change,
            });
        }

        // Filter out spam tokens and sort by value
        const validTokens = tokens
            .filter(token => token.symbol && !token.symbol.toLowerCase().includes('spam'))
            .sort((a, b) => (b.usdValue || 0) - (a.usdValue || 0));

        // Add ETH to tokens array
        const allTokens = [ethBalance, ...validTokens];

        // Calculate portfolio percentages
        const totalValue = allTokens.reduce((sum, token) => sum + (token.usdValue || 0), 0);
        allTokens.forEach(token => {
            token.portfolioPercentage = totalValue > 0 ? ((token.usdValue || 0) / totalValue) * 100 : 0;
        });

        // Process NFTs
        const nfts: NFT[] = (nftsData.ownedNfts || [])
            .filter((nft: any) => nft.image?.cachedUrl || nft.image?.originalUrl)
            .map((nft: any) => ({
                tokenAddress: nft.contract.address,
                tokenId: nft.tokenId,
                name: nft.name || nft.contract.name || `#${nft.tokenId}`,
                symbol: nft.contract.symbol,
                contractType: nft.contract.tokenType,
                metadata: nft.raw?.metadata,
                tokenUri: nft.tokenUri,
                imageUrl: nft.image?.cachedUrl || nft.image?.originalUrl,
                collectionName: nft.contract.name,
            }));

        // Build portfolio data
        const portfolioData: PortfolioData = {
            address,
            summary: {
                totalValueUsd: totalValue,
                change24h: 0, // Would need historical data
                change24hPercentage: 0,
                totalTokens: allTokens.length,
                totalNFTs: nfts.length,
                totalStakingPositions: 0,
                totalLPPositions: 0,
            },
            tokens: allTokens,
            nfts,
            transactions: [], // Can add later with alchemy_getAssetTransfers
            stakingPositions: [],
            lpPositions: [],
        };

        return NextResponse.json(portfolioData);

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
