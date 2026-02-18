# 🚀 DEPLOYMENT GUIDE

## ✅ YOU'VE COMPLETED:
- [x] Created Supabase database
- [x] Created tables (students, payments)
- [x] Disabled RLS
- [x] Got Supabase URL and Key

## 📤 STEP 1: Push to GitHub

### If starting fresh:
```bash
cd tuition-fee-manager
git init
git add .
git commit -m "Clean setup with Supabase backend"
git branch -M main
git remote add origin https://github.com/aakashsen704/tuition-fee-manager.git
git push -f origin main
```

### If repo exists:
```bash
cd tuition-fee-manager
git add .
git commit -m "Clean setup with Supabase backend"
git push
```

## 🌐 STEP 2: Delete Old Vercel Project

1. Go to https://vercel.com/dashboard
2. Find your old **tuition-fee-manager** project
3. Click it → Settings → Delete Project
4. Type the name and confirm

## 🆕 STEP 3: Deploy Fresh on Vercel

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import **tuition-fee-manager** from GitHub
4. **Framework Preset:** Other
5. **Root Directory:** `./`
6. **Build Command:** Leave default or `npm run build`
7. **Output Directory:** Leave default
8. Click **"Deploy"** (DON'T add env vars yet)

## 🔑 STEP 4: Add Environment Variables

After deploy starts:

1. Go to your project → **Settings** → **Environment Variables**
2. Add these TWO:

**Variable 1:**
- Name: `SUPABASE_URL`
- Value: `https://xxxxx.supabase.co` (YOUR Supabase URL)
- Environments: ✅ All

**Variable 2:**
- Name: `SUPABASE_KEY`
- Value: `eyJ...` (YOUR anon public key)
- Environments: ✅ All

3. Click **"Save"**

## ♻️ STEP 5: Redeploy

1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. UNCHECK "Use existing Build Cache"
5. Click **"Redeploy"**

## ⏱️ Wait 2-3 minutes

## ✅ STEP 6: Test

1. Open your Vercel URL
2. Go to **Students** page
3. Click **"+ Add Student"**
4. Fill in details and save
5. Check Supabase → Table Editor → students table
6. Student should appear! ✅

## 🎉 DONE!

Your app is now live with permanent Supabase database!

---

## 🆘 If Something Goes Wrong:

1. Check Vercel Logs (Deployments → Click deployment → Function Logs)
2. Check Browser Console (F12 → Console tab)
3. Verify environment variables are set correctly
4. Make sure RLS is disabled in Supabase

---

**Your app URL:** https://tuition-fee-manager-xxxxx.vercel.app
