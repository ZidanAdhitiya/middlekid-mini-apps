# GoodKid Agent Deployment Guide

This directory contains the Python backend for the GoodKid AI customer support agent.

## Files

- `good_kid_agent.py` - Agent definition with Google ADK configuration
- `goodkid_server.py` - Flask server that exposes the agent via HTTP API
- `requirements.txt` - Python dependencies
- `Dockerfile` - Container configuration for deployment

## Local Development

1. Install dependencies:
```bash
cd python-agent
pip install -r requirements.txt
```

2. Set environment variables:
```bash
export ALLOWED_ORIGINS="http://localhost:3000"
export PORT=8080
```

3. Run the server:
```bash
python goodkid_server.py
```

4. Test the endpoint:
```bash
curl -X POST http://localhost:8080/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Halo, apa itu Middlekid?"}'
```

## Deployment to Google Cloud Run

1. Make sure you have Google Cloud SDK installed and authenticated:
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

2. Build and deploy:
```bash
cd python-agent
gcloud run deploy goodkid-agent \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-env-vars ALLOWED_ORIGINS=https://your-app.vercel.app
```

3. Copy the service URL that's returned (e.g., `https://goodkid-agent-xxxxx.run.app`)

4. Add the URL to your Next.js environment variables:
```bash
# In Vercel dashboard or .env.local
GOODKID_AGENT_URL=https://goodkid-agent-xxxxx.run.app/chat
```

## Environment Variables

### Python Agent (Cloud Run)
- `PORT` - Server port (default: 8080, set automatically by Cloud Run)
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins (e.g., `https://your-app.vercel.app,https://your-app.com`)

### Next.js App (Vercel)
- `GOODKID_AGENT_URL` - Full URL to the chat endpoint (e.g., `https://goodkid-agent-xxxxx.run.app/chat`)

## API Endpoints

### POST /chat
Processes user messages and returns agent responses.

**Request:**
```json
{
  "message": "User message here",
  "conversationHistory": [
    {"role": "user", "content": "previous message"},
    {"role": "assistant", "content": "previous response"}
  ]
}
```

**Response:**
```json
{
  "response": "Agent response here"
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "GoodKid Agent",
  "version": "1.0.0"
}
```

## Security Notes

1. **CORS**: Update `ALLOWED_ORIGINS` to only include your production domain
2. **Authentication**: Consider adding API key authentication for production
3. **Rate Limiting**: Add rate limiting to prevent abuse
4. **Monitoring**: Set up Cloud Run monitoring and alerts

## Troubleshooting

**Error: "ModuleNotFoundError: No module named 'google.adk'"**
- Make sure google-adk is installed: `pip install google-adk`
- Check if the package name has changed in newer versions

**Error: "CORS policy blocked"**
- Verify `ALLOWED_ORIGINS` includes your Next.js app URL
- Check that the URL includes the protocol (https://)

**Error: "Agent execution failed"**
- Check Cloud Run logs: `gcloud run logs read goodkid-agent --region=asia-southeast1`
- Verify the agent's `.run()` method signature matches the Google ADK version

## Cost Optimization

1. Set minimum instances to 0 to reduce costs when idle
2. Set maximum instances to limit scaling
3. Configure CPU allocation to "CPU only allocated during request processing"

```bash
gcloud run services update goodkid-agent \
  --min-instances=0 \
  --max-instances=10 \
  --cpu-throttling \
  --region=asia-southeast1
```
