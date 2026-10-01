console.log("MediAssist reminder.js loaded");

"use strict";


// =====================================================
// API CONFIGURATION
// =====================================================
//
// Local development:
// Frontend → localhost:5500
// Backend  → localhost:5000
//
// Vercel deployment:
// Frontend + API use the same Vercel domain.
// =====================================================

const API_BASE_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : "";

"use strict";

function $(id) {
    return document.getElementById(id);
}

const MEDICINE_KEY = "advancedMedicines";
const BASIC_REMINDER_KEY = "basicReminderAlarms";
const ACTIVITY_KEY = "medicationActivity";
const TRIGGER_KEY = "medicineAlarmTriggers";
const SNOOZE_KEY = "medicineSnooze";

let audioContext = null;
let alarmInterval = null;
let currentMedicine = null;

function getToken() {
    return localStorage.getItem("token");
}

function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = value || "";
    return div.innerHTML;
}

function pad(number) {
    return String(number).padStart(2, "0");
}

function getTodayDate() {
    const now = new Date();

    return (
        now.getFullYear() +
        "-" +
        pad(now.getMonth() + 1) +
        "-" +
        pad(now.getDate())
    );
}

function getCurrentTime() {
    const now = new Date();

    return (
        pad(now.getHours()) +
        ":" +
        pad(now.getMinutes())
    );
}

function format12Hour(time) {

    if (!time) return "";

    const parts = time.split(":");

    let hour = parseInt(parts[0]);
    const minute = parts[1];

    const ampm = hour >= 12 ? "PM" : "AM";

    hour = hour % 12;

    if (hour === 0) {
        hour = 12;
    }

    return hour + ":" + minute + " " + ampm;
}

function updateClock() {

    const now = new Date();

    const timeElement = $("currentTime");
    const dateElement = $("currentDate");

    if (timeElement) {

        timeElement.textContent =
            now.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
                second: "2-digit"
            });
    }

    if (dateElement) {

        dateElement.textContent =
            now.toLocaleDateString([], {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            });
    }
}

function getMedicines() {

    try {

        return JSON.parse(
            localStorage.getItem(MEDICINE_KEY) || "[]"
        );

    } catch (error) {

        console.error(error);

        return [];
    }
}

function getBasicAlarmReminders() {

    try {

        return JSON.parse(
            localStorage.getItem(
                BASIC_REMINDER_KEY
            ) || "[]"
        );

    } catch (error) {

        console.error(
            "Basic alarm reminder error:",
            error
        );

        return [];
    }
}

function saveMedicines(medicines) {

    localStorage.setItem(
        MEDICINE_KEY,
        JSON.stringify(medicines)
    );
}

function getActivity() {

    try {

        return JSON.parse(
            localStorage.getItem(
                ACTIVITY_KEY
            ) || "[]"
        );

    } catch (error) {

        return [];
    }
}

function addActivity(medicine, action) {

    const activity = getActivity();

    activity.unshift({

        id: Date.now(),

        medicineId: medicine.id,

        medicineName: medicine.name,

        dosage: medicine.dosage,

        action: action,

        time: new Date().toISOString()
    });

    localStorage.setItem(
        ACTIVITY_KEY,
        JSON.stringify(
            activity.slice(0, 100)
        )
    );
}

function loadUserName() {

    const element = $("userName");

    if (!element) return;

    try {

        const user = JSON.parse(
            localStorage.getItem(
                "user"
            ) || "{}"
        );

        if (user.fullName) {

            element.textContent =
                user.fullName;
        }

    } catch (error) {

        console.error(error);
    }
}

