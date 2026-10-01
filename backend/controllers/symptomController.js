import {
    generateSymptomQuestion,
    generateSymptomAssessment
} from "../services/geminiService.js";


// =====================================================
// AI SYMPTOM INTERVIEW
// =====================================================

export const symptomInterview = async (req, res) => {

    try {

        const {
            symptoms,
            conversation = []
        } = req.body;


        // =================================================
        // VALIDATE SYMPTOMS
        // =================================================

        if (
            !symptoms ||
            typeof symptoms !== "string" ||
            symptoms.trim() === ""
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please describe your symptoms."

            });

        }


        // =================================================
        // VALIDATE CONVERSATION
        // =================================================

        if (!Array.isArray(conversation)) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid conversation format."

            });

        }


        // =================================================
        // ASK GEMINI FOR NEXT QUESTION
        // =================================================

        const result =
            await generateSymptomQuestion(
                symptoms.trim(),
                conversation
            );
        console.log("========== SYMPTOM AI RESULT ==========");
        console.log(JSON.stringify(result, null, 2));
        console.log("========================================");


        // =================================================
        // IF MORE INFORMATION IS NEEDED
        // =================================================

        if (!result.complete) {

            return res.status(200).json({

                success: true,

                complete: false,

                question:
                    result.question,

                options:
                    Array.isArray(result.options)
                        ? result.options
                        : [],

                questionReason:
                    result.reason || ""

            });

        }


        // =================================================
        // ENOUGH INFORMATION
        // GENERATE FINAL ASSESSMENT
        // =================================================

        const assessment =
            await generateSymptomAssessment(
                symptoms.trim(),
                conversation
            );
        console.log("========== SYMPTOM ASSESSMENT ==========");
        console.log(JSON.stringify(assessment, null, 2));
        console.log("========================================");


        // =================================================
        // RETURN FINAL ASSESSMENT
        // =================================================

        return res.status(200).json({

            success: true,

            complete: true,

            severity:
                assessment.severity || "MODERATE",

            assessment:
                assessment.assessment || "",

            possibleExplanations:
                assessment.possibleExplanations || [],

            guidance:
                assessment.guidance || [],

            warningSigns:
                assessment.warningSigns || [],

            seekMedicalAttention:
                assessment.seekMedicalAttention === true,

            emergency:
                assessment.emergency === true,

            emergencyMessage:
                assessment.emergencyMessage || ""

        });


    } catch (error) {

        console.error(
            "Symptom Controller Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to process the symptom assessment.",

            error:
                error.message

        });

    }

};