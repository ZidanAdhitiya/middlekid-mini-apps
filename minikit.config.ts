const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: ""
  },
  miniapp: {
    version: "1",
    name: "MiddleKid",
    subtitle: "Base Chain Portfolio Tracker",
    description: "Track your Base chain portfolio - tokens, NFTs, staking, LP positions, and more",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/blue-icon.png`,
    splashImageUrl: `${ROOT_URL}/blue-hero.png`,
    splashBackgroundColor: "#0f0f23",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "finance",
    tags: ["portfolio", "defi", "base", "analytics", "tracker"],
    heroImageUrl: `${ROOT_URL}/blue-hero.png`,
    tagline: "Your Base Chain Portfolio at a Glance",
    ogTitle: "MiddleKid - Base Chain Portfolio Tracker",
    ogDescription: "Track your Base chain portfolio - tokens, NFTs, staking, LP positions, and more",
    ogImageUrl: `${ROOT_URL}/blue-hero.png`,
  },
} as const;

