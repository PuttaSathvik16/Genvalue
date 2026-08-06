#!/usr/bin/env bun
/**
 * Install Firebase Admin service account for local backend.
 *
 * Usage:
 *   bun scripts/setup-firebase-admin.mjs
 *   bun scripts/setup-firebase-admin.mjs ~/Downloads/genvalue-fdb35-firebase-adminsdk-xxxxx.json
 *
 * Get the JSON key:
 *   Firebase Console → Project Settings → Service accounts → Generate new private key
 *   https://console.firebase.google.com/project/genvalue-fdb35/settings/serviceaccounts/adminsdk
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.join(__dirname, "..");
const envPath = path.join(backendRoot, ".env");
const targetKeyPath = path.join(backendRoot, "serviceAccountKey.json");
const expectedProjectId = process.env.FIREBASE_PROJECT_ID || "genvalue-fdb35";

function isServiceAccountJson(value) {
  return (
    value &&
    value.type === "service_account" &&
    typeof value.project_id === "string" &&
    typeof value.client_email === "string" &&
    typeof value.private_key === "string"
  );
}

function resolveSourcePath(rawPath) {
  const expanded = rawPath.startsWith("~")
    ? path.join(process.env.HOME || "", rawPath.slice(1))
    : rawPath;
  return path.resolve(expanded);
}

async function promptForKeyPath() {
  const rl = readline.createInterface({ input, output });
  try {
    console.log("\nFirebase Admin setup — GenValue Academy");
    console.log("Download a service account key from:");
    console.log(
      "  https://console.firebase.google.com/project/genvalue-fdb35/settings/serviceaccounts/adminsdk\n"
    );
    const answer = await rl.question(
      "Path to the downloaded JSON file (drag & drop works): "
    );
    return answer.trim().replace(/^['"]|['"]$/g, "");
  } finally {
    rl.close();
  }
}

function upsertEnvVar(envContents, key, value) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");

  if (pattern.test(envContents)) {
    return envContents.replace(pattern, line);
  }

  const firebaseBlock = envContents.match(/# Firebase Admin SDK[\s\S]*?(?=\n# |\n$|$)/);
  if (firebaseBlock) {
    return envContents.replace(firebaseBlock[0], `${firebaseBlock[0].trimEnd()}\n${line}\n`);
  }

  return `${envContents.trimEnd()}\n\n# Firebase Admin SDK\n${line}\n`;
}

async function verifyAdminKey(credentials) {
  const admin = (await import("firebase-admin")).default;

  if (admin.apps.length) {
    await Promise.all(admin.apps.map((app) => app.delete()));
  }

  admin.initializeApp({
    credential: admin.credential.cert(credentials),
    projectId: credentials.project_id,
  });

  await admin.auth().listUsers(1);
  await admin.app().delete();
}

async function main() {
  let sourceArg = process.argv[2];

  if (!sourceArg) {
    sourceArg = await promptForKeyPath();
  }

  if (!sourceArg) {
    console.error("❌ No key file path provided.");
    process.exit(1);
  }

  const sourcePath = resolveSourcePath(sourceArg);

  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ File not found: ${sourcePath}`);
    process.exit(1);
  }

  let credentials;
  try {
    credentials = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  } catch (error) {
    console.error(`❌ Invalid JSON: ${error.message}`);
    process.exit(1);
  }

  if (!isServiceAccountJson(credentials)) {
    console.error("❌ File is not a Firebase service account JSON (missing type/project_id/client_email/private_key).");
    process.exit(1);
  }

  if (credentials.project_id !== expectedProjectId) {
    console.warn(
      `⚠️  Key project_id is "${credentials.project_id}" but FIREBASE_PROJECT_ID is "${expectedProjectId}". Continuing anyway.`
    );
  }

  fs.copyFileSync(sourcePath, targetKeyPath);
  fs.chmodSync(targetKeyPath, 0o600);

  if (!fs.existsSync(envPath)) {
    console.error(`❌ Missing ${envPath}. Create it from backend/.env.example first.`);
    process.exit(1);
  }

  const envContents = fs.readFileSync(envPath, "utf8");
  const updatedEnv = upsertEnvVar(envContents, "GOOGLE_APPLICATION_CREDENTIALS", "./serviceAccountKey.json");
  fs.writeFileSync(envPath, updatedEnv, "utf8");

  console.log(`✅ Copied service account to backend/serviceAccountKey.json`);
  console.log(`✅ Updated backend/.env → GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json`);

  process.stdout.write("⏳ Verifying Firebase Admin Auth… ");
  try {
    await verifyAdminKey(credentials);
    console.log("OK");
    console.log("\nRestart the backend (bun run dev) — you should see:");
    console.log("  ✅ Firebase Admin credentials loaded (./serviceAccountKey.json)");
  } catch (error) {
    console.log("FAILED");
    console.warn(`⚠️  Key saved but verification failed: ${error.message}`);
    console.warn("   Check network access and that the key was not revoked in Firebase Console.");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
