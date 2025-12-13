# Cloudflare Worker Deployment Guide

## Step 1: Create Cloudflare Account (FREE)
1. Go to https://dash.cloudflare.com/sign-up
2. Sign up with email (no credit card needed)

## Step 2: Create Worker
1. Go to **Workers & Pages** in left sidebar
2. Click **Create Application**
3. Click **Create Worker**
4. Name it: `sakinah-ai-proxy`
5. Click **Deploy**

## Step 3: Add Your Code
1. Click **Edit Code**
2. Replace everything with content from `worker.js`
3. Click **Save and Deploy**

## Step 4: Add Your API Key (Secret)
1. Go to **Settings** tab
2. Click **Variables** (or **Environment Variables**)
3. Click **Add Variable**
4. Name: `GROQ_API_KEY`
5. Value: `your_actual_groq_api_key_here`
6. Check **Encrypt** (makes it a secret)
7. Click **Save**

## Step 5: Get Your Worker URL
After deployment, you'll get a URL like:
```
https://sakinah-ai-proxy.YOUR_USERNAME.workers.dev
```

Copy this URL - you'll need it for the extension!

## Step 6: Update Extension
Replace the Groq API URL in your extension with your worker URL.

## Rate Limiting (Optional but Recommended)
To enable rate limiting:
1. Go to **Settings** > **Bindings**
2. Add **KV Namespace** binding
3. Name: `RATE_LIMIT`
4. Create new namespace: `sakinah-rate-limit`
5. Click **Save**

This limits users to 10 requests/minute per IP.

## Free Tier Limits
- ✅ 100,000 requests/day
- ✅ No credit card required
- ✅ Global edge network (fast everywhere)
- ✅ Built-in DDoS protection

## Testing Your Worker
```bash
curl -X POST https://YOUR-WORKER-URL.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"model":"llama-3.3-70b-versatile","messages":[{"role":"user","content":"Test"}]}'
```

## Troubleshooting
- **CORS errors**: Make sure worker.js has CORS headers (already included)
- **401 Unauthorized**: Check your GROQ_API_KEY is set correctly
- **Rate limit**: Add KV namespace binding as described above
