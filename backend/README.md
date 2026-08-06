# GenValue Academy Backend API

Express.js backend server with Firebase Authentication for the GenValue Academy LMS platform.

## 🚀 Tech Stack

- **Runtime**: Bun (high-performance JavaScript runtime)
- **Framework**: Express.js
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **Language**: JavaScript (ES Modules)

## 📋 Prerequisites

- [Bun](https://bun.sh/) installed (`curl -fsSL https://bun.sh/install | bash`)
- Firebase project with Authentication enabled
- Node.js 18+ (for compatibility checks)

## 🛠️ Installation

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Set up environment variables:**
   
   The `.env` file is already configured with Firebase credentials. Review and update if needed:
   
   ```env
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000

   FIREBASE_API_KEY=your-api-key
   FIREBASE_AUTH_DOMAIN=your-auth-domain
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_STORAGE_BUCKET=your-storage-bucket
   FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   FIREBASE_APP_ID=your-app-id
   FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

## 🔑 Firebase Setup

### 1. Enable Authentication Methods

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `genvalue-fdb35`
3. Navigate to **Authentication** → **Sign-in method**
4. Enable:
   - ✅ Email/Password
   - ✅ Google

### 2. Set up Firestore Database

1. Navigate to **Firestore Database**
2. Create database in production mode
3. Collections will be created automatically:
   - `users` - User profiles
   - `otps` - Admin OTP verification

### 3. Configure Firebase Admin SDK (Optional)

For production, download service account key:

1. Go to **Project Settings** → **Service Accounts**
2. Click **Generate new private key**
3. Save as `serviceAccountKey.json` in backend folder
4. Update `.env`:
   ```env
   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
   ```

## 🏃 Running the Server

### Development Mode (with auto-reload):
```bash
bun run dev
```

### Production Mode:
```bash
bun start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Health Check
```
GET /
GET /health
```

### Authentication Routes

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "role": "STUDENT"
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

#### Verify Token
```
POST /api/auth/verify-token
Content-Type: application/json

{
  "idToken": "firebase-id-token"
}
```

#### Get User Profile (Protected)
```
GET /api/auth/profile
Authorization: Bearer <firebase-id-token>
```

#### Admin: Send OTP
```
POST /api/auth/admin/send-otp
Content-Type: application/json

{
  "email": "admin@gmail.com"
}
```

#### Admin: Verify OTP
```
POST /api/auth/admin/verify-otp
Content-Type: application/json

{
  "email": "admin@gmail.com",
  "otp": "123456"
}
```

## 🔐 User Roles

- **STUDENT** - Default role for all registrations
- **INSTRUCTOR** - Manually assigned via Firebase Console
- **ADMIN** - Admin access with OTP verification

## 🧪 Testing

### Using cURL:

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "name": "Test User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

### Using Postman:

Import the following collection structure:
- Base URL: `http://localhost:5000/api`
- Add Authorization header: `Bearer {idToken}` for protected routes

## 🗂️ Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── firebase.js          # Firebase initialization
│   ├── controllers/
│   │   └── authController.js    # Authentication logic
│   ├── middleware/
│   │   └── auth.js               # Token verification
│   ├── routes/
│   │   └── authRoutes.js         # API route definitions
│   └── server.js                 # Express app entry point
├── .env                          # Environment variables
├── .gitignore                    # Git ignore rules
├── package.json                  # Dependencies & scripts
├── bun.lock                      # Bun lockfile
└── README.md                     # This file
```

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Find and kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### Firebase Admin SDK Error
Ensure you're using application default credentials or service account key:
```bash
# Set environment variable (Mac/Linux)
export GOOGLE_APPLICATION_CREDENTIALS="./serviceAccountKey.json"
```

### CORS Issues
Update `FRONTEND_URL` in `.env` to match your frontend origin.

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` / `production` |
| `FRONTEND_URL` | Frontend origin for CORS | `http://localhost:3000` |
| `FIREBASE_API_KEY` | Firebase API key | `AIzaSy...` |
| `FIREBASE_AUTH_DOMAIN` | Auth domain | `project.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | Project ID | `project-id` |
| `FIREBASE_STORAGE_BUCKET` | Storage bucket | `project.appspot.com` |
| `FIREBASE_MESSAGING_SENDER_ID` | Sender ID | `123456789` |
| `FIREBASE_APP_ID` | App ID | `1:123:web:abc` |
| `FIREBASE_MEASUREMENT_ID` | Analytics ID | `G-ABC123` |

## 🔗 Related

- [Frontend README](../README.md)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Express.js Documentation](https://expressjs.com/)
- [Bun Documentation](https://bun.sh/docs)

## 📄 License

MIT License - GenValue Academy
