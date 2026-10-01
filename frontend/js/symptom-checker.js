console.log("MediAssist Dynamic Symptom Checker loaded");

// =========================================================
// ELEMENTS
// =========================================================

const symptomsInput = document.getElementById("symptoms");
const charCount = document.getElementById("charCount");
const checkBtn = document.getElementById("checkBtn");

const loading = document.getElementById("loading");

const followupCard = document.getElementById("followupCard");
const questionText = document.getElementById("questionText");
const answerOptions = document.getElementById("answerOptions");
const questionNumber = document.getElementById("questionNumber");
const nextQuestionBtn = document.getElementById("nextQuestionBtn");

const resultCard = document.getElementById("resultCard");

const severityBadge = document.getElementById("severityBadge");
const severityBar = document.getElementById("severityBar");

const assessment = document.getElementById("assessment");
const possibleCauses = document.getElementById("possibleCauses");
const guidance = document.getElementById("guidance");

const emergencyBox = document.getElementById("emergencyBox");
const emergencyText = document.getElementById("emergencyText");

const logoutBtn = document.getElementById("logoutBtn");
const userName = document.getElementById("userName");


// =========================================================
// API
// =========================================================

const API_BASE_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : "";

const API_URL =
    `${API_BASE_URL}/api/symptom-check`;


// =========================================================
// STATE
// =========================================================

let originalSymptoms = "";

let conversation = [];

let currentQuestion = null;

let questionCount = 0;

let selectedAnswer = null;

let assessmentComplete = false;


// =========================================================
// CHARACTER COUNTER
// =========================================================

if (symptomsInput) {

    symptomsInput.addEventListener(
        "input",
        () => {

            const length =
                symptomsInput.value.length;

            if (charCount) {

                charCount.textContent =
                    `${length} / 1000`;

            }

        }
    );

}


// =========================================================
// START SYMPTOM CHECKER
// =========================================================

if (checkBtn) {

    checkBtn.addEventListener(
        "click",
        startSymptomInterview
    );

}


async function startSymptomInterview() {

    const symptoms =
        symptomsInput.value.trim();


    // -----------------------------------------
    // Validate input
    // -----------------------------------------

    if (!symptoms) {

        alert(
            "Please describe your symptoms first."
        );

        symptomsInput.focus();

        return;
    }


    if (symptoms.length < 10) {

        alert(
            "Please provide a little more detail about your symptoms."
        );

        symptomsInput.focus();

        return;
    }


    // -----------------------------------------
    // Reset interview
    // -----------------------------------------

    originalSymptoms =
        symptoms;

    conversation =
        [];

    currentQuestion =
        null;

    questionCount =
        0;

    selectedAnswer =
        null;

    assessmentComplete =
        false;


    // -----------------------------------------
    // Hide previous result
    // -----------------------------------------

    if (resultCard) {

        resultCard.classList.add(
            "hidden"
        );

    }


    if (emergencyBox) {

        emergencyBox.classList.add(
            "hidden"
        );

    }


    // -----------------------------------------
    // Show question section
    // -----------------------------------------

    if (followupCard) {

        followupCard.classList.remove(
            "hidden"
        );

    }


    checkBtn.disabled =
        true;


    showLoadingQuestion();


    await askAIForNextStep();

}


// =========================================================
// ASK AI FOR NEXT STEP
// =========================================================

