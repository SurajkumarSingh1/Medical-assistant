import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/jwt.js";

// ================= REGISTER =================

export const registerUser = async (req, res) => {
    try {
        const {
            fullName,
            email,
            password,
            phone
        } = req.body;

        // Check required fields
        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Full name, email and password are required."
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email."
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            fullName,
            email: email.toLowerCase(),
            password: hashedPassword,
            phone: phone || ""
        });

        // Generate JWT
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: "Registration successful.",
            token,

            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                profileImage: user.profileImage
            }
        });

    } catch (error) {

        console.error("Register Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error during registration."
        });
    }
};


// ================= LOGIN =================

export const loginUser = async (req, res) => {
    try {

        const {
            email,
            password
        } = req.body;

        // Check fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        // Find user
        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Compare password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Generate JWT
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: "Login successful.",
            token,

            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                profileImage: user.profileImage
            }
        });

    } catch (error) {

        console.error("Login Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error during login."
        });
    }
};

// ================= GET PROFILE =================

export const getProfile = async (req, res) => {
    try {

        const user = req.user;

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone || "",
                profileImage: user.profileImage
            }
        });

    } catch (error) {

        console.error("Get Profile Error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch profile."
        });
    }
};


// ================= UPDATE PROFILE =================

export const updateProfile = async (req, res) => {
    try {

        const {
            fullName,
            email,
            phone
        } = req.body;

        if (!fullName || !email) {

            return res.status(400).json({
                success: false,
                message: "Full name and email are required."
            });
        }

        const user = req.user;

        user.fullName = fullName;
        user.email = email.toLowerCase();
        user.phone = phone || "";

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully.",

            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone || "",
                profileImage: user.profileImage
            }
        });

    } catch (error) {

        console.error("Update Profile Error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to update profile."
        });
    }
};