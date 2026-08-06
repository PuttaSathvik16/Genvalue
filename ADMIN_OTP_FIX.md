# Admin OTP 500 Error Fix

## Issue
The POST endpoint `/api/auth/admin/send-otp` was returning a **500 Internal Server Error** when attempting to send an OTP.

## Root Cause
The backend was throwing a 500 error because:
1. **No authorized admin email was seeded in the database** - The `authorizedAdmin` table was empty, so the database query logic was not properly handling this state
2. **Insufficient error handling** - Database errors weren't being caught separately from business logic errors
3. **Missing validation** - The code didn't distinguish between "email not found" (403) and "database error" (500)

## Solution Implemented

### 1. Created Database Seed Script (`backend/prisma/seed.js`)
- Automatically seeds the super admin email from `SUPER_ADMIN_EMAIL` environment variable
- Creates an authorized admin record on first run only
- Idempotent - safe to run multiple times
- Provides clear console output for verification

### 2. Enhanced Error Handling in `sendAdminOTP` Controller
- Added separate try-catch blocks for database operations
- Distinguishes between different error types:
  - **400**: Missing email parameter
  - **403**: Email not authorized OR account inactive
  - **500**: Database/system errors
  - **502**: Email service failures
- Provides helpful error messages:
  - In dev mode: Returns actual error details for debugging
  - In production: Returns generic messages for security
- Development mode convenience: Allows OTP testing without email service

### 3. Updated package.json
- Added `"seed"` script: `bun prisma/seed.js`
- Added `"prisma"` configuration for automatic seeding
- Includes other Prisma CLI commands for convenience

## How to Use

### Step 1: Run the Seed Script
```bash
cd backend
bun prisma/seed.js
```

Or using npm/yarn:
```bash
npm run seed
# or
yarn seed
```

### Step 2: Verify Super Admin was Created
You should see output like:
```
Starting database seed...
✓ Super admin created: sujithputta02@gmail.com
```

### Step 3: Test the Admin Login Flow
1. Open http://localhost:3000/admin/auth/login
2. Enter the super admin email: `sujithputta02@gmail.com`
3. Click "Send Code"
4. You should receive:
   - In **development**: OTP code in server logs and success response
   - In **production**: OTP via email (if Brevo is configured)

## Technical Details

### Database Models
The fix relies on two Prisma models:

**AuthorizedAdmin**
```prisma
model AuthorizedAdmin {
  id           String   @id @default(uuid())
  email        String   @unique
  name         String?
  isSuperAdmin Boolean  @default(false)
  isActive     Boolean  @default(true)
  addedByEmail String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

**AdminOTP**
```prisma
model AdminOTP {
  id         String   @id @default(uuid())
  email      String   @unique
  otp        String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  verified   Boolean  @default(false)
}
```

### Environment Variables Required
```env
SUPER_ADMIN_EMAIL=sujithputta02@gmail.com  # Used by seed script
BREVO_API_KEY=your-api-key                 # For email sending
BREVO_SENDER_EMAIL=genvalue.academy@gmail.com
NODE_ENV=development                       # For dev mode convenience
```

## Response Examples

### Success (Email Sent)
```json
{
  "success": true,
  "message": "OTP sent successfully. Check your email."
}
```

### Success (Development Mode - Email Failed)
```json
{
  "success": true,
  "message": "OTP generated (email service unavailable in dev — see server logs)",
  "dev_otp": "123456"
}
```

### Error: Email Not Authorized
```json
{
  "success": false,
  "message": "Email not authorized. Contact the super admin (sujithputta02@gmail.com) for access."
}
```

### Error: Account Inactive
```json
{
  "success": false,
  "message": "This admin account is inactive. Contact the super admin."
}
```

### Error: Database Issue
```json
{
  "success": false,
  "message": "Database error. Please try again later.",
  "error": "connection timeout" // Only in dev mode
}
```

## Next Steps

1. **Run the seed script** to initialize the super admin
2. **Test the admin login** with the seeded email
3. **Add other admins** using the admin panel (once logged in as super admin)
4. **Monitor server logs** for any issues

## Adding Additional Admin Users

Once logged in as a super admin, you can:
1. Navigate to Admin Dashboard → Users → Authorized Admins
2. Click "Add Admin Email"
3. Enter the new admin's email
4. The system will send them an OTP and grant them access

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Email not authorized" error | Run `bun prisma/seed.js` to seed the super admin |
| "Database error" in production | Check CockroachDB connection and credentials in `.env` |
| OTP not received in email | Verify `BREVO_API_KEY` and `BREVO_SENDER_EMAIL` are correct |
| OTP expires too quickly | Check `OTP_EXPIRY_MINUTES` constant in controller (default: 10 minutes) |

