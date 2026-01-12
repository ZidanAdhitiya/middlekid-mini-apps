// COMPREHENSIVE DeFi Scanner - NFTs + Contracts + Tokens
// Matches DeBank by reading all position types

import { createPublicClient, http, parseAbiItem, defineChain } from 'viem';
import { mainnet, base, optimism, arbitrum, polygon, gnosis, avalanche, bsc, fantom } from 'viem/chains';

// Define custom chains
const kava = defineChain({
    id: 2222,
    name: 'Kava EVM',
    network: 'kava',
    nativeCurrency: { name: 'Kava', symbol: 'KAVA', decimals: 18 },
    rpcUrls: { default: { http: ['https://kava.drpc.org'] }, public: { http: ['https://kava.drpc.org'] } },
    blockExplorers: { default: { name: 'Kavascan', url: 'https://kavascan.com' } }
});

const hyperliquid = defineChain({
    id: 999,
    name: 'Hyperliquid EVM',
    network: 'hyperliquid',
    nativeCurrency: { name: 'HYPE', symbol: 'HYPE', decimals: 18 },
    rpcUrls: { default: { http: ['https://rpc.hyperliquid.xyz/evm'] }, public: { http: ['https://rpc.hyperliquid.xyz/evm'] } },
    blockExplorers: { default: { name: 'Hyperliquid Explorer', url: 'https://app.hyperliquid.xyz' } }
});

export interface DeFiPosition {
    id: string;
    protocol: string;
    chain: string;
    tokens: Array<{ symbol: string; amount: string; value: number; }>;
    totalValue: number;
    apy: number;
}

const PROTOCOL_ADDRESSES: Record<string, Record<string, string>> = {
    uniswapV3NFT: {
        mainnet: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
        optimism: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
        arbitrum: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
        polygon: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
        base: '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1'
    },
    aaveV3Pool: {
        mainnet: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
        optimism: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
        arbitrum: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
        polygon: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
        base: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5',
        gnosis: '0xb50201558B00496A145fE76f7424749556E326D8',
        avalanche: '0x794a61358D6845594F94dc1DB02A252b5b4814aD'
    }
};

const RPC_URLS: Record<string, string> = {
    mainnet: 'https://eth.llamarpc.com',
    base: 'https://base.llamarpc.com',
    optimism: 'https://optimism.drpc.org',
    arbitrum: 'https://arbitrum.drpc.org',
    polygon: 'https://polygon.llamarpc.com',
    gnosis: 'https://gnosis.drpc.org',
    avalanche: 'https://avalanche.drpc.org',
    bsc: 'https://bsc.drpc.org',
    fantom: 'https://fantom.drpc.org',
    kava: 'https://kava.drpc.org',
    hyperliquid: 'https://rpc.hyperliquid.xyz/evm' // Testnet - mainnet may need different RPC
};

function getChain(chainId: string) {
    const chains: Record<string, any> = { mainnet, base, optimism, arbitrum, polygon, gnosis, avalanche, bsc, fantom, kava, hyperliquid };
    return chains[chainId] || mainnet;
}

function getClient(chainId: string) {
    return createPublicClient({
        chain: getChain(chainId),
        transport: http(RPC_URLS[chainId] || RPC_URLS.mainnet)
    });
}

// 1. Uniswap V3 NFT Positions
async function scanUniswapV3NFTs(address: string, chainId: string): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = [];
    const nftManager = PROTOCOL_ADDRESSES.uniswapV3NFT[chainId];
    if (!nftManager) return positions;

    try {
        const client = getClient(chainId);

        // Get number of NFTs owned
        const balance = await client.readContract({
            address: nftManager as `0x${string}`,
            abi: [parseAbiItem('function balanceOf(address) view returns (uint256)')],
            functionName: 'balanceOf',
            args: [address as `0x${string}`]
        });

        const count = Number(balance);
        if (count === 0) return positions;

        console.log(`  🦄 Uniswap V3 (${chainId}): ${count} LP positions`);

        // Get each NFT token ID and position details
        for (let i = 0; i < Math.min(count, 50); i++) {
            try {
                const tokenId = await client.readContract({
                    address: nftManager as `0x${string}`,
                    abi: [parseAbiItem('function tokenOfOwnerByIndex(address,uint256) view returns (uint256)')],
                    functionName: 'tokenOfOwnerByIndex',
                    args: [address as `0x${string}`, BigInt(i)]
                });

                // Get position details
                const position = await client.readContract({
                    address: nftManager as `0x${string}`,
                    abi: [parseAbiItem('function positions(uint256) view returns (uint96,address,address,address,uint24,int24,int24,uint128,uint256,uint256,uint128,uint128)')],
                    functionName: 'positions',
                    args: [tokenId]
                }) as any;

                const liquidity = Number(position[7]); // Liquidity in position
                const token0 = position[2] as string;
                const token1 = position[3] as string;

                if (liquidity > 0) {
                    positions.push({
                        id: `uniswap-v3-${chainId}-${tokenId}`,
                        protocol: 'Uniswap V3',
                        chain: chainId.charAt(0).toUpperCase() + chainId.slice(1),
                        tokens: [
                            { symbol: 'LP', amount: (liquidity / 1e18).toFixed(6), value: 0 }
                        ],
                        totalValue: 0, // Would need price oracle
                        apy: 0
                    });
                }
            } catch (e) {
                // Skip closed positions
            }
        }
    } catch (error) {
        console.error(`Uniswap V3 NFT error (${chainId}):`, error);
    }

    return positions;
}

// 2. Aave V3 Lending Positions
async function scanAaveV3(address: string, chainId: string): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = [];
    const pool = PROTOCOL_ADDRESSES.aaveV3Pool[chainId];
    if (!pool) return positions;

    try {
        const client = getClient(chainId);

        const data = await client.readContract({
            address: pool as `0x${string}`,
            abi: [parseAbiItem('function getUserAccountData(address) view returns (uint256,uint256,uint256,uint256,uint256,uint256)')],
            functionName: 'getUserAccountData',
            args: [address as `0x${string}`]
        }) as any;

        const collateral = Number(data[0]) / 1e8; // 8 decimals
        const debt = Number(data[1]) / 1e8;

        if (collateral > 1 || debt > 1) {
            console.log(`  💎 Aave V3 (${chainId}): $${collateral.toFixed(2)} supplied, $${debt.toFixed(2)} borrowed`);

            positions.push({
                id: `aave-v3-${chainId}`,
                protocol: 'Aave V3',
                chain: chainId.charAt(0).toUpperCase() + chainId.slice(1),
                tokens: [
                    { symbol: 'Supplied', amount: collateral.toFixed(2), value: collateral },
                    ...(debt > 0 ? [{ symbol: 'Borrowed', amount: debt.toFixed(2), value: -debt }] : [])
                ],
                totalValue: collateral - debt,
                apy: 0
            });
        }
    } catch (error) {
        console.error(`Aave V3 error (${chainId}):`, error);
    }

    return positions;
}

// 3. Compound V3 Positions
async function scanCompoundV3(address: string, chainId: string): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = [];

    // Compound V3 markets
    const markets: Record<string, string[]> = {
        mainnet: ['0xc3d688B66703497DAA19211EEdff47f25384cdc3'], // cUSDCv3
        base: ['0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf'],
        arbitrum: ['0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf'],
        polygon: ['0xF25212E676D1F7F89Cd72fFEe66158f541246445']
    };

    const chainMarkets = markets[chainId];
    if (!chainMarkets) return positions;

    try {
        const client = getClient(chainId);

        for (const market of chainMarkets) {
            try {
                const balance = await client.readContract({
                    address: market as `0x${string}`,
                    abi: [parseAbiItem('function balanceOf(address) view returns (uint256)')],
                    functionName: 'balanceOf',
                    args: [address as `0x${string}`]
                });

                const amount = Number(balance) / 1e6; // USDC decimals
                if (amount > 1) {
                    console.log(`  🏦 Compound V3 (${chainId}): ${amount.toFixed(2)} supplied`);
                    positions.push({
                        id: `compound-v3-${chainId}-${market}`,
                        protocol: 'Compound V3',
                        chain: chainId.charAt(0).toUpperCase() + chainId.slice(1),
                        tokens: [{ symbol: 'cUSDC', amount: amount.toFixed(2), value: amount }],
                        totalValue: amount,
                        apy: 0
                    });
                }
            } catch (e) {
                // Market might not exist on this chain
            }
        }
    } catch (error) {
        console.error(`Compound V3 error (${chainId}):`, error);
    }

    return positions;
}

// 4. MakerDAO/Spark (sDAI)
async function scanMakerDAO(address: string, chainId: string): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = [];
    const sDAI = chainId === 'mainnet' ? '0x83F20F44975D03b1b09e64809B757c47f942BEeA' : null;
    if (!sDAI) return positions;

    try {
        const client = getClient(chainId);
        const balance = await client.readContract({
            address: sDAI as `0x${string}`,
            abi: [parseAbiItem('function balanceOf(address) view returns (uint256)')],
            functionName: 'balanceOf',
            args: [address as `0x${string}`]
        });
        const amount = Number(balance) / 1e18;
        if (amount > 0.01) {
            positions.push({
                id: `makerdao-${chainId}`,
                protocol: 'MakerDAO',
                chain: 'Ethereum',
                tokens: [{ symbol: 'sDAI', amount: amount.toFixed(2), value: amount }],
                totalValue: amount,
                apy: 0
            });
        }
    } catch (error) { }
    return positions;
}

