import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  markFirebaseAdminCredentialsLoaded,
  probeFirebaseAdminAuth,
} from "../utils/firebaseAdminAuth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: path.join(__dirname, "../../.env"),
  override: true,
});

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

function loadServiceAccountCredentials() {
  const serviceAccountEnv =
    process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountEnv) {
    try {
      let credentialsStr = serviceAccountEnv.trim();
      if (!credentialsStr.startsWith("{")) {
        credentialsStr = Buffer.from(credentialsStr, "base64").toString("utf8");
      }
      const credentials = JSON.parse(credentialsStr);
      return {
        credentials,
        projectId: process.env.FIREBASE_PROJECT_ID || credentials.project_id,
        source: "FIREBASE_SERVICE_ACCOUNT",
      };
    } catch (error) {
      console.warn("⚠️  Could not parse FIREBASE_SERVICE_ACCOUNT:", error.message);
    }
  }

  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    try {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");
      return {
        credentials: {
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        },
        projectId: process.env.FIREBASE_PROJECT_ID,
        source: "FIREBASE_CLIENT_EMAIL",
      };
    } catch (error) {
      console.warn("⚠️  Could not load FIREBASE_CLIENT_EMAIL / PRIVATE_KEY:", error.message);
    }
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      const rawPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      const credPath = path.isAbsolute(rawPath)
        ? rawPath
        : path.resolve(process.cwd(), rawPath);
      const credentials = JSON.parse(fs.readFileSync(credPath, "utf8"));
      return {
        credentials,
        projectId: process.env.FIREBASE_PROJECT_ID || credentials.project_id,
        source: credPath,
      };
    } catch (error) {
      console.warn("⚠️  Could not load GOOGLE_APPLICATION_CREDENTIALS file:", error.message);
    }
  }

  const repoPaths = [
    path.join(__dirname, "../../serviceAccountKey.json"),
    path.join(process.cwd(), "serviceAccountKey.json"),
    path.join(process.cwd(), "backend/serviceAccountKey.json"),
  ];

  for (const certPath of repoPaths) {
    try {
      if (fs.existsSync(certPath)) {
        const credentials = JSON.parse(fs.readFileSync(certPath, "utf8"));
        return {
          credentials,
          projectId: process.env.FIREBASE_PROJECT_ID || credentials.project_id,
          source: certPath,
        };
      }
    } catch {
      /* try next path */
    }
  }

  return null;
}

if (!admin.apps.length) {
  const loaded = loadServiceAccountCredentials();
  let adminConfig;

  if (loaded) {
    adminConfig = {
      credential: admin.credential.cert(loaded.credentials),
      projectId: loaded.projectId,
    };
    markFirebaseAdminCredentialsLoaded(true);
    console.log(`✅ Firebase Admin credentials loaded (${loaded.source})`);
  } else {
    adminConfig = {
      projectId: process.env.FIREBASE_PROJECT_ID || "genvalue-fdb35",
    };
    markFirebaseAdminCredentialsLoaded(false);
    console.warn(
      "⚠️  Firebase Admin: no service account configured. LMS tokens use Google public key verification. For user disable/delete, run: bun run firebase:setup"
    );
  }

  admin.initializeApp(adminConfig);
}

export const adminAuth = admin.auth();

export async function ensureFirebaseAdminReady() {
  return probeFirebaseAdminAuth(adminAuth);
}

export default app;
