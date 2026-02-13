# 🔧 Fix Registration - Step by Step

## Issue: 429 Error + No Data in Supabase

You're getting **429 Too Many Requests** because:
1. signup endpoint is being rate-limited
2. You might have tried registering multiple times quickly
3. Duplicate RLS policies might be conflicting

---

## ✅ Step 1: Fix Supabase RLS Policies

### Action 1.1: Delete Duplicate INSERT Policy
1. Go to https://supabase.com → Select your project
2. **Database** → **Tables** → **profiles** → **RLS**
3. Find the policy named: `"Users can insert their own profile"` (duplicate)
4. Click the **3-dot menu** → **Delete**
5. Confirm deletion

**Keep only this INSERT policy**: `insert_own_profile`

### Action 1.2: Verify Final Policy List
After deletion, you should have **exactly these 4 policies**:
- ✅ `allow_viewing_alumni_profiles_only` (SELECT)
- ✅ `insert_own_profile` (INSERT) 
- ✅ `update_own_profile` (UPDATE)
- ✅ `delete_own_profile` (DELETE)

---

## ✅ Step 2: Wait for Rate Limit Reset

**If you got 429 error, you must wait** before trying again:
- ⏱️ **Wait at least 60-90 seconds**
- 📧 **Use a completely different email** (e.g., change the number: `+1` → `+2`)

### Example:
❌ Failed with: `john.test+1@gmail.com`
✅ Try with: `john.test+2@gmail.com`

Or use a different service:
- `yourname+feb13a@gmail.com` (first attempt)
- `yourname+feb13b@gmail.com` (second attempt after wait)

---

## ✅ Step 3: Clear Browser Cache

```
Ctrl + Shift + Delete
→ Select "All time"
→ Check "Cookies and other site data"
→ Click "Clear data"
→ Close browser completely
→ Reopen localhost:5173
```

---

## ✅ Step 4: Fresh Registration Test

1. Open http://localhost:5173/register
2. Fill the form with **NEW email**:
   ```
   Full Name: John Doe
   Email: your.email+date@gmail.com  ← Use new email!
   Password: Password123
   Graduation Year: 2020
   Branch: Computer Science
   Company: Tech Company
   LinkedIn: https://linkedin.com/in/yourprofile
   Role: Software Engineer
   ✅ Check "I agree to terms"
   ```

3. **Watch the browser console** (F12 → Console)
   - Should see: `Starting registration for: your.email...`
   - Should see: `User created successfully with ID: xxx`
   - Should see: `Session available: true`
   - Should see: `Profile inserted successfully`

4. **Click "Sign Up"**

### Expected Result:
```
✅ SUCCESS popup appears
✅ Redirects to /login page
✅ Supabase shows new profile in database
```

---

## ✅ Step 5: Verify in Supabase

1. Go to https://supabase.com
2. Select your project
3. **Database** → **Tables** → **profiles**
4. Click the **Refresh** icon (↻)
5. Look for your new entry with:
   - ✅ full_name: John Doe
   - ✅ graduation_year: 2020
   - ✅ branch: Computer Science
   - ✅ company: Tech Company
   - ✅ linkedin: https://linkedin.com/in/yourprofile
   - ✅ role: Software Engineer
   - ✅ created_at: (current timestamp)

**❌ NO NULL VALUES = SUCCESS**

---

## 🔍 Troubleshooting

### Still Getting 429?
- ❌ Trying same email too quickly
- ✅ Solution: Use different email, wait 2 minutes, try again
- ✅ Alternative: Check Rate Limits in Supabase:
  - **Settings** → **Rate Limits** → Increase auth limit if needed

### Profile Not Showing in Supabase?
- ❌ RLS policies are too strict
- ✅ Solution: Verify you deleted the duplicate INSERT policy
- ✅ Check console error message carefully (copy it)

### Getting RLS Error?
Example: `"new row violates row-level security policy"`
- ❌ The `insert_own_profile` policy isn't recognizing the authenticated user
- ✅ Solution:
  1. Ensure you're signed up AND signed in properly
  2. Check policy: `with check (auth.uid() = id)` is correct
  3. Clear browser cache and try fresh browser window (incognito mode)

---

## 📋 Checklist

Before registering again, confirm:
- [ ] Deleted duplicate INSERT policy from Supabase
- [ ] Waited 60 seconds (if you got 429 before)
- [ ] Cleared browser cache
- [ ] Using completely new email
- [ ] Browser console open (F12) to see debug logs
- [ ] Dev server is running on localhost:5173

---

## 🚀 Commands to Remember

**Start Frontend Dev Server:**
```bash
cd Alumni-Connect-DEP-/client
npm run dev
```

**View Console Logs:**
- Press **F12** in browser
- Go to **Console** tab
- Look for messages starting with `Starting registration...`

**Debug SQL Query in Supabase:**
```sql
SELECT * FROM profiles ORDER BY created_at DESC LIMIT 5;
```

---

## If Still Stuck

1. Copy **ALL console output** when registering (F12 → Console → right-click → Save as)
2. Share that with me
3. Also share: what email you used, exact error message
4. I'll help debug further
