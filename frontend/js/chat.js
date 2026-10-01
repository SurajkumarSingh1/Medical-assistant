// =========================================================
// MediAssist AI Medical Chat
// =========================================================

console.log("MediAssist Chat JS loaded successfully.");


// =========================================================
// ELEMENTS
// =========================================================

const messageInput =
    document.getElementById("messageInput");

const sendBtn =
    document.getElementById("sendBtn");

const chatMessages =
    document.getElementById("chatMessages");

const clearChatBtn =
    document.getElementById("clearChat");

const logoutBtn =
    document.getElementById("logoutBtn");


// =========================================================
// API CONFIGURATION
// =========================================================
//
// Local development:
// Frontend → localhost:5500
// Backend  → localhost:5000
//
// Vercel deployment:
// Frontend + API use the same Vercel domain.
// =========================================================

const API_BASE_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : "";

const API_URL =
    `${API_BASE_URL}/api/chat`;


// =========================================================
// CHECK ELEMENTS
// =========================================================

console.log("messageInput:", messageInput);
console.log("sendBtn:", sendBtn);
console.log("chatMessages:", chatMessages);
console.log("API:", API_URL);


// =========================================================
// SEND BUTTON
// =========================================================

if (sendBtn) {

    sendBtn.addEventListener(
        "click",
        function () {

            console.log(
                "Send button clicked."
            );

            sendMessage();

        }
    );

}


// =========================================================
// ENTER KEY
// =========================================================