// 5. LIDO (stETH staking)
async function scanLido(address: string, chainId: string, debugErrors: string[]): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = [];
    if (chainId !== 'mainnet') return positions;

    const stETH = '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84';
    const wstETH = '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0'; // Wrapped stETH - this is what most people hold!

    try {
        const client = getClient(chainId);
        const { getTokenPrice } = await import('./price-oracle');
        const ethPrice = await getTokenPrice('eth');
        let totalValue = 0;
        const tokens: any[] = [];

        // Check stETH balance
        const stEthBalance = await client.readContract({
            address: stETH as `0x${string}`,
            abi: [parseAbiItem('function balanceOf(address) view returns (uint256)')],
            functionName: 'balanceOf',
            args: [address as `0x${string}`]
        }) as bigint;

        const stEthAmount = Number(stEthBalance) / 1e18;
        debugErrors.push(`LIDO: stETH balance=${stEthAmount}`);

        if (stEthAmount > 0.01) {
            const value = stEthAmount * ethPrice;
            totalValue += value;
            tokens.push({ symbol: 'stETH', amount: stEthAmount.toFixed(4), value });
        }

        // Check wstETH balance (MOST IMPORTANT - this is what people usually hold!)
        const wstEthBalance = await client.readContract({
            address: wstETH as `0x${string}`,
            abi: [parseAbiItem('function balanceOf(address) view returns (uint256)')],
            functionName: 'balanceOf',
            args: [address as `0x${string}`]
        }) as bigint;

        const wstEthAmount = Number(wstEthBalance) / 1e18;
        debugErrors.push(`LIDO: wstETH balance=${wstEthAmount}`);

        if (wstEthAmount > 0.01) {
            // wstETH is worth more than ETH 1:1 - get the conversion rate
            const stEthPerWstEth = await client.readContract({
                address: wstETH as `0x${string}`,
                abi: [parseAbiItem('function stEthPerToken() view returns (uint256)')],
                functionName: 'stEthPerToken'
            }) as bigint;

            const stEthEquivalent = wstEthAmount * Number(stEthPerWstEth) / 1e18;
            const value = stEthEquivalent * ethPrice;
            debugErrors.push(`LIDO: ${wstEthAmount} wstETH = ${stEthEquivalent} stETH = $${value}`);
            totalValue += value;
            tokens.push({ symbol: 'wstETH', amount: wstEthAmount.toFixed(4), value });
        }

        if (totalValue > 0) {
            positions.push({
                id: `lido-${chainId}`,
                protocol: 'Lido',
                chain: 'Ethereum',
                tokens,
                totalValue,
                apy: 0
            });
        }
    } catch (error) {
        debugErrors.push(`LIDO ERROR: ${error instanceof Error ? error.message : String(error)}`);
    }
    return positions;
}

// 6. Pendle (simplified)
async function scanPendle(address: string, chainId: string): Promise<DeFiPosition[]> {
    return []; // Placeholder
}

// 7. ether.fi (eETH + weETH liquid staking) - ALL CHAINS
async function scanEtherFi(address: string, chainId: string, debugErrors: string[]): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = [];

    // weETH addresses per chain
    const weETH_ADDRESSES: Record<string, string> = {
        mainnet: '0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee',
        arbitrum: '0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe',
        base: '0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A',
        optimism: '0x5A7fACB970D094B6C7FF1df0eA68D99E6e73CBFF'
    };

    const eETH = chainId === 'mainnet' ? '0x35fA164735182de50811E8e2E824cFb9B6118ac2' : null;
    const weETH = weETH_ADDRESSES[chainId];

    if (!weETH && !eETH) return positions;

    try {
        const client = getClient(chainId);
        const { getTokenPrice } = await import('./price-oracle');
        const ethPrice = await getTokenPrice('eth');
        let totalValue = 0;
        const tokens: any[] = [];

        // Check eETH balance (mainnet only)
        if (eETH) {
            const eethBalance = await client.readContract({
                address: eETH as `0x${string}`,
                abi: [parseAbiItem('function balanceOf(address) view returns (uint256)')],
                functionName: 'balanceOf',
                args: [address as `0x${string}`]
            }) as bigint;

            const eethAmount = Number(eethBalance) / 1e18;
            debugErrors.push(`ETHERFI (${chainId}): eETH balance=${eethAmount}`);

            if (eethAmount > 0.01) {
                const value = eethAmount * ethPrice;
                totalValue += value;
                tokens.push({ symbol: 'eETH', amount: eethAmount.toFixed(4), value });
            }
        }

        // Check weETH balance (all chains)
        if (weETH) {
            const weethBalance = await client.readContract({
                address: weETH as `0x${string}`,
                abi: [parseAbiItem('function balanceOf(address) view returns (uint256)')],
                functionName: 'balanceOf',
                args: [address as `0x${string}`]
            }) as bigint;

            const weethAmount = Number(weethBalance) / 1e18;
            debugErrors.push(`ETHERFI (${chainId}): weETH balance=${weethAmount}`);

            if (weethAmount > 0.01) {
                // Get weETH to eETH conversion rate
                const eethPerWeeth = await client.readContract({
                    address: weETH as `0x${string}`,
                    abi: [parseAbiItem('function getRate() view returns (uint256)')],
                    functionName: 'getRate'
                }) as bigint;

                const eethEquivalent = weethAmount * Number(eethPerWeeth) / 1e18;
                const value = eethEquivalent * ethPrice;
                debugErrors.push(`ETHERFI (${chainId}): ${weethAmount} weETH = ${eethEquivalent} eETH = $${value}`);
                totalValue += value;
                tokens.push({ symbol: 'weETH', amount: weethAmount.toFixed(4), value });
            }
        }

        if (totalValue > 0) {
            positions.push({
                id: `etherfi-${chainId}`,
                protocol: 'ether.fi',
                chain: chainId.charAt(0).toUpperCase() + chainId.slice(1),
                tokens,
                totalValue,
                apy: 0
            });
        }
    } catch (error) {
        debugErrors.push(`ETHERFI (${chainId}) ERROR: ${error instanceof Error ? error.message : String(error)}`);
    }
    return positions;
}

// ether.fi Yield Vaults (liquidETH and eEIGEN)
async function scanEtherFiVaults(address: string, chainId: string, debugErrors: string[]): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = [];
    if (chainId !== 'mainnet') return positions;

    const liquidETH = '0xf0bb20865277aBd641a307eCe5Ee04E79073416C';
    const eEIGEN = '0xe77076518a813616315eaaba6ca8e595e845eee9';

    try {
        const client = getClient(chainId);
        const { getTokenPrice } = await import('./price-oracle');
        let totalValue = 0;
        const tokens: any[] = [];

        // Check liquidETH vault balance (yields WETH)
        const liquidEthBalance = await client.readContract({
            address: liquidETH as `0x${string}`,
            abi: [parseAbiItem('function balanceOf(address) view returns (uint256)')],
            functionName: 'balanceOf',
            args: [address as `0x${string}`]
        }) as bigint;

        const liquidEthAmount = Number(liquidEthBalance) / 1e18;
        debugErrors.push(`ETHERFI-VAULT: liquidETH balance=${liquidEthAmount}`);

        if (liquidEthAmount > 0.01) {
            const ethPrice = await getTokenPrice('eth');
            const value = liquidEthAmount * ethPrice;
            debugErrors.push(`ETHERFI-VAULT: ${liquidEthAmount} liquidETH * $${ethPrice} = $${value}`);
            totalValue += value;
            tokens.push({ symbol: 'liquidETH', amount: liquidEthAmount.toFixed(4), value });
        }

        // Check eEIGEN vault balance
        const eEigenBalance = await client.readContract({
            address: eEIGEN as `0x${string}`,
            abi: [parseAbiItem('function balanceOf(address) view returns (uint256)')],
            functionName: 'balanceOf',
            args: [address as `0x${string}`]
        }) as bigint;

        const eEigenAmount = Number(eEigenBalance) / 1e18;
        debugErrors.push(`ETHERFI-VAULT: eEIGEN balance=${eEigenAmount}`);

        if (eEigenAmount > 0.01) {
            const eigenPrice = await getTokenPrice('eigen');
            const value = eEigenAmount * eigenPrice;
            debugErrors.push(`ETHERFI-VAULT: ${eEigenAmount} eEIGEN * $${eigenPrice} = $${value}`);
            totalValue += value;
            tokens.push({ symbol: 'eEIGEN', amount: eEigenAmount.toFixed(4), value });
        }

        if (totalValue > 0) {
            positions.push({
                id: `etherfi-vaults-${chainId}`,
                protocol: 'ether.fi Vaults',
                chain: 'Ethereum',
                tokens,
                totalValue,
                apy: 0
            });
        }
    } catch (error) {
        debugErrors.push(`ETHERFI-VAULT ERROR: ${error instanceof Error ? error.message : String(error)}`);
    }
    return positions;
}

