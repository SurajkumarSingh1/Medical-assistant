console.log("MediAssist History JS loaded successfully.");

// =========================================================
// ELEMENTS
// =========================================================

const historyList =
    document.getElementById("historyList");

const historyCount =
    document.getElementById("historyCount");

const searchInput =
    document.getElementById("searchInput");

const logoutBtn =
    document.getElementById("logoutBtn");

const userNameElement =
    document.getElementById("userName");


// =========================================================
// STATE
// =========================================================

let allChats = [];


// =========================================================
// LOAD HISTORY FROM LOCAL STORAGE
// =========================================================

function loadHistory() {

    console.log("Loading chat history from localStorage...");

    if (historyList) {

        historyList.innerHTML = `
            <div class="loading">
                Loading your conversations...
            </div>
        `;

    }


    try {

        const storedHistory =
            localStorage.getItem(
                "mediassist_chat"
            );


        console.log(
            "Stored history:",
            storedHistory
        );


        // No history exists

        if (!storedHistory) {

            allChats = [];

            displayHistory(
                allChats
            );

            return;

        }


        let messages;


        try {

            messages =
                JSON.parse(
                    storedHistory
                );

        } catch (error) {

            console.error(
                "Invalid chat history JSON:",
                error
            );

            allChats = [];

            displayHistory(
                allChats
            );

            return;

        }


        if (!Array.isArray(messages)) {

            allChats = [];

            displayHistory(
                allChats
            );

            return;

        }


        // =================================================
        // CONVERT MESSAGE LIST INTO CONVERSATIONS
        // =================================================

        const conversations = [];


        let currentConversation = null;


        messages.forEach(
            message => {

                if (
                    !message ||
                    !message.sender
                ) {
                    return;
                }


                // -------------------------------
                // USER MESSAGE
                // -------------------------------

                if (
                    message.sender === "user"
                ) {

                    // If a previous conversation
                    // already has a user message
                    // but no AI answer, keep it.

                    currentConversation = {

                        userMessage:
                            message.message || "",

                        aiResponse:
                            "",

                        createdAt:
                            message.timestamp ||
                            new Date().toISOString()

                    };


                    conversations.push(
                        currentConversation
                    );

                }


                // -------------------------------
                // AI MESSAGE
                // -------------------------------

                else if (
                    message.sender === "assistant"
                ) {

                    if (
                        currentConversation
                    ) {

                        currentConversation.aiResponse =
                            message.message || "";

                    }

                }

            }
        );


        allChats =
            conversations.reverse();


        console.log(
            "Processed conversations:",
            allChats
        );


        displayHistory(
            allChats
        );


    } catch (error) {

        console.error(
            "History Error:",
            error
        );


        showError(
            "Unable to load chat history."
        );

    }

}


// =========================================================
// DISPLAY HISTORY
// =========================================================

function displayHistory(
    chats
) {

    if (!historyList) {
        return;
    }


    historyList.innerHTML = "";


    // =================================================
    // NO HISTORY
    // =================================================

    if (
        !chats ||
        chats.length === 0
    ) {

        if (historyCount) {

            historyCount.textContent =
                "No conversations yet.";

        }


        historyList.innerHTML = `
            <div class="empty-history">

                <div class="icon">
                    💬
                </div>

                <h3>
                    No chat history
                </h3>

                <p>
                    Start a conversation with MediAssist AI.
                </p>

                <a href="chat.html">
                    Start AI Chat
                </a>

            </div>
        `;


        return;

    }


    // =================================================
    // COUNT
    // =================================================

    if (historyCount) {

        historyCount.textContent =
            `${chats.length} conversation${
                chats.length !== 1
                    ? "s"
                    : ""
            }`;

    }


    // =================================================
    // CREATE CARDS
    // =================================================

    chats.forEach(
        (
            chat,
            index
        ) => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "history-card";


            const date =
                formatDate(
                    chat.createdAt
                );


            const userMessage =
                escapeHTML(
                    chat.userMessage ||
                    ""
                );


            const aiResponse =
                formatResponse(
                    chat.aiResponse ||
                    ""
                );


            card.innerHTML = `

                <div class="history-header">

                    <div class="history-date">
                        🕘 ${date}
                    </div>

                    <button
                        type="button"
                        class="delete-btn"
                        data-index="${index}"
                    >
                        🗑️ Delete
                    </button>

                </div>


                <div class="question">

                    <strong>
                        You:
                    </strong>

                    <br>

                    ${userMessage}

                </div>


                <div class="answer">

                    <strong>
                        🤖 MediAssist:
                    </strong>

                    <br>

                    ${
                        aiResponse ||
                        "<em>No AI response recorded.</em>"
                    }

                </div>

            `;


            // =================================================
            // DELETE BUTTON
            // =================================================

            const deleteButton =
                card.querySelector(
                    ".delete-btn"
                );


            if (deleteButton) {

                deleteButton.addEventListener(
                    "click",
                    function () {

                        deleteConversation(
                            index
                        );

                    }
                );

            }


            historyList.appendChild(
                card
            );

        }
    );

}


