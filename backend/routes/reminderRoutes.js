import express from "express";

import {
    addReminder,
    getReminders,
    deleteReminder
} from "../controllers/reminderController.js";

import protect from "../middleware/auth.js";


const router = express.Router();


// Add reminder
router.post(
    "/",
    protect,
    addReminder
);


// Get user's reminders
router.get(
    "/",
    protect,
    getReminders
);


// Delete reminder
router.delete(
    "/:id",
    protect,
    deleteReminder
);


export default router;