// Kelp DAO (rsETH, hgETH, agETH liquid restaking/vaults)
async function scanKelpDAO(address: string, chainId: string, debugErrors: string[]): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = [];
    if (chainId !== 'mainnet') return positions;

    const rsETH = '0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7';
    const hgETH = '0xc824A08dB624942c5E5F330d56530cD1598859fD'; // High Growth ETH
    const agETH = '0xe1b4d34e8754600962cd944b535180bd758e6c2e'; // Kelp Gain

    try {
        const client = getClient(chainId);
        const { getTokenPrice } = await import('./price-oracle');
        const ethPrice = await getTokenPrice('eth');
        let totalValue = 0;
        const tokens: any[] = [];

        // Check rsETH balance
        try {
            const rsEthBalance = await client.readContract({
                address: rsETH as `0x${string}`,
                abi: [parseAbiItem('function balanceOf(address) view returns (uint256)')],
                functionName: 'balanceOf',
                args: [address as `0x${string}`]
            }) as bigint;
            const rsEthAmount = Number(rsEthBalance) / 1e18;
            debugErrors.push(`KELP: rsETH balance=${rsEthAmount}`);
            if (rsEthAmount > 0.01) {
                const value = rsEthAmount * ethPrice * 1.02;
                tokens.push({ symbol: 'rsETH', amount: rsEthAmount.toFixed(4), value });
                totalValue += value;
            }
        } catch (e) { /* ignore */ }

        // Check hgETH balance (High Growth ETH)
        try {
            const hgEthBalance = await client.readContract({
                address: hgETH as `0x${string}`,
                abi: [parseAbiItem('function balanceOf(address) view returns (uint256)')],
                functionName: 'balanceOf',
                args: [address as `0x${string}`]
            }) as bigint;
            const hgEthAmount = Number(hgEthBalance) / 1e18;
            debugErrors.push(`KELP: hgETH balance=${hgEthAmount}`);
            if (hgEthAmount > 0.01) {
                const value = hgEthAmount * ethPrice;
                debugErrors.push(`KELP: ${hgEthAmount} hgETH * $${ethPrice} = $${value}`);
                tokens.push({ symbol: 'hgETH', amount: hgEthAmount.toFixed(4), value });
                totalValue += value;
            }
        } catch (e) {
            debugErrors.push(`KELP hgETH: ${e instanceof Error ? e.message : String(e)}`);
        }

        // Check agETH balance (Kelp Gain)
        try {
            const agEthBalance = await client.readContract({
                address: agETH as `0x${string}`,
                abi: [parseAbiItem('function balanceOf(address) view returns (uint256)')],
                functionName: 'balanceOf',
                args: [address as `0x${string}`]
            }) as bigint;
            const agEthAmount = Number(agEthBalance) / 1e18;
            debugErrors.push(`KELP: agETH balance=${agEthAmount}`);
            if (agEthAmount > 0.01) {
                const value = agEthAmount * ethPrice;
                debugErrors.push(`KELP: ${agEthAmount} agETH * $${ethPrice} = $${value}`);
                tokens.push({ symbol: 'agETH', amount: agEthAmount.toFixed(4), value });
                totalValue += value;
            }
        } catch (e) {
            debugErrors.push(`KELP agETH: ${e instanceof Error ? e.message : String(e)}`);
        }

        if (totalValue > 0) {
            positions.push({
                id: `kelp-${chainId}`,
                protocol: 'Kelp DAO',
                chain: 'Ethereum',
                tokens,
                totalValue,
                apy: 0
            });
        }
    } catch (error) {
        debugErrors.push(`KELP ERROR: ${error instanceof Error ? error.message : String(error)}`);
    }
    return positions;
}




// 8. Seamless Protocol (Base)
async function scanSeamless(address: string, chainId: string): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = [];
    const pool = chainId === 'base' ? '0x8F44Fd754285aa6A2b8B9B97739B79746e0475a7' : null;
    if (!pool) return positions;

    try {
        const client = getClient(chainId);
        const data = await client.readContract({
            address: pool as `0x${string}`,
            abi: [parseAbiItem('function getUserAccountData(address) view returns (uint256,uint256,uint256,uint256,uint256,uint256)')],
            functionName: 'getUserAccountData',
            args: [address as `0x${string}`]
        }) as any;
        const collateral = Number(data[0]) / 1e8;
        const debt = Number(data[1]) / 1e8;
        if (collateral > 1 || debt > 1) {
            positions.push({
                id: `seamless-${chainId}`,
                protocol: 'Seamless',
                chain: 'Base',
                tokens: [
                    { symbol: 'Supplied', amount: collateral.toFixed(2), value: collateral },
                    ...(debt > 0 ? [{ symbol: 'Borrowed', amount: debt.toFixed(2), value: -debt }] : [])
                ],
                totalValue: collateral - debt,
                apy: 0
            });
        }
    } catch (error) { }
    return positions;
}

// 9. Radiant Capital (Arbitrum)
async function scanRadiant(address: string, chainId: string): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = [];
    const pool = chainId === 'arbitrum' ? '0xF4B1486DD74D07706052A33d31d7c0AAFD0659E1' : null;
    if (!pool) return positions;

    try {
        const client = getClient(chainId);
        const data = await client.readContract({
            address: pool as `0x${string}`,
            abi: [parseAbiItem('function getUserAccountData(address) view returns (uint256,uint256,uint256,uint256,uint256,uint256)')],
            functionName: 'getUserAccountData',
            args: [address as `0x${string}`]
        }) as any;
        const collateral = Number(data[0]) / 1e8;
        const debt = Number(data[1]) / 1e8;
        if (collateral > 1 || debt > 1) {
            positions.push({
                id: `radiant-${chainId}`,
                protocol: 'Radiant Capital',
                chain: 'Arbitrum',
                tokens: [
                    { symbol: 'Supplied', amount: collateral.toFixed(2), value: collateral },
                    ...(debt > 0 ? [{ symbol: 'Borrowed', amount: debt.toFixed(2), value: -debt }] : [])
                ],
                totalValue: collateral - debt,
                apy: 0
            });
        }
    } catch (error) { }
    return positions;
}

// 10. Ionic Protocol (Base)
async function scanIonic(address: string, chainId: string): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = [];
    const pool = chainId === 'base' ? '0x3ee5e23eee121094f1cfc0ccc79d6c809ebd22e5' : null;
    if (!pool) return positions;
    try {
        const client = getClient(chainId);
        const balance = await client.readContract({
            address: pool as `0x${string}`,
            abi: [parseAbiItem('function balanceOf(address) view returns (uint256)')],
            functionName: 'balanceOf',
            args: [address as `0x${string}`]
        });
        const amount = Number(balance) / 1e18;
        if (amount > 0.01) {
            // Get ETH price for Base chain
            const { getTokenPrice } = await import('./price-oracle');
            const ethPrice = await getTokenPrice('eth');
            const value = amount * ethPrice;

            positions.push({
                id: `ionic-${chainId}`,
                protocol: 'Ionic',
                chain: 'Base',
                tokens: [{ symbol: 'ETH', amount: amount.toFixed(4), value }],
                totalValue: value,
                apy: 0
            });
        }
    } catch (error) { }
    return positions;
}


// 11. Silo Finance (Ethereum/Arbitrum)
async function scanSilo(address: string, chainId: string): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = [];
    const siloContract = chainId === 'mainnet' ? '0xfccc27aae7A85f190e80352F7e9eEab61616B' :
        chainId === 'arbitrum' ? '0x0341C0C0ec423328621788d4854119B97f44E391' : null;
    if (!siloContract) return positions;
    try {
        const client = getClient(chainId);
        const balance = await client.readContract({
            address: siloContract as `0x${string}`,
            abi: [parseAbiItem('function balanceOf(address) view returns (uint256)')],
            functionName: 'balanceOf',
            args: [address as `0x${string}`]
        });
        const amount = Number(balance) / 1e18;
        if (amount > 0.01) {
            positions.push({
                id: `silo-${chainId}`,
                protocol: 'Silo Finance',
                chain: chainId.charAt(0).toUpperCase() + chainId.slice(1),
                tokens: [{ symbol: 'SILO', amount: amount.toFixed(2), value: 0 }],
                totalValue: 0,
                apy: 0
            });
        }
    } catch (error) { }
    return positions;
}

// 12. Moonwell (Base/Optimism) - Compound fork
async function scanMoonwell(address: string, chainId: string, debugErrors: string[]): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = [];
    const comptroller = chainId === 'optimism' ? '0xCa889f40aae37FFf165BccF69aeF1E82b5C511B9' :
        chainId === 'base' ? '0xfBb21d0380beE3312B33c4353c8936a0F13EF26C' : null;
    if (!comptroller) return positions;

    try {
        const client = getClient(chainId);
        const accountLiquidity = await client.readContract({
            address: comptroller as `0x${string}`,
            abi: [parseAbiItem('function getAccountLiquidity(address) view returns (uint256, uint256, uint256)')],
            functionName: 'getAccountLiquidity',
            args: [address as `0x${string}`]
        }) as [bigint, bigint, bigint];

        debugErrors.push(`VENUS: liquidity=${Number(accountLiquidity[1]) / 1e18} USD`);
        const liquidityUSD = Number(accountLiquidity[1]) / 1e18;

        if (liquidityUSD > 1) {
            positions.push({
                id: `moonwell-${chainId}`,
                protocol: 'Moonwell',
                chain: chainId.charAt(0).toUpperCase() + chainId.slice(1),
                tokens: [{ symbol: 'Supplied', amount: '1+', value: liquidityUSD }],
                totalValue: liquidityUSD,
                apy: 0
            });
        }
    } catch (error) { debugErrors.push(`VENUS ERROR: ${error instanceof Error ? error.message : String(error)}`); }
    return positions;
}

