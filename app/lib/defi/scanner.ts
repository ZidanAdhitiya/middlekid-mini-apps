import { DeFiAdapter, DeFiPosition } from './types';
import { StargateAdapter } from './adapters/stargate';
import { BeethovenXAdapter } from './adapters/beets';
import { ManualAdapter } from './adapters/manual';

// Registry of all active adapters
const ADAPTERS: DeFiAdapter[] = [
    StargateAdapter,
    BeethovenXAdapter,
    ManualAdapter
    // Add more here (Aave, UniV3, etc.)
];

export async function scanDeFiPositions(address: string): Promise<DeFiPosition[]> {
    try {
        const promises = ADAPTERS.map(async (adapter) => {
            try {
                return await adapter.getPositions(address);
            } catch (error) {
                console.error(`Adapter ${adapter.name} failed:`, error);
                return [];
            }
        });

        const results = await Promise.all(promises);
        return results.flat();
    } catch (error) {
        console.error('DeFi Scan failed:', error);
        return [];
    }
}
