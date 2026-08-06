# Quick Start: Fix Admin OTP 500 Error

## TL;DR - 3 Steps to Fix

### 1. Run the seed script
```bash
cd backend
bun prisma/seed.js
```

### 2. Restart the backend (if running)
```bash
# Stop current: Ctrl+C
# Restart: bun --watch src/server.js
```

### 3. Test it
Go to: http://localhost:3000/admin/auth/login
- Email: `sujithputta02@gmail.com`
- Click "Send Code"
- Check server logs for OTP (dev mode)
- Or check email (if Brevo is configured)

---

## What Was Fixed

| Before | After |
|--------|-------|
| ❌ 500 error on send OTP | ✅ Proper error handling (400/403/500/502) |
| ❌ No authorized admins in DB | ✅ Seed script initializes super admin |
| ❌ Unclear error messages | ✅ Helpful error messages with guidance |
| ❌ No dev mode support | ✅ Dev mode shows OTP in logs |

---

## Files Changed

1. **NEW** `backend/prisma/seed.js` - Seeds super admin email
2. **MODIFIED** `backend/package.json` - Added seed script
3. **MODIFIED** `backend/src/controllers/authController.js` - Better error handling

---

## Expected Output

### Server logs (after running seed):
```
Starting database seed...
✓ Super admin created: sujithputta02@gmail.com
```

### After entering admin email:
**Dev mode:**
```
[DEV] Admin OTP for sujithputta02@gmail.com: 123456
```

**Production (with Brevo):**
```
✓ OTP sent successfully to sujithputta02@gmail.com
```

---

## Troubleshooting

### Still getting 500 error?
- Make sure you ran `bun prisma/seed.js` ✓
- Check server logs for error details
- Verify CockroachDB is running and accessible

### Seed script says "Email not authorized"?
- Check `.env` for `SUPER_ADMIN_EMAIL=sujithputta02@gmail.com`
- Verify environment variable is set correctly

### OTP not appearing in logs?
- Make sure `NODE_ENV=development` in `.env`
- Server needs to be restarted after seed script runs

### No email received?
- Check `BREVO_API_KEY` in `.env` is valid
- Dev mode shows OTP in logs even if email fails

---

## Next: Add More Admins

Once logged in as super admin:
1. Go to Admin Dashboard
2. Navigate to Settings → Authorized Admins
3. Click "Add Admin Email"
4. Enter new admin's email
5. They'll receive OTP to complete setup

---

## Questions?

See full documentation in:
- `ADMIN_OTP_FIX.md` - Detailed technical guide
- `ADMIN_OTP_FIX_SUMMARY.md` - Complete change overview
