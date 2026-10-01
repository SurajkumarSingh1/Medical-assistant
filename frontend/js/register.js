console.log("register.js loaded");

const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Check password
    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    try {
        const API_BASE_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : "";

const response = await fetch(
    `${API_BASE_URL}/api/auth/register`,
    {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fullName,
                    email,
                    phone,
                    password
                })
            }
        );

        const data = await response.json();

        console.log("Server response:", data);

        if (data.success) {

            alert("Registration successful!");

            localStorage.setItem("token", data.token);
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            window.location.href = "dashboard.html";

        } else {

            alert(data.message || "Registration failed.");

        }

    } catch (error) {

        console.error("Registration Error:", error);

        alert(
            "Cannot connect to server. Make sure backend is running."
        );
    }
});

/* =====================================================
   ADVANCED MEDICATION TRACKER
===================================================== */

let advancedMedicines =
    JSON.parse(localStorage.getItem("advancedMedicines")) || [];

let medicationActivity =
    JSON.parse(localStorage.getItem("medicationActivity")) || [];

let currentAlertMedicine = null;


/* =====================================================
   SAVE DATA
===================================================== */

function saveAdvancedData() {

    localStorage.setItem(
        "advancedMedicines",
        JSON.stringify(advancedMedicines)
    );

    localStorage.setItem(
        "medicationActivity",
        JSON.stringify(medicationActivity)
    );
}


/* =====================================================
   ADD MEDICINE
===================================================== */

function addAdvancedMedicine() {

    const name =
        document.getElementById("advMedicineName").value.trim();

    const dosage =
        document.getElementById("advDosage").value.trim();

    const date =
        document.getElementById("advDate").value;

    const time =
        document.getElementById("advTime").value;

    const repeat =
        document.getElementById("advRepeat").value;


    if (!name || !dosage || !date || !time) {

        alert("Please fill all medicine details.");

        return;
    }


    const medicine = {

        id: Date.now(),

        name: name,

        dosage: dosage,

        date: date,

        time: time,

        repeat: repeat,

        status: "pending"

    };


    advancedMedicines.push(medicine);

    saveAdvancedData();

    renderAdvancedMedicines();

    updateMedicationStats();


    document.getElementById("advMedicineName").value = "";
    document.getElementById("advDosage").value = "";
    document.getElementById("advDate").value = "";
    document.getElementById("advTime").value = "";

    alert("Medicine reminder added successfully 💊");
}


/* =====================================================
   DISPLAY MEDICINES
===================================================== */

function renderAdvancedMedicines() {

    const container =
        document.getElementById("advancedMedicineList");

    if (!container) return;

    container.innerHTML = "";


    if (advancedMedicines.length === 0) {

        container.innerHTML =
            `<p class="empty-activity">
                No advanced medicines added yet.
            </p>`;

        return;
    }


    advancedMedicines.forEach(medicine => {

        const div =
            document.createElement("div");

        div.className = "medicine-item";


        let repeatText = "Once";

        if (medicine.repeat === "daily") {
            repeatText = "Every Day";
        }

        if (medicine.repeat === "weekly") {
            repeatText = "Every Week";
        }


        div.innerHTML = `

            <div class="medicine-top">

                <div>

                    <div class="medicine-name">
                        💊 ${escapeMedicineText(medicine.name)}
                    </div>

                    <div class="medicine-details">

                        ${escapeMedicineText(medicine.dosage)}
                        &nbsp; • &nbsp;

                        📅 ${medicine.date}
                        &nbsp; • &nbsp;

                        ⏰ ${medicine.time}

                        &nbsp; • &nbsp;

                        🔁 ${repeatText}

                    </div>

                </div>

            </div>


            <div class="medicine-actions">

                <button
                    class="take-action"
                    onclick="takeMedicine(${medicine.id})"
                >
                    ✅ Taken
                </button>


                <button
                    class="skip-action"
                    onclick="skipMedicine(${medicine.id})"
                >
                    ⏭️ Skip
                </button>


                <button
                    class="delete-action"
                    onclick="deleteAdvancedMedicine(${medicine.id})"
                >
                    🗑️ Delete
                </button>

            </div>

        `;


        container.appendChild(div);

    });
}


/* =====================================================
   TAKEN
===================================================== */

function takeMedicine(id) {

    const medicine =
        advancedMedicines.find(
            item => item.id === id
        );

    if (!medicine) return;


    medicine.status = "taken";


    addActivity(
        medicine,
        "Taken ✅"
    );


    saveAdvancedData();

    renderAdvancedMedicines();

    updateMedicationStats();
}


/* =====================================================
   SKIP
===================================================== */

function skipMedicine(id) {

    const medicine =
        advancedMedicines.find(
            item => item.id === id
        );

    if (!medicine) return;


    medicine.status = "skipped";


    addActivity(
        medicine,
        "Skipped ⏭️"
    );


    saveAdvancedData();

    renderAdvancedMedicines();

    updateMedicationStats();
}


/* =====================================================
   MISSED
===================================================== */

function markMissed(medicine) {

    if (medicine.status !== "pending") {
        return;
    }


    medicine.status = "missed";


    addActivity(
        medicine,
        "Missed ⚠️"
    );


    saveAdvancedData();

    renderAdvancedMedicines();

    updateMedicationStats();
}


/* =====================================================
   DELETE
===================================================== */

function deleteAdvancedMedicine(id) {

    if (!confirm("Delete this medicine reminder?")) {
        return;
    }


    advancedMedicines =
        advancedMedicines.filter(
            item => item.id !== id
        );


    saveAdvancedData();

    renderAdvancedMedicines();

    updateMedicationStats();
}


