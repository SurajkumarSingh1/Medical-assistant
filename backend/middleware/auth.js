import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
    try {

        const authHeader = req.headers.authorization;

        // Check authorization header
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Not authorized. Please login."
            });
        }

        // Get token
        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("TOKEN DECODED:", decoded);

        // Get user ID from token
        const userId = decoded.userId || decoded.id;

        console.log("USER ID:", userId);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Invalid token. User ID missing."
            });
        }

        // Find user
        const user = await User.findById(userId);

        console.log("FOUND USER:", user ? user.email : "No user");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found."
            });
        }

        // Attach user to request
        req.user = user;

        next();

    } catch (error) {

        console.error(
            "Auth Middleware Error:",
            error
        );

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });
    }
};

export default protect;