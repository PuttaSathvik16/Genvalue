# GenValue Academy - Setup & Running Guide

## Architecture

The project consists of two separate applications:

- **Frontend**: Next.js (port 3000)
- **Backend**: Express.js with Firebase & CockroachDB (port 5001)

Both need to be running for the dashboard to work.

---

## Backend Setup

### Prerequisites
- Bun (runtime) - similar to Node.js but faster
- Environment variables configured in `backend/.env`

### Starting the Backend

```bash
cd backend
bun run dev
```

Expected output:
```
✅ Backend server running on http://localhost:5001
📝 Environment: development
🔥 Firebase Project: genvalue-fdb35
```

### API Endpoints

Once running, the backend provides:

- `GET /api/auth/profile` - Get current user profile (requires auth token)
- `GET /api/dashboard/overview` - Get student dashboard data
- `GET /api/dashboard/progress/:courseId` - Get course progress
- `GET /api/dashboard/deadlines` - Get upcoming deadlines

All dashboard endpoints require a valid Firebase auth token in the `Authorization: Bearer <token>` header.

---

## Frontend Setup

### Prerequisites
- Node.js or Bun
- Environment variables configured in `.env.local`

### Starting the Frontend

```bash
cd . (root directory)
npm run dev
# or
bun run dev
```

The frontend will start on `http://localhost:3000`

---

## How the Dashboard Works

### Data Flow

1. **User logs in** → Firebase generates auth token → Token stored in localStorage
2. **Dashboard page loads** → Fetches `http://localhost:5001/api/dashboard/overview`
3. **Auth middleware verifies token** → Looks up user in database
4. **Real data returned** → Dashboard displays user info, progress, stats

### Current Data Status

The dashboard currently shows:
- ✅ Real user data (name, email, profile picture)
- ✅ Enrollment information
- ⏳ Progress stats (0% - will populate when course models are added)
- ⏳ Quiz statistics (will populate with quiz data)
- ⏳ Upcoming deadlines (will populate with assignment data)

### Why You Might See Empty Stats

The database currently has:
- User accounts ✅
- Firebase authentication ✅
- Session management ✅

But doesn't have yet:
- Course enrollment records
- Student progress tracking
- Lessons and quiz data
- Assignment submissions

These will be added as the Course/Module/Lesson models are implemented.

---

## Troubleshooting

### "net::ERR_CONNECTION_REFUSED" on Dashboard

**Problem**: Frontend can't reach backend API
**Solution**: 
1. Make sure backend is running on port 5001
2. Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
3. Verify CORS is enabled in `backend/src/server.js`

### "401 Unauthorized" on API calls

**Problem**: Auth token is invalid or missing
**Solution**:
1. Log out and log back in to get a fresh token
2. Clear localStorage and try again
3. Check Firebase project credentials in `backend/.env`

### Port Already in Use

**Problem**: Cannot start backend (port 5001 in use)
**Solution**:
```bash
# Find process using port 5001
lsof -i :5001

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=5002 bun run dev
```

---

## Environment Variables

### Backend (.env)

```
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://...  # CockroachDB connection
FIREBASE_PROJECT_ID=...
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

---

## Next Steps

1. **Implement Course Models** - Add Course, Module, Lesson to Prisma schema
2. **Add Enrollment System** - Track student enrollments
3. **Implement Progress Tracking** - Record lesson completion, quiz scores
4. **Add Assignment System** - Support assignment submission and grading
5. **Build Quiz Engine** - Create quiz functionality

Once these are implemented, the dashboard will display real progress data! 🚀