function setupLogout() {

    const logoutButton =
        $("logoutBtn");

    if (!logoutButton) return;

    logoutButton.addEventListener(
        "click",
        function () {

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

async function loadReminders() {

    const list =
        $("remindersList");

    const count =
        $("reminderCount");

    if (!list) return;

    list.innerHTML = `
        <div class="loading">
            ⏳ Loading reminders...
        </div>
    `;

    const token =
        getToken();

    if (!token) {

        list.innerHTML = `
            <div class="error-message">
                ❌ Please login first.
            </div>
        `;

        return;
    }

    try {

        const response =
            await fetch(
    `${API_BASE_URL}/api/reminders`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );

        const data =
            await response.json();

        console.log(
            "Basic reminders:",
            data
        );

        if (data.success) {

            const reminders =
                data.reminders || [];

            const alarmReminders =
                reminders.map(
                    function(reminder) {

                        return {

                            id:
                                String(
                                    reminder._id
                                ),

                            name:
                                reminder.medicineName,

                            dosage:
                                reminder.dosage,

                            date:
                                reminder.date,

                            time:
                                reminder.time,

                            repeat:
                                "once",

                            status:
                                "pending",

                            notes:
                                reminder.notes ||
                                "",

                            source:
                                "basic",

                            backendId:
                                String(
                                    reminder._id
                                )
                        };
                    }
                );

            localStorage.setItem(
                BASIC_REMINDER_KEY,
                JSON.stringify(
                    alarmReminders
                )
            );

            displayReminders(
                reminders
            );

        } else {

            list.innerHTML = `
                <div class="error-message">
                    ❌ ${escapeHTML(
                        data.message ||
                        "Unable to load reminders."
                    )}
                </div>
            `;
        }

    } catch (error) {

        console.error(
            "Load reminder error:",
            error
        );

        list.innerHTML = `
            <div class="error-message">
                ❌ Cannot connect to server.
                <br>
                Make sure your backend is running.
            </div>
        `;
    }
}

function displayReminders(reminders) {

    const list =
        $("remindersList");

    const count =
        $("reminderCount");

    if (!list) {

        console.error(
            "remindersList element not found."
        );

        return;
    }

    if (!Array.isArray(reminders)) {

        reminders = [];
    }

    list.innerHTML = "";

    const total =
        reminders.length;

    if (count) {

        count.textContent =
            `${total} ${
                total === 1
                    ? "reminder"
                    : "reminders"
            }`;
    }

    const totalReminders =
        document.getElementById(
            "totalReminders"
        );

    if (totalReminders) {

        totalReminders.textContent =
            total;
    }

    if (total === 0) {

        list.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    💊
                </div>

                <h3>
                    No medicine reminders
                </h3>

                <p>
                    Add your first medicine reminder to start
                    managing your medication schedule.
                </p>

            </div>
        `;

        return;
    }

    const sortedReminders =
        [...reminders].sort(
            function(a, b) {

                const dateA =
                    new Date(
                        `${
                            a.date ||
                            "9999-12-31"
                        }T${
                            a.time ||
                            "23:59"
                        }`
                    );

                const dateB =
                    new Date(
                        `${
                            b.date ||
                            "9999-12-31"
                        }T${
                            b.time ||
                            "23:59"
                        }`
                    );

                return dateA - dateB;
            }
        );

    sortedReminders.forEach(
        function(reminder) {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "reminder-card";

            const medicineName =
                escapeReminderHTML(
                    reminder.medicineName ||
                    reminder.name ||
                    "Medicine"
                );

            const dosage =
                escapeReminderHTML(
                    reminder.dosage ||
                    "Dosage not specified"
                );

            const date =
                reminder.date || "";

            const time =
                reminder.time || "";

            const notes =
                escapeReminderHTML(
                    reminder.notes || ""
                );

            let formattedDate =
                date || "No date";

            if (date) {

                const parsedDate =
                    new Date(
                        `${date}T00:00:00`
                    );

                if (
                    !isNaN(
                        parsedDate.getTime()
                    )
                ) {

                    formattedDate =
                        parsedDate.toLocaleDateString(
                            "en-IN",
                            {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                            }
                        );
                }
            }

            let formattedTime =
                time || "No time";

            if (time) {

                const timeParts =
                    time.split(":");

                if (
                    timeParts.length >= 2
                ) {

                    const timeDate =
                        new Date();

                    timeDate.setHours(
                        Number(
                            timeParts[0]
                        ),
                        Number(
                            timeParts[1]
                        ),
                        0,
                        0
                    );

                    if (
                        !isNaN(
                            timeDate.getTime()
                        )
                    ) {

                        formattedTime =
                            timeDate.toLocaleTimeString(
                                "en-IN",
                                {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true
                                }
                            );
                    }
                }
            }

            let statusText =
                "Upcoming";

            let statusClass =
                "upcoming";

            if (date && time) {

                const reminderDateTime =
                    new Date(
                        `${date}T${time}`
                    );

                const now =
                    new Date();

                if (
                    !isNaN(
                        reminderDateTime.getTime()
                    )
                ) {

                    if (
                        reminderDateTime <
                        now
                    ) {

                        statusText =
                            "Scheduled";

                        statusClass =
                            "scheduled";

                    } else {

                        const today =
                            new Date();

                        const reminderDay =
                            new Date(
                                reminderDateTime
                            );

                        today.setHours(
                            0,
                            0,
                            0,
                            0
                        );

                        reminderDay.setHours(
                            0,
                            0,
                            0,
                            0
                        );

                        if (
                            reminderDay.getTime() ===
                            today.getTime()
                        ) {

                            statusText =
                                "Today";

                            statusClass =
                                "today";
                        }
                    }
                }
            }

            let createdText =
                "";

            if (
                reminder.createdAt
            ) {

                const createdDate =
                    new Date(
                        reminder.createdAt
                    );

                if (
                    !isNaN(
                        createdDate.getTime()
                    )
                ) {

                    createdText =
                        `Added ${
                            createdDate.toLocaleDateString(
                                "en-IN",
                                {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric"
                                }
                            )
                        }`;
                }
            }

            card.innerHTML = `

                <div class="reminder-card-top">

                    <div class="medicine-main-info">

                        <div class="medicine-icon">
                            💊
                        </div>

                        <div class="medicine-text">

                            <h3 class="medicine-name">
                                ${medicineName}
                            </h3>

                            <span class="medicine-dosage">
                                ${dosage}
                            </span>

                        </div>

                    </div>

                    <span
                        class="reminder-status ${statusClass}"
                    >
                        ${statusText}
                    </span>

                </div>

                <div class="reminder-card-details">

                    <div class="reminder-detail">

                        <span class="detail-icon">
                            📅
                        </span>

                        <div>

                            <span class="detail-label">
                                Date
                            </span>

                            <strong>
                                ${formattedDate}
                            </strong>

                        </div>

                    </div>

                    <div class="reminder-detail">

                        <span class="detail-icon">
                            ⏰
                        </span>

                        <div>

                            <span class="detail-label">
                                Time
                            </span>

                            <strong>
                                ${formattedTime}
                            </strong>

                        </div>

                    </div>

                </div>

                ${
                    notes
                        ? `
                            <div class="reminder-notes">

                                <span>
                                    📝
                                </span>

                                <div>

                                    <strong>
                                        Notes
                                    </strong>

                                    <p>
                                        ${notes}
                                    </p>

                                </div>

                            </div>
                          `
                        : ""
                }

                <div class="reminder-card-footer">

                    <span class="reminder-created">
                        ${createdText}
                    </span>

                    <button
                        type="button"
                        class="delete-reminder"
                        title="Delete reminder"
                    >
                        🗑️ Delete
                    </button>

                </div>
            `;

            const deleteButton =
                card.querySelector(
                    ".delete-reminder"
                );

            if (deleteButton) {

                deleteButton.addEventListener(
                    "click",
                    function() {

                        deleteReminder(
                            reminder._id
                        );
                    }
                );
            }

            list.appendChild(card);
        }
    );
}

function escapeReminderHTML(value) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}

function setupReminderForm() {

    const form =
        $("reminderForm");

    if (!form) return;

    form.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            unlockAlarmAudio();

            const medicineName =
                $("medicineName")?.value.trim();

            const dosage =
                $("dosage")?.value.trim();

            const date =
                $("date")?.value;

            const time =
                $("time")?.value;

            const notes =
                $("notes")?.value.trim();

            if (
                !medicineName ||
                !dosage ||
                !date ||
                !time
            ) {

                alert(
                    "⚠️ Please fill Medicine Name, Dosage, Date and Time."
                );

                return;
            }

            const token =
                getToken();

            if (!token) {

                alert(
                    "Please login first."
                );

                window.location.href =
                    "login.html";

                return;
            }

            try {

                const response =
                    await fetch(
    `${API_BASE_URL}/api/reminders`,
                        {
                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`
                            },

                            body:
                                JSON.stringify({

                                    medicineName:
                                        medicineName,

                                    dosage:
                                        dosage,

                                    date:
                                        date,

                                    time:
                                        time,

                                    notes:
                                        notes
                                })
                        }
                    );

                const data =
                    await response.json();

                console.log(
                    "Add reminder response:",
                    data
                );

                if (data.success) {

                    alert(
                        "✅ Medicine reminder added successfully!"
                    );

                    form.reset();

                    loadReminders();

                } else {

                    alert(
                        "❌ " +
                        (
                            data.message ||
                            "Unable to add reminder."
                        )
                    );
                }

            } catch (error) {

                console.error(
                    "Add reminder error:",
                    error
                );

                alert(
                    "❌ Cannot connect to server. Make sure backend is running."
                );
            }
        }
    );
}

