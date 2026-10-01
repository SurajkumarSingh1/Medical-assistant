import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        medicineName: {
            type: String,
            required: true,
            trim: true
        },

        dosage: {
            type: String,
            required: true,
            trim: true
        },

        date: {
            type: String,
            required: true
        },

        time: {
            type: String,
            required: true
        },

        notes: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const Reminder = mongoose.model(
    "Reminder",
    reminderSchema
);

export default Reminder;