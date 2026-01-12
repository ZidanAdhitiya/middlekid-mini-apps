'use server';

import { regretCalculator } from '../lib/tx-interpreter/regret-calculator';
import { profileAchievementSystem } from '../lib/tx-interpreter/profile-achievement-system';
import { getTranslation, interpolate, Language } from '../locales';

export async function analyzeWalletAction(address: string, lang: string) {
    try {
        console.log(`🚀 Server Action: Analyzing wallet ${address}`);

        // Construct simplified t function for server-side usage
        const t = (key: string, values?: Record<string, string | number>): string => {
            // Default to 'id' if invalid lang provided
            const validLang = (lang === 'en' || lang === 'id') ? lang : 'id';
            const translation = getTranslation(validLang as Language, key);
            return values ? interpolate(translation, values) : translation;
        };

        // Fetch BOTH regret analysis AND achievements in parallel
        // Use 3650 days (10 years) for full history
        // Scan Base (8453), Ethereum (1), Optimism (10), Arbitrum (42161), Polygon (137)
        // Pass 8453 as primary, but RegretCalculator logic (modified) handles multi-chain scan
        // Wait, RegretCalculator still takes single chainId? 
        // I modified RegretCalculator inside analyzeWalletRegrets to use an internal list [8453, 1].
        // I should UPDATE RegretCalculator to accept list OR update the internal list there.
        // My previous edit to RegretCalculator (Step 605) HARDCODED [8453, 1] inside the method.
        // So passing 8453 here doesn't matter much effectively for the multi-chain part, 
        // BUT I must update RegretCalculator to include the new chains.
        // I cannot do it here in analyze-wallet.ts if logic is hardcoded in RegretCalculator.ts.

        // I will first fix RegretCalculator.ts to include the new chains.
        // Then I will leave this call as is (primary chain 8453).

        const [regrets, achievements] = await Promise.all([
            regretCalculator.analyzeWalletRegrets(address, 8453, 3650),
            profileAchievementSystem.analyzePersonalWallet(address, t)
        ]);

        return { regrets, achievements };
    } catch (error) {
        console.error('❌ Server Action Error:', error);
        throw new Error('Analysis failed handled by server action');
    }
}