async function askAIForNextStep() {

    try {

        setQuestionLoading(true);


        console.log(
            "================================="
        );

        console.log(
            "Sending symptom interview request..."
        );

        console.log(
            "Symptoms:",
            originalSymptoms
        );

        console.log(
            "Conversation:",
            conversation
        );


        // -----------------------------------------
        // Send request to backend
        // -----------------------------------------

        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            symptoms:
                                originalSymptoms,

                            conversation:
                                conversation

                        })
                }
            );


        // -----------------------------------------
        // HTTP ERROR
        // -----------------------------------------

        if (!response.ok) {

            let errorMessage =
                "Unable to contact MediAssist.";

            try {

                const errorData =
                    await response.json();

                console.error(
                    "Backend error:",
                    errorData
                );

                if (errorData.message) {

                    errorMessage =
                        errorData.message;

                }

            } catch (error) {

                console.error(
                    "Could not read backend error:",
                    error
                );

            }

            throw new Error(
                errorMessage
            );

        }


        // -----------------------------------------
        // Read JSON
        // -----------------------------------------

        let data =
            await response.json();


        console.log(
            "================================="
        );

        console.log(
            "RAW BACKEND RESPONSE:"
        );

        console.log(
            JSON.stringify(
                data,
                null,
                2
            )
        );

        console.log(
            "================================="
        );


        // =================================================
        // VERY ROBUST RESPONSE NORMALIZATION
        // =================================================

        let result = data;


        // Handle:
        // { result: {...} }

        if (
            result &&
            typeof result.result === "object" &&
            result.result !== null
        ) {

            result =
                result.result;

        }


        // Handle:
        // { data: {...} }

        else if (
            result &&
            typeof result.data === "object" &&
            result.data !== null
        ) {

            result =
                result.data;

        }


        // Handle JSON returned as a string

        if (
            typeof result === "string"
        ) {

            try {

                result =
                    JSON.parse(result);

            } catch (error) {

                console.error(
                    "Could not parse result string:",
                    result
                );

            }

        }


        console.log(
            "NORMALIZED RESULT:"
        );

        console.log(
            JSON.stringify(
                result,
                null,
                2
            )
        );


        // =================================================
        // VALIDATE RESULT
        // =================================================

        if (
            !result ||
            typeof result !== "object"
        ) {

            throw new Error(
                "MediAssist returned an invalid response."
            );

        }


        // =================================================
        // SUCCESS FALSE
        // =================================================

        if (
            result.success === false
        ) {

            throw new Error(
                result.message ||
                "MediAssist could not process the request."
            );

        }


        // =================================================
        // NORMALIZE COMPLETE VALUE
        // =================================================

        let isComplete =
            result.complete === true;


        // Handle string "true"

        if (
            typeof result.complete === "string"
        ) {

            isComplete =
                result.complete.toLowerCase() === "true";

        }


        // =================================================
        // INTERVIEW COMPLETE
        // =================================================

        if (isComplete) {

            console.log(
                "AI says interview is complete."
            );


            assessmentComplete =
                true;


            // -----------------------------------------
            // If assessment is already included
            // -----------------------------------------

            if (

                result.assessment ||

                result.severity ||

                result.possibleExplanations ||

                result.possible_causes

            ) {

                showFinalAssessment(
                    result
                );

                return;

            }


            // -----------------------------------------
            // Ask backend for final assessment
            // -----------------------------------------

            await requestFinalAssessment();

            return;

        }


        // =================================================
        // NEW QUESTION
        // =================================================

        const hasQuestion =
            typeof result.question === "string" &&
            result.question.trim().length > 0;


        if (
            hasQuestion
        ) {

            // -----------------------------------------
            // Get options
            // -----------------------------------------

            let options =
                Array.isArray(result.options)
                    ? result.options
                    : [];


            // Remove invalid options

            options =
                options
                    .filter(
                        option =>
                            typeof option === "string" &&
                            option.trim().length > 0
                    )
                    .map(
                        option =>
                            option.trim()
                    );


            // Remove duplicates

            options =
                [...new Set(options)];


            // -----------------------------------------
            // Save current question
            // -----------------------------------------

            currentQuestion = {

                question:
                    result.question.trim(),

                options:
                    options

            };


            questionCount++;


            console.log(
                "NEW QUESTION:"
            );

            console.log(
                currentQuestion.question
            );

            console.log(
                "OPTIONS:"
            );

            console.log(
                currentQuestion.options
            );


            // -----------------------------------------
            // Display question
            // -----------------------------------------

            showQuestion(
                currentQuestion
            );


            return;

        }


        // =================================================
        // UNEXPECTED RESPONSE
        // =================================================

        console.error(
            "UNEXPECTED RESPONSE:"
        );

        console.error(
            JSON.stringify(
                result,
                null,
                2
            )
        );


        throw new Error(
            "MediAssist returned an unexpected response."
        );


    } catch (error) {

        console.error(
            "Symptom interview error:",
            error
        );


        showQuestionError(
            error.message
        );


    } finally {

        setQuestionLoading(false);


        if (checkBtn) {

            checkBtn.disabled =
                false;

        }

    }

}