async function deleteReminder(id) {

    if (!id) {

        alert(
            "Invalid reminder ID."
        );

        return;
    }

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this reminder?"
        );

    if (!confirmDelete) {

        return;
    }

    const token =
        getToken();

    if (!token) {

        alert(
            "Please login first."
        );

        return;
    }

    try {

        const response =
            await fetch(
    `${API_BASE_URL}/api/reminders/${id}`,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );

        const data =
            await response.json();

        console.log(
            "Delete reminder response:",
            data
        );

        if (data.success) {

            alert(
                "🗑️ Reminder deleted successfully."
            );

            const basicReminders =
                getBasicAlarmReminders();

            const updatedBasicReminders =
                basicReminders.filter(
                    function(reminder) {

                        return String(
                            reminder.id
                        ) !== String(id);
                    }
                );

            localStorage.setItem(
                BASIC_REMINDER_KEY,
                JSON.stringify(
                    updatedBasicReminders
                )
            );

            loadReminders();

        } else {

            alert(
                "❌ " +
                (
                    data.message ||
                    "Unable to delete reminder."
                )
            );
        }

    } catch (error) {

        console.error(
            "Delete reminder error:",
            error
        );

        alert(
            "❌ Cannot connect to server."
        );
    }
}

function setupAdvancedReminder() {

    const button =
        $("advancedAddBtn");

    if (!button) return;

    button.addEventListener(
        "click",
        addAdvancedMedicine
    );
}