// 13. Sturdy Finance (Ethereum - leveraged yield farming)
async function scanSturdy(address: string, chainId: string, debugErrors: string[]): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = [];
    const lending = chainId === 'mainnet' ? '0xa422BB0B61eF9FB4CC589c3cEFe92C1E8ed2545C' : null;
    if (!lending) return positions;
    try {
        const client = getClient(chainId);
        const balance = await client.readContract({
            address: lending as `0x${string}`,
            abi: [parseAbiItem('function balanceOf(address) view returns (uint256)')],
            functionName: 'balanceOf',
            args: [address as `0x${string}`]
        });
        const amount = Number(balance) / 1e18;
        if (amount > 0.01) {
            positions.push({
                id: `sturdy-${chainId}`,
                protocol: 'Sturdy Finance',
                chain: 'Ethereum',
                tokens: [{ symbol: 'Lending', amount: amount.toFixed(2), value: 0 }],
                totalValue: 0,
                apy: 0
            });
        }
    } catch (error) { }
    return positions;
}

// 14. Venus Protocol (BSC)
async function scanVenus(address: string, chainId: string, debugErrors: string[]): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = [];
    const comptroller = chainId === 'bsc' ? '0xfD36E2c2a6789Db23113685031d7F16329158384' : null;
    if (!comptroller) return positions;

    try {
        const client = getClient(chainId);

        // Get list of markets user has entered
        const markets = await client.readContract({
            address: comptroller as `0x${string}`,
            abi: [parseAbiItem('function getAssetsIn(address) view returns (address[])')],
            functionName: 'getAssetsIn',
            args: [address as `0x${string}`]
        }) as string[];

        debugErrors.push(`VENUS: found ${markets.length} markets`);

        if (markets.length === 0) return positions;

        // Read balances of each vToken and sum up
        let totalSuppliedUSD = 0;
        const { getTokenPrice } = await import('./price-oracle');

        for (const vToken of markets) {
            try {
                const balance = await client.readContract({
                    address: vToken as `0x${string}`,
                    abi: [parseAbiItem('function balanceOf(address) view returns (uint256)')],
                    functionName: 'balanceOf',
                    args: [address as `0x${string}`]
                }) as bigint;

                if (balance > BigInt(0)) {
                    // Get exchange rate (vToken to underlying)
                    const exchangeRate = await client.readContract({
                        address: vToken as `0x${string}`,
                        abi: [parseAbiItem('function exchangeRateStored() view returns (uint256)')],
                        functionName: 'exchangeRateStored'
                    }) as bigint;

                    // Convert to underlying amount (balance * exchangeRate / 1e18)
                    const underlyingAmount = Number(balance) * Number(exchangeRate) / 1e36;

                    // Get underlying token price (simplified - use BNB price for all for now)
                    const bnbPrice = await getTokenPrice('bnb');
                    const valueUSD = underlyingAmount * bnbPrice;
                    totalSuppliedUSD += valueUSD;

                    debugErrors.push(`VENUS vToken ${vToken.slice(0, 10)}: ${underlyingAmount.toFixed(4)} ≈ $${valueUSD.toFixed(2)}`);
                }
            } catch (e) {
                debugErrors.push(`VENUS vToken ${vToken.slice(0, 10)} error: ${e instanceof Error ? e.message : String(e)}`);
            }
        }

        debugErrors.push(`VENUS: total=${totalSuppliedUSD} USD`);

        if (totalSuppliedUSD > 1) {
            positions.push({
                id: `venus-bsc`,
                protocol: 'Venus Protocol',
                chain: 'BSC',
                tokens: [{ symbol: 'Supplied', amount: markets.length.toString(), value: totalSuppliedUSD }],
                totalValue: totalSuppliedUSD,
                apy: 0
            });
        }
    } catch (error) { debugErrors.push(`VENUS ERROR: ${error instanceof Error ? error.message : String(error)}`); }
    return positions;
}

// 15. Curve Finance (Ethereum)
async function scanCurve(address: string, chainId: string, debugErrors: string[]): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = [];
    const veCRV = chainId === 'mainnet' ? '0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2' : null;
    if (!veCRV) return positions;

    try {
        const client = getClient(chainId);
        const locked = await client.readContract({
            address: veCRV as `0x${string}`,
            abi: [parseAbiItem('function locked(address) view returns (int128, uint256)')],
            functionName: 'locked',
            args: [address as `0x${string}`]
        }) as [bigint, bigint];

        const amount = Number(locked[0]) / 1e18;
        debugErrors.push(`CURVE: locked=${amount} CRV`);

        if (amount > 0.1) {
            const { getTokenPrice } = await import('./price-oracle');
            const crvPrice = await getTokenPrice('crv');
            debugErrors.push(`CURVE: CRV price=${crvPrice}`);
            const value = amount * crvPrice;
            debugErrors.push(`CURVE: ${amount} CRV * $${crvPrice} = $${value}`);

            positions.push({
                id: `curve-mainnet`,
                protocol: 'Curve Finance',
                chain: 'Ethereum',
                tokens: [{ symbol: 'veCRV', amount: amount.toFixed(4), value }],
                totalValue: value,
                apy: 0
            });
        } else {
            debugErrors.push(`CURVE: amount ${amount} below threshold 0.1`);
        }
    } catch (error) { debugErrors.push(`VENUS ERROR: ${error instanceof Error ? error.message : String(error)}`); }
    return positions;
}


// 16. Convex Finance (Ethereum - cvxCRV staking)
async function scanConvex(address: string, chainId: string): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = [];
    const cvxCRV = chainId === 'mainnet' ? '0x62B9c7356A2Dc64a1969e19C23e4f579F9810Aa7' : null;
    if (!cvxCRV) return positions;

    try {
        const client = getClient(chainId);
        const balance = await client.readContract({
            address: cvxCRV as `0x${string}`,
            abi: [parseAbiItem('function balanceOf(address) view returns (uint256)')],
            functionName: 'balanceOf',
            args: [address as `0x${string}`]
        });
        const amount = Number(balance) / 1e18;
        if (amount > 0.01) {
            const { getTokenPrice } = await import('./price-oracle');
            const crvPrice = await getTokenPrice('crv');
            const value = amount * crvPrice;

            positions.push({
                id: `convex-${chainId}`,
                protocol: 'Convex Finance',
                chain: 'Ethereum',
                tokens: [{ symbol: 'cvxCRV', amount: amount.toFixed(4), value }],
                totalValue: value,
                apy: 0
            });
        }
    } catch (error) { }
    return positions;
}

// 17. Yearn V3 (Multi-chain - check for yv tokens in wallet)
async function scanYearn(address: string, chainId: string): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = [];
    // Yearn V3 detection is better done via token scanner since vaults are ERC-4626
    // This is a placeholder for direct vault enumeration if needed
    return positions;
}

// 18. Benqi (Avalanche - lending/staking)
async function scanBenqi(address: string, chainId: string): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = [];
    const comptroller = chainId === 'avalanche' ? '0x486Af39519B4Dc9a7fCcd318217352830E8AD9b4' : null;
    if (!comptroller) return positions;

    try {
        const client = getClient(chainId);
        const assets = await client.readContract({
            address: comptroller as `0x${string}`,
            abi: [parseAbiItem('function getAssetsIn(address) view returns (address[])')],
            functionName: 'getAssetsIn',
            args: [address as `0x${string}`]
        }) as any;

        if (assets && assets.length > 0) {
            // Try to get account liquidity
            try {
                const liquidity = await client.readContract({
                    address: comptroller as `0x${string}`,
                    abi: [parseAbiItem('function getAccountLiquidity(address) view returns (uint256,uint256,uint256)')],
                    functionName: 'getAccountLiquidity',
                    args: [address as `0x${string}`]
                }) as any;

                const totalValue = Number(liquidity[1]) / 1e18;

                positions.push({
                    id: `benqi-${chainId}`,
                    protocol: 'Benqi',
                    chain: 'Avalanche',
                    tokens: [{ symbol: 'Markets', amount: assets.length.toString(), value: totalValue }],
                    totalValue,
                    apy: 0
                });
            } catch {
                positions.push({
                    id: `benqi-${chainId}`,
                    protocol: 'Benqi',
                    chain: 'Avalanche',
                    tokens: [{ symbol: 'Markets', amount: assets.length.toString(), value: 0 }],
                    totalValue: 0,
                    apy: 0
                });
            }
        }
    } catch (error) { }
    return positions;
}