// =========================================================
// DISPLAY QUESTION
// =========================================================

function showQuestion(
    question
) {

    if (!questionText) {
        return;
    }


    questionText.textContent =
        question.question;


    if (questionNumber) {

        questionNumber.textContent =
            `Question ${questionCount}`;

    }


    if (!answerOptions) {
        return;
    }


    answerOptions.innerHTML =
        "";


    selectedAnswer =
        null;


    if (nextQuestionBtn) {

        nextQuestionBtn.disabled =
            true;

    }


    // -----------------------------------------
    // AI generated options
    // -----------------------------------------

    if (

        Array.isArray(
            question.options
        ) &&

        question.options.length > 0

    ) {

        showAnswerOptions(
            question.options
        );

    }

    // -----------------------------------------
    // Text answer
    // -----------------------------------------

    else {

        showTextAnswer();

    }

}


// =========================================================
// SHOW OPTIONS
// =========================================================

function showAnswerOptions(
    options
) {

    answerOptions.innerHTML =
        "";


    options.forEach(
        (
            option,
            index
        ) => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "answer-option";


            button.textContent =
                option;


            button.dataset.index =
                index;


            button.addEventListener(
                "click",
                () => {

                    if (
                        isOtherOption(
                            option
                        )
                    ) {

                        selectOtherOption(
                            button
                        );

                    }

                    else {

                        selectOption(
                            button,
                            option
                        );

                    }

                }
            );


            answerOptions.appendChild(
                button
            );

        }
    );

}


// =========================================================
// DETECT OTHER OPTION
// =========================================================

function isOtherOption(
    option
) {

    const value =
        String(
            option
        ).toLowerCase();


    return (

        value.includes("other") ||

        value.includes("describe it") ||

        value.includes("describe myself") ||

        value.includes("something else") ||

        value.includes("own words")

    );

}


// =========================================================
// NORMAL OPTION
// =========================================================

function selectOption(
    button,
    answer
) {

    document
        .querySelectorAll(
            ".answer-option"
        )
        .forEach(
            btn => {

                btn.classList.remove(
                    "selected"
                );

            }
        );


    button.classList.add(
        "selected"
    );


    const customInput =
        document.getElementById(
            "dynamicAnswerInput"
        );


    if (customInput) {

        customInput.remove();

    }


    selectedAnswer =
        answer;


    if (nextQuestionBtn) {

        nextQuestionBtn.disabled =
            false;

    }

}


// =========================================================
// OTHER OPTION
// =========================================================

