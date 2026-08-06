import admin from "firebase-admin";

/** True when a service account was loaded (required for disable/delete user). */
export let firebaseAdminCredentialsLoaded = false;

/** True after a successful Auth API probe at startup. */
export let firebaseAdminAuthReady = false;

let authProbePromise = null;

function isCredentialNetworkError(error) {
  const message = String(error?.message ?? error ?? "");
  return (
    message.includes("ECONNREFUSED") ||
    message.includes("FailedToOpenSocket") ||
    message.includes("ENOTFOUND") ||
    message.includes("ETIMEDOUT") ||
    message.includes("fetch failed")
  );
}

function isSyntheticFirebaseUid(firebaseUid) {
  if (!firebaseUid) return true;
  return (
    firebaseUid.startsWith("admin-") ||
    firebaseUid.startsWith("fb-") ||
    firebaseUid === "test-firebase-uid"
  );
}

/**
 * Call once after Firebase Admin initializeApp().
 */
export function markFirebaseAdminCredentialsLoaded(loaded) {
  firebaseAdminCredentialsLoaded = Boolean(loaded);
}

/**
 * Verify Admin Auth can reach Google APIs (valid key + network).
 */
export async function probeFirebaseAdminAuth(adminAuth) {
  if (!firebaseAdminCredentialsLoaded) {
    firebaseAdminAuthReady = false;
    return false;
  }

  if (firebaseAdminAuthReady) return true;

  if (!authProbePromise) {
    authProbePromise = (async () => {
      try {
        await adminAuth.listUsers(1);
        firebaseAdminAuthReady = true;
        return true;
      } catch (error) {
        firebaseAdminAuthReady = false;
        if (isCredentialNetworkError(error)) {
          console.warn(
            "[firebase] Admin Auth unreachable (network/DNS). Student DB removal will still work; Firebase Auth revoke is skipped until connectivity is restored."
          );
        } else {
          console.warn(
            "[firebase] Admin Auth credential check failed:",
            error?.message ?? error
          );
        }
        return false;
      } finally {
        authProbePromise = null;
      }
    })();
  }

  return authProbePromise;
}

export function canRevokeFirebaseUsers() {
  return firebaseAdminCredentialsLoaded && firebaseAdminAuthReady;
}

/**
 * Disable + delete a Firebase Auth user. Safe to call when Admin is unavailable.
 */
export async function revokeFirebaseAuthUser(adminAuth, firebaseUid) {
  if (isSyntheticFirebaseUid(firebaseUid)) {
    return { status: "skipped", reason: "synthetic_uid" };
  }

  if (!firebaseAdminCredentialsLoaded) {
    return { status: "skipped", reason: "credentials_missing" };
  }

  const ready = await probeFirebaseAdminAuth(adminAuth);
  if (!ready) {
    return { status: "skipped", reason: "auth_unavailable" };
  }

  try {
    await adminAuth.updateUser(firebaseUid, { disabled: true });
  } catch (error) {
    if (error?.code === "auth/user-not-found") {
      return { status: "skipped", reason: "user_not_found" };
    }
    throw error;
  }

  try {
    await adminAuth.deleteUser(firebaseUid);
    return { status: "revoked" };
  } catch (error) {
    if (error?.code === "auth/user-not-found") {
      return { status: "skipped", reason: "user_not_found" };
    }
    throw error;
  }
}
