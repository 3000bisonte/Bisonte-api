# ⚠️ CRITICAL SECURITY FIXES REQUIRED

## 1. SENSITIVE DATA EXPOSURE (.env.local)

**PROBLEM:** Production secrets are visible in .env.local which could be committed to git.

**IMMEDIATE FIXES:**

### Move to Production Environment Variables:
```bash
# Move these to Vercel Environment Variables (server-only):
DATABASE_URL=postgresql://neondb_owner:npg_J8aQD0kGEOmj@...
JWT_SECRET=311b9fbfc67a40088dd2ac0308b9dffe62a7ed8f180a470e82f8eeebff206e8d
GOOGLE_CLIENT_SECRET=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
RESEND_API_KEY=re_NBSjtKUm_GAaD9y6DVBZe2HAnXsQomxnU
```

### Create .env.example (safe template):
```bash
# Copy of .env.local but with placeholder values
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_ADMOB_APP_ID=ca-app-pub-YOUR_PUBLISHER_ID~YOUR_APP_ID
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
JWT_SECRET=your_32_char_hex_secret_here
```

## 2. ENVIRONMENT CONFUSION

**PROBLEM:** `NEXT_PUBLIC_ENVIRONMENT=development` but app is being built for production APK.

**FIX:**
```bash
# In production .env:
NEXT_PUBLIC_ENVIRONMENT=production
NODE_ENV=production
```

## 3. ANDROID KEYSTORE SECURITY

**PROBLEM:** Hardcoded fallback passwords in build.gradle

**FIX:**
```gradle
// In android/app/build.gradle, replace:
storePassword project.hasProperty('MY_STORE_PASSWORD') ? MY_STORE_PASSWORD : 'bisonte123'

// With secure-only approach:
storePassword project.hasProperty('MY_STORE_PASSWORD') ? MY_STORE_PASSWORD : System.getenv('STORE_PASSWORD')
```