// 19. Token-based detection (AGGRESSIVE - catches anything DeFi-like)
function scanDeFiTokens(allTokens: any[]): DeFiPosition[] {
    const positions: DeFiPosition[] = [];

    // MASSIVELY EXPANDED patterns
    const defiKeywords = [
        // LP tokens
        'LP', 'SLP', 'UNI-V2', 'CAKE-LP', 'PLP', 'JLP', 'BPT', 'BALANCER',
        // Staking
        'STAKED', 'STAKE', 'xTOKEN', 'veTOKEN', 'STETH', 'WSTETH', 'RETH',
        // Lending
        'aUSDC', 'aETH', 'aDAI', 'aWBTC', 'aToken', 'cUSDC', 'cETH', 'cDAI', 'cToken',
        // Vaults
        'yv', 'MOO', 'VAULT', 'ibToken',
        // Curve
        'CRV', '3CRV', 'crvUSD', 'CURVE',
        // Synthetix
        'sUSD', 'sBTC', 'sETH', 'SNX',
        // Other
        'PT-', 'YT-', 'PENDLE', 'LIDO', 'SPARK', 'sDAI',
        // Newer protocols (from screenshot)
        'KINETIC', 'HYPERLEND', 'ETHERFI', 'DELORME', 'ORIGAMI', 'IONIC',
        'MENDI', 'ZEROLEND', 'SEAMLESS', 'RADIANT', 'GRANARY',
        // Generic DeFi indicators
        'LENDING', 'BORROW', 'SUPPLY', 'DEPOSIT', 'YIELD', 'FARM'
    ];

    for (const token of allTokens) {
        const balance = parseFloat(token.balanceFormatted || '0');
        if (balance === 0) continue;

        const symbol = (token.symbol || '').toUpperCase();
        const name = (token.name || '').toUpperCase();

        // Check if token matches ANY DeFi keyword
        const matchedKeyword = defiKeywords.find(keyword =>
            symbol.includes(keyword) || name.includes(keyword)
        );

        if (matchedKeyword) {
            // Try to determine protocol from keyword
            let protocol = 'DeFi Protocol';
            if (matchedKeyword.includes('UNI')) protocol = 'Uniswap';
            else if (matchedKeyword.includes('CAKE')) protocol = 'PancakeSwap';
            else if (matchedKeyword.includes('aToken') || matchedKeyword.startsWith('a')) protocol = 'Aave';
            else if (matchedKeyword.includes('cToken') || matchedKeyword.startsWith('c')) protocol = 'Compound';
            else if (matchedKeyword.includes('yv')) protocol = 'Yearn';
            else if (matchedKeyword.includes('MOO')) protocol = 'Beefy';
            else if (matchedKeyword.includes('CRV')) protocol = 'Curve';
            else if (matchedKeyword.includes('PENDLE') || matchedKeyword.startsWith('PT-')) protocol = 'Pendle';
            else if (matchedKeyword.includes('LIDO') || matchedKeyword.includes('stETH')) protocol = 'LIDO';
            else if (matchedKeyword.includes('KINETIC')) protocol = 'Kinetic';
            else if (matchedKeyword.includes('HYPERLEND')) protocol = 'HyperLend';
            else if (matchedKeyword.includes('ETHERFI')) protocol = 'ether.fi';
            else protocol = matchedKeyword;

            positions.push({
                id: `token-${token.address}`,
                protocol,
                chain: getChainName(token.chainId),
                tokens: [{ symbol: token.symbol, amount: token.balanceFormatted, value: token.usdValue || 0 }],
                totalValue: token.usdValue || 0,
                apy: 0
            });
        }
    }

    return positions;
}

function getChainName(chainId: any): string {
    const chains: Record<string, string> = {
        '1': 'Ethereum', 'mainnet': 'Ethereum',
        '8453': 'Base', 'base': 'Base',
        '10': 'Optimism', 'optimism': 'Optimism',
        '42161': 'Arbitrum', 'arbitrum': 'Arbitrum',
        '137': 'Polygon', 'polygon': 'Polygon'
    };
    return chains[String(chainId)] || 'Unknown';
}

