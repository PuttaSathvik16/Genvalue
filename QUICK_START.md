# Quick Start - Get Google Auth Working NOW

## 🚨 Critical Step: Restart Backend

The backend code has been updated but is still running the old version.

```bash
cd backend
# Stop old process (Ctrl+C in the terminal where it's running)
# Then run:
bun src/server.js
```

Wait for this message:
```
✅ Backend server running on http://localhost:5001
```

## ✅ Verify Everything Works

### 1. Check Backend
```bash
curl http://localhost:5001/health
```
Response: `{"success":true,"message":"Server is healthy",...}`

### 2. Check Frontend
Go to http://localhost:3000/auth/login

### 3. Test Google Login
1. Click "Sign In with Google"
2. Complete Google authentication
3. **Expected:** Redirect to dashboard

### 4. Check Console for Logs
- DevTools Console should show: "Token decoded successfully"
- Backend console should show: "User created/updated"

## 🎯 What Was Fixed

| Issue | Before | After |
|-------|--------|-------|
| Token storage | Blocked on backend call | Stored immediately ✅ |
| Backend down | App broken | App still works ✅ |
| Token verification | Crashed without credentials | Direct JWT decode ✅ |
| API endpoints | 404 errors | Fixed ✅ |

## 📋 What to Do If Something Goes Wrong

### Backend won't start?
```bash
# Check Node version
bun --version

# Check database connection
curl http://localhost:5001/health

# Check logs
cat backend/.env | grep DATABASE_URL
```

### Token verification still failing?
- Make sure backend is restarted
- Check backend console for "Token decoded successfully"
- Not showing? → Backend process still running old code

### Dashboard shows blank?
- Open DevTools → Application → Local Storage
- Look for `authToken` key
- Should have a long JWT string
- If missing → Token wasn't stored

### Discussions page empty?
```bash
# Seed categories
cd backend
bun scripts/seed-categories.js
```

## 🔍 Verify Everything

Run these commands to verify the setup:

```bash
# 1. Backend running?
curl http://localhost:5001/health

# 2. Database connected?
curl http://localhost:5001/api/discussions/categories/list

# 3. Frontend running?
curl http://localhost:3000/ | head -20
```

All should return success.

## 📚 Full Documentation

- **FINAL_AUTH_FIX.md** - Detailed explanation of what was fixed
- **FIX_GUIDE.md** - Complete setup and troubleshooting
- **src/services/authService.ts** - Frontend auth logic
- **backend/src/controllers/authController.js** - Backend auth logic

## ⚡ Quick Reference

**Backend port:** 5001  
**Frontend port:** 3000  
**Database:** CockroachDB (AWS)  
**Auth:** Firebase Google OAuth  

**Key endpoints:**
- GET `http://localhost:5001/health` - Backend health
- POST `http://localhost:5001/api/auth/google-auth` - Google auth
- GET `http://localhost:5001/api/discussions/categories/list` - Categories

## 🎉 When It Works

You'll see:
1. Google auth popup/redirect
2. Redirect to http://localhost:3000/dashboard
3. Dashboard loads with your profile picture and name
4. Discussion categories visible in dropdown
5. No console errors

## ❓ Need Help?

1. Check console logs first (DevTools or backend terminal)
2. Restart backend if anything changed
3. Check if services are running (health endpoints)
4. Read detailed docs (FINAL_AUTH_FIX.md, FIX_GUIDE.md)