function addAdvancedMedicine() {

    const name =
        $("advMedicineName")?.value.trim();

    const dosage =
        $("advDosage")?.value.trim();

    const date =
        $("advDate")?.value;

    const time =
        $("advTime")?.value;

    const repeat =
        $("advRepeat")?.value ||
        "once";

    if (
        !name ||
        !dosage ||
        !date ||
        !time
    ) {

        alert(
            "⚠️ Please fill Medicine Name, Dosage, Date and Time."
        );

        return;
    }

    const medicines =
        getMedicines();

    const medicine = {

        id:
            Date.now(),

        name:
            name,

        dosage:
            dosage,

        date:
            date,

        time:
            time,

        repeat:
            repeat,

        status:
            "pending",

        lastAlarmDate:
            "",

        createdAt:
            new Date().toISOString()
    };

    medicines.push(
        medicine
    );

    saveMedicines(
        medicines
    );

    if (
        $("advMedicineName")
    ) {

        $("advMedicineName").value =
            "";
    }

    if (
        $("advDosage")
    ) {

        $("advDosage").value =
            "";
    }

    if (
        $("advDate")
    ) {

        $("advDate").value =
            "";
    }

    if (
        $("advTime")
    ) {

        $("advTime").value =
            "";
    }

    if (
        $("advRepeat")
    ) {

        $("advRepeat").value =
            "once";
    }

    loadAdvancedMedicines();

    updateMedicationStats();

    alert(
        "💊 Advanced medicine reminder added successfully!"
    );
}

function loadAdvancedMedicines() {

    const container =
        $("advancedMedicineList");

    if (!container) return;

    const medicines =
        getMedicines();

    container.innerHTML =
        "";

    if (
        medicines.length === 0
    ) {

        container.innerHTML = `
            <p class="empty-activity">
                No medicines scheduled yet.
            </p>
        `;

        updateMedicationStats();

        return;
    }

    medicines.forEach(
        function(medicine) {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "advanced-medicine-item";

            const statusText =
                medicine.status ===
                "taken"

                    ? "✅ Taken"

                    : medicine.status ===
                      "skipped"

                        ? "⏭️ Skipped"

                        : "⏳ Pending";

            item.innerHTML = `

                <div class="medicine-info">

                    <strong>
                        💊 ${
                            escapeHTML(
                                medicine.name
                            )
                        }
                    </strong>

                    <p>
                        💉 ${
                            escapeHTML(
                                medicine.dosage
                            )
                        }
                    </p>

                    <p>
                        📅 ${
                            escapeHTML(
                                medicine.date
                            )
                        }
                    </p>

                    <p>
                        ⏰ ${
                            format12Hour(
                                medicine.time
                            )
                        }
                    </p>

                    <p>
                        🔁 ${
                            getRepeatText(
                                medicine.repeat
                            )
                        }
                    </p>

                    <p>
                        Status:
                        <strong>
                            ${statusText}
                        </strong>
                    </p>

                </div>

                <div class="medicine-actions">

                    <button
                        type="button"
                        class="taken-btn"
                        data-id="${medicine.id}"
                    >
                        ✅ Taken
                    </button>

                    <button
                        type="button"
                        class="skip-btn"
                        data-id="${medicine.id}"
                    >
                        ⏭️ Skip
                    </button>

                    <button
                        type="button"
                        class="delete-medicine-btn"
                        data-id="${medicine.id}"
                    >
                        🗑️ Delete
                    </button>

                </div>
            `;

            const takenButton =
                item.querySelector(
                    ".taken-btn"
                );

            if (takenButton) {

                takenButton.addEventListener(
                    "click",
                    function() {

                        markAdvancedTaken(
                            medicine.id
                        );
                    }
                );
            }

            const skipButton =
                item.querySelector(
                    ".skip-btn"
                );

            if (skipButton) {

                skipButton.addEventListener(
                    "click",
                    function() {

                        markAdvancedSkipped(
                            medicine.id
                        );
                    }
                );
            }

            const deleteButton =
                item.querySelector(
                    ".delete-medicine-btn"
                );

            if (deleteButton) {

                deleteButton.addEventListener(
                    "click",
                    function() {

                        deleteAdvancedMedicine(
                            medicine.id
                        );
                    }
                );
            }

            container.appendChild(
                item
            );
        }
    );

    updateMedicationStats();
}

