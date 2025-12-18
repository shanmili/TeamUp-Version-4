# TeamUpV3 Quick Start Guide

## Prerequisites
- Node.js installed (v16 or higher)
- Expo CLI installed: `npm install -g expo-cli`
- Supabase account and project created
- Database schema executed in Supabase SQL editor

---

## Step 1: Backend Setup

### 1.1 Navigate to backend folder:
```bash
cd "TeamUpV3 backend"
```

### 1.2 Install dependencies:
```bash
npm install
```

### 1.3 Create `.env` file:
```bash
cp .env.example .env
```

### 1.4 Edit `.env` with your Supabase credentials:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
PORT=3000
```

### 1.5 Start the backend server:
```bash
node server.js
```

**Expected output:**
```
Server running on port 3000
```

---

## Step 2: Frontend Setup

### 2.1 Open new terminal and navigate to frontend:
```bash
cd "TeamUpV3 frontend"
```

### 2.2 Install dependencies:
```bash
npm install
```

### 2.3 Create `.env` file in frontend folder:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 2.4 Start Expo development server:
```bash
npx expo start
```

### 2.5 Run the app:
- **iOS:** Press `i` or scan QR code with Expo Go app
- **Android:** Press `a` or scan QR code with Expo Go app
- **Web:** Press `w`

---

## Step 3: First Time Setup

### 3.1 Create your first account:
1. Open the app
2. Tap "Sign Up"
3. Enter your details:
   - Full Name
   - Email (must be @gmail.com, @yahoo.com, etc.)
   - Password (8+ chars, uppercase, number, symbol)
4. Tap "Sign Up"

### 3.2 Complete onboarding:
1. Select your role (Team Lead or Team Member)
2. Add your skills (comma-separated)
3. Add your interests (comma-separated)
4. Tap "Complete"

### 3.3 Explore the app:
- **Teams Tab:** View and search for teams
- **Profile Tab:** Update your profile
- **Notifications:** Receive real-time updates

---

## Step 4: Test Features

### Create a Team (Team Lead only):
1. Go to Teams tab
2. Tap "+" button
3. Fill in team details:
   - Team Name
   - Description
   - Project Type
   - Skills Required
   - Max Members
   - Start/End Date
4. Tap "Create Team"

### Join a Team (Team Member):
1. Go to Teams tab
2. Find a team you want to join
3. Tap "Join Team" button
4. Wait for team lead approval

### Update Your Profile:
1. Go to Profile tab
2. Tap settings icon (top right)
3. Tap "Edit Profile"
4. Update your information
5. Tap "Save"

---

## Troubleshooting

### Backend not connecting:
```bash
# Check if backend is running
curl http://localhost:3000/api/auth/signin
```

### Supabase errors:
1. Verify `.env` files have correct URLs and keys
2. Check Supabase dashboard for project status
3. Ensure database schema was executed

### App won't start:
```bash
# Clear cache and restart
npx expo start -c
```

### Authentication issues:
1. Check email format matches allowed domains
2. Verify password meets requirements
3. Check backend server is running
4. Review Expo console for error messages

---

## Quick Commands Reference

### Backend:
```bash
# Install dependencies
npm install

# Start server
node server.js

# Check if running
curl http://localhost:3000
```

### Frontend:
```bash
# Install dependencies
npm install

# Start Expo
npx expo start

# Clear cache
npx expo start -c

# Run on specific platform
npx expo start --ios
npx expo start --android
npx expo start --web
```

---

## Environment Variables Checklist

### Backend `.env`:
- [ ] SUPABASE_URL
- [ ] SUPABASE_SERVICE_KEY
- [ ] PORT

### Frontend `.env`:
- [ ] EXPO_PUBLIC_SUPABASE_URL
- [ ] EXPO_PUBLIC_SUPABASE_ANON_KEY

---

## Database Schema Checklist

Run these SQL commands in Supabase SQL Editor:

1. [ ] Execute `backend/database/schema.sql`
2. [ ] Verify tables created (profiles, teams, team_members, notifications, join_requests)
3. [ ] Check RLS policies are enabled
4. [ ] Test automatic profile creation trigger

---

## API Endpoints Reference

### Authentication:
- POST `/api/auth/signup` - Create account
- POST `/api/auth/signin` - Sign in

### Profiles:
- GET `/api/profiles/:id` - Get profile
- PUT `/api/profiles/:id` - Update profile

### Teams:
- GET `/api/teams` - List all teams
- POST `/api/teams` - Create team
- GET `/api/teams/:id` - Get team details
- PUT `/api/teams/:id` - Update team
- DELETE `/api/teams/:id` - Delete team
- POST `/api/teams/:id/members` - Add member
- DELETE `/api/teams/:id/members/:memberId` - Remove member

### Notifications:
- GET `/api/notifications/:userId` - Get notifications
- POST `/api/notifications` - Create notification
- PUT `/api/notifications/:id` - Mark as read
- DELETE `/api/notifications/:id` - Delete notification

---

## Success Checklist

After setup, you should be able to:

- [ ] Sign up and sign in
- [ ] Stay logged in after app restart
- [ ] Update your profile
- [ ] Create teams (if team lead)
- [ ] View all teams
- [ ] Search teams
- [ ] Join teams (if team member)
- [ ] Receive notifications
- [ ] Mark notifications as read

---

## Next Steps

1. **Customize**: Modify colors, layouts, and branding
2. **Add Features**: Implement messaging, file sharing, etc.
3. **Deploy**: Deploy backend to cloud service (Heroku, Railway, etc.)
4. **Publish**: Submit to App Store/Google Play

---

## Getting Help

1. Check [SUPABASE_INTEGRATION_SUMMARY.md](./SUPABASE_INTEGRATION_SUMMARY.md) for detailed documentation
2. Review [SETUP_GUIDE.md](./TeamUpV3%20backend/SETUP_GUIDE.md) for backend setup
3. Check Expo logs for error messages
4. Review Supabase dashboard for database issues

---

**Happy coding! 🚀**
