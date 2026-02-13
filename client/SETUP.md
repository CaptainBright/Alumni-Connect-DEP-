# Setup Guide - Alumni Connect Client

## 🎯 Quick Start

### 1. Install Dependencies
```bash
cd client
npm install --legacy-peer-deps
```

### 2. Configure Supabase

Create a `.env` file in the client directory:

```bash
cp .env.example .env
```

Then edit `.env` and add your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Get your credentials from:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings → API**
4. Copy the **Project URL** and **anon public key**

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📁 Project Structure

```
client/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── api/            # API calls
│   ├── lib/            # Utilities (Supabase client, etc.)
│   ├── styles/         # Global styles
│   ├── App.jsx         # Main router
│   └── main.jsx        # Entry point
├── .env.example        # Template for environment variables
├── package.json        # Dependencies
└── index.html          # HTML entry point
```

## 🔐 Security Notes

- **Never commit `.env` file** - it contains sensitive credentials
- The `.gitignore` already excludes `.env` files
- Always keep API keys private
- In production, use environment variables from your hosting platform

## 🛠️ Features

- ✅ Supabase Authentication (Login/Register)
- ✅ Alumni Directory 
- ✅ Job Board
- ✅ Donation Platform (in ₹ Indian Rupees)
- ✅ Resources & Library
- ✅ Community Network

## 📱 Responsive Design

The app is fully responsive and tested on:
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

## 🐛 Troubleshooting

### "No routes matched location /register"
✅ **FIXED** - Register route has been added to App.jsx

### Supabase 400 Error
**Solution:** Make sure your `.env` file has the correct credentials:
- Check VITE_SUPABASE_URL is correct
- Check VITE_SUPABASE_ANON_KEY is valid
- Restart the dev server: `npm run dev`

### Dependencies Errors
Use legacy peer deps:
```bash
npm install --legacy-peer-deps
```

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

## 🚀 Deployment

See main repository README for deployment instructions to production environments.
