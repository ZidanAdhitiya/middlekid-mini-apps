# Diagnostic: Check if Cloud Run Updated

Jalankan command ini untuk verify apakah Cloud Run sudah update ke code terbaru:

```bash
# Test health endpoint
curl -s https://goodkid-agent-672365495987.asia-southeast2.run.app/health

# Test debug endpoint - ini akan show available methods
curl -s https://goodkid-agent-672365495987.asia-southeast2.run.app/debug

# Test chat endpoint dan lihat exact error
curl -X POST https://goodkid-agent-672365495987.asia-southeast2.run.app/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}' \
  -s | python3 -m json.tool
```

## Untuk verifikasi Cloud Run deployment:

1. **Buka Cloud Run Console**: https://console.cloud.google.com/run/detail/asia-southeast2/goodkid-agent

2. **Cek "Revisions" tab**:
   - Lihat timestamp revision yang 100% traffic
   - Apakah timestamp-nya SETELAH Anda klik "Deploy"?

3. **Cek "Logs" tab**:
   - Lihat apakah ada error message saat startup
   - Search for "role" error untuk lihat traceback lengkap

4. **Cek "Source" di revision detail**:
   - Apakah commit hash-nya `44c0fdf`?
   - Kalau bukan, berarti Cloud Run belum pull code terbaru

## Jika masih error 'role':

Error ini kemungkinan berasal dari **agent definition** atau **runner initialization**, bukan dari event processing kita.

Possible causes:
1. `good_kid_agent.py` ada issue dengan agent config
2. Runner initialization error
3. Session service issue

Mari kita add more logging untuk pinpoint exact location of error.
