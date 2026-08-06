-- CreateEnum for Role
CREATE TYPE "Role" AS ENUM ('STUDENT', 'INSTRUCTOR', 'ADMIN');

-- CreateEnum for AuthProvider
CREATE TYPE "AuthProvider" AS ENUM ('EMAIL', 'GOOGLE', 'BOTH');

-- CreateEnum for AnnouncementType
CREATE TYPE "AnnouncementType" AS ENUM ('GENERAL', 'IMPORTANT', 'SYSTEM', 'DEADLINE', 'EVENT', 'MENTORSHIP');

-- CreateEnum for Priority
CREATE TYPE "Priority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum for NotificationType
CREATE TYPE "NotificationType" AS ENUM ('ANNOUNCEMENT', 'DEADLINE', 'GRADE', 'ENROLLMENT', 'SYSTEM', 'MESSAGE');

-- CreateTable for users
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" STRING NOT NULL,
    "name" STRING NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "firebaseUid" STRING,
    "emailVerified" BOOL NOT NULL DEFAULT false,
    "googleId" STRING,
    "googlePhotoUrl" STRING,
    "authProvider" "AuthProvider" NOT NULL DEFAULT 'EMAIL',
    "linkedProviders" STRING[] DEFAULT ARRAY[]::STRING[],
    "bio" STRING,
    "profilePicture" STRING,
    "phoneNumber" STRING,
    "country" STRING,
    "timeZone" STRING,
    "skills" STRING[] DEFAULT ARRAY[]::STRING[],
    "linkedinUrl" STRING,
    "githubUrl" STRING,
    "portfolioUrl" STRING,
    "huggingFaceUrl" STRING,
    "kaggleUrl" STRING,
    "twitterUrl" STRING,
    "preferredLanguage" STRING DEFAULT 'en',
    "emailNotifications" BOOL NOT NULL DEFAULT true,
    "publicProfile" BOOL NOT NULL DEFAULT false,
    "membershipPlan" STRING DEFAULT 'FREE',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable for sessions
CREATE TABLE "sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "firebaseToken" STRING NOT NULL,
    "refreshToken" STRING,
    "ipAddress" STRING,
    "userAgent" STRING,
    "deviceInfo" STRING,
    "expiresAt" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAccessedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- CreateTable for admin_otps
CREATE TABLE "admin_otps" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" STRING NOT NULL,
    "otp" STRING NOT NULL,
    "expiresAt" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified" BOOL NOT NULL DEFAULT false,
    CONSTRAINT "admin_otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable for announcements
CREATE TABLE "announcements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" STRING NOT NULL,
    "message" STRING NOT NULL,
    "description" STRING,
    "type" "AnnouncementType" NOT NULL DEFAULT 'GENERAL',
    "priority" "Priority" NOT NULL DEFAULT 'NORMAL',
    "status" STRING NOT NULL DEFAULT 'PUBLISHED',
    "imageUrl" STRING,
    "targetAudience" STRING NOT NULL DEFAULT 'ALL',
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP,
    "expiresAt" TIMESTAMP,
    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "announcements_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE
);

-- CreateTable for notifications
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "announcementId" UUID,
    "title" STRING NOT NULL,
    "message" STRING NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'ANNOUNCEMENT',
    "isRead" BOOL NOT NULL DEFAULT false,
    "readAt" TIMESTAMP,
    "actionUrl" STRING,
    "actionLabel" STRING,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "notifications_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "announcements"("id") ON DELETE SET NULL
);

-- Create indexes
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_firebaseUid_key" ON "users"("firebaseUid");
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_firebaseUid_idx" ON "users"("firebaseUid");

CREATE UNIQUE INDEX "admin_otps_email_key" ON "admin_otps"("email");
CREATE INDEX "admin_otps_email_idx" ON "admin_otps"("email");
CREATE INDEX "admin_otps_expiresAt_idx" ON "admin_otps"("expiresAt");

CREATE INDEX "announcements_createdById_idx" ON "announcements"("createdById");
CREATE INDEX "announcements_publishedAt_idx" ON "announcements"("publishedAt");
CREATE INDEX "announcements_expiresAt_idx" ON "announcements"("expiresAt");

CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");
