import { prisma } from "../config/database.js";
import { adminAuth } from "../config/firebase.js";
import { insertUserRemovalLog } from "../utils/ensureUserRemovalLogSchema.js";
import { revokeFirebaseAuthUser } from "../utils/firebaseAdminAuth.js";

const MIN_REASON_LENGTH = 10;

/**
 * Suspend and permanently remove a student account (Firebase + DB) with audit reason.
 */
export async function removeStudent(req, res) {
  try {
    const { userId } = req.params;
    const reason = String(req.body?.reason ?? "").trim();

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (reason.length < MIN_REASON_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Removal reason must be at least ${MIN_REASON_LENGTH} characters`,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        firebaseUid: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "STUDENT") {
      return res.status(403).json({
        success: false,
        message: "Only student accounts can be removed from the roster",
      });
    }

    const firebaseResult = await revokeFirebaseAuthUser(adminAuth, user.firebaseUid);

    await prisma.session.deleteMany({ where: { userId: user.id } });

    await insertUserRemovalLog({
      userId: user.id,
      email: user.email,
      name: user.name,
      reason,
      removedById: req.admin?.userId ?? null,
      removedByEmail: req.admin?.email ?? null,
    });

    await prisma.user.delete({ where: { id: user.id } });

    const firebaseNote =
      firebaseResult.status === "revoked"
        ? " Firebase sign-in was revoked."
        : firebaseResult.reason === "credentials_missing" ||
            firebaseResult.reason === "auth_unavailable"
          ? " Database record removed; configure Firebase Admin service account to revoke Firebase sign-in."
          : "";

    return res.json({
      success: true,
      message: `${user.name} (${user.email}) has been suspended and removed from GenValue Academy.${firebaseNote}`,
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
        firebaseRevoked: firebaseResult.status === "revoked",
      },
    });
  } catch (error) {
    console.error("[adminUser] removeStudent error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove student account",
    });
  }
}
