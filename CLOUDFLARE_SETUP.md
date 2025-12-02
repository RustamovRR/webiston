# 🚀 Cloudflare Pages - Setup Guide

## ✅ Prerequisites

- [x] Cloudflare account (FREE)
- [x] GitHub repository (private OK!)
- [x] Node.js 20+

---

## 📝 STEP 1: Cloudflare Dashboard Setup

### 1.1 - Login to Cloudflare

1. Go to: https://dash.cloudflare.com/
2. Login or Sign up (FREE)
3. Verify email

### 1.2 - Create Pages Project

1. Click **"Workers & Pages"** in sidebar
2. Click **"Create application"**
3. Click **"Pages"** tab
4. Click **"Connect to Git"**

### 1.3 - Connect GitHub

1. Click **"Connect GitHub"**
2. Authorize Cloudflare
3. Select **"webiston"** repository
4. Click **"Begin setup"**

---

## ⚙️ STEP 2: Build Configuration

### 2.1 - Project Settings

```
Project name: webiston
Production branch: main (or master)
```

### 2.2 - Build Settings

```
Framework preset: Next.js
Build command: pnpm run pages:build
Build output directory: .vercel/output/static
Root directory: /
```

### 2.3 - Environment Variables

Click **"Add variable"** for each:

```
NODE_VERSION = 20
NEXT_PUBLIC_SITE_URL = https://webiston.uz
```

*(Add other env vars from your .env file)*

### 2.4 - Advanced Settings

```
Node.js version: 20
Build timeout: 20 minutes (default)
```

---

## 🔧 STEP 3: Local Setup (Already Done!)

### 3.1 - Dependencies Installed ✅

```bash
pnpm add -D @cloudflare/next-on-pages wrangler
```

### 3.2 - Files Created ✅

- `wrangler.toml` - Cloudflare config
- `.node-version` - Node version
- `.gitignore` - Updated

### 3.3 - Add Build Script

Add to `package.json`:

```json
{
  "scripts": {
    "pages:build": "npx @cloudflare/next-on-pages",
    "pages:dev": "npx wrangler pages dev .vercel/output/static --compatibility-date=2024-12-02",
    "pages:deploy": "npm run pages:build && npx wrangler pages deploy .vercel/output/static"
  }
}
```

---

## 🚀 STEP 4: Deploy!

### 4.1 - First Deploy (via Dashboard)

1. Click **"Save and Deploy"** in Cloudflare Dashboard
2. Wait for build (~3-5 minutes)
3. ✅ Done! Your site is live!

### 4.2 - Auto Deploy (Git Push)

```bash
# Make changes
git add .
git commit -m "feat: add new feature"
git push origin main

# Cloudflare automatically:
# 1. Detects push
# 2. Builds project
# 3. Deploys to production
# 4. Updates DNS
```

**Just like Vercel!** ✅

---

## 🔄 STEP 5: Deployment Workflow

### Automatic Deployments

```
┌─────────────┐
│  Git Push   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Cloudflare │ ← Webhook triggered
│   Detects   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Build    │ ← pnpm run pages:build
│  (3-5 min)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Deploy    │ ← Automatic
│  (30 sec)   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    LIVE!    │ ← https://webiston.pages.dev
└─────────────┘
```

### Branch Deployments

```
main branch → Production (webiston.uz)
dev branch  → Preview (dev.webiston.pages.dev)
PR #123     → Preview (pr-123.webiston.pages.dev)
```

---

## 🌐 STEP 6: Custom Domain

### 6.1 - Add Domain

1. Go to **"Custom domains"** tab
2. Click **"Set up a custom domain"**
3. Enter: `webiston.uz`
4. Click **"Continue"**

### 6.2 - DNS Configuration

**Option A: Cloudflare DNS (Recommended)**

If domain already on Cloudflare:
- ✅ Automatic setup!
- Click **"Activate domain"**

**Option B: External DNS**

Add CNAME record:
```
Type: CNAME
Name: @
Value: webiston.pages.dev
```

### 6.3 - SSL Certificate

- ✅ Automatic (FREE)
- ✅ Universal SSL
- ✅ Auto-renewal

---

## 📊 STEP 7: Monitoring & Analytics

### 7.1 - Deployment Logs

1. Go to **"Deployments"** tab
2. Click on any deployment
3. View build logs

### 7.2 - Analytics (FREE)

1. Go to **"Analytics"** tab
2. View:
   - Requests
   - Bandwidth
   - Errors
   - Performance

