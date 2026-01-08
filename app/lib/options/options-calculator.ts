// Options Calculator - P&L Calculation Engine
// Simplified options payoff calculations for CALL options

export interface PayoffPoint {
    price: number;        // Spot price at this point
    profit: number;       // P&L at this price
    isBreakeven?: boolean;
    isCurrent?: boolean;
}

export interface OptionsParameters {
    currentPrice: number;
    strikePrice: number;
    premium: number;
    daysToExpiry: number;
    contracts: number;
}

/**
 * Calculate CALL option payoff at expiration
 * Formula: max(Spot - Strike, 0) - Premium
 */
export function calculateCallPayoff(
    spotPrice: number,
    strikePrice: number,
    premium: number,
    contracts: number = 1
): number {
    const intrinsicValue = Math.max(spotPrice - strikePrice, 0);
    const payoff = (intrinsicValue - premium) * contracts;
    return payoff;
}

/**
 * Calculate breakeven price for CALL option
 * Formula: Strike + Premium
 */
export function calculateBreakeven(
    strikePrice: number,
    premium: number
): number {
    return strikePrice + premium;
}

/**
 * Generate payoff curve data for charting
 * Returns array of {price, profit} points
 */
export function generatePayoffCurve(
    params: OptionsParameters,
    priceRange?: { min: number; max: number }
): PayoffPoint[] {
    const { currentPrice, strikePrice, premium, contracts } = params;

    // Default range: -50% to +100% of current price
    const minPrice = priceRange?.min || currentPrice * 0.5;
    const maxPrice = priceRange?.max || currentPrice * 2;

    // Generate 50 points for smooth curve
    const numPoints = 50;
    const step = (maxPrice - minPrice) / numPoints;

    const curve: PayoffPoint[] = [];
    const breakevenPrice = calculateBreakeven(strikePrice, premium);

    for (let i = 0; i <= numPoints; i++) {
        const price = minPrice + (step * i);
        const profit = calculateCallPayoff(price, strikePrice, premium, contracts);

        curve.push({
            price,
            profit,
            isBreakeven: Math.abs(price - breakevenPrice) < step,
            isCurrent: Math.abs(price - currentPrice) < step
        });
    }

    return curve;
}

/**
 * Calculate max profit (theoretical unlimited for CALL)
 */
export function calculateMaxProfit(
    targetPrice: number,
    strikePrice: number,
    premium: number,
    contracts: number = 1
): number {
    return calculateCallPayoff(targetPrice, strikePrice, premium, contracts);
}

/**
 * Calculate max loss (premium paid)
 */
export function calculateMaxLoss(premium: number, contracts: number = 1): number {
    return premium * contracts;
}

/**
 * Estimate premium based on moneyness and time
 * Simplified model - in production would use Black-Scholes or API
 */
export function estimatePremium(
    currentPrice: number,
    strikePrice: number,
    daysToExpiry: number
): number {
    const moneyness = strikePrice / currentPrice;
    const timeValue = Math.sqrt(daysToExpiry / 365) * 0.3; // Simplified IV

    // ATM premium roughly 3-5% of spot
    const atmPremium = currentPrice * 0.04;

    // Adjust for moneyness
    let premium = atmPremium;

    if (moneyness > 1) {
        // OTM - cheaper
        premium *= (1 - (moneyness - 1) * 0.5);
    } else if (moneyness < 1) {
        // ITM - more expensive
        premium *= (1 + (1 - moneyness) * 0.8);
    }

    // Adjust for time
    premium *= (0.5 + timeValue);

    return Math.max(premium, currentPrice * 0.01); // Min 1% of spot
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return sign + new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

/**
 * Format price for display
 */
export function formatPrice(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(value);
}
