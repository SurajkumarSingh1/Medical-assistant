import ai from "../config/gemini.js";

console.log(
    "Gemini API Key loaded:",
    !!process.env.GEMINI_API_KEY
);

/*
=========================================================
MEDIASSIST GEMINI SERVICE
=========================================================

AI CHAT
→ gemini-3.6-flash

SYMPTOM CHECKER
→ gemini-3.1-flash-lite

The symptom checker:
1. Asks dynamic questions
2. Generates 5-8 relevant options
3. Uses previous answers
4. Decides when enough information is collected
5. Generates a final general-health assessment

=========================================================
*/


// =======================================================
// MODELS
// =======================================================

// DO NOT CHANGE THIS.
// Your normal AI Chat is already working.
const CHAT_MODEL = "gemini-3.6-flash";

// Separate model for Symptom Checker.
const SYMPTOM_MODEL = "gemini-3.1-flash-lite";


// =======================================================
// NORMAL MEDICAL CHAT
// =======================================================

const generateMedicalResponse = async (userMessage) => {

    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {

        try {

            const prompt = `
You are MediAssist, an AI medical information assistant.

The user asked:

"${userMessage}"

Provide general health information in simple language.

Important rules:

1. Do not claim to diagnose the user.
2. Do not pretend to be a real doctor.
3. Do not prescribe prescription medicines.
4. Do not give unsafe medication instructions.
5. Discuss possible causes only as possibilities.
6. Mention important warning signs when appropriate.
7. If symptoms could be serious, recommend professional medical care.
8. If the situation appears to be an emergency, clearly recommend immediate emergency medical help.
9. Do not create unnecessary fear.
10. Keep the answer understandable.
11. End with a short medical disclaimer.

Structure the response as:

Possible explanations:
- ...

What you can do:
- ...

When to seek medical help:
- ...

Disclaimer:
This information is for general educational purposes only and is not a medical diagnosis or substitute for professional medical advice.
`;

            console.log(
                `Sending request to Gemini (attempt ${attempt}/${maxRetries})...`
            );

            const response = await ai.models.generateContent({

                model: CHAT_MODEL,

                contents: prompt

            });

            console.log("Gemini response received successfully.");

            return response.text;

        } catch (error) {

            console.error(
                `Gemini attempt ${attempt} failed:`,
                error.message
            );

            // Retry only temporary 503/unavailable errors
            const isTemporaryError =
                error.status === 503 ||
                error.code === 503 ||
                error.message?.includes("503") ||
                error.message?.includes("UNAVAILABLE") ||
                error.message?.includes("high demand");

            if (!isTemporaryError || attempt === maxRetries) {

                console.error("========== GEMINI ERROR ==========");
                console.error("Message:", error.message);
                console.error("Full Error:", error);
                console.error("===================================");

                throw new Error(
                    error.message ||
                    "Unable to get a response from Gemini AI."
                );
            }

            // Exponential backoff:
            // attempt 1 → wait 1 second
            // attempt 2 → wait 2 seconds
            // attempt 3 → final attempt
            const delay = 1000 * Math.pow(2, attempt - 1);

            console.log(
                `Gemini temporarily unavailable. Retrying in ${delay / 1000} seconds...`
            );

            await new Promise(resolve =>
                setTimeout(resolve, delay)
            );
        }
    }
};


// =======================================================
// DYNAMIC SYMPTOM QUESTION
// =======================================================

