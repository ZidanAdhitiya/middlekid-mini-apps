
import { ChainConfig } from '../chains';

export interface DeFiPosition {
    id: string;
    protocolId: string;
    protocolName: string;
    chain: ChainConfig;
    type: 'staking' | 'liquidity-pool' | 'lending' | 'farming';
    assets: {
        symbol: string;
        address: string;
        amount: string;
        valueUsd: number;
    }[];
    totalValueUsd: number;
    apy?: number;
}

export interface DeFiAdapter {
    id: string;
    name: string;
    description: string;
    getPositions(address: string): Promise<DeFiPosition[]>;
}
