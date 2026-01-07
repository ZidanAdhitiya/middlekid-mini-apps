# Setup Real API untuk Token Scam Detection

## Quick Start

Untuk mengakitifkan deteksi token scam REAL (bukan mock data):

### 1. Buat file `.env.local` di root project:

```bash
# Enable Real Data Mode
NEXT_PUBLIC_USE_REAL_DATA=true

# BaseScan API Key (untuk fetch token holdings)
# Get free key dari: https://basescan.org/apis
NEXT_PUBLIC_BASESCAN_API_KEY=YOUR_API_KEY_HERE
```

### 2. Get API Keys (GRATIS):

#### BaseScan API (Required)
1. Kunjungi https://basescan.org/apis
2. Login/Register
3. Klik "Add" untuk create API key
4. Copy API key ke `.env.local`

**Note:** Free tier gives 100,000 calls/day (more than enough!)

#### GoPlus Security API (No Key Needed!)
- GoPlus API tidak butuh API key untuk basic usage
- Akan auto-check token scam saat scan holdings

### 3. Restart Development Server:

```bash
# Stop server (Ctrl+C)
# Start again
npm run dev
```

### 4. Test dengan Wallet Address Real:

Masukkan address wallet asli, misalnya:
```
0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1
```

Aplikasi akan:
- ✅ Fetch semua token holdings dari BaseScan
- ✅ Check setiap token via GoPlus Security API
- ✅ Tampilkan token scam REAL dengan warnings spesifik

---

## Cara Kerja

### Mode MOCK (Default - tanpa env var):
```
USER input address
  ↓
Generate random tokens (USDC, PEPE, MOONX, dll)
  ↓
Random scam detection (30% chance)
  ↓
Show results
```

### Mode REAL (with NEXT_PUBLIC_USE_REAL_DATA=true):
```
USER input address
  ↓
Call BaseScan API → Get all token transfers
  ↓
Extract unique tokens
  ↓
For each token:
   - Call RPC → Get current balance
   - Call GoPlus API → Check security
  ↓
Show REAL results with actual scam warnings
```

---

## Contoh Output Real vs Mock

### MOCK Mode:
```
Token Holdings (8):
✅ USDC - 1234.56 USDC
✅ WETH - 0.5 WETH
⚠️ MOONX - 10000 MOONX (SCAM - Honeypot terdeteksi)
```

### REAL Mode:
```
Token Holdings (15):
✅ USDC - 100.00 USDC
✅ cbETH - 0.05 cbETH
⚠️ SafeMoon2.0 - 1000000 SAFEMOON (SCAM)
    - 🚨 HONEYPOT - Token tidak bisa dijual!
    - 💸 Tax tinggi: Buy 10% / Sell 99%
    - ❌ Masuk blacklist scam database
```

---

## FAQ

**Q: Apakah API gratis?**
A: Ya! BaseScan free tier sangat generous (100k calls/day). GoPlus juga gratis.

**Q: Berapa lama proses scanning?**
A: Tergantung jumlah token di wallet:
- 1-5 tokens: ~2-3 detik
- 10-20 tokens: ~5-8 detik
- 50+ tokens: ~15-20 detik

**Q: Apa yang terjadi jika API down?**
A: Auto fallback ke MOCK data dengan warning di console.

**Q: Bisa check chain lain selain Base?**
A: Ya! Edit `chainId` parameter di `wallet-analyzer.ts` line 122:
```typescript
const holdings = await realTokenFetcher.fetchTokenHoldings(address, 1); // 1 = Ethereum
```

Supported chains:
- Base: 8453
- Ethereum: 1
- Polygon: 137
- Arbitrum: 42161
- Optimism: 10

---

## Troubleshooting

### Error: "Failed to fetch token holdings"
- Check API key valid
- Check internet connection
- Verify wallet address format (0x...)

### Show only few tokens (wallet has many)
- Some tokens might have 0 balance (filtered out)
- Check console for skipped tokens

### All tokens showing as "safe" despite being scam
- GoPlus might not have data for new/obscure tokens
- Try another well-known scam token for testing

---

**Sekarang Anda bisa deteksi token scam REAL!** 🎉
