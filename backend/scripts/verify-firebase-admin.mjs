#!/usr/bin/env bun
/** Quick check that Firebase Admin credentials load from backend/.env */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const backendRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(backendRoot, ".env"), override: true });

const { ensureFirebaseAdminReady, adminAuth } = await import("../src/config/firebase.js");
const { firebaseAdminCredentialsLoaded } = await import("../src/utils/firebaseAdminAuth.js");

if (!firebaseAdminCredentialsLoaded) {
  console.error("❌ No Firebase Admin credentials configured.");
  console.error("   Run: bun scripts/setup-firebase-admin.mjs");
  process.exit(1);
}

const ready = await ensureFirebaseAdminReady();
if (!ready) {
  console.error("❌ Credentials loaded but Firebase Auth API is unreachable.");
  process.exit(1);
}

const result = await adminAuth.listUsers(1);
console.log(`✅ Firebase Admin OK — project has users (sample count probe: ${result.users.length})`);
