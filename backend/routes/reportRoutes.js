import express from "express";
import multer from "multer";

import {
    analyzeReport
} from "../controllers/reportController.js";

const router = express.Router();


// =====================================================
// FILE UPLOAD CONFIGURATION
// =====================================================

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 10 * 1024 * 1024
    }
});


// =====================================================
// ANALYZE REPORT
// =====================================================

router.post(
    "/analyze",
    upload.single("report"),
    analyzeReport
);


// =====================================================
// EXPORT
// =====================================================

export default router;