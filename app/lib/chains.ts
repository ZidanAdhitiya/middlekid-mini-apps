
export interface ChainConfig {
    id: string; // Internal ID
    name: string;
    alchemyNetwork: string; // e.g., 'eth-mainnet'
    nativeSymbol: string;
    logo: string;
}

export const SUPPORTED_CHAINS: ChainConfig[] = [
    {
        id: 'ethereum',
        name: 'Ethereum',
        alchemyNetwork: 'eth-mainnet',
        nativeSymbol: 'ETH',
        logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
    },
    {
        id: 'base',
        name: 'Base',
        alchemyNetwork: 'base-mainnet',
        nativeSymbol: 'ETH',
        logo: 'https://raw.githubusercontent.com/base-org/brand-kit/master/logo/symbol/Base_Symbol_Blue.svg'
    },
    {
        id: 'optimism',
        name: 'Optimism',
        alchemyNetwork: 'opt-mainnet',
        nativeSymbol: 'ETH',
        logo: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png'
    },
    {
        id: 'arbitrum',
        name: 'Arbitrum',
        alchemyNetwork: 'arb-mainnet',
        nativeSymbol: 'ETH',
        logo: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png'
    },
    {
        id: 'polygon',
        name: 'Polygon',
        alchemyNetwork: 'polygon-mainnet',
        nativeSymbol: 'MATIC',
        logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png'
    }
];
