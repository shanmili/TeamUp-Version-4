# TeamUp Backend Setup Guide

## 📋 Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account (free tier available)

## 🚀 Quick Start

### 1. Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in the details:
   - **Project Name**: TeamUp
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
4. Wait for the project to be created (~2 minutes)

### 2. Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. You'll find:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (also starts with `eyJ...`)

### 3. Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `database/schema.sql`
4. Click **RUN** to create all tables and policies
5. Verify: Go to **Table Editor** and you should see:
   - profiles
   - teams
   - team_members
   - notifications
   - join_requests

### 4. Configure Backend

1. Open terminal in the backend folder
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` and add your Supabase credentials:
   ```
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   PORT=3000
   NODE_ENV=development
   ```

### 5. Start the Backend Server

```bash
npm run dev
```

You should see:
```
🚀 TeamUp Backend server is running on port 3000
📊 Health check: http://localhost:3000/health
```

Test it by visiting: `http://localhost:3000/health`

## 📁 Backend Structure

```
TeamUpV3 backend/
├── config/
│   └── supabase.js          # Supabase client configuration
├── database/
│   └── schema.sql           # Database schema and policies
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── profiles.js         # User profile routes
│   ├── teams.js            # Team management routes
│   └── notifications.js    # Notification routes
├── .env.example            # Environment variables template
├── .gitignore             # Git ignore file
├── package.json           # Dependencies
├── server.js              # Express server entry point
└── README.md              # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user
- `POST /api/auth/signout` - Logout user
- `GET /api/auth/session` - Get current session

### Profiles
- `GET /api/profiles` - Get all profiles
- `GET /api/profiles/:userId` - Get single profile
- `PUT /api/profiles/:userId` - Update profile

### Teams
- `GET /api/teams` - Get all teams
- `GET /api/teams/my-teams/:userId` - Get user's teams
- `GET /api/teams/:teamId` - Get single team
- `POST /api/teams` - Create team
- `PUT /api/teams/:teamId` - Update team
- `DELETE /api/teams/:teamId` - Delete team
- `POST /api/teams/:teamId/members` - Add member
- `DELETE /api/teams/:teamId/members/:memberId` - Remove member
- `GET /api/teams/search/:query` - Search teams

### Notifications
- `GET /api/notifications/:userId` - Get user notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/:notificationId/read` - Mark as read
- `PUT /api/notifications/user/:userId/read-all` - Mark all as read
- `DELETE /api/notifications/:notificationId` - Delete notification
- `GET /api/notifications/:userId/unread-count` - Get unread count

## 🔒 Security Features

- **Row Level Security (RLS)**: Enabled on all tables
- **Authentication**: Supabase Auth with email/password
- **Authorization**: Users can only access/modify their own data
- **Password Validation**: 8+ characters, uppercase, number, symbol
- **Email Validation**: Valid domains only

## 📱 Frontend Integration

Install Supabase client in your React Native app:

```bash
cd "TeamUpV3 frontend"
npm install @supabase/supabase-js
```

Create a Supabase client file (already created in `lib/supabase.js`)

## 🧪 Testing

Test the health endpoint:
```bash
curl http://localhost:3000/health
```

## 📝 Next Steps

1. ✅ Set up Supabase project
2. ✅ Run database schema
3. ✅ Configure .env file
4. ✅ Install dependencies
5. ✅ Start backend server
6. 🔄 Update frontend to use Supabase
7. 🔄 Test authentication flow
8. 🔄 Test team creation and management

## 🆘 Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env` file exists
- Check that SUPABASE_URL and SUPABASE_ANON_KEY are set correctly

### "Cannot find module"
- Run `npm install` to install all dependencies

### Database errors
- Verify schema.sql was executed successfully in Supabase SQL Editor
- Check Row Level Security policies are enabled

### Port already in use
- Change PORT in .env file to a different port (e.g., 3001)

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