const generateSymptomQuestion = async (
    symptoms,
    conversation = []
) => {

    try {

        const previousConversation =
            conversation.length > 0
                ? JSON.stringify(
                    conversation,
                    null,
                    2
                )
                : "No questions have been asked yet.";


        const prompt = `
You are MediAssist, an AI medical information assistant.

You are conducting a careful symptom interview.

The patient initially described:

"${symptoms}"

Previous conversation:

${previousConversation}


=========================================================
YOUR JOB
=========================================================

Understand the patient's problem step by step.

Do NOT follow a fixed questionnaire.

Every question must depend on:

- The original symptoms
- Previous questions
- Previous answers


Consider information such as:

- Location
- When symptoms started
- Duration
- Severity
- Whether symptoms are getting better or worse
- Character of the symptom
- Frequency
- Triggers
- What makes it better
- What makes it worse
- Associated symptoms
- Relevant medical history
- Existing conditions
- Current medicines
- Allergies
- Recent food
- Recent travel
- Recent injuries
- Sick contacts
- Possible exposures
- Important warning signs


=========================================================
QUESTION RULES
=========================================================

Ask ONLY ONE question at a time.

Do NOT repeat a question that has already been answered.

Do NOT ask irrelevant generic questions.

The next question must be useful for understanding this
specific patient's situation.


=========================================================
ANSWER OPTIONS
=========================================================

For every question provide 5-8 answer options.

The options MUST be relevant to the exact question.

Do NOT reuse the same options for every question.

Make the options:

- Easy to understand
- Specific
- Realistic
- Relevant

Whenever appropriate, include:

"Other / I want to describe it myself"


=========================================================
INTERVIEW LENGTH
=========================================================

There is NO fixed number of questions.

Simple cases may need fewer questions.

Complex cases may need more questions.

Usually collect around 7-12 useful pieces of information
when appropriate.

Do NOT force exactly 7 questions.

Do NOT force exactly 8 questions.

Do NOT force exactly 10 questions.

Stop when enough information has been collected.


=========================================================
SAFETY
=========================================================

You are NOT diagnosing the patient.

You are collecting information for general health guidance.

If a possible emergency warning sign becomes apparent,
prioritize safety-related questions.

If enough information has been collected and urgent care
may be needed, stop asking unnecessary questions.


=========================================================
OUTPUT
=========================================================

Return ONLY valid JSON.

If another question is needed:

{
    "complete": false,
    "question": "Your question here",
    "options": [
        "Option 1",
        "Option 2",
        "Option 3",
        "Option 4",
        "Option 5"
    ],
    "reason": "Why this question is useful"
}

If enough information has been collected:

{
    "complete": true,
    "question": "",
    "options": [],
    "reason": "Why the interview is complete"
}

IMPORTANT:

When complete is true:

question MUST be an empty string.

options MUST be an empty array.

Do not include markdown.

Do not include any text outside JSON.
`;


        console.log(
            `Gemini Symptom Question Request: ${SYMPTOM_MODEL}`
        );


        const response =
            await ai.models.generateContent({

                model: SYMPTOM_MODEL,

                contents: prompt,

                config: {

                    responseMimeType:
                        "application/json",

                    responseSchema: {

                        type: "object",

                        properties: {

                            complete: {
                                type: "boolean"
                            },

                            question: {
                                type: "string"
                            },

                            options: {

                                type: "array",

                                items: {
                                    type: "string"
                                }

                            },

                            reason: {
                                type: "string"
                            }

                        },

                        required: [
                            "complete",
                            "question",
                            "options",
                            "reason"
                        ]

                    }

                }

            });


        console.log(
            "Gemini Symptom Question Response Received."
        );


        // ===============================================
        // PARSE JSON
        // ===============================================

        const result =
            JSON.parse(response.text);


        // ===============================================
        // VALIDATE RESPONSE
        // ===============================================

        if (
            typeof result.complete !==
            "boolean"
        ) {

            throw new Error(
                "AI response is missing 'complete'."
            );

        }


        // ===============================================
        // VALIDATE QUESTION
        // ===============================================

        if (
            result.complete === false
        ) {

            if (
                !result.question ||
                typeof result.question !==
                "string"
            ) {

                throw new Error(
                    "AI response is missing the question."
                );

            }


            if (
                !Array.isArray(
                    result.options
                )
            ) {

                throw new Error(
                    "AI response is missing options."
                );

            }


            if (
                result.options.length < 5
            ) {

                throw new Error(
                    "AI returned fewer than 5 options."
                );

            }


            if (
                result.options.length > 8
            ) {

                result.options =
                    result.options.slice(0, 8);

            }

        }


        // ===============================================
        // COMPLETE INTERVIEW
        // ===============================================

        if (
            result.complete === true
        ) {

            result.question = "";

            result.options = [];

        }


        return result;


    } catch (error) {

        console.error(
            "Gemini Symptom Question Error:",
            error
        );


        console.error(
            "Error message:",
            error.message
        );


        throw new Error(
            "Unable to generate the next symptom question."
        );

    }

};


// =======================================================
// FINAL SYMPTOM ASSESSMENT
// =======================================================

