import crypto from "crypto";

const CERTS_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";
const CACHE_TTL_MS = 60 * 60 * 1000;

/** @type {{ keys: Record<string, string>; fetchedAt: number } | null} */
let certCache = null;

function decodeBase64Url(value) {
  const padded = value + "=".repeat((4 - (value.length % 4)) % 4);
  return Buffer.from(padded.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

async function fetchPublicKeys() {
  const now = Date.now();
  if (certCache && now - certCache.fetchedAt < CACHE_TTL_MS) {
    return certCache.keys;
  }

  const response = await fetch(CERTS_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch Firebase public keys (${response.status})`);
  }

  const keys = await response.json();
  certCache = { keys, fetchedAt: now };
  return keys;
}

/**
 * Cryptographically verify a Firebase ID token using Google's public x509 keys.
 * Does not require Firebase Admin SDK / service account.
 */
export async function verifyFirebaseIdTokenPublic(idToken, projectId) {
  if (!idToken || !projectId) {
    throw new Error("Missing token or project ID");
  }

  const parts = idToken.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid token format");
  }

  const header = JSON.parse(decodeBase64Url(parts[0]).toString("utf8"));
  const payload = JSON.parse(decodeBase64Url(parts[1]).toString("utf8"));
  const signature = decodeBase64Url(parts[2]);

  const keys = await fetchPublicKeys();
  const pem = keys[header.kid];
  if (!pem) {
    throw new Error("Unknown signing key");
  }

  const verifier = crypto.createVerify("RSA-SHA256");
  verifier.update(`${parts[0]}.${parts[1]}`);
  verifier.end();

  const valid = verifier.verify(pem, signature);
  if (!valid) {
    throw new Error("Invalid token signature");
  }

  const expectedIss = `https://securetoken.google.com/${projectId}`;
  if (payload.iss !== expectedIss) {
    throw new Error("Invalid token issuer");
  }

  if (payload.aud !== projectId) {
    throw new Error("Invalid token audience");
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < nowSec) {
    throw new Error("Token expired");
  }

  if (payload.iat && payload.iat > nowSec + 60) {
    throw new Error("Token issued in the future");
  }

  return payload;
}

/** Health probe — can we reach Google cert endpoint? */
export async function probeFirebasePublicKeyVerification(projectId) {
  if (!projectId) return false;
  try {
    await fetchPublicKeys();
    return true;
  } catch (error) {
    console.warn("[firebase] Public key probe failed:", error.message);
    return false;
  }
}
