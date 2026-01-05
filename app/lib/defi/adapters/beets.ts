import { DeFiAdapter, DeFiPosition } from '../types';
import { SUPPORTED_CHAINS } from '../../chains';
import { createPublicClient, http, parseAbi } from 'viem';
import { mainnet, optimism, fantom } from 'viem/chains';

// Configuration for Beets contracts (Fantom, Optimism, Sonic)
const BEETS_CONFIG = {
    fantom: {
        chainId: 'fantom',
        fBeets: '0xfcef8a994209d69e61a8971e3d6c98aad17f8648', // Fidelio Duetto (fBEETS)
        vault: '0x20dd72Ed959b6147912C2e529F0a0C651c33c9ce',
        rpc: 'https://rpc.ftm.tools'
    },
    optimism: {
        chainId: 'optimism',
        fBeets: '', // Add if known
        vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8', // Balancer Vault
        rpc: 'https://mainnet.optimism.io'
    },
    sonic: {
        chainId: 'sonic',
        // Sonic addresses would go here. For now we will try to find the User's "Beets Staked" by symbol scanning if possible,
        // or generic MasterChef if we had the address.
        // Since we don't have the exact address for Sonic Beets yet, we will rely on finding the token in the wallet 
        // and enriching it, OR this adapter will return empty for Sonic until updated.
        rpc: 'https://rpc.soniclabs.com'
    }
};

const FBEETS_ABI = parseAbi([
    'function balanceOf(address account) view returns (uint256)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function name() view returns (string)'
]);

export const BeethovenXAdapter: DeFiAdapter = {
    id: 'beets',
    name: 'Beethoven X',
    description: 'Decentralized Exchange & Liquidity',
    getPositions: async (address: string) => {
        const positions: DeFiPosition[] = [];

        // 1. Check Fantom fBEETS (Fresh Beets)
        try {
            const client = createPublicClient({
                chain: fantom,
                transport: http(BEETS_CONFIG.fantom.rpc)
            });

            const balance = await client.readContract({
                address: BEETS_CONFIG.fantom.fBeets as `0x${string}`,
                abi: FBEETS_ABI,
                functionName: 'balanceOf',
                args: [address as `0x${string}`]
            });

            if (balance > BigInt(0)) {
                // Fetch price (mock or API) - For now assuming $0.50 approx or fetching later
                const fBeetsValue = Number(balance) / 1e18;
                // We should ideally fetch the real price, but for "visibility" this proves tracking works

                const chainConfig = SUPPORTED_CHAINS.find(c => c.id === 'fantom')!;

                positions.push({
                    id: `beets-fantom-fbeets`,
                    protocolId: 'beets',
                    protocolName: 'Beethoven X',
                    chain: chainConfig,
                    type: 'farming',
                    assets: [{
                        symbol: 'fBEETS',
                        address: BEETS_CONFIG.fantom.fBeets,
                        amount: fBeetsValue.toString(),
                        valueUsd: 0 // Price fetched in analyzer or generic pricer
                    }],
                    totalValueUsd: 0,
                    apy: 0
                });
            }
        } catch (e) {
            // console.warn('Failed to check Beets Fantom', e);
        }

        return positions;
    }
};