function selectOtherOption(
    button
) {

    document
        .querySelectorAll(
            ".answer-option"
        )
        .forEach(
            btn => {

                btn.classList.remove(
                    "selected"
                );

            }
        );


    button.classList.add(
        "selected"
    );


    const oldInput =
        document.getElementById(
            "dynamicAnswerInput"
        );


    if (oldInput) {

        oldInput.remove();

    }


    const input =
        document.createElement(
            "textarea"
        );


    input.id =
        "dynamicAnswerInput";


    input.placeholder =
        "Please describe it in your own words...";


    input.rows =
        4;


    input.style.width =
        "100%";

    input.style.marginTop =
        "12px";

    input.style.padding =
        "14px";

    input.style.border =
        "1px solid #dbe4ee";

    input.style.borderRadius =
        "10px";

    input.style.fontFamily =
        "inherit";

    input.style.fontSize =
        "14px";

    input.style.resize =
        "vertical";

    input.style.boxSizing =
        "border-box";


    input.addEventListener(
        "input",
        () => {

            selectedAnswer =
                input.value.trim();


            if (nextQuestionBtn) {

                nextQuestionBtn.disabled =
                    selectedAnswer.length === 0;

            }

        }
    );


    answerOptions.appendChild(
        input
    );


    input.focus();


    selectedAnswer =
        null;


    if (nextQuestionBtn) {

        nextQuestionBtn.disabled =
            true;

    }

}


// =========================================================
// TEXT ANSWER
// =========================================================

function showTextAnswer() {

    answerOptions.innerHTML =
        "";


    const input =
        document.createElement(
            "textarea"
        );


    input.id =
        "dynamicAnswerInput";


    input.placeholder =
        "Type your answer here...";


    input.rows =
        4;


    input.style.width =
        "100%";

    input.style.padding =
        "14px";

    input.style.border =
        "1px solid #dbe4ee";

    input.style.borderRadius =
        "10px";

    input.style.fontFamily =
        "inherit";

    input.style.fontSize =
        "14px";

    input.style.resize =
        "vertical";

    input.style.boxSizing =
        "border-box";


    input.addEventListener(
        "input",
        () => {

            selectedAnswer =
                input.value.trim();


            if (nextQuestionBtn) {

                nextQuestionBtn.disabled =
                    selectedAnswer.length === 0;

            }

        }
    );


    answerOptions.appendChild(
        input
    );

}


// =========================================================
// NEXT BUTTON
// =========================================================

if (nextQuestionBtn) {

    nextQuestionBtn.addEventListener(
        "click",
        submitAnswer
    );

}


// =========================================================
// SUBMIT ANSWER
// =========================================================

async function submitAnswer() {

    if (!selectedAnswer) {

        alert(
            "Please select an answer first."
        );

        return;

    }


    if (!currentQuestion) {

        alert(
            "No question is currently active."
        );

        return;

    }


    // -----------------------------------------
    // Save question + answer
    // -----------------------------------------

    conversation.push({

        question:
            currentQuestion.question,

        answer:
            selectedAnswer

    });


    console.log(
        "================================="
    );

    console.log(
        "ANSWER SAVED:"
    );

    console.log(
        conversation[
            conversation.length - 1
        ]
    );

    console.log(
        "TOTAL QUESTIONS:",
        conversation.length
    );

    console.log(
        "================================="
    );


    selectedAnswer =
        null;


    if (nextQuestionBtn) {

        nextQuestionBtn.disabled =
            true;

    }


    // -----------------------------------------
    // Ask AI for next question
    // -----------------------------------------

    await askAIForNextStep();

}


// =========================================================
// REQUEST FINAL ASSESSMENT
// =========================================================

async function requestFinalAssessment() {

    try {

        setQuestionLoading(true);


        console.log(
            "Requesting final assessment..."
        );


        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            symptoms:
                                originalSymptoms,

                            conversation:
                                conversation,

                            action:
                                "assessment"

                        })

                }
            );


        if (!response.ok) {

            let message =
                "Unable to generate the final assessment.";


            try {

                const errorData =
                    await response.json();


                if (
                    errorData.message
                ) {

                    message =
                        errorData.message;

                }

            } catch (error) {

                console.error(
                    error
                );

            }


            throw new Error(
                message
            );

        }


        const data =
            await response.json();


        console.log(
            "FINAL ASSESSMENT RESPONSE:"
        );

        console.log(
            JSON.stringify(
                data,
                null,
                2
            )
        );


        let result =
            data;


        if (
            result &&
            typeof result.result === "object" &&
            result.result !== null
        ) {

            result =
                result.result;

        }

        else if (
            result &&
            typeof result.data === "object" &&
            result.data !== null
        ) {

            result =
                result.data;

        }


        if (
            result.success === false
        ) {

            throw new Error(
                result.message ||
                "Unable to generate final assessment."
            );

        }


        showFinalAssessment(
            result
        );


    } catch (error) {

        console.error(
            "Final assessment error:",
            error
        );


        showQuestionError(
            error.message
        );


    } finally {

        setQuestionLoading(false);

    }

}