// MAIN SCANNER - Combines all methods
export async function scanDeFiPositions(address: string, allTokens: any[], debugErrors: string[]): Promise<DeFiPosition[]> {
    console.log('🔍 COMPREHENSIVE DeFi Scanner - NFTs + Contracts + Tokens');
    debugErrors.push('DEBUG: Starting NFT+Contract scan...');

    const chains = ['mainnet', 'base', 'optimism', 'arbitrum', 'polygon', 'gnosis', 'avalanche', 'bsc', 'fantom'];
    const allPositions: DeFiPosition[] = [];

    // 1. Scan NFT positions (Uniswap V3)
    debugErrors.push(`DEBUG: Checking Uniswap V3 NFTs on ${chains.length} chains...`);
    const nftResults = await Promise.allSettled(
        chains.map(chain => scanUniswapV3NFTs(address, chain))
    );
    let nftCount = 0;
    nftResults.forEach(r => {
        if (r.status === 'fulfilled') {
            nftCount += r.value.length;
            allPositions.push(...r.value);
        }
    });
    debugErrors.push(`DEBUG: Found ${nftCount} Uniswap V3 LP NFTs`);

    // 2. Scan contract state (Aave + Compound)
    debugErrors.push(`DEBUG: Checking Aave V3 on ${chains.length} chains...`);
    const aaveResults = await Promise.allSettled(
        chains.map(chain => scanAaveV3(address, chain))
    );
    let aaveCount = 0;
    aaveResults.forEach(r => {
        if (r.status === 'fulfilled') {
            aaveCount += r.value.length;
            allPositions.push(...r.value);
        }
    });
    debugErrors.push(`DEBUG: Found ${aaveCount} Aave positions`);

    debugErrors.push('DEBUG: Checking Compound V3 on 4 chains...');
    const compoundResults = await Promise.allSettled(
        chains.map(chain => scanCompoundV3(address, chain))
    );
    let compoundCount = 0;
    compoundResults.forEach(r => {
        if (r.status === 'fulfilled') {
            compoundCount += r.value.length;
            allPositions.push(...r.value);
        }
    });
    debugErrors.push(`DEBUG: Found ${compoundCount} Compound positions`);

    // 4. Scan MakerDAO/Spark
    debugErrors.push('DEBUG: Checking MakerDAO/Spark...');
    const makerResults = await Promise.allSettled(
        ['mainnet', 'gnosis'].map(chain => scanMakerDAO(address, chain))
    );
    let makerCount = 0;
    makerResults.forEach(r => {
        if (r.status === 'fulfilled') {
            makerCount += r.value.length;
            allPositions.push(...r.value);
        }
    });
    debugErrors.push(`DEBUG: Found ${makerCount} MakerDAO positions`);

    // 5. Scan LIDO
    debugErrors.push('DEBUG: Checking LIDO staking...');
    const lidoResults = await Promise.allSettled(
        ['mainnet', 'arbitrum', 'optimism'].map(chain => scanLido(address, chain, debugErrors))
    );
    let lidoCount = 0;
    lidoResults.forEach(r => {
        if (r.status === 'fulfilled') {
            lidoCount += r.value.length;
            allPositions.push(...r.value);
        }
    });
    debugErrors.push(`DEBUG: Found ${lidoCount} LIDO positions`);

    // 6. Scan Pendle
    debugErrors.push('DEBUG: Checking Pendle V2...');
    const pendleResults = await Promise.allSettled(
        ['mainnet', 'arbitrum'].map(chain => scanPendle(address, chain))
    );
    let pendleCount = 0;
    pendleResults.forEach(r => {
        if (r.status === 'fulfilled') {
            pendleCount += r.value.length;
            allPositions.push(...r.value);
        }
    });
    debugErrors.push(`DEBUG: Found ${pendleCount} Pendle positions`);

    // 7. Scan ether.fi
    debugErrors.push('DEBUG: Checking ether.fi liquid staking...');
    const etherfiResults = await Promise.allSettled(
        ['mainnet', 'arbitrum', 'base', 'optimism'].map(chain => scanEtherFi(address, chain, debugErrors))
    );
    let etherfiCount = 0;
    etherfiResults.forEach(r => {
        if (r.status === 'fulfilled') {
            etherfiCount += r.value.length;
            allPositions.push(...r.value);
        }
    });
    debugErrors.push(`DEBUG: Found ${etherfiCount} ether.fi positions`);

    // 7b. Scan ether.fi Yield Vaults
    debugErrors.push('DEBUG: Checking ether.fi yield vaults...');
    const etherfiVaultResults = await Promise.allSettled([
        scanEtherFiVaults(address, 'mainnet', debugErrors)
    ]);
    let etherfiVaultCount = 0;
    etherfiVaultResults.forEach(r => {
        if (r.status === 'fulfilled') {
            etherfiVaultCount += r.value.length;
            allPositions.push(...r.value);
        }
    });
    debugErrors.push(`DEBUG: Found ${etherfiVaultCount} ether.fi vault positions`);

    // 7c. Scan Kelp DAO
    debugErrors.push('DEBUG: Checking Kelp DAO...');
    const kelpResults = await Promise.allSettled([
        scanKelpDAO(address, 'mainnet', debugErrors)
    ]);
    let kelpCount = 0;
    kelpResults.forEach(r => {
        if (r.status === 'fulfilled') {
            kelpCount += r.value.length;
            allPositions.push(...r.value);
        }
    });
    debugErrors.push(`DEBUG: Found ${kelpCount} Kelp positions`);

    // 8. Scan Seamless (Base)
    debugErrors.push('DEBUG: Checking Seamless Protocol...');
    const seamlessResults = await Promise.allSettled(
        ['base'].map(chain => scanSeamless(address, chain))
    );
    let seamlessCount = 0;
    seamlessResults.forEach(r => {
        if (r.status === 'fulfilled') {
            seamlessCount += r.value.length;
            allPositions.push(...r.value);
        }
    });
    debugErrors.push(`DEBUG: Found ${seamlessCount} Seamless positions`);

    // 9. Scan Radiant (Arbitrum)
    debugErrors.push('DEBUG: Checking Radiant Capital...');
    const radiantResults = await Promise.allSettled(
        ['arbitrum'].map(chain => scanRadiant(address, chain))
    );
    let radiantCount = 0;
    radiantResults.forEach(r => {
        if (r.status === 'fulfilled') {
            radiantCount += r.value.length;
            allPositions.push(...r.value);
        }
    });
    debugErrors.push(`DEBUG: Found ${radiantCount} Radiant positions`);

    // 10-13. Scan Ionic, Silo, Moonwell, Sturdy
    debugErrors.push('DEBUG: Checking Ionic/Silo/Moonwell/Sturdy...');
    const otherResults = await Promise.allSettled([
        scanIonic(address, 'base'),
        scanSilo(address, 'mainnet'),
        scanSilo(address, 'arbitrum'),
        scanMoonwell(address, 'base', debugErrors),
        scanMoonwell(address, 'optimism', debugErrors),
        scanSturdy(address, 'mainnet', debugErrors)
    ]);
    let otherCount = 0;
    otherResults.forEach(r => {
        if (r.status === 'fulfilled') {
            otherCount += r.value.length;
            allPositions.push(...r.value);
        }
    });
    debugErrors.push(`DEBUG: Found ${otherCount} other protocol positions`);

    // 14-30. Scan ALL protocols + NEW: Hyperlend, Kinetix
    debugErrors.push('DEBUG: Checking all additional protocols + Hyperlend/Kinetix...');
    const moreResults = await Promise.allSettled([
        scanVenus(address, 'bsc', debugErrors),
        scanCurve(address, 'mainnet', debugErrors),
        scanConvex(address, 'mainnet'),
        scanBenqi(address, 'avalanche'),
        scanRocketPool(address, 'mainnet', debugErrors),
        scanFrax(address, 'mainnet', debugErrors),
        scanSushiSwap(address, 'mainnet', debugErrors),
        scanStargate(address, 'mainnet', debugErrors),
        scanMorpho(address, 'mainnet', debugErrors),
        scanVelodrome(address, 'optimism', debugErrors),
        scanVelodrome(address, 'base', debugErrors),
        scanAura(address, 'mainnet', debugErrors),
        scanGMX(address, 'arbitrum', debugErrors),
        scanGMX(address, 'avalanche', debugErrors),
        scanConvexCVX(address, 'mainnet', debugErrors),
        scanHyperlend(address, 'hyperliquid', debugErrors),
        scanKinetix(address, 'hyperliquid', debugErrors)
    ]);
    let moreCount = 0;
    moreResults.forEach(r => {
        if (r.status === 'fulfilled') {
            moreCount += r.value.length;
            allPositions.push(...r.value);
        }
    });
    debugErrors.push(`DEBUG: Found ${moreCount} additional protocol positions`);

    // Token scan
    debugErrors.push('DEBUG: Checking token holdings...');
    const tokenPositions = scanDeFiTokens(allTokens);
    allPositions.push(...tokenPositions);
    debugErrors.push(`DEBUG: Found ${tokenPositions.length} token-based positions`);

    debugErrors.push(`DEBUG: TOTAL = ${allPositions.length} positions`);

    // Log each position for debugging
    if (allPositions.length > 0) {
        allPositions.forEach(p => {
            debugErrors.push(`DEBUG: ${p.protocol} on ${p.chain}: $${p.totalValue.toFixed(2)}`);
        });
    }

    return allPositions;
}
// 19. Rocket Pool (rETH) - ENHANCED
async function scanRocketPool(address: string, chainId: string, debugErrors: string[]): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = [];
    const rETH = chainId === 'mainnet' ? '0xae78736Cd615f374D3085123A210448E74Fc6393' : null;
    if (!rETH) return positions;

    try {
        const client = getClient(chainId);
        const balance = await client.readContract({
            address: rETH as `0x${string}`,
            abi: [parseAbiItem('function balanceOf(address) view returns (uint256)')],
            functionName: 'balanceOf',
            args: [address as `0x${string}`]
        }) as bigint;

        const amount = Number(balance) / 1e18;
        debugErrors.push(`ROCKETPOOL: rETH balance=${amount}`);

        if (amount > 0.01) {
            // Get rETH/ETH exchange rate
            const rethContract = await client.readContract({
                address: rETH as `0x${string}`,
                abi: [parseAbiItem('function getEthValue(uint256) view returns (uint256)')],
                functionName: 'getEthValue',
                args: [balance]
            }) as bigint;

            const ethEquivalent = Number(rethContract) / 1e18;

            const { getTokenPrice } = await import('./price-oracle');
            const ethPrice = await getTokenPrice('eth');
            const value = ethEquivalent * ethPrice;
            debugErrors.push(`ROCKETPOOL: ${amount} rETH = ${ethEquivalent} ETH = $${value}`);

            positions.push({
                id: `rocketpool-${chainId}`,
                protocol: 'Rocket Pool',
                chain: 'Ethereum',
                tokens: [{ symbol: 'rETH', amount: amount.toFixed(4), value }],
                totalValue: value,
                apy: 0
            });
        }
    } catch (error) {
        debugErrors.push(`ROCKETPOOL ERROR: ${error instanceof Error ? error.message : String(error)}`);
    }
    return positions;
}


// 20. Frax (frxETH/sfrxETH) - ENHANCED to check BOTH
async function scanFrax(address: string, chainId: string, debugErrors: string[]): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = [];
    if (chainId !== 'mainnet') return positions;

    const frxETH = '0x5E8422345238F34275888049021821E8E08CAa1f';
    const sfrxETH = '0xac3E018457B222d93114458476f3E3416Abbe38F';

    try {
        const client = getClient(chainId);
        const { getTokenPrice } = await import('./price-oracle');
        const ethPrice = await getTokenPrice('eth');
        let totalValue = 0;
        const tokens: any[] = [];

        // Check frxETH (unstaked)
        const frxBalance = await client.readContract({
            address: frxETH as `0x${string}`,
            abi: [parseAbiItem('function balanceOf(address) view returns (uint256)')],
            functionName: 'balanceOf',
            args: [address as `0x${string}`]
        }) as bigint;

        const frxAmount = Number(frxBalance) / 1e18;
        debugErrors.push(`FRAX: frxETH balance=${frxAmount}`);

        if (frxAmount > 0.01) {
            const value = frxAmount * ethPrice;
            totalValue += value;
            tokens.push({ symbol: 'frxETH', amount: frxAmount.toFixed(4), value });
        }

        // Check sfrxETH (staked)
        const sfrxBalance = await client.readContract({
            address: sfrxETH as `0x${string}`,
            abi: [parseAbiItem('function balanceOf(address) view returns (uint256)')],
            functionName: 'balanceOf',
            args: [address as `0x${string}`]
        }) as bigint;

        const sfrxAmount = Number(sfrxBalance) / 1e18;
        debugErrors.push(`FRAX: sfrxETH balance=${sfrxAmount}`);

        if (sfrxAmount > 0.01) {
            // sfrxETH converts to frxETH at a rate
            const pricePerShare = await client.readContract({
                address: sfrxETH as `0x${string}`,
                abi: [parseAbiItem('function pricePerShare() view returns (uint256)')],
                functionName: 'pricePerShare'
            }) as bigint;

            const frxEquivalent = sfrxAmount * Number(pricePerShare) / 1e18;
            const value = frxEquivalent * ethPrice;
            debugErrors.push(`FRAX: ${sfrxAmount} sfrxETH = ${frxEquivalent} frxETH = $${value}`);
            totalValue += value;
            tokens.push({ symbol: 'sfrxETH', amount: sfrxAmount.toFixed(4), value });
        }

        if (totalValue > 0) {
            positions.push({
                id: `frax-${chainId}`,
                protocol: 'Frax Finance',
                chain: 'Ethereum',
                tokens,
                totalValue,
                apy: 0
            });
        }
    } catch (error) {
        debugErrors.push(`FRAX ERROR: ${error instanceof Error ? error.message : String(error)}`);
    }
    return positions;
}


// 21. Balancer V2 (BPT tokens)
async function scanBalancer(address: string, chainId: string, debugErrors: string[]): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = [];
    // Balancer uses token scanner approach - pools are ERC20 BPT tokens
    // This is a placeholder - actual detection via token scanner
    debugErrors.push(`BALANCER: using token scanner for BPT detection`);
    return positions;
}

