// Free DeFi Protocol Integrations - Token-Based Detection
// Scans wallet tokens for DeFi indicators (LP, staking, vaults, etc.)

export interface DeFiPosition {
    id: string;
    protocol: string;
    chain: string;
    tokens: Array<{
        symbol: string;
        amount: string;
        value: number;
    }>;
    totalValue: number;
    apy: number;
}

// Detect DeFi positions from token holdings
export async function fetchAllDeFiPositions(address: string, allTokens: any[]): Promise<DeFiPosition[]> {
    console.log('🔍 Scanning tokens for DeFi positions...');
    console.log(`   Address: ${address}`);
    console.log(`   Total tokens: ${allTokens.length}`);

    // DEBUG: Log all token symbols
    console.log('   Token symbols:', allTokens.map(t => `${t.symbol} (${t.balanceFormatted})`).join(', '));

    const positions: DeFiPosition[] = [];

    // DeFi token patterns that indicate positions
    const defiPatterns = {
        // Liquidity Pool tokens
        lp: ['LP', 'SLP', 'UNI-V2', 'UNI-V3', 'CAKE-LP', 'BPT', 'PLP', 'JLP'],
        // Staking tokens  
        staked: ['stETH', 'rETH', 'cbETH', 'wstETH', 'aETH', 'vwETH', 'stS', 'STS'],
        // Vault tokens
        vault: ['yv', 'MOO', 'ib', 'f-'],
        // Aave aTokens
        aave: ['aUSDC', 'aETH', 'aWETH', 'aDAI', 'aUSDT', 'aWBTC'],
        // Compound cTokens
        compound: ['cUSDC', 'cETH', 'cDAI', 'cWBTC'],
        // Protocol specific
        beets: ['fBEETS', 'sBEETS', 'maBEETS'],
        curve: ['3Crv', 'cvx', 'CRV'],
        convex: ['cvx'],
    };

    // Scan each token
    for (const token of allTokens) {
        const symbol = token.symbol?.toUpperCase() || '';
        const name = token.name?.toUpperCase() || '';

        // Skip if balance is zero
        if (!token.balanceFormatted || parseFloat(token.balanceFormatted) === 0) {
            continue;
        }

        let protocolName = 'Unknown DeFi';
        let positionType = 'position';

        // Check for LP tokens
        if (defiPatterns.lp.some(p => symbol.includes(p) || name.includes(p))) {
            protocolName = detectLPProtocol(symbol, name);
            positionType = 'Liquidity Pool';
        }
        // Check for staking tokens
        else if (defiPatterns.staked.some(p => symbol.includes(p) || name.includes(p))) {
            protocolName = detectStakingProtocol(symbol, name);
            positionType = 'Staking';
        }
        // Check for vault tokens
        else if (defiPatterns.vault.some(p => symbol.includes(p) || name.includes(p))) {
            protocolName = detectVaultProtocol(symbol, name);
            positionType = 'Vault';
        }
        // Check for Aave
        else if (defiPatterns.aave.some(p => symbol.includes(p))) {
            protocolName = 'Aave';
            positionType = 'Lending';
        }
        // Check for Compound
        else if (defiPatterns.compound.some(p => symbol.includes(p))) {
            protocolName = 'Compound';
            positionType = 'Lending';
        }
        // Check for Beets
        else if (defiPatterns.beets.some(p => symbol.includes(p))) {
            protocolName = 'Beethoven X';
            positionType = 'Farming';
        }
        // Check for Curve
        else if (defiPatterns.curve.some(p => symbol.includes(p))) {
            protocolName = 'Curve';
            positionType = 'LP';
        }
        else {
            // Not a DeFi token
            continue;
        }

        // Create position
        positions.push({
            id: `${protocolName.toLowerCase().replace(/\s+/g, '-')}-${token.address}`,
            protocol: protocolName,
            chain: getChainName(token.chainId),
            tokens: [{
                symbol: token.symbol,
                amount: token.balanceFormatted,
                value: token.usdValue || 0
            }],
            totalValue: token.usdValue || 0,
            apy: 0
        });
    }

    console.log(`✅ Found ${positions.length} DeFi positions`);
    positions.forEach(p => console.log(`   - ${p.protocol} (${p.chain}): $${p.totalValue.toFixed(2)}`));

    return positions;
}

// Helper: Detect LP protocol from token symbol/name
function detectLPProtocol(symbol: string, name: string): string {
    if (symbol.includes('UNI') || name.includes('UNISWAP')) return 'Uniswap';
    if (symbol.includes('CAKE')) return 'PancakeSwap';
    if (symbol.includes('SLP') || symbol.includes('SUSHI')) return 'SushiSwap';
    if (symbol.includes('BPT') || name.includes('BALANCER')) return 'Balancer';
    if (symbol.includes('PLP')) return 'Platypus';
    if (symbol.includes('JLP')) return 'Joe LP';
    return 'Liquidity Pool';
}

// Helper: Detect staking protocol  
function detectStakingProtocol(symbol: string, name: string): string {
    if (symbol.includes('stETH') || symbol.includes('wstETH')) return 'Lido';
    if (symbol.includes('rETH')) return 'Rocket Pool';
    if (symbol.includes('cbETH')) return 'Coinbase';
    if (symbol.includes('stS')) return 'Sonic';
    return 'Staking';
}

// Helper: Detect vault protocol
function detectVaultProtocol(symbol: string, name: string): string {
    if (symbol.startsWith('yv')) return 'Yearn';
    if (symbol.includes('MOO')) return 'Beefy';
    if (symbol.startsWith('ib')) return 'Iron Bank';
    return 'Vault';
}

// Helper: Get chain name from ID
function getChainName(chainId: any): string {
    const chains: any = {
        '1': 'Ethereum',
        'ethereum': 'Ethereum',
        '8453': 'Base',
        'base': 'Base',
        '10': 'Optimism',
        'optimism': 'Optimism',
        '42161': 'Arbitrum',
        'arbitrum': 'Arbitrum',
        '137': 'Polygon',
        'polygon': 'Polygon',
        '250': 'Fantom',
        'fantom': 'Fantom',
        '43114': 'Avalanche',
        'avalanche': 'Avalanche',
        '56': 'BSC',
        'bsc': 'BSC'
    };
    return chains[chainId?.toString()] || 'Unknown';
}