function getRepeatText(
    repeat
) {

    if (
        repeat === "daily"
    ) {

        return "Every Day";
    }

    if (
        repeat === "weekly"
    ) {

        return "Every Week";
    }

    return "Once";
}

function markAdvancedTaken(
    id
) {

    const medicines =
        getMedicines();

    const medicine =
        medicines.find(
            function(item) {

                return item.id === id;
            }
        );

    if (!medicine) return;

    medicine.status =
        "taken";

    medicine.lastTaken =
        new Date().toISOString();

    saveMedicines(
        medicines
    );

    addActivity(
        medicine,
        "taken"
    );

    loadAdvancedMedicines();

    updateMedicationStats();

    alert(
        "✅ Medicine marked as Taken."
    );
}

function markAdvancedSkipped(
    id
) {

    const medicines =
        getMedicines();

    const medicine =
        medicines.find(
            function(item) {

                return item.id === id;
            }
        );

    if (!medicine) return;

    medicine.status =
        "skipped";

    saveMedicines(
        medicines
    );

    addActivity(
        medicine,
        "skipped"
    );

    loadAdvancedMedicines();

    updateMedicationStats();

    alert(
        "⏭️ Medicine marked as Skipped."
    );
}

function deleteAdvancedMedicine(
    id
) {

    const confirmDelete =
        confirm(
            "Delete this medicine reminder?"
        );

    if (!confirmDelete) {

        return;
    }

    let medicines =
        getMedicines();

    medicines =
        medicines.filter(
            function(item) {

                return item.id !== id;
            }
        );

    saveMedicines(
        medicines
    );

    loadAdvancedMedicines();

    updateMedicationStats();

    alert(
        "🗑️ Medicine reminder deleted."
    );
}

function updateMedicationStats() {

    const medicines =
        getMedicines();

    const taken =
        medicines.filter(
            function(item) {

                return (
                    item.status ===
                    "taken"
                );
            }
        ).length;

    const skipped =
        medicines.filter(
            function(item) {

                return (
                    item.status ===
                    "skipped"
                );
            }
        ).length;

    const pending =
        medicines.filter(
            function(item) {

                return (
                    item.status ===
                    "pending"
                );
            }
        ).length;

    const total =
        medicines.length;

    const takenElement =
        $("takenCount");

    const missedElement =
        $("missedCount");

    const skippedElement =
        $("skippedCount");

    const adherenceElement =
        $("adherencePercent");

    if (takenElement) {

        takenElement.textContent =
            taken;
    }

    if (missedElement) {

        missedElement.textContent =
            pending;
    }

    if (skippedElement) {

        skippedElement.textContent =
            skipped;
    }

    if (adherenceElement) {

        let percentage =
            0;

        if (total > 0) {

            percentage =
                Math.round(
                    (
                        taken /
                        total
                    ) * 100
                );
        }

        adherenceElement.textContent =
            percentage + "%";
    }
}

function clearMedicationHistory() {

    const confirmClear =
        confirm(
            "Clear all medication activity?"
        );

    if (!confirmClear) {

        return;
    }

    localStorage.removeItem(
        ACTIVITY_KEY
    );

    const medicines =
        getMedicines();

    medicines.forEach(
        function(medicine) {

            medicine.status =
                "pending";
        }
    );

    saveMedicines(
        medicines
    );

    loadAdvancedMedicines();

    updateMedicationStats();

    const activity =
        $("medicationActivity");

    if (activity) {

        activity.innerHTML = `
            <p class="empty-activity">
                No medication activity yet.
            </p>
        `;
    }

    alert(
        "🗑️ Medication history cleared."
    );
}

