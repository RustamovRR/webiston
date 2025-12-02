# 🚀 Quick Deploy Guide

## Cloudflare Pages (Recommended)

### 1. Setup (One-time)

```bash
# Install dependencies
pnpm add -D @cloudflare/next-on-pages wrangler
```

### 2. Deploy via Dashboard

1. Go to: https://dash.cloudflare.com/
2. Click **"Workers & Pages"** → **"Create application"** → **"Pages"**
3. Connect GitHub → Select **"webiston"** repo
4. Configure:
   ```
   Framework: Next.js
   Build command: pnpm run pages:build
   Build output: .vercel/output/static
   Node version: 20
   ```
5. Click **"Save and Deploy"**

### 3. Auto Deploy

```bash
# Just push to GitHub!
git add .
git commit -m "feat: new feature"
git push origin main

# Cloudflare auto-deploys ✅
```

---

## Netlify (Alternative)

### 1. Create netlify.toml

```toml
[build]
  command = "pnpm build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "20"
```

### 2. Deploy

1. Go to: https://app.netlify.com/
2. Click **"Add new site"** → **"Import from Git"**
3. Select **"webiston"** repo
4. Click **"Deploy"**

---

## Vercel (Current)

```bash
# Already configured!
git push origin main
```

---

## 🎯 Recommendation

**Use Cloudflare Pages:**
- ✅ Unlimited bandwidth
- ✅ Private repos FREE
- ✅ Fastest CDN
- ✅ $0/month forever

See `CLOUDFLARE_SETUP.md` for detailed guide.
