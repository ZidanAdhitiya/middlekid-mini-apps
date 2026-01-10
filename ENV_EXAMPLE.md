## Example Environment Variables for Real Token Scam Detection

# Copy this content to a new file named `.env.local` and fill in your API keys

# =====================
# REAL DATA MODE
# =====================
# Set to 'true' to fetch real token holdings and scam detection
# Set to 'false' or remove to use mock data (for testing UI)
NEXT_PUBLIC_USE_REAL_DATA=true

# =====================
# API KEYS
# =====================

# BaseScan API Key (REQUIRED for real data)
# Get free key from: https://basescan.org/apis
# Free tier: 100,000 calls/day
NEXT_PUBLIC_BASESCAN_API_KEY=YourBaseScanAPIKeyHere

# Optional: Other Explorer API Keys (if using other chains)
# NEXT_PUBLIC_ETHERSCAN_API_KEY=YourEtherscanAPIKeyHere
# NEXT_PUBLIC_POLYGONSCAN_API_KEY=YourPolygonscanAPIKeyHere

# Note: GoPlus Security API does not require an API key!
# It's free and open for basic token security checks

# =====================
# ALCHEMY (Optional - already exists in project)
# =====================
# ALCHEMY_API_KEY=YourAlchemyAPIKeyHere
