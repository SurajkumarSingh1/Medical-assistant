import Chat from "../models/Chat.js";
import generateMedicalResponse from "../services/geminiService.js";


// ================= SEND MESSAGE =================

export const sendMessage = async (req, res) => {

    try {

        const { message } = req.body;

        if (!message || message.trim() === "") {

            return res.status(400).json({
                success: false,
                message: "Please enter a message."
            });
        }


        // Gemini response
        const aiResponse =
            await generateMedicalResponse(message);


        // Save with logged-in user's ID
        const chat = await Chat.create({

            userId: req.user._id,

            userMessage: message,

            aiResponse: aiResponse

        });


        res.status(200).json({

            success: true,

            message: message,

            response: aiResponse,

            chatId: chat._id

        });


    } catch (error) {

        console.error(
            "Chat Controller Error:",
            error
        );

        res.status(500).json({

            success: false,

            message: "Unable to process your request."

        });
    }
};



// ================= GET USER HISTORY =================

export const getChatHistory = async (req, res) => {

    try {

        const chats = await Chat.find({

            userId: req.user._id

        })
        .sort({
            createdAt: -1
        });


        res.status(200).json({

            success: true,

            chats: chats

        });


    } catch (error) {

        console.error(
            "Chat History Error:",
            error
        );

        res.status(500).json({

            success: false,

            message: "Unable to fetch chat history."

        });
    }
};

// ================= DELETE CHAT =================

export const deleteChat = async (req, res) => {

    try {

        const { id } = req.params;

        const chat = await Chat.findOneAndDelete({
            _id: id,
            userId: req.user._id
        });

        if (!chat) {

            return res.status(404).json({
                success: false,
                message: "Chat not found."
            });

        }

        res.status(200).json({
            success: true,
            message: "Chat deleted successfully."
        });

    } catch (error) {

        console.error(
            "Delete Chat Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to delete chat."
        });
    }
};