// =========================================================
// DELETE CONVERSATION
// =========================================================

function deleteConversation(
    displayIndex
) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this conversation?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const storedHistory =
            localStorage.getItem(
                "mediassist_chat"
            );


        if (!storedHistory) {
            return;
        }


        const messages =
            JSON.parse(
                storedHistory
            );


        if (
            !Array.isArray(
                messages
            )
        ) {
            return;
        }


        // =================================================
        // CONVERT AGAIN TO FIND ORIGINAL MESSAGE PAIR
        // =================================================

        const conversations = [];


        let currentConversation = null;


        messages.forEach(
            message => {

                if (
                    !message ||
                    !message.sender
                ) {
                    return;
                }


                if (
                    message.sender === "user"
                ) {

                    currentConversation = {

                        userMessage:
                            message.message || "",

                        aiResponse:
                            "",

                        userTimestamp:
                            message.timestamp ||
                            "",

                        aiTimestamp:
                            ""

                    };


                    conversations.push(
                        currentConversation
                    );

                }


                else if (
                    message.sender === "assistant"
                ) {

                    if (
                        currentConversation
                    ) {

                        currentConversation.aiResponse =
                            message.message || "";

                        currentConversation.aiTimestamp =
                            message.timestamp ||
                            "";

                    }

                }

            }
        );


        const reversed =
            conversations.reverse();


        const conversationToDelete =
            reversed[
                displayIndex
            ];


        if (
            !conversationToDelete
        ) {

            alert(
                "Unable to find this conversation."
            );

            return;

        }


        // =================================================
        // REMOVE MATCHING USER + AI MESSAGES
        // =================================================

        const filteredMessages =
            messages.filter(
                message => {

                    const timestamp =
                        message.timestamp;


                    return !(
                        timestamp ===
                        conversationToDelete.userTimestamp

                        ||

                        timestamp ===
                        conversationToDelete.aiTimestamp
                    );

                }
            );


        localStorage.setItem(
            "mediassist_chat",
            JSON.stringify(
                filteredMessages
            )
        );


        // Reload

        loadHistory();


    } catch (error) {

        console.error(
            "Delete conversation error:",
            error
        );


        alert(
            "Unable to delete conversation."
        );

    }

}


// =========================================================
// SEARCH
// =========================================================

function searchHistory() {

    if (!searchInput) {
        return;
    }


    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    // Empty search

    if (!search) {

        displayHistory(
            allChats
        );

        return;

    }


    const filtered =
        allChats.filter(
            chat => {

                const userMessage =
                    String(
                        chat.userMessage ||
                        ""
                    ).toLowerCase();


                const aiResponse =
                    String(
                        chat.aiResponse ||
                        ""
                    ).toLowerCase();


                return (

                    userMessage.includes(
                        search
                    )

                    ||

                    aiResponse.includes(
                        search
                    )

                );

            }
        );


    displayHistory(
        filtered
    );

}


// =========================================================
// DATE FORMAT
// =========================================================

function formatDate(
    dateString
) {

    if (!dateString) {

        return "Unknown date";

    }


    const date =
        new Date(
            dateString
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Unknown date";

    }


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",

            month: "short",

            year: "numeric",

            hour: "2-digit",

            minute: "2-digit"
        }
    );

}


// =========================================================
// FORMAT AI RESPONSE
// =========================================================

function formatResponse(
    text
) {

    if (!text) {
        return "";
    }


    return escapeHTML(
        text
    )
        .replace(
            /\n/g,
            "<br>"
        )
        .replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );

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
// ERROR
// =========================================================

function showError(
    message
) {

    if (historyCount) {

        historyCount.textContent =
            "Unable to load conversations.";

    }


    if (historyList) {

        historyList.innerHTML = `

            <div class="error-message">

                ❌

                ${escapeHTML(
                    message
                )}

            </div>

        `;

    }

}


// =========================================================
// USER NAME
// =========================================================

try {

    const user =
        JSON.parse(
            localStorage.getItem(
                "user"
            ) || "{}"
        );


    if (
        userNameElement &&
        user.fullName
    ) {

        userNameElement.textContent =
            user.fullName;

    }

} catch (error) {

    console.error(
        "Unable to load user information:",
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

            // IMPORTANT:
            // Do NOT delete mediassist_chat here.
            // History should remain available.

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


// =========================================================
// SEARCH INPUT
// =========================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        searchHistory
    );

}


// =========================================================
// START
// =========================================================

loadHistory();