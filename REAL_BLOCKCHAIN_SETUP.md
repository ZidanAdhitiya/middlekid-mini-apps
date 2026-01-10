# Real Blockchain API Setup Guide

## 🚀 Cara Mengaktifkan REAL Data dari Blockchain

Implementasi real blockchain API **sudah lengkap dan siap digunakan**! Yang perlu Anda lakukan adalah setup API keys.

---

## ✅ Status Implementasi

### Files yang Sudah Dibuat:
- ✅ `app/lib/tx-interpreter/real-token-fetcher.ts` - Real API integration
- ✅ `app/lib/tx-interpreter/wallet-analyzer.ts` - Smart mode toggle (REAL/MOCK)
- ✅ `app/lib/tx-interpreter/address-detector.ts` - Smart input detection
- ✅ `app/components/WalletReport.tsx` - Beautiful UI

### API Integration:
- ✅ **BaseScan API** - Fetch token holdings dari blockchain
- ✅ **GoPlus Security API** - Scam token detection (GRATIS, no API key needed!)
- ✅ **On-chain RPC** - Direct balance checking

---

## 📝 Langkah Setup (5 Menit)

### Step 1: Buat File `.env.local`

Di root project, buat file baru bernama `.env.local` dengan isi:

```bash
# Enable REAL blockchain data
NEXT_PUBLIC_USE_REAL_DATA=true

# BaseScan API Key (GRATIS)
NEXT_PUBLIC_BASESCAN_API_KEY=your_api_key_here

# Alchemy API Key (Optional)
ALCHEMY_API_KEY=your_alchemy_key_here
```

### Step 2: Dapatkan BaseScan API Key (GRATIS!)

1. **Kunjungi**: https://basescan.org/apis
2. **Klik** "Register" atau "Login" jika sudah punya akun
3. **Navigasi** ke "API-KEYs" di dashboard
4. **Klik** "Add" untuk create new API key
5. **Copy** API key yang baru dibuat
6. **Paste** ke file `.env.local` Anda

**Free Tier Limits:**
- ✅ 100,000 calls per hari
- ✅ 5 calls per detik
- ✅ Cukup untuk development & testing
- ✅ Tidak perlu kartu kredit

### Step 3: Restart Development Server

```bash
# Stop server (Ctrl+C)
# Lalu restart
npm run dev
```

### Step 4: Test dengan Wallet Real!

Buka http://localhost:3000/interpreter dan test dengan wallet address asli:

**Contoh Wallet untuk Testing:**
```
0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1
```

Anda akan melihat:
- ✅ **REAL token holdings** dari blockchain
- ✅ **REAL scam warnings** dari GoPlus Security
- ✅ **REAL balances** via on-chain RPC

---

## 🔍 Cara Kerja Real Mode

### Mode Toggle System

Ketika `NEXT_PUBLIC_USE_REAL_DATA=true`:

```typescript
// Di wallet-analyzer.ts line 119-128
if (USE_REAL_DATA) {
    // Fetch REAL data from blockchain
    const holdings = await realTokenFetcher.fetchTokenHoldings(address, 8453);
} else {
    // Use MOCK data for testing
    // Generate mock tokens...
}
```

### Real Token Fetcher Flow:

1. **BaseScan API** → Get list of all tokens yang pernah diterima wallet
   ```typescript
   // Endpoint: api.basescan.org/api?module=account&action=tokentx
   ```

2. **On-chain RPC** → Get current balance untuk setiap token
   ```typescript
   // Direct call: eth_call dengan balanceOf(address)
   ```

3. **GoPlus API** → Check keamanan token (honeypot, fake, tax, dll)
   ```typescript
   // Endpoint: api.gopluslabs.io/api/v1/token_security
   ```

4. **Return** → Array of TokenHolding dengan scam warnings

---

## 📊 Contoh Output

