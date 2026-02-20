# Quick Start: Run Your App

## 🚀 5-Minute Setup

### Step 1: Setup Supabase Credentials
```bash
cd Alumni-Connect-DEP-/client
```

Create `.env` file with:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_key_here
```

**Where to find these?**
- Go to Supabase Dashboard
- Settings → API
- Copy Project URL and anon key

### Step 2: Start Frontend
```bash
cd client
npm install --legacy-peer-deps
npm run dev
```

✅ Opens at: http://localhost:5173/

### Step 3: Start Backend (Optional)
In another terminal:
```bash
cd server
npm install
node server.js
```

✅ Backend runs at: http://localhost:5000/

---

## 📝 Key Files to Know

| File | What It Does |
|------|--------------|
| `client/src/pages/Register.jsx` | Sign up form → saves to Supabase |
| `client/src/pages/Login.jsx` | Sign in form → Supabase auth |
| `client/src/lib/supabaseClient.js` | Connects to Supabase |
| `client/.env` | Your Supabase secrets |
| `server/server.js` | Backend API server |

---

## ✅ Test Registration

1. Open http://localhost:5173/
2. Click "Register"
3. Fill in all fields:
   - Full Name
   - Email
   - Password (6+ chars)
   - Graduation Year
   - Branch
   - Company
   - LinkedIn URL
   - Role
4. Click "Sign Up"
5. Check in **Supabase Dashboard → profiles table** to see all fields populated ✓

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| "No routes matched" | Browser cache - try incognito mode |
| Supabase auth error | Check .env file has correct credentials |
| Port 5173 in use | `npm run dev -- --port 3000` |
| NULL values in DB | Use new Register.jsx (INSERT method) ✓ |
| Server not starting | Check Node.js installed: `node --version` |

---

## 📍 Where to See Your Data

### In Supabase Dashboard:
1. Go to https://supabase.com
2. Select your project
3. **Database** → **Tables** → **profiles**
4. See all registered users with complete info

### Via SQL:
**SQL Editor** in Supabase:
```sql
SELECT * FROM profiles ORDER BY created_at DESC;
```

---

## 🎯 That's It!

Your app is ready. Start at the frontend and use Supabase directly for data. For more details, read `docs/BACKEND_SETUP.md`.
