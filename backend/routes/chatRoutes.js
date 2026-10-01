import express from "express";

import Chat from "../models/Chat.js";

import protect from "../middleware/auth.js";

import generateMedicalResponse from "../services/geminiService.js";


const router = express.Router();


// =====================================================
// NORMAL AI MEDICAL CHAT
// POST /api/chat
// =====================================================

router.post("/", protect, async (req, res) => {

    try {

        console.log("=================================");
        console.log("CHAT REQUEST RECEIVED");
        console.log("=================================");


        // =================================================
        // GET MESSAGE FROM FRONTEND
        // =================================================

        const { message } = req.body;


        console.log(
            "User message:",
            message
        );


        console.log(
            "Logged in user:",
            req.user._id
        );


        // =================================================
        // VALIDATE MESSAGE
        // =================================================

        if (
            !message ||
            typeof message !== "string" ||
            message.trim() === ""
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter a message."

            });

        }


        // =================================================
        // SEND MESSAGE TO GEMINI
        // =================================================

        console.log(
            "Sending message to Gemini..."
        );


        const response =
            await generateMedicalResponse(
                message.trim()
            );


        console.log(
            "Gemini response received."
        );


        // =================================================
        // SAVE CHAT TO MONGODB
        // =================================================

        const savedChat = await Chat.create({

            userId: req.user._id,

            userMessage: message.trim(),

            aiResponse: response

        });


        console.log(
            "Chat saved successfully:",
            savedChat._id
        );


        // =================================================
        // SEND RESPONSE TO FRONTEND
        // =================================================

        return res.status(200).json({

            success: true,

            response: response,

            chatId: savedChat._id

        });


    } catch (error) {

        console.error(
            "CHAT CONTROLLER ERROR:"
        );

        console.error(error);


        return res.status(500).json({

            success: false,

            message:
                "Unable to get a response from the AI service.",

            error:
                error.message

        });

    }

});


// =====================================================
// GET CHAT HISTORY
// GET /api/chat/history
// =====================================================

router.get(
    "/history",
    protect,
    async (req, res) => {

        try {

            console.log("=================================");
            console.log("CHAT HISTORY REQUEST RECEIVED");
            console.log("=================================");


            // =================================================
            // GET LOGGED-IN USER'S CHATS
            // =================================================

            const chats = await Chat.find({

                userId: req.user._id

            })
            .sort({

                createdAt: -1

            });


            console.log(
                "User:",
                req.user._id
            );


            console.log(
                "Chats found:",
                chats.length
            );


            // =================================================
            // SEND HISTORY TO FRONTEND
            // =================================================

            return res.status(200).json({

                success: true,

                chats: chats

            });


        } catch (error) {

            console.error(
                "HISTORY ERROR:"
            );

            console.error(error);


            return res.status(500).json({

                success: false,

                message:
                    "Unable to load chat history.",

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// DELETE ONE CHAT
// DELETE /api/chat/:id
// =====================================================

router.delete(
    "/:id",
    protect,
    async (req, res) => {

        try {

            console.log(
                "Deleting chat:",
                req.params.id
            );


            // =================================================
            // FIND CHAT BELONGING TO CURRENT USER
            // =================================================

            const chat = await Chat.findOne({

                _id: req.params.id,

                userId: req.user._id

            });


            // =================================================
            // CHAT NOT FOUND
            // =================================================

            if (!chat) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Chat not found."

                });

            }


            // =================================================
            // DELETE CHAT
            // =================================================

            await Chat.findByIdAndDelete(
                req.params.id
            );


            console.log(
                "Chat deleted successfully."
            );


            return res.status(200).json({

                success: true,

                message:
                    "Chat deleted successfully."

            });


        } catch (error) {

            console.error(
                "DELETE CHAT ERROR:"
            );

            console.error(error);


            return res.status(500).json({

                success: false,

                message:
                    "Unable to delete chat.",

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// EXPORT ROUTER
// =====================================================

export default router;