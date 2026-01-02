
import { DeFiAdapter, DeFiPosition } from '../types';
import { SUPPORTED_CHAINS } from '../../chains';

// This is a sample adapter. 
// in production, this would make RPC calls to Stargate Router/Farming contracts.
export const StargateAdapter: DeFiAdapter = {
    id: 'stargate',
    name: 'Stargate Finance',
    description: 'Cross-chain liquidity bridge',
    getPositions: async (address: string) => {
        // Mocking positions removed as requested by user.
        // Real implementation requires contract calls.
        return [];
    }
};
