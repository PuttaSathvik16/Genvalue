import express from "express";
import { verifyLmsToken } from "../middleware/auth.js";
import { submitBugReport } from "../controllers/bugReportController.js";

const router = express.Router();

router.post("/", verifyLmsToken, submitBugReport);

export default router;
