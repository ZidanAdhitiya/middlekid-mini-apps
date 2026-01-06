# Panduan Deployment Python Agent - 3 Opsi

## ✨ Opsi 1: Google Cloud Console (PALING MUDAH - RECOMMENDED)

**Tidak perlu install apapun!** Deploy langsung dari browser.

### Langkah-langkah:

1. **Buka Google Cloud Run Console**
   - URL: https://console.cloud.google.com/run
   - Login dengan akun Google Anda

2. **Create New Service**
   - Klik "**CREATE SERVICE**"
   - Pilih "**Deploy one revision from an existing container image**" ATAU "**Continuously deploy from a repository**"

3. **Setup Source Code**
   
   **Option A - Via GitHub (Recommended):**
   - Connect repository ini ke Google Cloud
   - Set source directory: `/python-agent`
   - Build type: Dockerfile
   
   **Option B - Upload Manual:**
   - Compress folder `python-agent/` ke ZIP
   - Upload via Cloud Shell

4. **Configuration**
   - **Service name**: `goodkid-agent`
   - **Region**: `asia-southeast1` (Jakarta)
   - **Authentication**: ✅ Allow unauthenticated invocations
   - **Container port**: 8080 (default)
   
5. **Environment Variables**
   - Klik "VARIABLES & SECRETS"
   - Add variable: `ALLOWED_ORIGINS` = `*` (untuk testing)
   - Nanti ganti dengan URL production Anda

6. **Deploy!**
   - Klik "**CREATE**"
   - Tunggu 2-5 menit
   - Copy URL yang muncul (contoh: `https://goodkid-agent-xxxxx-as.a.run.app`)

7. **Update Next.js App**
   ```bash
   # Di terminal lokal
   echo "GOODKID_AGENT_URL=https://goodkid-agent-xxxxx-as.a.run.app/chat" >> .env.local
   ```
   
   Atau di Vercel:
   - Settings → Environment Variables
   - Add: `GOODKID_AGENT_URL` = `https://your-url.run.app/chat`

---

## 🖥️ Opsi 2: Via Command Line (Google Cloud SDK)

**Butuh install SDK terlebih dahulu.**

### Prerequisites:

1. **Install Google Cloud SDK**
   ```bash
   # Linux
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   
   # atau via package manager
   # Ubuntu/Debian
   sudo apt-get install google-cloud-sdk
   
   # macOS
   brew install google-cloud-sdk
   ```

2. **Initialize gcloud**
   ```bash
   gcloud init
   ```
   - Login dengan akun Google (akan buka browser)
   - Pilih atau create GCP project
   - Set default region: `asia-southeast1`

3. **Enable Required APIs**
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   ```

### Deploy Command:

```bash
cd python-agent

gcloud run deploy goodkid-agent \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-env-vars ALLOWED_ORIGINS=*
```

Copy URL yang keluar, lalu update `.env.local`:
```bash
echo "GOODKID_AGENT_URL=<URL-DARI-GCLOUD>/chat" >> ../.env.local
```

---

## 🎮 Opsi 3: Pakai Demo Mode Dulu

**Chat sudah berfungsi!** Mode demo sudah aktif dan bisa dipakai untuk testing.

### Yang Bisa Dilakukan:
- ✅ Chat interface berfungsi normal
- ✅ Respons otomatis dalam bahasa Indonesia
- ✅ Info tentang fitur Middlekid
- ✅ Guide untuk deployment

### Yang TIDAK Bisa (Butuh Full Agent):
- ❌ Analisis risiko token real-time
- ❌ Security audit smart contract
- ❌ Google Search untuk info crypto
- ❌ Fetch URL untuk research

### Cara Test Demo Mode:
1. Buka app (`npm run dev` sudah running)
2. Klik tombol chat ungu di kanan bawah
3. Ketik: "Bagaimana cara pakai Middlekid?"
4. Atau: "Jelaskan DeFi positions"

---

## 💰 Estimasi Biaya Google Cloud Run

- **Free tier**: 2 juta requests/bulan
- **Setelah free tier**: ~$0.40 per 1 juta requests
- **Estimasi untuk app kecil**: $0-5/bulan
- **Idle time**: $0 (jika set min-instances=0)

**Rekomendasi:** Mulai dengan free tier, monitor usage.

---

## ❓ Mana yang Harus Dipilih?

| Kriteria | Opsi 1 (Console) | Opsi 2 (CLI) | Opsi 3 (Demo) |
|----------|------------------|--------------|---------------|
| **Kemudahan** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Waktu setup** | 15 menit | 30 menit | 0 menit ✅ |
| **Perlu install** | ❌ Tidak | ✅ Ya | ❌ Tidak |
| **Fitur lengkap** | ✅ Ya | ✅ Ya | ❌ Terbatas |
| **Gratis** | ✅ (free tier) | ✅ (free tier) | ✅ Gratis |

**Rekomendasi:**
- **Untuk testing**: Gunakan **Opsi 3** (demo mode) dulu ✅
- **Untuk production**: Deploy dengan **Opsi 1** (termudah)
- **Untuk developer**: **Opsi 2** jika sudah familiar dengan gcloud

---

## 🆘 Troubleshooting

**Error: "Permission denied"**
- Pastikan sudah login ke Google Cloud
- Cek project ID sudah benar
- Enable billing account (gratis untuk free tier)

**Error: "Service not found"**
- Cek region sudah benar (`asia-southeast1`)
- Tunggu beberapa menit setelah deploy

**Chat masih error setelah deploy**
- Pastikan URL di `.env.local` include `/chat` di akhir
- Restart dev server: Ctrl+C lalu `npm run dev`
- Cek Cloud Run logs untuk error
