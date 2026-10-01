import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        userMessage: {
            type: String,
            required: true,
            trim: true
        },

        aiResponse: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;