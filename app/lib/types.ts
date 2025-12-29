// Type definitions for MiddleKid Portfolio Tracker

export interface Token {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    balance: string;
    balanceFormatted: string;
    logo?: string;
    thumbnail?: string;
    usdPrice?: number;
    usdValue?: number;
    percentChange24h?: number;
    portfolioPercentage?: number;
}

export interface NFT {
    tokenAddress: string;
    tokenId: string;
    name: string;
    symbol?: string;
    contractType: string;
    metadata?: {
        name?: string;
        description?: string;
        image?: string;
        attributes?: Array<{
            trait_type: string;
            value: string | number;
        }>;
    };
    tokenUri?: string;
    imageUrl?: string;
    collectionName?: string;
    floorPrice?: number;
}

export interface Transaction {
    hash: string;
    blockNumber: string;
    blockTimestamp: string;
    fromAddress: string;
    toAddress: string;
    value: string;
    gas: string;
    gasPrice: string;
    methodLabel?: string;
    category?: string;
}

export interface StakingPosition {
    protocol: string;
    tokenSymbol: string;
    tokenAddress: string;
    stakedAmount: string;
    stakedAmountUsd?: number;
    rewards?: string;
    rewardsUsd?: number;
    apy?: number;
    logo?: string;
}

export interface LPPosition {
    protocol: string;
    pairName: string;
    token0: {
        symbol: string;
        address: string;
        amount: string;
    };
    token1: {
        symbol: string;
        address: string;
        amount: string;
    };
    totalValueUsd?: number;
    poolShare?: number;
    feesEarned?: number;
    logo?: string;
}

export interface PortfolioSummary {
    totalValueUsd: number;
    change24h?: number;
    change24hPercentage?: number;
    totalTokens: number;
    totalNFTs: number;
    totalStakingPositions: number;
    totalLPPositions: number;
}

export interface PortfolioData {
    address: string;
    summary: PortfolioSummary;
    tokens: Token[];
    nfts: NFT[];
    transactions: Transaction[];
    stakingPositions: StakingPosition[];
    lpPositions: LPPosition[];
}

// Moralis API Response Types
export interface MoralisTokenBalance {
    token_address: string;
    symbol: string;
    name: string;
    decimals: string;
    balance: string;
    logo?: string;
    thumbnail?: string;
    usd_price?: number;
    usd_value?: number;
    percentage_relative_to_total_supply?: number;
    verified_contract?: boolean;
    possible_spam?: boolean;
    balance_formatted?: string;
    usd_price_24hr_percent_change?: number;
}

export interface MoralisNFT {
    token_address: string;
    token_id: string;
    amount: string;
    owner_of: string;
    token_hash: string;
    block_number_minted: string;
    block_number: string;
    contract_type: string;
    name: string;
    symbol: string;
    token_uri?: string;
    metadata?: string;
    last_token_uri_sync?: string;
    last_metadata_sync?: string;
    minter_address?: string;
    possible_spam?: boolean;
    verified_collection?: boolean;
    collection_logo?: string;
    collection_banner_image?: string;
}

export interface MoralisTransaction {
    hash: string;
    nonce: string;
    transaction_index: string;
    from_address: string;
    to_address: string;
    value: string;
    gas: string;
    gas_price: string;
    input: string;
    receipt_cumulative_gas_used: string;
    receipt_gas_used: string;
    receipt_contract_address?: string;
    receipt_root?: string;
    receipt_status: string;
    block_timestamp: string;
    block_number: string;
    block_hash: string;
    transfer_index?: number[];
    logs?: any[];
}
