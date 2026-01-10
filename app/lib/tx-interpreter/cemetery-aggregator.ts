// Scam Token Cemetery Aggregator
// Collects and manages scam token records for the cemetery

import {
    ScamTokenRecord,
    CemeteryStats,
    ScamType
} from './gamification-types';
import { TokenHolding } from './wallet-types';

export class CemeteryAggregator {
    private scamRecords: Map<string, ScamTokenRecord> = new Map();

    /**
     * Register a scam token to the cemetery
     */
    registerScamToken(token: TokenHolding, chainId: number = 8453): void {
        const key = `${chainId}-${token.address.toLowerCase()}`;

        // Don't re-add if already exists
        if (this.scamRecords.has(key)) {
            // Update report count
            const existing = this.scamRecords.get(key)!;
            existing.reportCount = (existing.reportCount || 0) + 1;
            existing.lastReportedAt = new Date();
            return;
        }

        // Classify scam type from warnings
        const scamType = this.classifyScamType(token.warnings);

        const record: ScamTokenRecord = {
            address: token.address,
            name: token.name,
            symbol: token.symbol,
            chainId,
            scamType,
            riskScore: token.riskScore,
            detectedAt: new Date(),
            warnings: token.warnings,
            reportCount: 1,
            lastReportedAt: new Date()
        };

        this.scamRecords.set(key, record);
        console.log(`💀 Added to cemetery: ${token.symbol} (${scamType})`);
    }

    /**
     * Classify scam type based on warnings
     */
    private classifyScamType(warnings: string[]): ScamType {
        const warningText = warnings.join(' ').toLowerCase();

        if (warningText.includes('honeypot')) return 'honeypot';
        if (warningText.includes('rug pull') || warningText.includes('liquidity')) return 'rug_pull';
        if (warningText.includes('fake') || warningText.includes('imitasi')) return 'fake_token';
        if (warningText.includes('tax') || warningText.includes('buy') || warningText.includes('sell')) return 'high_tax';
        if (warningText.includes('blacklist')) return 'blacklisted';

        return 'suspicious';
    }

    /**
     * Get all scam tokens
     */
    getAllScams(): ScamTokenRecord[] {
        return Array.from(this.scamRecords.values());
    }

    /**
     * Get scams filtered by type
     */
    getScamsByType(type: ScamType): ScamTokenRecord[] {
        return this.getAllScams().filter(scam => scam.scamType === type);
    }

    /**
     * Get scams filtered by chain
     */
    getScamsByChain(chainId: number): ScamTokenRecord[] {
        return this.getAllScams().filter(scam => scam.chainId === chainId);
    }

    /**
     * Search scams by name or symbol
     */
    searchScams(query: string): ScamTokenRecord[] {
        const lowerQuery = query.toLowerCase();
        return this.getAllScams().filter(scam =>
            scam.name.toLowerCase().includes(lowerQuery) ||
            scam.symbol.toLowerCase().includes(lowerQuery) ||
            scam.address.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Get cemetery statistics
     */
    getStats(): CemeteryStats {
        const allScams = this.getAllScams();

        // Count by type
        const scamsByType = {
            honeypot: this.getScamsByType('honeypot').length,
            rug_pull: this.getScamsByType('rug_pull').length,
            fake_token: this.getScamsByType('fake_token').length,
            high_tax: this.getScamsByType('high_tax').length,
            blacklisted: this.getScamsByType('blacklisted').length,
            suspicious: this.getScamsByType('suspicious').length,
        };

        // Calculate totals (mock for now, would track real data)
        const totalVictims = allScams.reduce((sum, scam) => sum + (scam.estimatedVictims || 0), 0);
        const totalLoss = allScams.reduce((sum, scam) => sum + (scam.estimatedLoss || 0), 0);

        // Get recent scams (last 10)
        const recentScams = allScams
            .sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime())
            .slice(0, 10);

        // Get top losses (would use real data)
        const topLosses = allScams
            .filter(scam => scam.estimatedLoss && scam.estimatedLoss > 0)
            .sort((a, b) => (b.estimatedLoss || 0) - (a.estimatedLoss || 0))
            .slice(0, 10);

        return {
            totalScams: allScams.length,
            totalLoss,
            totalVictims,
            scamsByType,
            recentScams,
            topLosses
        };
    }

    /**
     * Clear all records (for testing)
     */
    clear(): void {
        this.scamRecords.clear();
    }

    /**
     * Get scam count
     */
    getScamCount(): number {
        return this.scamRecords.size;
    }

    /**
     * Check if token is in cemetery
     */
    isInCemetery(address: string, chainId: number = 8453): boolean {
        const key = `${chainId}-${address.toLowerCase()}`;
        return this.scamRecords.has(key);
    }

    /**
     * Get specific scam record
     */
    getScamRecord(address: string, chainId: number = 8453): ScamTokenRecord | undefined {
        const key = `${chainId}-${address.toLowerCase()}`;
        return this.scamRecords.get(key);
    }

    /**
     * Batch register scam tokens
     */
    registerScamTokens(tokens: TokenHolding[], chainId: number = 8453): void {
        const scamTokens = tokens.filter(t => t.isScam);
        scamTokens.forEach(token => this.registerScamToken(token, chainId));

        if (scamTokens.length > 0) {
            console.log(`💀 Cemetery: Registered ${scamTokens.length} scam tokens`);
        }
    }

    /**
     * Generate mock estimated losses (for demo)
     * In production, this would come from blockchain analysis
     */
    estimateMockLosses(): void {
        this.scamRecords.forEach((record, key) => {
            if (!record.estimatedLoss) {
                // Generate mock loss between $1k - $10M
                record.estimatedLoss = Math.floor(Math.random() * 10000000) + 1000;
                // Generate mock victims between 10 - 10000
                record.estimatedVictims = Math.floor(Math.random() * 9990) + 10;
            }
        });
    }
}

// Singleton instance
export const cemeteryAggregator = new CemeteryAggregator();