let currentAlarmMedicine =
    null;

let alarmTimer =
    null;

let alarmSoundTimer =
    null;

function unlockAlarmAudio() {

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) {

            return;
        }

        if (
            !window.medicineAudioContext
        ) {

            window.medicineAudioContext =
                new AudioContext();
        }

        audioContext =
            window.medicineAudioContext;

        if (
            audioContext.state ===
            "suspended"
        ) {

            audioContext
                .resume()
                .then(
                    function() {

                        console.log(
                            "🔊 Alarm audio unlocked."
                        );
                    }
                )
                .catch(
                    function(error) {

                        console.error(
                            "Audio unlock error:",
                            error
                        );
                    }
                );
        }

    } catch (error) {

        console.error(
            "Audio unlock error:",
            error
        );
    }
}

function startAlarmSound() {

    stopAlarmSound();

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) {

            console.log(
                "AudioContext not supported."
            );

            return;
        }

        if (
            !window.medicineAudioContext
        ) {

            window.medicineAudioContext =
                new AudioContext();
        }

        const context =
            window.medicineAudioContext;

        audioContext =
            context;

        if (
            context.state ===
            "suspended"
        ) {

            context
                .resume()
                .catch(
                    function(error) {

                        console.error(
                            "Audio resume error:",
                            error
                        );
                    }
                );
        }

        function beep() {

            if (
                !window.medicineAlarmPlaying
            ) {

                return;
            }

            if (
                context.state ===
                "suspended"
            ) {

                context.resume();
            }

            const oscillator =
                context.createOscillator();

            const gain =
                context.createGain();

            oscillator.type =
                "square";

            oscillator.frequency.setValueAtTime(
                850,
                context.currentTime
            );

            gain.gain.setValueAtTime(
                0.0001,
                context.currentTime
            );

            gain.gain.exponentialRampToValueAtTime(
                0.5,
                context.currentTime +
                0.02
            );

            gain.gain.exponentialRampToValueAtTime(
                0.0001,
                context.currentTime +
                0.45
            );

            oscillator.connect(
                gain
            );

            gain.connect(
                context.destination
            );

            oscillator.start();

            oscillator.stop(
                context.currentTime +
                0.5
            );
        }

        window.medicineAlarmPlaying =
            true;

        beep();

        alarmSoundTimer =
            setInterval(
                function() {

                    beep();

                },
                1000
            );

        console.log(
            "🔊 Medicine alarm sound started."
        );

    } catch (error) {

        console.error(
            "Alarm sound error:",
            error
        );
    }
}

function stopAlarmSound() {

    window.medicineAlarmPlaying =
        false;

    if (alarmSoundTimer) {

        clearInterval(
            alarmSoundTimer
        );

        alarmSoundTimer =
            null;
    }
}

function showMedicineAlarm(
    medicine
) {

    currentAlarmMedicine =
        medicine;

    const popup =
        $("medicineAlert");

    const medicineName =
        $("alertMedicineName");

    const dosage =
        $("alertDosage");

    const reminderTime =
        $("alertReminderTime");

    if (!popup) {

        console.error(
            "medicineAlert popup not found."
        );

        return;
    }

    if (medicineName) {

        medicineName.textContent =
            "Time to take " +
            medicine.name;
    }

    if (dosage) {

        dosage.textContent =
            "Dosage: " +
            medicine.dosage;
    }

    if (reminderTime) {

        reminderTime.textContent =
            "⏰ Scheduled time: " +
            format12Hour(
                medicine.time
            );
    }

    popup.classList.remove(
        "hidden"
    );

    startAlarmSound();

    sendMedicineNotification(
        medicine
    );
}

function closeMedicineAlarm() {

    stopAlarmSound();

    const popup =
        $("medicineAlert");

    if (popup) {

        popup.classList.add(
            "hidden"
        );
    }

    currentAlarmMedicine =
        null;
}

function shouldAlarm(
    medicine
) {

    if (!medicine) {

        return false;
    }

    const today =
        getTodayDate();

    const currentTime =
        getCurrentTime();

    if (
        medicine.date !==
        today
    ) {

        return false;
    }

    if (
        medicine.time !==
        currentTime
    ) {

        return false;
    }

    if (
        medicine.repeat ===
            "once" &&
        medicine.status ===
            "taken"
    ) {

        return false;
    }

    return true;
}

