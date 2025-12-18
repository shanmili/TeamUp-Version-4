# 🚀 TeamUp Backend Setup - Complete Guide

## Step-by-Step Instructions

### STEP 1: Create Supabase Account & Project

1. **Go to Supabase**
   - Visit: https://app.supabase.com
   - Click "Start your project"
   - Sign up with GitHub, Google, or Email

2. **Create New Project**
   - Click "New Project"
   - Choose your organization (or create one)
   - Fill in project details:
     - **Name**: TeamUp
     - **Database Password**: Create a strong password (SAVE THIS!)
     - **Region**: Choose closest to your location
     - **Pricing Plan**: Free (perfect for development)
   - Click "Create new project"
   - Wait 2-3 minutes for setup

3. **Get Your API Keys**
   - After project is created, go to **Settings** (gear icon in sidebar)
   - Click **API** in the settings menu
   - You'll see:
     - **Project URL**: `https://xxxxxxxxx.supabase.co`
     - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
     - **service_role**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **COPY THESE - You'll need them soon!**

---

### STEP 2: Set Up Database

1. **Open SQL Editor**
   - In Supabase dashboard, click **SQL Editor** in sidebar
   - Click **New query** button

2. **Run Database Schema**
   - Open the file: `TeamUpV3 backend/database/schema.sql`
   - Copy ALL the content
   - Paste into the SQL Editor
   - Click **RUN** (or press Ctrl/Cmd + Enter)
   - Wait for "Success. No rows returned"

3. **Verify Tables Created**
   - Click **Table Editor** in sidebar
   - You should see 5 tables:
     - ✅ profiles
     - ✅ teams
     - ✅ team_members
     - ✅ notifications
     - ✅ join_requests

---

### STEP 3: Configure Backend Server

1. **Install Node.js Dependencies**
   ```bash
   cd "TeamUpV3 backend"
   npm install
   ```

2. **Create Environment File**
   - Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

3. **Edit .env File**
   - Open `.env` in your code editor
   - Replace the placeholders with your Supabase credentials:
   ```env
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   PORT=3000
   NODE_ENV=development
   ```

4. **Start the Server**
   ```bash
   npm run dev
   ```
   
   You should see:
   ```
   🚀 TeamUp Backend server is running on port 3000
   📊 Health check: http://localhost:3000/health
   ```

5. **Test the Server**
   - Open browser: http://localhost:3000/health
   - You should see: `{"status":"OK","message":"TeamUp Backend is running"}`

---

### STEP 4: Configure Frontend

1. **Install Supabase Client in Frontend**
   ```bash
   cd "../TeamUpV3 frontend"
   npm install @supabase/supabase-js
   ```

2. **Update Supabase Config**
   - Open: `TeamUpV3 frontend/lib/supabase.js`
   - Replace these lines:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```
   
   With your actual credentials:
   ```javascript
   const SUPABASE_URL = 'https://xxxxx.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
   ```

---

### STEP 5: Test Everything

1. **Test Backend API**
   ```bash
   # In backend folder
   curl http://localhost:3000/health
   ```

2. **Test Database Connection**
   - In Supabase dashboard, go to **Table Editor**
   - Click on **profiles** table
   - Should be empty (no errors)

3. **Test Frontend**
   ```bash
   # In frontend folder
   npm start
   # or
   npx expo start
   ```

---

## 📋 Checklist

Before moving forward, make sure:

- [ ] Supabase project created
- [ ] Database schema executed successfully
- [ ] 5 tables visible in Table Editor
- [ ] `.env` file created with correct credentials
- [ ] `npm install` completed in backend
- [ ] Backend server starts without errors
- [ ] Health check endpoint works
- [ ] `@supabase/supabase-js` installed in frontend
- [ ] Frontend `supabase.js` updated with credentials

---

## 🎯 Next Steps

Now that your backend is set up, you can:

1. Update your Zustand stores to use Supabase instead of local storage
2. Update AuthScreens to use real authentication
3. Update team management to sync with database
4. Enable real-time notifications

---

## ❓ Common Issues

### "Missing Supabase environment variables"
**Solution**: Make sure `.env` file exists and has all required variables

### "Error: connect ECONNREFUSED"
**Solution**: 
- Check your SUPABASE_URL is correct
- Make sure you have internet connection
- Verify Supabase project is active

### "Invalid API key"
**Solution**:
- Re-copy your anon key from Supabase dashboard
- Make sure there are no extra spaces in .env file

### Database schema errors
**Solution**:
- Delete all tables in Supabase
- Run schema.sql again
- Make sure you're running the entire file

### Port 3000 already in use
**Solution**:
- Change PORT in .env to 3001
- Or stop other server using port 3000

---

## 🔐 Security Notes

⚠️ **IMPORTANT**:
- Never commit `.env` file to Git (it's in .gitignore)
- Never share your SERVICE_ROLE_KEY publicly
- ANON_KEY is safe to use in frontend
- Use environment variables for production

---

## 📞 Need Help?

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- Check the backend README.md for API documentation

---

**Ready to integrate with your app!** 🎉
