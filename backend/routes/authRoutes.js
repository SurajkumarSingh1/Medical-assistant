import protect from "../middleware/auth.js";
import express from "express";

import {
    registerUser,
    loginUser,
    getProfile,
    updateProfile
} from "../controllers/authController.js";

const router = express.Router();


router.post(
    "/register",
    registerUser
);


router.post(
    "/login",
    loginUser
);

// Profile
router.get(
    "/profile",
    protect,
    getProfile
);

router.put(
    "/profile",
    protect,
    updateProfile
);


export default router;