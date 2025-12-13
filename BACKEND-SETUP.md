# Backend Proxy Setup - Complete Guide

## Why Use a Proxy?
✅ Keep your API key secret (users can't see it)
✅ Control usage with rate limiting
✅ Free hosting on Cloudflare Workers
✅ No credit card required

## Step-by-Step Setup

### 1. Create Cloudflare Account (2 minutes)
1. Go to https://dash.cloudflare.com/sign-up
2. Sign up with email (FREE, no credit card)
3. Verify your email

### 2. Create Worker (3 minutes)
1. Click **Workers & Pages** in sidebar
2. Click **Create Application** → **Create Worker**
3. Name: `sakinah-ai-proxy` (or any name you want)
4. Click **Deploy**

### 3. Add Your Code (2 minutes)
1. Click **Edit Code** button
2. **Delete all the default code** in the editor
3. Copy ALL content from `cloudflare-worker/worker.js`
4. Paste it into the editor
5. Click **Save and Deploy**

### 4. Add Your Groq API Key (2 minutes)
1. Click **Settings** tab (top of page)
2. Scroll to **Environment Variables** section
3. Click **Add Variable**
4. Fill in:
   - **Variable name**: `GROQ_API_KEY`
   - **Value**: Your actual Groq API key (starts with `gsk_...`)
   - **✓ Encrypt** (check this box - very important!)
5. Click **Deploy** or **Save**

### 5. Get Your Worker URL (1 minute)
After deploying, you'll see a URL like:
```
https://sakinah-ai-proxy.YOUR_USERNAME.workers.dev
```

**Copy this URL!** You need it for the next step.

### 6. Update Extension with Your Worker URL (1 minute)
1. Open `config.js` in your extension folder
2. Replace the URL:
```javascript
const CONFIG = { 
    PROXY_URL: 'https://sakinah-ai-proxy.YOUR_USERNAME.workers.dev'
};
```

### 7. Create New ZIP for Chrome Store (1 minute)
```powershell
cd "C:\Users\Ahmed Attafi\Desktop\Projects\Sakinah"
Remove-Item "Sakinah-extension.zip" -Force
$files = Get-ChildItem -Path . -Exclude @('.git', '.gitignore', '.env', '.env.example', 'node_modules', '*.md', '*.bat', 'Sakinah-extension.zip', 'config.js.backup', 'cloudflare-worker') -File
$folders = Get-ChildItem -Path . -Exclude @('.git', 'node_modules', 'cloudflare-worker') -Directory
Compress-Archive -Path ($files + $folders) -DestinationPath "Sakinah-extension.zip" -Force
Write-Output "✅ Ready for Chrome Web Store!"
```

## Testing Your Setup

Test the worker is working:
```bash
curl -X POST https://YOUR-WORKER-URL.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"model":"llama-3.3-70b-versatile","messages":[{"role":"user","content":"Say hello"}],"max_completion_tokens":50}'
```

Should return JSON with AI response.

## Optional: Add Rate Limiting (Recommended)

Limit users to 10 requests/minute:

1. Go to **Settings** → **Bindings**
2. Click **Add** under **KV Namespaces**
3. Variable name: `RATE_LIMIT`
4. Click **Create a new namespace**
5. Namespace name: `sakinah-rate-limit`
6. Click **Add**
7. Click **Deploy**

Now your API is protected from abuse!

## Free Tier Limits
- ✅ 100,000 requests per day
- ✅ Unlimited workers
- ✅ Global CDN (fast worldwide)
- ✅ No credit card required

## Troubleshooting

**"Worker not found"**
- Make sure you deployed the worker

**"500 Internal Server Error"**
- Check your GROQ_API_KEY is set correctly in Environment Variables
- Make sure it starts with `gsk_`

**"CORS error" in extension**
- Worker code already has CORS headers, should work
- If issues persist, check browser console for exact error

**"Rate limit exceeded"**
- This is working as intended! User needs to wait 1 minute
- You can increase the limit in worker.js line 26: change `> 10` to higher number

## Security Notes
✅ API key is encrypted in Cloudflare (only you can see it)
✅ Users can't see your key in extension code
✅ Rate limiting prevents abuse
✅ CORS is configured correctly

## Total Time: ~12 minutes
After this, your extension is ready for Chrome Web Store with secure AI features!