const generateSymptomAssessment = async (
    symptoms,
    conversation = []
) => {

    try {

        const interview =
            JSON.stringify(
                conversation,
                null,
                2
            );


        const prompt = `
You are MediAssist, an AI medical information assistant.

The patient initially reported:

"${symptoms}"

The symptom interview collected:

${interview}


=========================================================
TASK
=========================================================

Provide a careful GENERAL HEALTH INFORMATION assessment.


=========================================================
IMPORTANT RULES
=========================================================

1. Do NOT diagnose the patient.
2. Do NOT claim certainty.
3. Discuss possible explanations only as possibilities.
4. Base the response ONLY on information provided.
5. Do not invent symptoms.
6. Do not invent medical history.
7. Do not invent medicines.
8. Clearly identify uncertainty.
9. Mention important warning signs when appropriate.
10. If emergency warning signs are present, recommend immediate professional medical attention.
11. Do not prescribe prescription medicines.
12. Do not provide unsafe medication instructions.
13. Keep language understandable.
14. Do not unnecessarily alarm the patient.


=========================================================
SEVERITY
=========================================================

Choose ONE:

LOW
MODERATE
HIGH
URGENT

Use URGENT only when information suggests potentially
serious or emergency symptoms.


=========================================================
OUTPUT
=========================================================

Return ONLY valid JSON.

Use this exact structure:

{
    "severity": "LOW",
    "assessment": "General explanation based on collected information.",
    "possibleExplanations": [
        "Possible explanation 1",
        "Possible explanation 2"
    ],
    "guidance": [
        "General guidance 1",
        "General guidance 2"
    ],
    "warningSigns": [
        "Important warning sign 1"
    ],
    "seekMedicalAttention": false,
    "emergency": false,
    "emergencyMessage": ""
}


If there are no specific warning signs:

"warningSigns": []


If professional medical attention is recommended:

"seekMedicalAttention": true


If emergency care is indicated:

"emergency": true

and provide an appropriate emergency message.


Do not include markdown.

Do not include text outside JSON.
`;


        console.log(
            `Gemini Symptom Assessment Request: ${SYMPTOM_MODEL}`
        );


        const response =
            await ai.models.generateContent({

                model: SYMPTOM_MODEL,

                contents: prompt,

                config: {

                    responseMimeType:
                        "application/json",

                    responseSchema: {

                        type: "object",

                        properties: {

                            severity: {

                                type: "string",

                                enum: [
                                    "LOW",
                                    "MODERATE",
                                    "HIGH",
                                    "URGENT"
                                ]

                            },

                            assessment: {
                                type: "string"
                            },

                            possibleExplanations: {

                                type: "array",

                                items: {
                                    type: "string"
                                }

                            },

                            guidance: {

                                type: "array",

                                items: {
                                    type: "string"
                                }

                            },

                            warningSigns: {

                                type: "array",

                                items: {
                                    type: "string"
                                }

                            },

                            seekMedicalAttention: {
                                type: "boolean"
                            },

                            emergency: {
                                type: "boolean"
                            },

                            emergencyMessage: {
                                type: "string"
                            }

                        },

                        required: [

                            "severity",
                            "assessment",
                            "possibleExplanations",
                            "guidance",
                            "warningSigns",
                            "seekMedicalAttention",
                            "emergency",
                            "emergencyMessage"

                        ]

                    }

                }

            });


        console.log(
            "Gemini Symptom Assessment Response Received."
        );


        // ===============================================
        // PARSE JSON
        // ===============================================

        const result =
            JSON.parse(response.text);


        // ===============================================
        // VALIDATE
        // ===============================================

        if (
            !result.severity ||
            !result.assessment
        ) {

            throw new Error(
                "Invalid symptom assessment response."
            );

        }


        return result;


    } catch (error) {

        console.error(
            "Gemini Symptom Assessment Error:",
            error
        );


        console.error(
            "Error message:",
            error.message
        );


        throw new Error(
            "Unable to generate symptom assessment."
        );

    }

};
// =======================================================
// MEDICAL REPORT / PDF / X-RAY ANALYSIS
// =======================================================

