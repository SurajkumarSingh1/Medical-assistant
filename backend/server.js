import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";
import symptomRoutes from "./routes/symptomRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";

import generateMedicalResponse from "./services/geminiService.js";


// =====================================================
// LOAD ENVIRONMENT VARIABLES
// =====================================================

dotenv.config();


// =====================================================
// CREATE EXPRESS APP
// =====================================================

const app = express();


// =====================================================
// PORT
// =====================================================

const PORT = process.env.PORT || 5000;


// =====================================================
// DATABASE
// =====================================================

connectDB();


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
    cors()
);

app.use(
    express.json()
);


// =====================================================
// API ROUTES
// =====================================================

// Authentication
app.use(
    "/api/auth",
    authRoutes
);


// Normal AI Medical Chat
app.use(
    "/api/chat",
    chatRoutes
);


// Medicine Reminders
app.use(
    "/api/reminders",
    reminderRoutes
);


// AI Symptom Checker
app.use(
    "/api/symptom-check",
    symptomRoutes
);


// Medical Report Scanner
app.use(
    "/api/reports",
    reportRoutes
);

// Nearby Doctors
app.use(
    "/api/doctors",
    doctorRoutes
);


// =====================================================
// HOME / SERVER TEST
// =====================================================

app.get(
    "/",
    (req, res) => {

        res.json({

            success: true,

            message:
                "Medical Assistant Backend is running!"

        });

    }
);


// =====================================================
// GEMINI TEST
// =====================================================

app.get(
    "/test-gemini",
    async (req, res) => {

        try {

            const response =
                await generateMedicalResponse(
                    "I have a mild headache. What general things should I know?"
                );


            res.json({

                success: true,

                response: response

            });


        } catch (error) {

            console.error(
                "Gemini Test Error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    error.message

            });

        }

    }
);


// =====================================================
// LOCAL DEVELOPMENT SERVER
// =====================================================
//
// Vercel handles the Express application itself.
// app.listen() is only used when running the backend
// locally with "npm start".
//
// =====================================================

if (process.env.VERCEL !== "1") {

    app.listen(
        PORT,
        "0.0.0.0",
        () => {

            console.log("");
            console.log("==============================================");
            console.log("       🏥 MEDIASSIST BACKEND SERVER");
            console.log("==============================================");

            console.log("");
            console.log(
                `✅ Server running on port ${PORT}`
            );

        }
    );

}


// =====================================================
// EXPORT EXPRESS APP
// =====================================================

export default app;