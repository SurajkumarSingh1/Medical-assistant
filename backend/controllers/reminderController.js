import Reminder from "../models/Reminder.js";


// ================= ADD REMINDER =================

export const addReminder = async (req, res) => {

    try {

        const {
            medicineName,
            dosage,
            date,
            time,
            notes
        } = req.body;


        if (
            !medicineName ||
            !dosage ||
            !date ||
            !time
        ) {

            return res.status(400).json({
                success: false,
                message: "Medicine name, dosage, date and time are required."
            });

        }


        const reminder = await Reminder.create({

            userId: req.user._id,

            medicineName,

            dosage,

            date,

            time,

            notes: notes || ""

        });


        res.status(201).json({

            success: true,

            message: "Reminder added successfully.",

            reminder

        });


    } catch (error) {

        console.error(
            "Add Reminder Error:",
            error
        );

        res.status(500).json({

            success: false,

            message: "Unable to add reminder."

        });

    }
};



// ================= GET REMINDERS =================

export const getReminders = async (req, res) => {

    try {

        const reminders = await Reminder.find({

            userId: req.user._id

        }).sort({

            date: 1,

            time: 1

        });


        res.status(200).json({

            success: true,

            reminders

        });


    } catch (error) {

        console.error(
            "Get Reminders Error:",
            error
        );

        res.status(500).json({

            success: false,

            message: "Unable to fetch reminders."

        });

    }
};



// ================= DELETE REMINDER =================

export const deleteReminder = async (req, res) => {

    try {

        const { id } = req.params;


        const reminder =
            await Reminder.findOneAndDelete({

                _id: id,

                userId: req.user._id

            });


        if (!reminder) {

            return res.status(404).json({

                success: false,

                message: "Reminder not found."

            });

        }


        res.status(200).json({

            success: true,

            message: "Reminder deleted successfully."

        });


    } catch (error) {

        console.error(
            "Delete Reminder Error:",
            error
        );

        res.status(500).json({

            success: false,

            message: "Unable to delete reminder."

        });

    }
};