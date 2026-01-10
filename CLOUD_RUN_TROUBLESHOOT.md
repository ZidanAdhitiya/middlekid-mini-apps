# Troubleshooting: Cloud Run Tidak Update Kode

## Masalah

Kode sudah di-push ke GitHub tapi Cloud Run masih running kode lama.

Error: `Runner.run_async() got an unexpected keyword argument 'prompt'`  
Padahal kode terbaru sudah pakai `new_message`.

## Penyebab

1. **Rebuild belum dilakukan**
2. **Auto-deploy belum trigger**
3. **Cache issue di Cloud Run**

## Solusi

### Option 1: Force Rebuild (RECOMMENDED)

1. **Di Google Cloud Console**, buka service `goodkid-agent`

2. **Hapus semua revisions lama**:
   - Tab "Revisions"
   - Delete semua revision yang 0% traffic
   
3. **Deploy revision baru**:
   - Klik "EDIT & DEPLOY NEW REVISION"
   - **IMPORTANT**: Di "Source Code" section:
     - Klik "SELECT" di repository
     - **Force re-select branch `main`**
     - Ini akan force pull latest code
   - Scroll ke bawah
   - Klik "DEPLOY"

4. **Tunggu sampai status "READY"** (2-5 menit)
   - Jangan test sebelum status READY!

5. **Verify deployment**:
   ```bash
   curl -s https://goodkid-agent-672365495987.asia-southeast2.run.app/health
   ```

6. **Test chat**:
   - Buka app
   - Send message
   - Harusnya working!

### Option 2: Delete & Recreate Service

Kalau Option 1 masih tidak work:

1. **Delete service** `goodkid-agent` completely
2. **Create NEW service** dari scratch:
   - Deploy from repository
   - Select repo dan branch `main`
   - Region: `asia-southeast2` 
   - Allow unauthenticated
   - Add env var: `ALLOWED_ORIGINS=*`
3. **Copy NEW URL** yang keluar
4. **Update `.env.local`** dengan URL baru
5. Test!

### Option 3: Deploy Via gcloud CLI

Kalau punya gcloud installed:

```bash
cd /home/adit/Documents/base/middlekid-mini-apps

gcloud run deploy goodkid-agent \
  --source . \
  --region asia-southeast2 \
  --allow-unauthenticated \
  --set-env-vars ALLOWED_ORIGINS=*
```

## Cara Verify Kode Sudah Update

Test debug endpoint:

```bash
curl https://goodkid-agent-672365495987.asia-southeast2.run.app/debug
```

Harusnya return info tentang agent methods.

**ATAU** test chat endpoint dengan cara ini:

```bash
curl -X POST https://goodkid-agent-672365495987.asia-southeast2.run.app/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Halo"}'
```

### Kalau masih error `'prompt'`:
→ Kode belum update, coba Option 1 atau 2

### Kalau error baru (bukan tentang 'prompt'):
→ Kode sudah update! Share error barunya

### Kalau dapat respons JSON dengan text:
→ **SUCCESS!** 🎉

## Notes

- Cloud Run kadang cache build
- Force rebuild dengan re-select repository biasanya fix ini
- Pastikan tunggu status READY sebelum test