function alreadyAlarmedToday(
    medicine
) {

    const key =
        medicine.id +
        "_" +
        getTodayDate();

    let triggered =
        JSON.parse(
            localStorage.getItem(
                TRIGGER_KEY
            ) || "[]"
        );

    return triggered.includes(
        key
    );
}

function saveAlarmTrigger(
    medicine
) {

    const key =
        medicine.id +
        "_" +
        getTodayDate();

    let triggered =
        JSON.parse(
            localStorage.getItem(
                TRIGGER_KEY
            ) || "[]"
        );

    if (
        !triggered.includes(
            key
        )
    ) {

        triggered.push(
            key
        );
    }

    if (
        triggered.length >
        100
    ) {

        triggered =
            triggered.slice(
                -100
            );
    }

    localStorage.setItem(
        TRIGGER_KEY,
        JSON.stringify(
            triggered
        )
    );
}

function checkMedicineAlarms() {

    const advancedMedicines =
        getMedicines();

    const basicReminders =
        getBasicAlarmReminders();

    const allMedicines = [
        ...advancedMedicines,
        ...basicReminders
    ];

    if (
        !allMedicines.length
    ) {

        return;
    }

    allMedicines.forEach(
        function(medicine) {

            if (
                alreadyAlarmedToday(
                    medicine
                )
            ) {

                return;
            }

            if (
                shouldAlarm(
                    medicine
                )
            ) {

                console.log(
                    "🔔 Medicine alarm:",
                    medicine.name
                );

                saveAlarmTrigger(
                    medicine
                );

                showMedicineAlarm(
                    medicine
                );
            }
        }
    );
}

function startMedicineAlarmSystem() {

    console.log(
        "🔔 Medicine alarm system started."
    );

    checkMedicineAlarms();

    if (alarmTimer) {

        clearInterval(
            alarmTimer
        );
    }

    alarmTimer =
        setInterval(
            function() {

                checkMedicineAlarms();

            },
            1000
        );
}

async function sendMedicineNotification(
    medicine
) {

    if (
        !("Notification" in window)
    ) {

        return;
    }

    try {

        if (
            Notification.permission ===
            "default"
        ) {

            await Notification.requestPermission();
        }

        if (
            Notification.permission ===
            "granted"
        ) {

            new Notification(
                "💊 MediAssist Medicine Reminder",
                {
                    body:
                        "Time to take " +
                        medicine.name +
                        " (" +
                        medicine.dosage +
                        ")",

                    icon:
                        "🩺"
                }
            );
        }

    } catch (error) {

        console.error(
            "Notification error:",
            error
        );
    }
}

function handleAlarmTaken() {

    if (
        !currentAlarmMedicine
    ) {

        closeMedicineAlarm();

        return;
    }

    const medicine =
        currentAlarmMedicine;

    const medicines =
        getMedicines();

    const found =
        medicines.find(
            function(item) {

                return (
                    item.id ===
                    medicine.id
                );
            }
        );

    if (found) {

        found.status =
            "taken";

        found.lastTaken =
            new Date().toISOString();
    }

    saveMedicines(
        medicines
    );

    addActivity(
        medicine,
        "taken"
    );

    closeMedicineAlarm();

    loadAdvancedMedicines();

    updateMedicationStats();

    alert(
        "✅ " +
        medicine.name +
        " marked as Taken."
    );
}

function handleAlarmSkip() {

    if (
        !currentAlarmMedicine
    ) {

        closeMedicineAlarm();

        return;
    }

    const medicine =
        currentAlarmMedicine;

    const medicines =
        getMedicines();

    const found =
        medicines.find(
            function(item) {

                return (
                    item.id ===
                    medicine.id
                );
            }
        );

    if (found) {

        found.status =
            "skipped";
    }

    saveMedicines(
        medicines
    );

    addActivity(
        medicine,
        "skipped"
    );

    closeMedicineAlarm();

    loadAdvancedMedicines();

    updateMedicationStats();

    alert(
        "⏭️ " +
        medicine.name +
        " marked as Skipped."
    );
}

function handleAlarmSnooze() {

    if (
        !currentAlarmMedicine
    ) {

        return;
    }

    const medicine =
        currentAlarmMedicine;

    const snoozeTime =
        Date.now() +
        (
            10 *
            60 *
            1000
        );

    const snoozeData = {

        medicineId:
            medicine.id,

        name:
            medicine.name,

        dosage:
            medicine.dosage,

        time:
            snoozeTime
    };

    localStorage.setItem(
        SNOOZE_KEY,
        JSON.stringify(
            snoozeData
        )
    );

    closeMedicineAlarm();

    alert(
        "😴 Alarm snoozed for 10 minutes."
    );
}

