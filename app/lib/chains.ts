export interface ChainConfig {
    id: string; // Internal ID
    chainId?: number; // Numeric chain ID for RPC calls
    name: string;
    alchemyNetwork?: string; // e.g., 'eth-mainnet'. Optional if using rpcUrl
    nativeSymbol: string;
    logo?: string;
    rpcUrl?: string; // For chains not supported by Alchemy
}

export const SUPPORTED_CHAINS: ChainConfig[] = [
    {
        id: 'ethereum',
        chainId: 1,
        name: 'Ethereum',
        alchemyNetwork: 'eth-mainnet',
        nativeSymbol: 'ETH',
        logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
    },
    {
        id: 'base',
        chainId: 8453,
        name: 'Base',
        alchemyNetwork: 'base-mainnet',
        nativeSymbol: 'ETH',
        logo: 'https://raw.githubusercontent.com/base-org/brand-kit/master/logo/symbol/Base_Symbol_Blue.svg'
    },
    {
        id: 'optimism',
        chainId: 10,
        name: 'Optimism',
        alchemyNetwork: 'opt-mainnet',
        nativeSymbol: 'ETH',
        logo: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png'
    },
    {
        id: 'arbitrum',
        chainId: 42161,
        name: 'Arbitrum',
        alchemyNetwork: 'arb-mainnet',
        nativeSymbol: 'ETH',
        logo: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png'
    },
    {
        id: 'polygon',
        chainId: 137,
        name: 'Polygon',
        alchemyNetwork: 'polygon-mainnet',
        nativeSymbol: 'MATIC',
        logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png'
    },
    {
        id: 'bsc',
        chainId: 56,
        name: 'BNB Smart Chain',
        alchemyNetwork: 'bnb-mainnet',
        nativeSymbol: 'BNB',
        logo: 'https://cryptologos.cc/logos/bnb-bnb-logo.png'
    },
    {
        id: 'avalanche',
        chainId: 43114,
        name: 'Avalanche',
        alchemyNetwork: 'avax-mainnet',
        nativeSymbol: 'AVAX',
        logo: 'https://cryptologos.cc/logos/avalanche-avax-logo.png'
    },
    {
        id: 'fantom',
        chainId: 250,
        name: 'Fantom',
        alchemyNetwork: 'fantom-mainnet',
        nativeSymbol: 'FTM',
        logo: 'https://cryptologos.cc/logos/fantom-ftm-logo.png'
    },
    {
        id: 'gnosis',
        chainId: 100,
        name: 'Gnosis',
        alchemyNetwork: 'gnosis-mainnet',
        nativeSymbol: 'xDAI',
        logo: 'https://cryptologos.cc/logos/gnosis-gno-logo.png'
    },
    {
        id: 'viction',
        name: 'Viction',
        alchemyNetwork: 'viction-mainnet',
        nativeSymbol: 'VIC',
        logo: 'https://pbs.twimg.com/profile_images/1719626573752528896/yX8-k_u8_400x400.jpg'
    },
    {
        id: 'monad',
        name: 'Monad',
        alchemyNetwork: 'monad-mainnet',
        nativeSymbol: 'MON',
        logo: 'https://pbs.twimg.com/profile_images/1628126300186718210/N-tP8a9s_400x400.jpg'
    },
    {
        id: 'sonic',
        name: 'Sonic',
        alchemyNetwork: 'sonic-mainnet',
        rpcUrl: 'https://rpc.soniclabs.com',
        nativeSymbol: 'S',
        logo: 'https://pbs.twimg.com/profile_images/1819036772718198784/N2Yv7vX__400x400.jpg'
    },
    // Top L2s/L1s
    { id: 'linea', chainId: 59144, name: 'Linea', alchemyNetwork: 'linea-mainnet', nativeSymbol: 'ETH', logo: 'https://cryptologos.cc/logos/linea-logo.png' },
    { id: 'zksync', chainId: 324, name: 'zkSync Era', alchemyNetwork: 'zksync-mainnet', nativeSymbol: 'ETH', logo: 'https://cryptologos.cc/logos/zksync-logo.png' },
    { id: 'scroll', chainId: 534352, name: 'Scroll', alchemyNetwork: 'scroll-mainnet', nativeSymbol: 'ETH', logo: 'https://cryptologos.cc/logos/scroll-logo.png' },
    { id: 'blast', chainId: 81457, name: 'Blast', alchemyNetwork: 'blast-mainnet', nativeSymbol: 'ETH', logo: 'https://cryptologos.cc/logos/blast-logo.png' },
    { id: 'mantle', chainId: 5000, name: 'Mantle', alchemyNetwork: 'mantle-mainnet', nativeSymbol: 'MNT', logo: 'https://cryptologos.cc/logos/mantle-mnt-logo.png' },
    { id: 'cronos', chainId: 25, name: 'Cronos', alchemyNetwork: 'cronos-mainnet', nativeSymbol: 'CRO', logo: 'https://cryptologos.cc/logos/cronos-cro-logo.png' },
    { id: 'zora', chainId: 7777777, name: 'Zora', alchemyNetwork: 'zora-mainnet', nativeSymbol: 'ETH', logo: 'https://cryptologos.cc/logos/zora-logo.png' }
];