/* =====================================================
   ACTIVITY
===================================================== */

function addActivity(
    medicine,
    status
) {

    medicationActivity.unshift({

        id: Date.now(),

        medicine:
            medicine.name,

        dosage:
            medicine.dosage,

        status:
            status,

        time:
            new Date().toLocaleString()

    });


    if (medicationActivity.length > 50) {

        medicationActivity =
            medicationActivity.slice(0, 50);

    }
}


/* =====================================================
   STATISTICS
===================================================== */

function updateMedicationStats() {

    const taken =
        advancedMedicines.filter(
            m => m.status === "taken"
        ).length;


    const missed =
        advancedMedicines.filter(
            m => m.status === "missed"
        ).length;


    const skipped =
        advancedMedicines.filter(
            m => m.status === "skipped"
        ).length;


    const total =
        taken + missed + skipped;


    const adherence =
        total === 0
            ? 0
            : Math.round(
                (taken / total) * 100
            );


    const takenElement =
        document.getElementById("takenCount");

    const missedElement =
        document.getElementById("missedCount");

    const skippedElement =
        document.getElementById("skippedCount");

    const adherenceElement =
        document.getElementById("adherencePercent");


    if (takenElement)
        takenElement.textContent = taken;

    if (missedElement)
        missedElement.textContent = missed;

    if (skippedElement)
        skippedElement.textContent = skipped;

    if (adherenceElement)
        adherenceElement.textContent =
            adherence + "%";


    renderActivity();
}


/* =====================================================
   ACTIVITY DISPLAY
===================================================== */

function renderActivity() {

    const container =
        document.getElementById(
            "medicationActivity"
        );

    if (!container) return;


    if (medicationActivity.length === 0) {

        container.innerHTML =
            `<p class="empty-activity">
                No medication activity yet.
            </p>`;

        return;
    }


    container.innerHTML =
        medicationActivity
            .map(activity => `

                <div class="activity-item">

                    <strong>
                        ${escapeMedicineText(activity.medicine)}
                    </strong>

                    (${escapeMedicineText(activity.dosage)})

                    — ${activity.status}

                    <br>

                    <small>
                        ${activity.time}
                    </small>

                </div>

            `)
            .join("");
}


/* =====================================================
   REMINDER CHECK
===================================================== */

function checkMedicineReminders() {

    const now = new Date();

    const currentDate =
        now.toISOString()
           .split("T")[0];

    const currentTime =
        now.toTimeString()
           .slice(0, 5);


    advancedMedicines.forEach(medicine => {

        if (
            medicine.date === currentDate &&
            medicine.time === currentTime &&
            medicine.status === "pending"
        ) {

            showMedicineAlert(medicine);

        }

    });
}


/* =====================================================
   SHOW ALERT
===================================================== */

function showMedicineAlert(medicine) {

    currentAlertMedicine = medicine;


    const alert =
        document.getElementById(
            "medicineAlert"
        );


    const name =
        document.getElementById(
            "alertMedicineName"
        );


    const dosage =
        document.getElementById(
            "alertDosage"
        );


    if (!alert) return;


    name.textContent =
        `It's time to take ${medicine.name}`;

    dosage.textContent =
        medicine.dosage;


    alert.classList.remove("hidden");


    // Browser notification

    if (
        "Notification" in window &&
        Notification.permission === "granted"
    ) {

        new Notification(
            "💊 Medicine Reminder",
            {
                body:
                    `${medicine.name} - ${medicine.dosage}`
            }
        );

    }

}


/* =====================================================
   TAKEN FROM POPUP
===================================================== */

function markMedicineTaken() {

    if (!currentAlertMedicine) return;


    takeMedicine(
        currentAlertMedicine.id
    );


    closeMedicineAlert();
}


/* =====================================================
   SKIP FROM POPUP
===================================================== */

function markMedicineSkipped() {

    if (!currentAlertMedicine) return;


    skipMedicine(
        currentAlertMedicine.id
    );


    closeMedicineAlert();
}


/* =====================================================
   SNOOZE
===================================================== */

function snoozeMedicine() {

    if (!currentAlertMedicine) return;


    const medicine =
        currentAlertMedicine;


    closeMedicineAlert();


    setTimeout(
        () => {

            showMedicineAlert(medicine);

        },
        10 * 60 * 1000
    );

}


/* =====================================================
   CLOSE ALERT
===================================================== */

function closeMedicineAlert() {

    const alert =
        document.getElementById(
            "medicineAlert"
        );


    if (alert) {

        alert.classList.add("hidden");

    }


    currentAlertMedicine = null;
}


/* =====================================================
   CLEAR HISTORY
===================================================== */

function clearMedicationHistory() {

    if (
        !confirm(
            "Clear medication activity history?"
        )
    ) {
        return;
    }


    medicationActivity = [];

    saveAdvancedData();

    renderActivity();
}


/* =====================================================
   REQUEST NOTIFICATION
===================================================== */

function requestMedicationNotification() {

    if (
        "Notification" in window &&
        Notification.permission === "default"
    ) {

        Notification.requestPermission();

    }
}


/* =====================================================
   SECURITY
===================================================== */

function escapeMedicineText(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;
}


/* =====================================================
   INITIALIZE
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderAdvancedMedicines();

        updateMedicationStats();

        requestMedicationNotification();

        setInterval(
            checkMedicineReminders,
            30000
        );

    }
);