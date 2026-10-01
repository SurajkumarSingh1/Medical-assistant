import express from "express";

import {
    symptomInterview
} from "../controllers/symptomController.js";


const router = express.Router();


// =====================================================
// AI SYMPTOM INTERVIEW
// =====================================================

router.post(
    "/",
    symptomInterview
);


export default router;