if (messageInput) {

    messageInput.addEventListener(
        "keydown",
        function (event) {

            // Enter = send
            // Shift + Enter = new line

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );

}


// =========================================================
// SEND MESSAGE
// =========================================================

async function sendMessage() {

    // -----------------------------------------------------
    // CHECK INPUT ELEMENT
    // -----------------------------------------------------

    if (!messageInput) {

        console.error(
            "messageInput element was not found."
        );

        return;

    }


    // -----------------------------------------------------
    // GET MESSAGE
    // -----------------------------------------------------

    const message =
        messageInput.value.trim();


    // -----------------------------------------------------
    // EMPTY MESSAGE
    // -----------------------------------------------------

    if (!message) {

        messageInput.focus();

        return;

    }


    console.log(
        "User message:",
        message
    );


    // -----------------------------------------------------
    // GET LOGIN TOKEN
    // -----------------------------------------------------

    const token =
        localStorage.getItem("token");


    console.log(
        "Token exists:",
        !!token
    );


    // -----------------------------------------------------
    // CHECK LOGIN
    // -----------------------------------------------------

    if (!token) {

        alert(
            "Your session has expired. Please login again."
        );

        window.location.href =
            "login.html";

        return;

    }


    // -----------------------------------------------------
    // DISABLE SEND BUTTON
    // -----------------------------------------------------

    if (sendBtn) {

        sendBtn.disabled = true;

    }


    // -----------------------------------------------------
    // SHOW USER MESSAGE
    // -----------------------------------------------------

    addUserMessage(
        message
    );


    // -----------------------------------------------------
    // CLEAR INPUT
    // -----------------------------------------------------

    messageInput.value = "";

    messageInput.style.height =
        "auto";


    // -----------------------------------------------------
    // SHOW TYPING INDICATOR
    // -----------------------------------------------------

    const typingMessage =
        addTypingMessage();


    try {

        console.log(
            "Sending request to:",
            API_URL
        );


        // =================================================
        // CALL BACKEND
        // =================================================

        const response =
            await fetch(
                API_URL,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        // IMPORTANT:
                        // Send JWT token to protected backend

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify({

                            message:
                                message

                        })

                }
            );


        console.log(
            "Backend status:",
            response.status
        );


        // =================================================
        // REMOVE TYPING INDICATOR
        // =================================================

        removeTypingMessage(
            typingMessage
        );


        // =================================================
        // HTTP ERROR
        // =================================================

        if (!response.ok) {

            let errorMessage =
                "Unable to get a response from MediAssist.";


            try {

                const errorData =
                    await response.json();


                console.error(
                    "Backend error:",
                    errorData
                );


                if (
                    errorData.message
                ) {

                    errorMessage =
                        errorData.message;

                }
                else if (
                    errorData.error
                ) {

                    errorMessage =
                        errorData.error;

                }


                // -----------------------------------------
                // TOKEN ERROR
                // -----------------------------------------

                if (
                    response.status === 401
                ) {

                    localStorage.removeItem(
                        "token"
                    );

                    localStorage.removeItem(
                        "user"
                    );


                    alert(
                        "Your login session has expired. Please login again."
                    );


                    window.location.href =
                        "login.html";


                    return;

                }

            }
            catch (error) {

                console.error(
                    "Could not read backend error:",
                    error
                );

            }


            throw new Error(
                errorMessage
            );

        }


        // =================================================
        // READ RESPONSE
        // =================================================

        const data =
            await response.json();


        console.log(
            "AI response:",
            data
        );


        // =================================================
        // CHECK SUCCESS
        // =================================================

        if (
            data.success === false
        ) {

            throw new Error(
                data.message ||
                "AI response failed."
            );

        }


        // =================================================
        // GET AI RESPONSE TEXT
        // =================================================

        let aiResponse =
            "";


        // Backend returns:
        //
        // {
        //     success: true,
        //     response: "...",
        //     chatId: "..."
        // }


        if (
            typeof data.response ===
            "string"
        ) {

            aiResponse =
                data.response;

        }


        else if (
            typeof data.message ===
            "string"
        ) {

            aiResponse =
                data.message;

        }


        else if (
            typeof data.answer ===
            "string"
        ) {

            aiResponse =
                data.answer;

        }


        else if (
            typeof data.text ===
            "string"
        ) {

            aiResponse =
                data.text;

        }


        else if (
            typeof data.result ===
            "string"
        ) {

            aiResponse =
                data.result;

        }


        // =================================================
        // NO AI RESPONSE
        // =================================================

        if (!aiResponse) {

            console.error(
                "Unexpected backend response:",
                data
            );


            throw new Error(
                "The server returned an empty AI response."
            );

        }


        // =================================================
        // SHOW AI RESPONSE
        // =================================================

        addAIMessage(
            aiResponse
        );


        // =================================================
        // SAVE CHAT LOCALLY
        // =================================================

        saveChatMessage(
            "user",
            message
        );


        saveChatMessage(
            "assistant",
            aiResponse
        );


        console.log(
            "Chat completed successfully."
        );


    }
    catch (error) {

        console.error(
            "Chat error:",
            error
        );


        // -------------------------------------------------
        // REMOVE TYPING
        // -------------------------------------------------

        removeTypingMessage(
            typingMessage
        );


        // -------------------------------------------------
        // SHOW ERROR
        // -------------------------------------------------

        addAIMessage(

            "⚠️ Sorry, I couldn't connect to the AI service right now.\n\n" +

            "Please make sure your MediAssist backend server is running on port 5000 and try again."

        );

    }
    finally {

        // -------------------------------------------------
        // ENABLE SEND BUTTON
        // -------------------------------------------------

        if (sendBtn) {

            sendBtn.disabled =
                false;

        }


        // -------------------------------------------------
        // FOCUS INPUT
        // -------------------------------------------------

        if (messageInput) {

            messageInput.focus();

        }

    }

}


// =========================================================
// ADD USER MESSAGE
// =========================================================

function addUserMessage(
    message
) {

    if (!chatMessages) {

        console.error(
            "chatMessages element was not found."
        );

        return;

    }


    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "message user-message";


    wrapper.innerHTML = `

        <div class="message-content">

            <div class="message-name">
                You
            </div>

            <div class="message-bubble">

                <p></p>

            </div>

        </div>

    `;


    const paragraph =
        wrapper.querySelector(
            "p"
        );


    if (paragraph) {

        paragraph.textContent =
            message;

    }


    chatMessages.appendChild(
        wrapper
    );


    scrollToBottom();

}