// =========================================================
// SHOW FINAL ASSESSMENT
// =========================================================

function showFinalAssessment(
    data
) {

    console.log(
        "Displaying final assessment:",
        data
    );


    if (followupCard) {

        followupCard.classList.add(
            "hidden"
        );

    }


    if (resultCard) {

        resultCard.classList.remove(
            "hidden"
        );

    }


    // -----------------------------------------
    // Assessment
    // -----------------------------------------

    if (assessment) {

        assessment.textContent =
            data.assessment ||

            "The information provided is not enough to determine a specific cause.";

    }


    // -----------------------------------------
    // Possible explanations
    // -----------------------------------------

    const causes =
        Array.isArray(
            data.possibleExplanations
        )

            ? data.possibleExplanations

            : Array.isArray(
                data.possible_causes
            )

                ? data.possible_causes

                : [];


    if (possibleCauses) {

        if (
            causes.length > 0
        ) {

            possibleCauses.innerHTML =
                causes
                    .map(
                        cause =>
                            `• ${escapeHTML(
                                cause
                            )}`
                    )
                    .join(
                        "<br>"
                    );

        }

        else {

            possibleCauses.textContent =
                "There are several possible explanations. A healthcare professional can determine the cause more accurately.";

        }

    }


    // -----------------------------------------
    // General guidance
    // -----------------------------------------

    if (guidance) {

        if (
            Array.isArray(
                data.guidance
            )
        ) {

            guidance.innerHTML =
                data.guidance
                    .map(
                        item =>
                            `• ${escapeHTML(
                                item
                            )}`
                    )
                    .join(
                        "<br>"
                    );

        }

        else {

            guidance.textContent =
                data.guidance ||

                "Monitor your symptoms and seek professional medical advice if they persist or worsen.";

        }

    }


    // -----------------------------------------
    // Severity
    // -----------------------------------------

    const severity =
        data.severity ||

        data.urgency ||

        "MODERATE";


    const normalizedSeverity =
        normalizeSeverity(
            severity
        );


    setSeverity(
        normalizedSeverity
    );


    // -----------------------------------------
    // Emergency
    // -----------------------------------------

    if (

        data.emergency === true ||

        normalizedSeverity === "Urgent"

    ) {

        if (emergencyBox) {

            emergencyBox.classList.remove(
                "hidden"
            );

        }


        if (emergencyText) {

            emergencyText.textContent =

                data.emergencyMessage ||

                data.emergency_message ||

                "Some symptoms may require urgent medical attention. Please seek appropriate professional or emergency care.";

        }

    }

    else {

        if (emergencyBox) {

            emergencyBox.classList.add(
                "hidden"
            );

        }

    }


    // -----------------------------------------
    // Scroll to result
    // -----------------------------------------

    if (resultCard) {

        resultCard.scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"

        });

    }

}


// =========================================================
// NORMALIZE SEVERITY
// =========================================================

function normalizeSeverity(
    severity
) {

    if (!severity) {

        return "Moderate";

    }


    const value =
        String(
            severity
        )
            .toLowerCase()
            .trim();


    if (

        value.includes(
            "urgent"
        ) ||

        value.includes(
            "emergency"
        )

    ) {

        return "Urgent";

    }


    if (

        value.includes(
            "high"
        ) ||

        value.includes(
            "severe"
        )

    ) {

        return "High";

    }


    if (

        value.includes(
            "low"
        ) ||

        value.includes(
            "mild"
        )

    ) {

        return "Low";

    }


    return "Moderate";

}


