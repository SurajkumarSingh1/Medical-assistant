import {
    generateReportAnalysis
} from "../services/geminiService.js";


// =====================================================
// ANALYZE MEDICAL REPORT
// =====================================================

export const analyzeReport = async (req, res) => {

    try {

        // -------------------------------------------------
        // CHECK FILE
        // -------------------------------------------------

        if (!req.file) {

            return res.status(400).json({
                success: false,
                message: "Please upload a medical report."
            });

        }


        const file = req.file;


        // -------------------------------------------------
        // FILE INFORMATION
        // -------------------------------------------------

        const fileName = file.originalname;
        const fileType = file.mimetype;
        const fileSize = file.size;


        console.log("");
        console.log("==============================================");
        console.log("📄 MEDICAL REPORT UPLOAD");
        console.log("==============================================");

        console.log("File:", fileName);
        console.log("Type:", fileType);
        console.log("Size:", fileSize, "bytes");


        // -------------------------------------------------
        // SEND ACTUAL FILE TO GEMINI
        // -------------------------------------------------

        const analysis = await generateReportAnalysis(
            file.buffer,
            fileType,
            fileName
        );


        // -------------------------------------------------
        // SEND RESULT TO FRONTEND
        // -------------------------------------------------

        return res.status(200).json({

            success: true,

            message: "Report analyzed successfully.",

            file: {
                name: fileName,
                type: fileType,
                size: fileSize
            },

            analysis: analysis

        });


    } catch (error) {

        console.error("");
        console.error("==============================================");
        console.error("❌ REPORT ANALYSIS ERROR");
        console.error("==============================================");

        console.error(error);


        return res.status(500).json({

            success: false,

            message:
                "Unable to analyze the medical report.",

            error:
                error.message

        });

    }

};