// 22. SushiSwap - ENHANCED to check xSUSHI bar
async function scanSushiSwap(address: string, chainId: string, debugErrors: string[]): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = [];
    const xSUSHI = chainId === 'mainnet' ? '0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272' : null;
    if (!xSUSHI) return positions;

    try {
        const client = getClient(chainId);

        // Check xSUSHI balance (staked SUSHI in SushiBar)
        const xBalance = await client.readContract({
            address: xSUSHI as `0x${string}`,
            abi: [parseAbiItem('function balanceOf(address) view returns (uint256)')],
            functionName: 'balanceOf',
            args: [address as `0x${string}`]
        }) as bigint;

        const xAmount = Number(xBalance) / 1e18;
        debugErrors.push(`SUSHI: xSUSHI balance=${xAmount}`);

        if (xAmount > 0.01) {
            // Convert xSUSHI to SUSHI using totalSupply and SUSHI balance
            const totalSupply = await client.readContract({
                address: xSUSHI as `0x${string}`,
                abi: [parseAbiItem('function totalSupply() view returns (uint256)')],
                functionName: 'totalSupply'
            }) as bigint;

            const sushiBalance = await client.readContract({
                address: '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2' as `0x${string}`, // SUSHI token
                abi: [parseAbiItem('function balanceOf(address) view returns (uint256)')],
                functionName: 'balanceOf',
                args: [xSUSHI as `0x${string}`]
            }) as bigint;

            const sushiAmount = xAmount * Number(sushiBalance) / Number(totalSupply);

            const { getTokenPrice } = await import('./price-oracle');
            const sushiPrice = await getTokenPrice('sushi');
            const value = sushiAmount * sushiPrice;
            debugErrors.push(`SUSHI: ${xAmount} xSUSHI = ${sushiAmount} SUSHI = $${value}`);

            positions.push({
                id: `sushiswap-${chainId}`,
                protocol: 'SushiSwap',
                chain: 'Ethereum',
                tokens: [{ symbol: 'xSUSHI', amount: xAmount.toFixed(4), value }],
                totalValue: value,
                apy: 0
            });
        }
    } catch (error) {
        debugErrors.push(`SUSHI ERROR: ${error instanceof Error ? error.message : String(error)}`);
    }
    return positions;
}


// 23. Yearn V2 (yVaults)
async function scanYearnV2(address: string, chainId: string, debugErrors: string[]): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = [];
    // Yearn vaults are ERC20 tokens - better detected via token scanner
    // This is a placeholder
    debugErrors.push(`YEARN: using token scanner for yVault detection`);
    return positions;
}

// 24. Stargate (STG staking
async function scanStargate(address: string, chainId: string, debugErrors: string[]): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = [];
    const staking = chainId === 'mainnet' ? '0xB0D502E938ed5f4df2E681fE6E419ff29631d62b' : null;
    if (!staking) return positions;

    try {
        const client = getClient(chainId);
        const balance = await client.readContract({
            address: staking as `0x${string}`,
            abi: [parseAbiItem('function balanceOf(address) view returns (uint256)')],
            functionName: 'balanceOf',
            args: [address as `0x${string}`]
        }) as bigint;

        const amount = Number(balance) / 1e18;
        debugErrors.push(`STARGATE: STG staked=${amount}`);

        if (amount > 1) {
            const { getTokenPrice } = await import('./price-oracle');
            const stgPrice = await getTokenPrice('stg');
            const value = amount * stgPrice;
            debugErrors.push(`STARGATE: ${amount} STG * $${stgPrice} = $${value}`);

            positions.push({
                id: `stargate-${chainId}`,
                protocol: 'Stargate',
                chain: 'Ethereum',
                tokens: [{ symbol: 'STG', amount: amount.toFixed(4), value }],
                totalValue: value,
                apy: 0
            });
        }
    } catch (error) {
        debugErrors.push(`STARGATE ERROR: ${error instanceof Error ? error.message : String(error)}`);
    }
    return positions;
}

// 25. Beefy Finance (Vaults across chains)
async function scanBeefy(address: string, chainId: string, debugErrors: string[]): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = [];
    // Beefy moo tokens are ERC20 - detect via token scanner
    debugErrors.push(`BEEFY: using token scanner for mooToken detection`);
    return positions;
}

// 26. Morpho (Aave/Compound optimizer)
async function scanMorpho(address: string, chainId: string, debugErrors: string[]): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = [];
    const morphoAave = chainId === 'mainnet' ? '0x777777c9898D384F785Ee44Acfe945efDFf5f3E0' : null;
    if (!morphoAave) return positions;

    try {
        const client = getClient(chainId);
        // Check if user has any supply on Morpho - simplified check
        const supplyBalance = await client.readContract({
            address: morphoAave as `0x${string}`,
            abi: [parseAbiItem('function supplyBalance(address,address) view returns (uint256)')],
            functionName: 'supplyBalance',
            args: [
                '0xBcca60bB61934080951369a648Fb03DF4F96263C' as `0x${string}`, // aUSDC market
                address as `0x${string}`
            ]
        }) as bigint;

        const amount = Number(supplyBalance) / 1e6; // USDC decimals
        debugErrors.push(`MORPHO: aUSDC supply=${amount}`);

        if (amount > 1) {
            positions.push({
                id: `morpho-${chainId}`,
                protocol: 'Morpho',
                chain: 'Ethereum',
                tokens: [{ symbol: 'aUSDC', amount: amount.toFixed(2), value: amount }],
                totalValue: amount,
                apy: 0
            });
        }
    } catch (error) {
        debugErrors.push(`MORPHO ERROR: ${error instanceof Error ? error.message : String(error)}`);
    }
    return positions;
}

// 27. Velodrome/Aerodrome (Optimism/Base DEX)
async function scanVelodrome(address: string, chainId: string, debugErrors: string[]): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = [];
    const voter = chainId === 'optimism' ? '0x09236cfF45047DBee6B921e00704bed6D6B8Cf7e' :
        chainId === 'base' ? '0x16613524e02ad97eDfeF371bC883F2F5d6C480A5' : null;
    if (!voter) return positions;

    try {
        const client = getClient(chainId);
        // Check veVELO/veAERO balance
        const veNFTBalance = await client.readContract({
            address: voter as `0x${string}`,
            abi: [parseAbiItem('function balanceOf(address) view returns (uint256)')],
            functionName: 'balanceOf',
            args: [address as `0x${string}`]
        }) as bigint;

        debugErrors.push(`VELO: veNFT count=${veNFTBalance.toString()}`);

        if (veNFTBalance > BigInt(0)) {
            positions.push({
                id: `velodrome-${chainId}`,
                protocol: chainId === 'base' ? 'Aerodrome' : 'Velodrome',
                chain: chainId.charAt(0).toUpperCase() + chainId.slice(1),
                tokens: [{ symbol: 'veNFT', amount: veNFTBalance.toString(), value: 0 }],
                totalValue: 0,
                apy: 0
            });
        }
    } catch (error) {
        debugErrors.push(`VELO ERROR: ${error instanceof Error ? error.message : String(error)}`);
    }
    return positions;
}

// 28. Aura Finance (Balancer gauge wrapper)
async function scanAura(address: string, chainId: string, debugErrors: string[]): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = [];
    const auraLocker = chainId === 'mainnet' ? '0x3Fa73f1E5d8A792C80F426fc8F84FBF7Ce9bBCAC' : null;
    if (!auraLocker) return positions;

    try {
        const client = getClient(chainId);
        const locked = await client.readContract({
            address: auraLocker as `0x${string}`,
            abi: [parseAbiItem('function balances(address) view returns (uint112, uint32)')],
            functionName: 'balances',
            args: [address as `0x${string}`]
        }) as [bigint, number];

        const amount = Number(locked[0]) / 1e18;
        debugErrors.push(`AURA: locked=${amount}`);

        if (amount > 0.01) {
            const { getTokenPrice } = await import('./price-oracle');
            const auraPrice = await getTokenPrice('aura');
            const value = amount * auraPrice;
            debugErrors.push(`AURA: ${amount} AURA * $${auraPrice} = $${value}`);

            positions.push({
                id: `aura-${chainId}`,
                protocol: 'Aura Finance',
                chain: 'Ethereum',
                tokens: [{ symbol: 'vlAURA', amount: amount.toFixed(4), value }],
                totalValue: value,
                apy: 0
            });
        }
    } catch (error) {
        debugErrors.push(`AURA ERROR: ${error instanceof Error ? error.message : String(error)}`);
    }
    return positions;
}

