# Quick Setup Guide - AI Customer Support

## TL;DR

1. Deploy Python agent to Cloud Run
2. Add `GOODKID_AGENT_URL` to Vercel
3. Chat button appears automatically

---

## Step 1: Deploy Python Agent

```bash
cd python-agent

gcloud run deploy goodkid-agent \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated
```

Copy the URL (e.g., `https://goodkid-agent-xxxxx.run.app`)

---

## Step 2: Add Environment Variable

### Option A: Vercel (Production)

```bash
vercel env add GOODKID_AGENT_URL production
# Paste: https://goodkid-agent-xxxxx.run.app/chat
```

### Option B: Local Development

Create/update `.env.local`:

```bash
GOODKID_AGENT_URL=https://goodkid-agent-xxxxx.run.app/chat
```

---

## Step 3: Deploy/Run

### Production (Vercel)
```bash
vercel --prod
```

### Local Development
```bash
npm run dev
```

---

## Verify It Works

1. Open your app
2. Look for purple chat button (bottom-right)
3. Click it and send "Halo!"
4. Should get Indonesian response from Kid

---

## Troubleshooting

**Chat button not appearing?**
- Check browser console for errors
- Verify `<ChatWidget />` is in layout.tsx ✅

**"Agent not configured" error?**
- Add `GOODKID_AGENT_URL` to environment
- Restart server/redeploy

**No response from agent?**
- Check Cloud Run logs:
  ```bash
  gcloud run logs read goodkid-agent --limit=50
  ```

---

## Cost Estimate (Google Cloud Run)

- **Free Tier**: 2 million requests/month
- **After Free Tier**: ~$0.40 per 1M requests
- **Likely Cost**: $0-5/month for typical usage

**Optimization Tip:**
```bash
gcloud run services update goodkid-agent --min-instances=0
```

This keeps costs at $0 when idle.
