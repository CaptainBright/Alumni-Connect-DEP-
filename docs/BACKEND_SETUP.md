# Backend Setup Documentation

## Overview
This document covers the Supabase database setup, the NULL value issue resolution, and complete server running instructions.

---

## Part 1: Supabase Database Schema

### Profiles Table
The `profiles` table stores user information after registration. Here's the complete schema:

| Column | Type | Description | Nullable |
|--------|------|-------------|----------|
| `id` | UUID | Primary key, auto-generated | NO |
| `email` | TEXT | User's email (from auth) | NO |
| `full_name` | TEXT | User's full name | NO |
| `graduation_year` | INTEGER | Year user graduated | NO |
| `branch` | TEXT | Engineering branch/field of study | NO |
| `company` | TEXT | Current company/organization | NO |
| `linkedin` | TEXT | LinkedIn profile URL | NO |
| `role` | TEXT | Current job role/position | NO |
| `created_at` | TIMESTAMP | Account creation timestamp | NO |

### Auth Users Table (Built-in)
Supabase automatically manages an `auth.users` table:

| Column | Description |
|--------|-------------|
| `id` | User UUID (links to profiles.id) |
| `email` | Email address |
| `encrypted_password` | Hashed password |
| `created_at` | Registration timestamp |

---

## Part 2: Understanding the NULL Issue

### ❌ What Was Wrong (Before Fix)
When users registered, the `profiles` table showed NULL values like this:
```
id: abc-123
full_name: John Doe
graduation_year: 2020
branch: NULL
company: NULL
linkedin: NULL
role: NULL
```

### Why Did This Happen?
The original code used **UPSERT** (INSERT OR UPDATE):
```javascript
// ❌ OLD CODE (caused NULL values)
const { error } = await supabase
  .from('profiles')
  .upsert({
    id: user.id,
    email: user.email,
    full_name: fullName
  })
```

**Problem**: UPSERT only updates fields you explicitly provide. Fields like `branch`, `company`, etc. were left as NULL in the database.

### ✅ What We Fixed (Current Solution)
Now we use **INSERT** with ALL fields explicitly mapped:
```javascript
// ✅ NEW CODE (before INSERT, all fields are validated)
const { error } = await supabase
  .from('profiles')
  .insert([{
    id: user.id,
    email: user.email,
    full_name: fullName,
    graduation_year: parseInt(graduationYear),
    branch: branch,
    company: company,
    linkedin: linkedIn,
    role: role,
    created_at: new Date()
  }])
```

### Key Differences:
| Aspect | UPSERT | INSERT |
|--------|--------|--------|
| **Behavior** | Create or update row | Create new row only |
| **Missing Fields** | Left as NULL | Must provide all required fields |
| **When to Use** | Updating existing profiles | Creating new profiles |
| **Validation** | Happens at runtime | Can validate before submitting |

---

## Part 3: Registration Flow (Step-by-Step)

### 1. User Submits Register Form
**File**: `client/src/pages/Register.jsx`

Form inputs collected:
- Full Name (`fullName`)
- Email (`email`)
- Password (`password`)
- Graduation Year (`graduationYear`)
- Branch (`branch`)
- Company (`company`)
- LinkedIn URL (`linkedIn`)
- Role (`role`)
- Terms Agreement (`agreedToTerms`)

### 2. Client-Side Validation
Before sending to Supabase:
```javascript
if (!fullName) throw new Error("Name required")
if (!email) throw new Error("Email required")
if (password.length < 6) throw new Error("Password min 6 chars")
if (!graduationYear) throw new Error("Graduation year required")
if (!branch) throw new Error("Branch required")
if (!company) throw new Error("Company required")
if (!linkedIn) throw new Error("LinkedIn required")
if (!role) throw new Error("Role required")
if (!agreedToTerms) throw new Error("Must agree to terms")
```

### 3. Authentication
Supabase creates an auth user:
```javascript
const { data: { user }, error: authError } = 
  await supabase.auth.signUp({
    email: email,
    password: password
  })
// Returns: user.id (UUID)
```

### 4. Profile Creation
Insert into `profiles` table with all fields:
```javascript
const { error: profileError } = 
  await supabase.from('profiles').insert([{
    id: user.id,              // Links to auth.users
    email: user.email,
    full_name: fullName,       // Captured from form
    graduation_year: parseInt(graduationYear),
    branch: branch,
    company: company,
    linkedin: linkedIn,
    role: role,
    created_at: new Date()
  }])
```

### 5. Redirect to Dashboard
On success:
```javascript
navigate('/dashboard')
// User is now logged in and profile is complete
```

---

## Part 4: Viewing Data in Supabase Dashboard

### Step 1: Log into Supabase
1. Go to https://supabase.com/
2. Sign in with your credentials
3. Select your project

### Step 2: Navigate to Database
1. In left sidebar, click **"Database"**
2. Click **"Tables"**

### Step 3: View Users
#### View Authentication Users:
1. In left sidebar, click **"Authentication"**
2. Click **"Users"**
3. See all registered users with email, status, etc.

