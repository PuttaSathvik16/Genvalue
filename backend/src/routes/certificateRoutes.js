import express from "express";
import {
  getUserCertificates,
  generateCertificate,
  getCertificateById,
  getAllCertificates,
} from "../controllers/certificateController.js";
import { verifyToken, checkRole } from "../middleware/auth.js";

const router = express.Router();

// Student routes
router.get("/user/certificates", verifyToken, getUserCertificates);
router.post("/certificates/generate", verifyToken, generateCertificate);

// Public route - verify certificate
router.get("/certificates/:certificateId/verify", getCertificateById);

// Admin routes
router.get("/admin/certificates", verifyToken, checkRole(["ADMIN", "INSTRUCTOR"]), getAllCertificates);

export default router;
