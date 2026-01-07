# Environment Variables Template for Real Blockchain Integration

Copy this template and create your own `.env.local` file:

```bash
# ==================================================
# REAL BLOCKCHAIN API CONFIGURATION
# ==================================================

# Enable REAL data fetching from blockchain
NEXT_PUBLIC_USE_REAL_DATA=true

# BaseScan API Key (GRATIS - 100k calls/day)
# Daftar di: https://basescan.org/apis
NEXT_PUBLIC_BASESCAN_API_KEY=YourBaseScanApiKeyHere

# Alchemy API Key (Optional)
# Daftar di: https://www.alchemy.com/
ALCHEMY_API_KEY=YourAlchemyApiKeyHere
```

## Cara Menggunakan:

1. Copy isi kode di atas
2. Buat file baru bernama `.env.local` di root project
3. Paste dan ganti `YourBaseScanApiKeyHere` dengan API key Anda
4. Restart development server (`npm run dev`)