// =========================================================
// ADD AI MESSAGE
// =========================================================

function addAIMessage(
    message
) {

    if (!chatMessages) {

        return;

    }


    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "message ai-message";


    wrapper.innerHTML = `

        <div class="message-avatar">
            🤖
        </div>

        <div class="message-content">

            <div class="message-name">
                MediAssist
            </div>

            <div class="message-bubble">

                <p></p>

            </div>

        </div>

    `;


    const paragraph =
        wrapper.querySelector(
            "p"
        );


    if (paragraph) {

        paragraph.innerHTML =
            formatAIResponse(
                message
            );

    }


    chatMessages.appendChild(
        wrapper
    );


    scrollToBottom();

}


// =========================================================
// FORMAT AI RESPONSE
// =========================================================

function formatAIResponse(
    text
) {

    // ---------------------------------------------------------
    // Escape the AI response first for safety
    // ---------------------------------------------------------

    const escaped =
        escapeHTML(
            text
        );


    // ---------------------------------------------------------
    // Format the response line-by-line.
    //
    // Gemini commonly returns:
    //
    // * **Muscle strain or cramp:** explanation...
    // * **Minor injuries:** explanation...
    // * **Nerve irritation:** explanation...
    // * **Circulation issues:** explanation...
    //
    // These headings are converted into highlighted labels.
    // ---------------------------------------------------------

    const lines =
        escaped.split("\n");


    const formattedLines =
        lines.map(
            function (line) {

                const headingMatch =
                    line.match(
                        /^\s*(?:[*-]\s*)?\*\*(.{1,80}?)\*\*\s*:\s*(.*)$/
                    );


                if (!headingMatch) {

                    return line;

                }


                const heading =
                    headingMatch[1].trim();


                const explanation =
                    headingMatch[2].trim();


                const normalizedHeading =
                    heading.toLowerCase();


                // Default heading style

                let headingClass =
                    "heading-general";


                // Muscle / cramp

                if (
                    normalizedHeading.includes("muscle") ||
                    normalizedHeading.includes("cramp")
                ) {

                    headingClass =
                        "heading-muscle";

                }


                // Minor injuries

                else if (
                    normalizedHeading.includes("minor") ||
                    normalizedHeading.includes("injur")
                ) {

                    headingClass =
                        "heading-injury";

                }


                // Nerve irritation

                else if (
                    normalizedHeading.includes("nerve") ||
                    normalizedHeading.includes("irritation")
                ) {

                    headingClass =
                        "heading-nerve";

                }


                // Circulation

                else if (
                    normalizedHeading.includes("circulation") ||
                    normalizedHeading.includes("blood flow")
                ) {

                    headingClass =
                        "heading-circulation";

                }


                // Warning / red flags

                else if (
                    normalizedHeading.includes("warning") ||
                    normalizedHeading.includes("seek medical") ||
                    normalizedHeading.includes("red flag")
                ) {

                    headingClass =
                        "heading-warning";

                }


                // Self care

                else if (
                    normalizedHeading.includes("what you can do") ||
                    normalizedHeading.includes("self care") ||
                    normalizedHeading.includes("self-care")
                ) {

                    headingClass =
                        "heading-care";

                }


                return (

                    '<span class="medical-heading ' +
                    headingClass +
                    '">' +
                    heading +
                    '</span>' +

                    (
                        explanation
                            ? '<div class="medical-heading-text">' +
                              explanation +
                              '</div>'
                            : ''
                    )

                );

            }
        );


    let formatted =
        formattedLines.join(
            "\n"
        );


    // ---------------------------------------------------------
    // Convert remaining markdown bold text
    // ---------------------------------------------------------

    formatted =
        formatted.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


    // ---------------------------------------------------------
    // Convert markdown bullet points
    // ---------------------------------------------------------

    formatted =
        formatted.replace(
            /(^|\n)\s*\*\s+/g,
            "$1• "
        );


    // ---------------------------------------------------------
    // Convert line breaks to HTML
    // ---------------------------------------------------------

    formatted =
        formatted.replace(
            /\n\n/g,
            "<br><br>"
        );


    formatted =
        formatted.replace(
            /\n/g,
            "<br>"
        );


    return formatted;

}