// 29. GMX V2 - ENHANCED to check esGMX and GLP
async function scanGMX(address: string, chainId: string, debugErrors: string[]): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = [];
    const config = chainId === 'arbitrum' ? {
        rewardRouter: '0xA906F338CB21815cBc4Bc87ace9e68c87eF8d8F1',
        gmx: '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a',
        esGMX: '0xf42Ae1D54fd613C9bb14810b0588FaAa09a426cA',
        glp: '0x4277f8F2c384827B5273592FF7CeBd9f2C1ac258'
    } : chainId === 'avalanche' ? {
        rewardRouter: '0x82147C5A7E850eA4E28155DF107F2590fD4ba327',
        gmx: '0x62edc0692BD897D2295872a9FFCac5425011c661',
        esGMX: '0xFf1489227BbAAC61a9209A08929E4c2a526DdD17',
        glp: '0x01234181085565ed162a948b6a5e88758CD7c7b8'
    } : null;

    if (!config) return positions;

    try {
        const client = getClient(chainId);
        const { getTokenPrice } = await import('./price-oracle');
        const gmxPrice = await getTokenPrice('gmx');
        let totalValue = 0;
        const tokens: any[] = [];

        // Check staked GMX
        const stakedGMX = await client.readContract({
            address: config.rewardRouter as `0x${string}`,
            abi: [parseAbiItem('function stakedGmxTracker() view returns (address)')],
            functionName: 'stakedGmxTracker'
        }) as string;

        const gmxBalance = await client.readContract({
            address: stakedGMX as `0x${string}`,
            abi: [parseAbiItem('function depositBalances(address, address) view returns (uint256)')],
            functionName: 'depositBalances',
            args: [address as `0x${string}`, config.gmx as `0x${string}`]
        }) as bigint;

        const gmxAmount = Number(gmxBalance) / 1e18;
        debugErrors.push(`GMX: staked GMX=${gmxAmount}`);

        if (gmxAmount > 0.01) {
            const value = gmxAmount * gmxPrice;
            totalValue += value;
            tokens.push({ symbol: 'sGMX', amount: gmxAmount.toFixed(4), value });
        }

        // Check esGMX
        const esGMXBalance = await client.readContract({
            address: stakedGMX as `0x${string}`,
            abi: [parseAbiItem('function depositBalances(address, address) view returns (uint256)')],
            functionName: 'depositBalances',
            args: [address as `0x${string}`, config.esGMX as `0x${string}`]
        }) as bigint;

        const esAmount = Number(esGMXBalance) / 1e18;
        debugErrors.push(`GMX: esGMX=${esAmount}`);

        if (esAmount > 0.01) {
            const value = esAmount * gmxPrice; // esGMX valued same as GMX
            totalValue += value;
            tokens.push({ symbol: 'esGMX', amount: esAmount.toFixed(4), value });
        }

        if (totalValue > 0) {
            positions.push({
                id: `gmx-${chainId}`,
                protocol: 'GMX',
                chain: chainId === 'arbitrum' ? 'Arbitrum' : 'Avalanche',
                tokens,
                totalValue,
                apy: 0
            });
        }
    } catch (error) {
        debugErrors.push(`GMX ERROR: ${error instanceof Error ? error.message : String(error)}`);
    }
    return positions;
}

// 30. Convex CVX Staking (expand existing)
async function scanConvexCVX(address: string, chainId: string, debugErrors: string[]): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = [];
    const cvxLocker = chainId === 'mainnet' ? '0xD18140b4B819b895A3dba5442F959fA44994AF50' : null;
    if (!cvxLocker) return positions;

    try {
        const client = getClient(chainId);
        const locked = await client.readContract({
            address: cvxLocker as `0x${string}`,
            abi: [parseAbiItem('function lockedBalanceOf(address) view returns (uint256)')],
            functionName: 'lockedBalanceOf',
            args: [address as `0x${string}`]
        }) as bigint;

        const amount = Number(locked) / 1e18;
        debugErrors.push(`CONVEX-CVX: locked=${amount}`);

        if (amount > 0.01) {
            const { getTokenPrice } = await import('./price-oracle');
            const cvxPrice = await getTokenPrice('cvx');
            const value = amount * cvxPrice;
            debugErrors.push(`CONVEX-CVX: ${amount} CVX * $${cvxPrice} = $${value}`);

            positions.push({
                id: `convex-cvx-${chainId}`,
                protocol: 'Convex Finance',
                chain: 'Ethereum',
                tokens: [{ symbol: 'vlCVX', amount: amount.toFixed(4), value }],
                totalValue: value,
                apy: 0
            });
        }
    } catch (error) {
        debugErrors.push(`CONVEX-CVX ERROR: ${error instanceof Error ? error.message : String(error)}`);
    }
    return positions;
}
// Hyperlend (Arbitrum) - Aave V3 fork
async function scanHyperlend(address: string, chainId: string, debugErrors: string[]): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = [];
    const pool = chainId === 'hyperliquid' ? '0x00A89d7a5A02160f20150EbEA7a2b5E4879A1A8b' : null;
    if (!pool) return positions;

    try {
        const client = getClient(chainId);

        // Hyperlend uses Aave V3 style - get user account data
        const accountData = await client.readContract({
            address: pool as `0x${string}`,
            abi: [parseAbiItem('function getUserAccountData(address) view returns (uint256,uint256,uint256,uint256,uint256,uint256)')],
            functionName: 'getUserAccountData',
            args: [address as `0x${string}`]
        }) as [bigint, bigint, bigint, bigint, bigint, bigint];

        // [0] = total collateral in base currency
        // [1] = total debt in base currency  
        // [2] = available borrow in base currency
        // [3] = current liquidation threshold
        // [4] = ltv
        // [5] = health factor

        const totalCollateralUSD = Number(accountData[0]) / 1e8; // Usually 8 decimals for USD
        const totalDebtUSD = Number(accountData[1]) / 1e8;

        debugErrors.push(`HYPERLEND: collateral=$${totalCollateralUSD}, debt=$${totalDebtUSD}`);

        if (totalCollateralUSD > 1) {
            positions.push({
                id: `hyperlend-${chainId}`,
                protocol: 'Hyperlend',
                chain: 'Arbitrum',
                tokens: [
                    { symbol: 'Supplied', amount: totalCollateralUSD.toFixed(2), value: totalCollateralUSD },
                    ...(totalDebtUSD > 0 ? [{ symbol: 'Borrowed', amount: totalDebtUSD.toFixed(2), value: -totalDebtUSD }] : [])
                ],
                totalValue: totalCollateralUSD - totalDebtUSD,
                apy: 0
            });
        }
    } catch (error) {
        debugErrors.push(`HYPERLEND ERROR: ${error instanceof Error ? error.message : String(error)}`);
    }
    return positions;
}

// Kinetiq (Hyperliquid - kHYPE, vkHYPE liquid staking)
async function scanKinetix(address: string, chainId: string, debugErrors: string[]): Promise<DeFiPosition[]> {
    const positions: DeFiPosition[] = [];
    if (chainId !== 'hyperliquid') return positions;

    const kHYPE = '0xfd739d4e423301ce9385c1fb8850539d657c296d';
    const vkHYPE = '0x9ba2edc44e0a4632eb4723e81d4142353e1bb160'; // vkHYPE token

    try {
        const client = getClient(chainId);
        const { getTokenPrice } = await import('./price-oracle');
        const hypePrice = await getTokenPrice('hype');
        let totalValue = 0;
        const tokens: any[] = [];

        // Check kHYPE balance
        try {
            const kHypeBalance = await client.readContract({
                address: kHYPE as `0x${string}`,
                abi: [parseAbiItem('function balanceOf(address) view returns (uint256)')],
                functionName: 'balanceOf',
                args: [address as `0x${string}`]
            }) as bigint;

            const kHypeAmount = Number(kHypeBalance) / 1e18;
            debugErrors.push(`KINETIQ: kHYPE balance=${kHypeAmount}`);

            if (kHypeAmount > 0.01) {
                const value = kHypeAmount * hypePrice;
                debugErrors.push(`KINETIQ: ${kHypeAmount} kHYPE * $${hypePrice} = $${value}`);
                totalValue += value;
                tokens.push({ symbol: 'kHYPE', amount: kHypeAmount.toFixed(4), value });
            }
        } catch (e) {
            debugErrors.push(`KINETIQ kHYPE: ${e instanceof Error ? e.message : String(e)}`);
        }

        // Check vkHYPE balance
        try {
            const vkHypeBalance = await client.readContract({
                address: vkHYPE as `0x${string}`,
                abi: [parseAbiItem('function balanceOf(address) view returns (uint256)')],
                functionName: 'balanceOf',
                args: [address as `0x${string}`]
            }) as bigint;

            const vkHypeAmount = Number(vkHypeBalance) / 1e18;
            debugErrors.push(`KINETIQ: vkHYPE balance=${vkHypeAmount}`);

            if (vkHypeAmount > 0.01) {
                const value = vkHypeAmount * hypePrice;
                debugErrors.push(`KINETIQ: ${vkHypeAmount} vkHYPE * $${hypePrice} = $${value}`);
                totalValue += value;
                tokens.push({ symbol: 'vkHYPE', amount: vkHypeAmount.toFixed(4), value });
            }
        } catch (e) {
            debugErrors.push(`KINETIQ vkHYPE: ${e instanceof Error ? e.message : String(e)}`);
        }

        if (totalValue > 0) {
            positions.push({
                id: `kinetiq-${chainId}`,
                protocol: 'Kinetiq',
                chain: 'Hyperliquid',
                tokens,
                totalValue,
                apy: 0
            });
        }
    } catch (error) {
        debugErrors.push(`KINETIQ ERROR: ${error instanceof Error ? error.message : String(error)}`);
    }
    return positions;
}