function checkSnoozeAlarm() {

    const data =
        localStorage.getItem(
            SNOOZE_KEY
        );

    if (!data) {

        return;
    }

    try {

        const snooze =
            JSON.parse(
                data
            );

        if (
            Date.now() >=
            snooze.time
        ) {

            localStorage.removeItem(
                SNOOZE_KEY
            );

            const medicine = {

                id:
                    snooze.medicineId,

                name:
                    snooze.name,

                dosage:
                    snooze.dosage,

                date:
                    getTodayDate(),

                time:
                    getCurrentTime(),

                repeat:
                    "snooze",

                status:
                    "pending"
            };

            showMedicineAlarm(
                medicine
            );
        }

    } catch (error) {

        console.error(
            "Snooze error:",
            error
        );

        localStorage.removeItem(
            SNOOZE_KEY
        );
    }
}

function testAlarm() {

    const testMedicine = {

        id:
            "test-" +
            Date.now(),

        name:
            "Test Medicine",

        dosage:
            "500 mg",

        date:
            getTodayDate(),

        time:
            getCurrentTime(),

        repeat:
            "test",

        status:
            "pending"
    };

    showMedicineAlarm(
        testMedicine
    );
}

async function enableNotifications() {

    if (
        !("Notification" in window)
    ) {

        alert(
            "❌ Your browser does not support notifications."
        );

        return;
    }

    try {

        const permission =
            await Notification.requestPermission();

        updateNotificationStatus();

        if (
            permission ===
            "granted"
        ) {

            alert(
                "🔔 Notifications enabled successfully!"
            );

        } else {

            alert(
                "⚠️ Notification permission was not granted."
            );
        }

    } catch (error) {

        console.error(
            "Notification permission error:",
            error
        );
    }
}

function updateNotificationStatus() {

    const element =
        $("notificationStatus");

    if (!element) {

        return;
    }

    if (
        !("Notification" in window)
    ) {

        element.textContent =
            "Not Supported";

        return;
    }

    if (
        Notification.permission ===
        "granted"
    ) {

        element.textContent =
            "Enabled";

    } else if (
        Notification.permission ===
        "denied"
    ) {

        element.textContent =
            "Blocked";

    } else {

        element.textContent =
            "Not Enabled";
    }
}

function testAlarmSound() {

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) {

            alert(
                "❌ Audio is not supported."
            );

            return;
        }

        const context =
            new AudioContext();

        const oscillator =
            context.createOscillator();

        const gain =
            context.createGain();

        oscillator.type =
            "sine";

        oscillator.frequency.value =
            900;

        gain.gain.setValueAtTime(
            0.5,
            context.currentTime
        );

        oscillator.connect(
            gain
        );

        gain.connect(
            context.destination
        );

        oscillator.start();

        oscillator.stop(
            context.currentTime +
            1
        );

    } catch (error) {

        console.error(
            "Test sound error:",
            error
        );
    }
}

function setupAlarmButtons() {

    const takenButton =
        $("alertTakenBtn");

    if (takenButton) {

        takenButton.addEventListener(
            "click",
            handleAlarmTaken
        );
    }

    const snoozeButton =
        $("alertSnoozeBtn");

    if (snoozeButton) {

        snoozeButton.addEventListener(
            "click",
            handleAlarmSnooze
        );
    }

    const skipButton =
        $("alertSkipBtn");

    if (skipButton) {

        skipButton.addEventListener(
            "click",
            handleAlarmSkip
        );
    }

    const closeButton =
        $("alertCloseBtn");

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeMedicineAlarm
        );
    }

    const testButton =
        $("testAlarmBtn");

    if (testButton) {

        testButton.addEventListener(
            "click",
            testAlarm
        );
    }

    const notificationButton =
        $("enableNotificationBtn");

    if (notificationButton) {

        notificationButton.addEventListener(
            "click",
            enableNotifications
        );
    }
}

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "🚀 MediAssist Reminder System Started"
        );

        updateClock();

        setInterval(
            updateClock,
            1000
        );

        loadUserName();

        setupLogout();

        setupReminderForm();

        setupAdvancedReminder();

        setupAlarmButtons();

        updateNotificationStatus();

        loadReminders();

        loadAdvancedMedicines();

        updateMedicationStats();

        startMedicineAlarmSystem();

        checkSnoozeAlarm();

        setInterval(
            checkSnoozeAlarm,
            1000
        );

        console.log(
            "✅ All reminder features initialized"
        );
    }
);