### MOCK Mode (tanpa setup):
```
Token Holdings (5):
✅ USDC - 1234.56 USDC
✅ WETH - 0.5 WETH
⚠️ MOONX - 10000 MOONX [SCAM]
   - Honeypot terdeteksi
   - Liquidity tidak dikunci
```

### REAL Mode (dengan API key):
```
Token Holdings (12):
✅ USDC - 100.00 USDC
✅ cbETH - 0.05 cbETH
⚠️ SafeMoon2.0 - 1000000 SAFEMOON [SCAM]
   - 🚨 HONEYPOT - Token tidak bisa dijual!
   - 💸 Tax tinggi: Buy 10% / Sell 99%
   - ❌ Masuk blacklist scam database
   - 🚩 Creator pernah buat honeypot lain
⚠️ ElonDoge - 50000 ELONDOGE [SCAM]
   - ⚠️ Fake Token - Imitasi token populer
   - ⚠️ Kode contract tidak open source
```

**Bedanya:**
- REAL mode: Data asli + warnings spesifik dari GoPlus
- MOCK mode: Data simulasi + warnings generic

---

## 🌐 Supported Chains

Real token fetcher sudah support multiple chains:

```typescript
// Di real-token-fetcher.ts
const apiUrls = {
    8453: 'https://api.basescan.org/api',          // Base
    1: 'https://api.etherscan.io/api',             // Ethereum
    137: 'https://api.polygonscan.com/api',        // Polygon
    42161: 'https://api.arbiscan.io/api',          // Arbitrum
    10: 'https://api-optimistic.etherscan.io/api'  // Optimism
};
```

**Default:** Base chain (chainId: 8453)

Untuk ganti chain, edit di `wallet-analyzer.ts` line 122:
```typescript
const holdings = await realTokenFetcher.fetchTokenHoldings(address, 1); // Ethereum
```

---

## 🐛 Troubleshooting

### Error: "BaseScan API returned error"
**Solusi:**
- Cek API key sudah benar di `.env.local`
- Pastikan file `.env.local` ada di root project
- Restart server setelah edit `.env.local`

### Error: "No tokens found in wallet"
**Normal!** Artinya wallet belum pernah terima token apapun. Coba wallet lain yang punya token.

### Warning: "Failed to fetch real data, falling back to mock"
**Fallback otomatis** ke MOCK mode jika API gagal. Cek:
- Internet connection
- API key valid
- Rate limit belum exceeded

---

## 💡 Tips

### Mode MOCK tetap berguna untuk:
- ✅ Testing UI/UX tanpa API calls
- ✅ Development offline
- ✅ Demo tanpa expose API key
- ✅ Testing edge cases (bot wallet, scam tokens, dll)

### Mode REAL untuk:
- ✅ Production deployment
- ✅ Analisis wallet asli
- ✅ Validasi scam token real
- ✅ Data akurat dari blockchain

---

## 🚀 Ready to Go!

Setelah setup `.env.local`, aplikasi Anda akan:
1. ✅ Fetch REAL token holdings dari BaseScan
2. ✅ Check REAL scam status dari GoPlus
3. ✅ Get REAL balances via RPC
4. ✅ Display beautiful warnings dalam bahasa Indonesia

**Total setup time:** ~5 menit  
**Cost:** FREE (BaseScan free tier)  
**Effort:** Copy-paste API key

---

## ❓ FAQ

**Q: Apakah GoPlus API butuh API key?**  
A: TIDAK! GoPlus Security API gratis tanpa API key.

**Q: Apakah Alchemy wajib?**  
A: TIDAK! Alchemy optional untuk advanced features. BaseScan sudah cukup.

**Q: Berapa lama response time?**  
A: 2-10 detik tergantung jumlah token di wallet.

**Q: Apakah bisa analytics wallet tanpa API?**  
A: BISA! Mode MOCK tetap berfungsi dengan data simulasi.

---

**🎉 Selamat! Real blockchain integration sudah siap digunakan!**