#### View Profile Data:
1. In Database → Tables, click **"profiles"**
2. See all user profiles with complete information:
   - full_name ✓
   - graduation_year ✓
   - branch ✓
   - company ✓
   - linkedin ✓
   - role ✓
   - created_at ✓

### Step 4: Run SQL Queries
Click **"SQL Editor"** to run custom queries:

```sql
-- See all profiles with complete data
SELECT * FROM profiles ORDER BY created_at DESC;

-- Count users in system
SELECT COUNT(*) as total_users FROM auth.users;

-- See users by graduation year
SELECT graduation_year, COUNT(*) 
FROM profiles 
GROUP BY graduation_year;

-- See users by branch
SELECT branch, COUNT(*) 
FROM profiles 
GROUP BY branch;
```

---

## Part 5: Supabase Environment Setup

### Step 1: Create .env File
In `client/` folder, create `.env`:

```bash
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Step 2: Find Your Credentials
1. Go to Supabase Dashboard
2. Click **Settings** (bottom left)
3. Click **API**
4. Copy:
   - **Project URL** → paste in `VITE_SUPABASE_URL`
   - **anon key** → paste in `VITE_SUPABASE_ANON_KEY`

Example:
```bash
VITE_SUPABASE_URL=https://abc123def456.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Restart Dev Server
After updating .env:
```bash
# Kill the current dev server (Ctrl+C)
# Then restart:
npm run dev
```

⚠️ **Important**: Environment variables are loaded when the dev server starts. You must restart the server after modifying .env.

---

## Part 6: Running the Backend Server

### Prerequisites
- Node.js 16+ installed
- npm 7+ installed
- Supabase project created
- .env file configured (see Part 5)

### Option A: Run Frontend Dev Server

```bash
cd client

# Install dependencies (first time only)
npm install --legacy-peer-deps

# Start development server
npm run dev
```

Expected output:
```
  VITE v4.5.0  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

✅ Open http://localhost:5173/ in browser

### Option B: Run Backend Node Server

```bash
cd server

# Install dependencies (first time only)
npm install

# Start backend server
node server.js
```

Expected output:
```
Server running on port 5000
Connected to database successfully
```

✅ Backend runs at http://localhost:5000/

### Option C: Run Both Simultaneously

Terminal 1:
```bash
cd client
npm run dev
```

Terminal 2:
```bash
cd server
npm install
node server.js
```

### Troubleshooting

#### Issue: "Missing Supabase credentials"
**Solution**: Create `.env` in `client/` folder with correct values

#### Issue: "CORS error" when making API calls
**Solution**: Backend CORS is configured in `server/app.js`
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
```

#### Issue: "Port 5173 already in use"
**Solution**: Kill the process or use different port:
```bash
npm run dev -- --port 3000
```

#### Issue: "ENOENT: no such file or directory, open '.env'"
**Solution**: Create `.env` file with Supabase credentials

---

## Part 7: Project Structure Overview

### Client (Frontend)
```
client/
├── src/
│   ├── pages/
│   │   ├── Register.jsx      ← Registration form (INSERT to profiles)
│   │   ├── Login.jsx         ← Authentication (signInWithPassword)
│   │   ├── Home.jsx          ← Landing page
│   │   └── Donation.jsx      ← Donation page with campaigns
│   ├── context/
│   │   └── AuthContext.jsx   ← Global auth state
│   ├── lib/
│   │   └── supabaseClient.js ← Supabase initialization
│   └── App.jsx               ← Router configuration
├── .env                       ← Environment secrets
├── index.html                 ← Entry point
└── package.json
```

### Server (Backend)
```
server/
├── src/
│   ├── app.js                 ← Express configuration
│   ├── config/
│   │   ├── db.js              ← Database connection
│   │   └── multer.js          ← File upload config
│   ├── controllers/           ← Business logic
│   ├── routes/                ← API endpoints
│   ├── middleware/            ← Auth, error handling
│   └── models/                ← Database queries
├── server.js                  ← Server entry point
└── package.json
```

---

## Part 8: API Integration (Frontend to Backend)

### Current Flow: Direct Supabase (No Backend)
```
Register.jsx
    ↓
supabaseClient.signUp()     ← Direct to Supabase Auth
    ↓
supabaseClient.profiles.insert()  ← Direct to Supabase DB
```

### Future Flow: With Backend Server
```
Register.jsx
    ↓
POST /api/auth/register     ← Node backend
    ↓
Backend queries Supabase
    ↓
Response to frontend
```

**Implementation**: Update `client/src/api/authApi.js` to point to `http://localhost:5000/api/...`

---

## Summary

| Task | Location | Status |
|------|----------|--------|
| View registration data | Supabase Dashboard → profiles table | ✅ Ready |
| Understand NULL fix | Above Part 2 | ✅ Done |
| Run frontend | `cd client && npm run dev` | ✅ Ready |
| Run backend | `cd server && node server.js` | ✅ Ready |
| Configure .env | `client/.env` | ⚠️ Manual |

🎉 **You're all set!** Start with Part 5 (setup .env) and Part 6 (run the servers).
