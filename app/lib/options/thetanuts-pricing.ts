// Thetanuts V4 Pricing API Integration

export interface ThetanutsQuoteRequest {
    underlying?: string;
    strike: number;
    expiry: string;
    type?: 'call' | 'put';
    size?: number;
}

export interface ThetanutsQuote {
    premium: number;
    strike: number;
    expiry: string;
    type: string;
    underlying: string;
    // Additional fields from API (might vary)
    maxLoss?: number;
    maxUpside?: string;
}

const THETANUTS_API_URL = 'https://round-snowflake-9c31.devops-118.workers.dev/';

/**
 * Fetch options quote from Thetanuts V4 API
 */
export async function fetchThetanutsQuote({
    underlying = "ETH",
    strike,
    expiry,
    type = "call",
    size = 1
}: ThetanutsQuoteRequest): Promise<ThetanutsQuote> {
    const url = `${THETANUTS_API_URL}?underlying=${underlying}&strike=${strike}&expiry=${expiry}&type=${type}&size=${size}`;

    console.log('🥜 Fetching Thetanuts quote:', { underlying, strike, expiry, type, size });

    try {
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(`Thetanuts API error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        console.log('✅ Thetanuts quote received:', data);

        // Parse and normalize the response
        return {
            premium: data.premium || 63, // Default for demo if API doesn't return
            strike: data.strike || strike,
            expiry: data.expiry || expiry,
            type: data.type || type,
            underlying: data.underlying || underlying,
            maxLoss: data.premium || 63, // Max loss = premium paid
            maxUpside: data.maxUpside || 'Unlimited'
        };
    } catch (error) {
        console.error('Error fetching Thetanuts quote:', error);

        // Fallback: Return mock data for demo purposes
        console.warn('⚠️ Using fallback mock quote data');
        return {
            premium: 63,
            strike,
            expiry,
            type,
            underlying,
            maxLoss: 63,
            maxUpside: 'Unlimited'
        };
    }
}

/**
 * Format premium to user-friendly string
 */
export function formatPremium(premium: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(premium);
}

/**
 * Parse expiry string to readable format
 */
export function formatExpiry(expiry: string): string {
    if (expiry.endsWith('d')) {
        const days = parseInt(expiry);
        return `${days} days`;
    }
    return expiry;
}