// =========================================================
// TYPING INDICATOR
// =========================================================

function addTypingMessage() {

    if (!chatMessages) {

        return null;

    }


    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "message ai-message typing-message";


    wrapper.innerHTML = `

        <div class="message-avatar">
            🤖
        </div>

        <div class="message-content">

            <div class="message-name">
                MediAssist
            </div>

            <div class="message-bubble">

                <div class="typing-indicator">

                    <span></span>
                    <span></span>
                    <span></span>

                </div>

            </div>

        </div>

    `;


    chatMessages.appendChild(
        wrapper
    );


    scrollToBottom();


    return wrapper;

}


// =========================================================
// REMOVE TYPING INDICATOR
// =========================================================

function removeTypingMessage(
    element
) {

    if (
        element &&
        element.parentNode
    ) {

        element.parentNode.removeChild(
            element
        );

    }

}


// =========================================================
// SCROLL CHAT
// =========================================================

function scrollToBottom() {

    if (!chatMessages) {

        return;

    }


    chatMessages.scrollTop =
        chatMessages.scrollHeight;

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
// SAVE CHAT LOCALLY
// =========================================================

function saveChatMessage(
    sender,
    message
) {

    try {

        const history =
            JSON.parse(

                localStorage.getItem(
                    "mediassist_chat"
                ) || "[]"

            );


        history.push({

            sender:
                sender,

            message:
                message,

            timestamp:
                new Date().toISOString()

        });


        localStorage.setItem(

            "mediassist_chat",

            JSON.stringify(
                history
            )

        );

    }
    catch (error) {

        console.warn(
            "Could not save chat history:",
            error
        );

    }

}


// =========================================================
// CLEAR CHAT
// =========================================================

if (clearChatBtn) {

    clearChatBtn.addEventListener(

        "click",

        function () {

            if (!chatMessages) {

                return;

            }


            // Keep original AI welcome message

            chatMessages.innerHTML = `

                <div class="message ai-message">

                    <div class="message-avatar">
                        🤖
                    </div>

                    <div class="message-content">

                        <div class="message-name">
                            MediAssist
                        </div>

                        <div class="message-bubble">

                            <p>
                                Hello! 👋 I'm your AI Medical Assistant.
                            </p>

                            <p>
                                You can ask me about general health
                                information, symptoms, home care,
                                medicines, nutrition and other
                                health-related topics.
                            </p>

                            <p>
                                <strong>
                                    How can I help you today?
                                </strong>
                            </p>

                        </div>

                    </div>

                </div>

            `;


            localStorage.removeItem(
                "mediassist_chat"
            );


            console.log(
                "Chat cleared."
            );

        }

    );

}


// =========================================================
// AUTO RESIZE TEXTAREA
// =========================================================

if (messageInput) {

    messageInput.addEventListener(

        "input",

        function () {

            this.style.height =
                "auto";


            this.style.height =

                Math.min(

                    this.scrollHeight,

                    160

                ) + "px";

        }

    );

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


    const userName =
        document.getElementById(
            "userName"
        );


    if (
        userName &&
        user.fullName
    ) {

        userName.textContent =
            user.fullName;

    }

}
catch (error) {

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

        function () {

            localStorage.removeItem(
                "token"
            );


            localStorage.removeItem(
                "user"
            );


            localStorage.removeItem(
                "mediassist_chat"
            );


            window.location.href =
                "login.html";

        }

    );

}


// =========================================================
// INITIALIZATION
// =========================================================

console.log(
    "===================================="
);


console.log(
    "MediAssist AI Chat initialized."
);


console.log(
    "API:",
    API_URL
);


console.log(
    "===================================="
);