// =========================================================
// SET SEVERITY UI
// =========================================================

function setSeverity(
    level
) {

    if (severityBadge) {

        severityBadge.textContent =
            level;

    }


    if (!severityBar) {
        return;
    }


    if (
        level === "Low"
    ) {

        severityBar.style.width =
            "25%";

        severityBar.style.background =
            "#22c55e";

    }

    else if (
        level === "Moderate"
    ) {

        severityBar.style.width =
            "50%";

        severityBar.style.background =
            "#f59e0b";

    }

    else if (
        level === "High"
    ) {

        severityBar.style.width =
            "75%";

        severityBar.style.background =
            "#f97316";

    }

    else {

        severityBar.style.width =
            "100%";

        severityBar.style.background =
            "#ef4444";

    }

}


// =========================================================
// LOADING QUESTION
// =========================================================

function showLoadingQuestion() {

    if (questionText) {

        questionText.textContent =
            "Let me understand your symptoms...";

    }


    if (questionNumber) {

        questionNumber.textContent =
            "Analyzing";

    }


    if (answerOptions) {

        answerOptions.innerHTML =
            `
            <div class="ai-thinking">

                <div class="small-spinner"></div>

                <span>
                    MediAssist is reviewing your symptoms...
                </span>

            </div>
            `;

    }


    if (nextQuestionBtn) {

        nextQuestionBtn.disabled =
            true;

    }

}


// =========================================================
// QUESTION LOADING
// =========================================================

function setQuestionLoading(
    isLoading
) {

    if (!isLoading) {
        return;
    }


    if (nextQuestionBtn) {

        nextQuestionBtn.disabled =
            true;

    }


    if (answerOptions) {

        answerOptions.innerHTML =
            `
            <div class="ai-thinking">

                <div class="small-spinner"></div>

                <span>
                    MediAssist is thinking...
                </span>

            </div>
            `;

    }

}


// =========================================================
// QUESTION ERROR
// =========================================================

function showQuestionError(
    message
) {

    if (questionText) {

        questionText.textContent =
            "We couldn't continue the symptom interview.";

    }


    if (questionNumber) {

        questionNumber.textContent =
            "Connection error";

    }


    if (answerOptions) {

        answerOptions.innerHTML =
            `
            <div class="question-error">

                <strong>
                    MediAssist could not contact the AI service.
                </strong>

                <p>
                    ${escapeHTML(
                        message ||
                        "Please try again."
                    )}
                </p>

                <button
                    type="button"
                    id="retryQuestionBtn"
                    class="answer-option"
                >
                    Try Again
                </button>

            </div>
            `;

    }


    if (nextQuestionBtn) {

        nextQuestionBtn.disabled =
            true;

    }


    const retryButton =
        document.getElementById(
            "retryQuestionBtn"
        );


    if (retryButton) {

        retryButton.addEventListener(
            "click",
            async () => {

                await askAIForNextStep();

            }
        );

    }

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHTML(
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(
            text ?? ""
        );


    return div.innerHTML;

}


// =========================================================
// LOAD USER NAME
// =========================================================

try {

    const user =
        JSON.parse(
            localStorage.getItem(
                "user"
            ) || "{}"
        );


    if (

        userName &&

        user.fullName

    ) {

        userName.textContent =
            user.fullName;

    }

} catch (error) {

    console.warn(
        "Could not load user information.",
        error
    );

}


// =========================================================
// LOGOUT
// =========================================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "token"
            );


            localStorage.removeItem(
                "user"
            );


            window.location.href =
                "login.html";

        }
    );

}


console.log(
    "MediAssist Symptom Checker initialized successfully."
);