const generateReportAnalysis = async (
    fileBuffer,
    mimeType,
    fileName
) => {

    try {

        console.log("");
        console.log("========================================");
        console.log("GEMINI MEDICAL REPORT ANALYSIS STARTED");
        console.log("========================================");

        console.log(
            "File:",
            fileName
        );

        console.log(
            "Type:",
            mimeType
        );

        console.log(
            "Size:",
            fileBuffer.length,
            "bytes"
        );


        // =================================================
        // CONVERT FILE TO BASE64
        // =================================================

        const base64Data =
            fileBuffer.toString("base64");


        // =================================================
        // MEDICAL ANALYSIS PROMPT
        // =================================================

        const prompt = `

You are MediAssist, an AI medical report
information assistant.

Analyze the uploaded medical document or
medical image carefully.

The uploaded file may be:

- Blood test report
- CBC report
- Liver function test
- Kidney function test
- Thyroid report
- Diabetes report
- Urine report
- General laboratory report
- Prescription/document
- Medical PDF
- X-ray image
- Other medical image

Your job is NOT to diagnose the patient.

Your job is to explain the information
present in the uploaded report in simple
language so that a normal person can
understand it.

IMPORTANT SAFETY RULES:

1. Do not claim to provide a medical diagnosis.

2. Do not pretend to be a doctor.

3. Do not invent values that are not visible
   in the uploaded document.

4. If a value cannot be read clearly,
   write "Not clearly visible".

5. Carefully distinguish between:
   - Normal
   - Low
   - High
   - Borderline
   - Unable to determine

6. If reference ranges are present in the
   report, use those reference ranges.

7. If reference ranges are not available,
   do not invent a reference range.

8. Explain medical terms in simple language.

9. Mention possible reasons for abnormal
   findings, but clearly say they are
   possibilities and not a diagnosis.

10. Mention when professional medical
    consultation may be appropriate.

11. If the report contains an emergency-level
    warning or potentially dangerous finding,
    clearly recommend urgent professional
    medical evaluation.

12. Do not unnecessarily frighten the user.

13. Do not prescribe medicines.

14. Do not change or invent the patient's
    medical information.

15. For X-ray images, describe only visible
    observations that can reasonably be
    identified from the image. Do not claim
    a definitive radiological diagnosis.

16. If the uploaded document is unclear,
    incomplete or unreadable, clearly mention
    that limitation.

Create a detailed but easy-to-understand
medical information report.

Return ONLY valid JSON.

Use this exact structure:

{
    "documentType": "",
    "summary": "",
    "overallStatus": "",
    "patientInformation": {
        "name": "",
        "age": "",
        "gender": "",
        "date": ""
    },
    "findings": [
        {
            "testName": "",
            "value": "",
            "unit": "",
            "referenceRange": "",
            "status": "",
            "explanation": ""
        }
    ],
    "importantFindings": [
        ""
    ],
    "possibleExplanations": [
        ""
    ],
    "whatItMayMean": "",
    "recommendedNextSteps": [
        ""
    ],
    "whenToSeekMedicalHelp": [
        ""
    ],
    "questionsForDoctor": [
        ""
    ],
    "limitations": [
        ""
    ],
    "disclaimer": "This AI-generated explanation is for general educational purposes only and is not a medical diagnosis or a substitute for professional medical advice."
}

`;


        // =================================================
        // SEND FILE + PROMPT TO GEMINI
        // =================================================

        const response =
            await ai.models.generateContent({

                model: CHAT_MODEL,

                contents: [

                    {
                        role: "user",

                        parts: [

                            {
                                text: prompt
                            },

                            {
                                inlineData: {

                                    mimeType:
                                        mimeType,

                                    data:
                                        base64Data

                                }

                            }

                        ]

                    }

                ],

                config: {

                    responseMimeType:
                        "application/json"

                }

            });


        console.log(
            "Gemini report response received."
        );


        // =================================================
        // PARSE RESPONSE
        // =================================================

        let result;


        try {

            result =
                JSON.parse(
                    response.text
                );

        } catch (parseError) {

            console.error(
                "Gemini JSON Parse Error:",
                parseError
            );

            console.error(
                "Raw Gemini Response:",
                response.text
            );

            throw new Error(
                "Gemini returned an invalid report response."
            );

        }


        // =================================================
        // BASIC VALIDATION
        // =================================================

        if (
            !result ||
            !result.documentType ||
            !result.summary
        ) {

            throw new Error(
                "Invalid medical report analysis received from Gemini."
            );

        }


        console.log(
            "Medical report analysis completed successfully."
        );


        return result;


    } catch (error) {

        console.error("");
        console.error(
            "========================================"
        );

        console.error(
            "GEMINI REPORT ANALYSIS ERROR"
        );

        console.error(
            "Message:",
            error.message
        );

        console.error(
            "Full Error:",
            error
        );

        console.error(
            "========================================"
        );


        throw new Error(
            error.message ||
            "Unable to analyze the medical report."
        );

    }

};


// =======================================================
// EXPORTS
// =======================================================

export {
    generateMedicalResponse,
    generateSymptomQuestion,
    generateSymptomAssessment,
    generateReportAnalysis,
    generateSymptomQuestion as generateSymptomInterview
};

export default generateMedicalResponse;