### 7.3 - Real-time Logs

```bash
# Local development with logs
pnpm run pages:dev
```

---

## 🔧 STEP 8: Environment Variables

### 8.1 - Production Variables

1. Go to **"Settings"** → **"Environment variables"**
2. Click **"Add variable"**
3. Add:

```
NODE_VERSION = 20
NEXT_PUBLIC_SITE_URL = https://webiston.uz
# Add other vars from .env
```

### 8.2 - Preview Variables

Same as production, or different values for testing.

---

## 🚨 STEP 9: Rollback (if needed)

### 9.1 - Instant Rollback

1. Go to **"Deployments"** tab
2. Find previous working deployment
3. Click **"..."** → **"Rollback to this deployment"**
4. ✅ Instant rollback (no rebuild!)

### 9.2 - Retry Failed Build

1. Click failed deployment
2. Click **"Retry deployment"**

---

## 🎯 STEP 10: Advanced Features

### 10.1 - Preview Deployments

Every PR gets automatic preview:
```
PR #123 → https://pr-123.webiston.pages.dev
```

### 10.2 - Build Hooks

Create webhook for external triggers:
1. Go to **"Settings"** → **"Builds & deployments"**
2. Click **"Add build hook"**
3. Use webhook URL to trigger builds

### 10.3 - Access Control

Protect preview deployments:
1. Go to **"Settings"** → **"Access policies"**
2. Add password or JWT authentication

---

## 📈 Performance Optimization

### 10.1 - Edge Caching

Already configured in API routes:
```typescript
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, s-maxage=3600'
  }
})
```

### 10.2 - Image Optimization

Already configured:
```typescript
// next.config.ts
images: {
  unoptimized: true, // Cloudflare handles it
}
```

---

## 🆚 Vercel vs Cloudflare Comparison

| Feature | Vercel | Cloudflare |
|---------|--------|------------|
| **Auto Deploy** | ✅ Yes | ✅ Yes |
| **Preview Deploys** | ✅ Yes | ✅ Yes |
| **Private Repos** | ❌ Paid | ✅ FREE |
| **Bandwidth** | 100GB | ♾️ Unlimited |
| **Build Minutes** | 6000/mo | 500/mo |
| **Rollback** | ✅ Yes | ✅ Yes |
| **Custom Domain** | ✅ Yes | ✅ Yes |
| **SSL** | ✅ FREE | ✅ FREE |
| **Analytics** | ✅ Yes | ✅ Yes |
| **Edge Functions** | ✅ Yes | ✅ Yes |

---

## ✅ Checklist

Before deploying:

- [ ] Dependencies installed (`@cloudflare/next-on-pages`)
- [ ] `wrangler.toml` created
- [ ] `.node-version` created
- [ ] `.gitignore` updated
- [ ] `package.json` scripts added
- [ ] Environment variables ready
- [ ] Custom domain DNS ready (optional)
- [ ] Git repository pushed

---

## 🚀 Quick Deploy Commands

```bash
# 1. Install dependencies (if not done)
pnpm add -D @cloudflare/next-on-pages wrangler

# 2. Test build locally
pnpm run pages:build

# 3. Test locally (optional)
pnpm run pages:dev

# 4. Push to GitHub
git add .
git commit -m "feat: setup Cloudflare Pages"
git push origin main

# 5. Cloudflare auto-deploys! ✅
```

---

## 🆘 Troubleshooting

### Build fails?

1. Check Node version: `NODE_VERSION=20`
2. Check build command: `pnpm run pages:build`
3. Check output directory: `.vercel/output/static`
4. View build logs in dashboard

### Domain not working?

1. Check DNS propagation (24-48 hours)
2. Check CNAME record
3. Check SSL certificate status

### API routes not working?

1. Check `wrangler.toml` config
2. Check API route exports (`export async function GET()`)
3. Check Cloudflare Workers compatibility

---

## 📚 Resources

- **Cloudflare Docs:** https://developers.cloudflare.com/pages/
- **Next.js on Pages:** https://github.com/cloudflare/next-on-pages
- **Wrangler CLI:** https://developers.cloudflare.com/workers/wrangler/
- **Community:** https://discord.cloudflare.com/

---

## 🎉 Success!

Your site is now live on Cloudflare Pages with:

✅ Unlimited bandwidth
✅ Auto deployments
✅ Preview deployments
✅ Custom domain
✅ FREE SSL
✅ Global CDN
✅ Private repo support

**Enjoy!** 🚀
