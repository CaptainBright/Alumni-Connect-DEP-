# Fixing Registration Issues - Complete Guide

## Issue: 429 Too Many Requests + No Data in Supabase

### Root Causes Identified
1. **429 Rate Limiting** - Supabase auth endpoint is limiting rapid signup requests
2. **RLS Policy Issue** - Profile insert requires `auth.uid() = id` check
3. **Session Timing** - Session might not be established immediately after signup

---

## Solution Applied ✅

### Updated Register.jsx Flow
The code now:
1. Creates user via `supabase.auth.signUp()`
2. **Waits 500ms** for auth system to process
3. **Checks/refreshes session** to ensure auth context exists
4. **Auto-signs in** if needed to establish session
5. **Inserts profile** with authenticated session context

---

## How to Test Now

### Step 1: Wait for Rate Limit Reset
If you just got a 429 error:
- **Wait 60 seconds** before trying again
- Try with a completely new email address

### Step 2: Clear Browser Cache
```
Ctrl + Shift + Delete → Clear everything → Close browser
Reopen localhost:5173
```

### Step 3: Register Again
Fill the form with:
- **Full Name**: Your Name
- **Email**: `newuser.test+20260213@gmail.com` ← Use new email each time
- **Password**: `Password123`
- **Graduation Year**: 2020
- **Branch**: Computer Science
- **Company**: Acme Corp
- **LinkedIn**: https://linkedin.com/in/yourprofile
- **Role**: Software Engineer
- Check "I agree to terms"
- **Click "Sign Up"**

### Step 4: Verify Data in Supabase
1. Go to https://supabase.com
2. Select your project
3. **Database** → **Tables** → **profiles**
4. Look for your new entry with all fields populated (not NULL)

If successful, you'll see:
| id | full_name | graduation_year | branch | company | linkedin | role | created_at |
|----|----|----|----|----|----|----|----|
| abc-123 | Your Name | 2020 | Computer Science | Acme Corp | https://... | Software Engineer | 2026-02-13... |

---

## Troubleshooting

### Still Getting 429?
**Reason**: Supabase auth rate limit (usually 15-60 second cooldown per email)

**Fix**:
- Use a different email: `user.test+123@gmail.com` vs `user.test+124@gmail.com`
- Wait longer between attempts
- Check your Supabase project isn't under attack (rare)

### Data Still Not Showing in Supabase?

**Check 1: Browser Console Errors**
- Open DevTools (F12)
- Go to **Console** tab
- Look for error messages
- Share the exact error with context

**Check 2: Verify RLS Policy**
In Supabase Dashboard:
1. **Database** → **Tables** → **profiles**
2. Click **RLS** button
3. Look for policy named `insert_own_profile`
4. It should show: `with check (auth.uid() = id)`

**Check 3: Verify Profiles Table Structure**
Columns should be:
- `id` (UUID)
- `full_name` (Text)
- `graduation_year` (Integer)
- `branch` (Text)  
- `company` (Text)
- `linkedin` (Text)
- `role` (Text)
- `created_at` (Timestamp)

If any are missing, run in Supabase SQL Editor:
```sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS branch TEXT,
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS linkedin TEXT,
ADD COLUMN IF NOT EXISTS role TEXT;
```

**Check 3: Test SQL Query**
In Supabase Dashboard, go to **SQL Editor** and run:
```sql
SELECT * FROM profiles ORDER BY created_at DESC LIMIT 10;
```

Should show your newly registered users.

---

## Advanced: Why RLS Policies Matter

### What is RLS?
Row Level Security (RLS) is Supabase's way of controlling who can read/write data.

### Your Policy
```sql
create policy "insert_own_profile" on public.profiles 
for insert 
with check (auth.uid() = id);
```

**Translation**: "Only authenticated users can insert a profile, and only if the `id` field matches their own user ID from `auth.users`"

### Why It Matters
- Without RLS: Anyone could insert fake profiles
- With RLS: Only real authenticated users can create profiles for themselves
- Our fix: Ensures the authenticated session exists before insertion

---

## Next Steps

1. **Test Registration** - Try creating a new account
2. **Check Supabase** - Verify data appears without NULL values
3. **If still broken** - Copy the exact console error and share it

**Expected Result**:
```
✅ Registration succeeds
✅ No console errors
✅ Data visible in Supabase within 2-3 seconds
✅ All profile fields populated (no NULL)
✅ Can login with registered email/password
```

---

## Quick CLI Commands

### Check Current Dev Server
```bash
cd client
npm run dev
```

### Rebuild (if needed)
```bash
rm -rf node_modules
npm install --legacy-peer-deps
npm run dev
```

### Kill Port Conflicts
```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force

# Then restart
npm run dev
```
