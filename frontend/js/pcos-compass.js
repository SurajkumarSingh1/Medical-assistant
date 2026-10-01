// =========================================================
// PCOS HEALTH COMPASS
// Uses real user-entered check-in history.
// Does NOT diagnose PCOS/PCOD.
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // ELEMENTS
    // =====================================================

    const openBtn =
        document.getElementById("openPCOSCompassBtn");

    const closeBtn =
        document.getElementById("closePCOSCompassBtn");

    const compassSection =
        document.getElementById("pcosCompass");

    const generateBtn =
        document.getElementById(
            "generatePCOSInsightBtn"
        );

    const insightBox =
        document.getElementById(
            "pcosInsightBox"
        );

    const healthOverview =
        document.getElementById(
            "pcosHealthOverview"
        );

    const whatChanged =
        document.getElementById(
            "pcosWhatChanged"
        );

    const insightText =
        document.getElementById(
            "pcosInsightText"
        );

    const whyBtn =
        document.getElementById(
            "pcosWhyBtn"
        );

    const whyBox =
        document.getElementById(
            "pcosWhyBox"
        );

    const historyAnswer =
        document.getElementById(
            "pcosHistoryAnswer"
        );

    const timeline =
        document.getElementById(
            "pcosTimeline"
        );

    const doctorSummary =
        document.getElementById(
            "pcosDoctorSummary"
        );

    const doctorSummaryBtn =
        document.getElementById(
            "generateDoctorSummaryBtn"
        );


    // =====================================================
    // STORAGE
    // =====================================================

    const STORAGE_KEY =
        "mediassist_pcos_compass_history";


    // =====================================================
    // HELPERS
    // =====================================================

    function getHistory() {

        try {

            const saved =
                localStorage.getItem(
                    STORAGE_KEY
                );

            if (!saved) {
                return [];
            }

            const parsed =
                JSON.parse(saved);

            return Array.isArray(parsed)
                ? parsed
                : [];

        }
        catch (error) {

            console.error(
                "PCOS history could not be loaded:",
                error
            );

            return [];

        }

    }


    function saveHistory(history) {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(history)
        );

    }


    function escapeHTML(value) {

        const div =
            document.createElement("div");

        div.textContent =
            String(value ?? "");

        return div.innerHTML;

    }


    function formatDate(dateValue) {

        if (!dateValue) {
            return "--";
        }

        const date =
            new Date(dateValue);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return String(dateValue);

        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    function getSymptoms() {

        return [
            ...document.querySelectorAll(
                ".pcos-symptom:checked"
            )
        ].map(function (checkbox) {

            return checkbox.value;

        });

    }


    function getLatest(history) {

        if (!history.length) {
            return null;
        }

        return history[0];

    }


    // =====================================================
    // OPEN COMPASS
    // =====================================================

    if (openBtn) {

        openBtn.addEventListener(
            "click",
            function () {

                compassSection.classList.add(
                    "show"
                );

                compassSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

                renderTimeline();

            }
        );

    }


    // =====================================================
    // CLOSE COMPASS
    // =====================================================

    if (closeBtn) {

        closeBtn.addEventListener(
            "click",
            function () {

                compassSection.classList.remove(
                    "show"
                );

                window.scrollTo({
                    top:
                        compassSection.offsetTop - 100,
                    behavior: "smooth"
                });

            }
        );

    }


    // =====================================================
    // GENERATE HEALTH INSIGHT
    // =====================================================

    if (generateBtn) {

        generateBtn.addEventListener(
            "click",
            function () {

                const periodStatus =
                    document.getElementById(
                        "pcosPeriodStatus"
                    ).value;

                const sleepValue =
                    document.getElementById(
                        "pcosSleepHours"
                    ).value;

                const stress =
                    document.getElementById(
                        "pcosStressLevel"
                    ).value;

                const activity =
                    document.getElementById(
                        "pcosActivityLevel"
                    ).value;

                const symptoms =
                    getSymptoms();


                // -----------------------------------------
                // BASIC VALIDATION
                // -----------------------------------------

                if (
                    !periodStatus &&
                    !sleepValue &&
                    !stress &&
                    !activity &&
                    symptoms.length === 0
                ) {

                    alert(
                        "Please record at least one check-in detail."
                    );

                    return;

                }


                const sleep =
                    sleepValue === ""
                        ? null
                        : Number(sleepValue);


                // -----------------------------------------
                // CREATE CHECK-IN
                // -----------------------------------------

                const checkIn = {

                    id:
                        Date.now(),

                    date:
                        new Date().toISOString(),

                    periodStatus:
                        periodStatus ||
                        "Not recorded",

                    symptoms:
                        symptoms,

                    sleep:
                        sleep,

                    stress:
                        stress ||
                        "Not recorded",

                    activity:
                        activity ||
                        "Not recorded"

                };


                // -----------------------------------------
                // LOAD HISTORY
                // -----------------------------------------

                const history =
                    getHistory();


                // newest first

                history.unshift(
                    checkIn
                );


                // Keep a practical amount
                // of personal records.

                if (
                    history.length > 100
                ) {

                    history.length =
                        100;

                }


                saveHistory(
                    history
                );


                // -----------------------------------------
                // ANALYZE
                // -----------------------------------------

                generateAnalysis(
                    checkIn,
                    history
                );


                // -----------------------------------------
                // UPDATE TIMELINE
                // -----------------------------------------

                renderTimeline();


                // -----------------------------------------
                // CLEAR FORM
                // -----------------------------------------

                resetCheckInForm();


                // -----------------------------------------
                // SHOW RESULT
                // -----------------------------------------

                insightBox.style.display =
                    "block";


                insightBox.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }
        );

    }


    // =====================================================
    // ANALYSIS
    // =====================================================

    function generateAnalysis(
        current,
        history
    ) {

        const previous =
            history.length > 1
                ? history[1]
                : null;


        // -----------------------------------------
        // HEALTH OVERVIEW
        // -----------------------------------------

        healthOverview.innerHTML = `

            <div class="pcos-overview-item">

                <span class="pcos-overview-label">
                    Period
                </span>

                <strong class="pcos-overview-value">
                    ${escapeHTML(current.periodStatus)}
                </strong>

            </div>


            <div class="pcos-overview-item">

                <span class="pcos-overview-label">
                    Symptoms
                </span>

                <strong class="pcos-overview-value">
                    ${current.symptoms.length}
                </strong>

            </div>


            <div class="pcos-overview-item">

                <span class="pcos-overview-label">
                    Sleep
                </span>

                <strong class="pcos-overview-value">
                    ${
                        current.sleep !== null
                            ? escapeHTML(
                                current.sleep +
                                " hrs"
                            )
                            : "Not recorded"
                    }
                </strong>

            </div>


            <div class="pcos-overview-item">

                <span class="pcos-overview-label">
                    Stress
                </span>

                <strong class="pcos-overview-value">
                    ${escapeHTML(current.stress)}
                </strong>

            </div>


            <div class="pcos-overview-item">

                <span class="pcos-overview-label">
                    Activity
                </span>

                <strong class="pcos-overview-value">
                    ${escapeHTML(current.activity)}
                </strong>

            </div>

        `;


        // -----------------------------------------
        // CHANGES
        // -----------------------------------------

        const changes =
            getChanges(
                current,
                previous
            );


        if (!changes.length) {

            whatChanged.innerHTML = `

                <div class="pcos-change-item">
                    This is your first recorded check-in,
                    so there is not enough personal history
                    for a comparison yet.
                </div>

            `;

        }
        else {

            whatChanged.innerHTML =
                changes
                    .map(function (change) {

                        return `
                            <div class="pcos-change-item">
                                • ${escapeHTML(change)}
                            </div>
                        `;

                    })
                    .join("");

        }


        // -----------------------------------------
        // PERSONAL INSIGHT
        // -----------------------------------------

        const messages = [];


        if (
            current.periodStatus ===
            "Very Late"
        ) {

            messages.push(
                "You recorded a very late period status today."
            );

        }
        else if (
            current.periodStatus ===
            "Late"
        ) {

            messages.push(
                "You recorded a late period status today."
            );

        }


        if (
            current.sleep !== null &&
            current.sleep < 6
        ) {

            messages.push(
                "Your recorded sleep today is lower than 6 hours."
            );

        }


        if (
            current.stress ===
            "High"
        ) {

            messages.push(
                "You recorded a high stress level today."
            );

        }


        if (
            current.activity ===
            "Low"
        ) {

            messages.push(
                "You recorded low physical activity today."
            );

        }


        if (
            current.symptoms.length
        ) {

            messages.push(
                "You recorded " +
                current.symptoms.length +
                " symptom(s): " +
                current.symptoms.join(", ") +
                "."
            );

        }


        if (!messages.length) {

            messages.push(
                "No major change was identified from today's recorded information."
            );

        }


        if (previous) {

            const comparison =
                getComparisonSummary(
                    current,
                    previous
                );

            if (comparison) {

                messages.push(
                    comparison
                );

            }

        }


        insightText.innerHTML =
            messages
                .map(function (message) {

                    return `
                        <span>
                            ${escapeHTML(message)}
                        </span>
                    `;

                })
                .join("<br><br>");

    }


    // =====================================================
    // FIND CHANGES
    // =====================================================

    function getChanges(
        current,
        previous
    ) {

        if (!previous) {
            return [];
        }


        const changes = [];


        // -----------------------------------------
        // PERIOD
        // -----------------------------------------

        if (
            current.periodStatus !==
            previous.periodStatus
        ) {

            changes.push(
                "Period status changed from " +
                previous.periodStatus +
                " to " +
                current.periodStatus +
                "."
            );

        }


        // -----------------------------------------
        // SLEEP
        // -----------------------------------------

        if (
            current.sleep !== null &&
            previous.sleep !== null
        ) {

            const difference =
                (
                    current.sleep -
                    previous.sleep
                ).toFixed(1);


            if (
                Number(difference) !== 0
            ) {

                if (
                    Number(difference) < 0
                ) {

                    changes.push(
                        "Recorded sleep decreased by " +
                        Math.abs(difference) +
                        " hour(s)."
                    );

                }
                else {

                    changes.push(
                        "Recorded sleep increased by " +
                        difference +
                        " hour(s)."
                    );

                }

            }

        }


        // -----------------------------------------
        // SYMPTOMS
        // -----------------------------------------

        const oldSymptoms =
            new Set(
                previous.symptoms || []
            );

        const newSymptoms =
            new Set(
                current.symptoms || []
            );


        const addedSymptoms =
            [...newSymptoms].filter(
                function (symptom) {

                    return !oldSymptoms.has(
                        symptom
                    );

                }
            );


        const removedSymptoms =
            [...oldSymptoms].filter(
                function (symptom) {

                    return !newSymptoms.has(
                        symptom
                    );

                }
            );


        if (
            addedSymptoms.length
        ) {

            changes.push(
                "Newly recorded symptoms: " +
                addedSymptoms.join(", ") +
                "."
            );

        }


        if (
            removedSymptoms.length
        ) {

            changes.push(
                "Symptoms no longer selected: " +
                removedSymptoms.join(", ") +
                "."
            );

        }


        // -----------------------------------------
        // STRESS
        // -----------------------------------------

        if (
            current.stress !==
            previous.stress
        ) {

            changes.push(
                "Stress level changed from " +
                previous.stress +
                " to " +
                current.stress +
                "."
            );

        }


        // -----------------------------------------
        // ACTIVITY
        // -----------------------------------------

        if (
            current.activity !==
            previous.activity
        ) {

            changes.push(
                "Physical activity changed from " +
                previous.activity +
                " to " +
                current.activity +
                "."
            );

        }


        return changes;

    }


    // =====================================================
    // COMPARISON SUMMARY
    // =====================================================

    function getComparisonSummary(
        current,
        previous
    ) {

        const parts = [];


        if (
            current.sleep !== null &&
            previous.sleep !== null
        ) {

            const difference =
                (
                    current.sleep -
                    previous.sleep
                ).toFixed(1);


            if (
                Number(difference) < 0
            ) {

                parts.push(
                    "Your latest check-in records less sleep than the previous one."
                );

            }
            else if (
                Number(difference) > 0
            ) {

                parts.push(
                    "Your latest check-in records more sleep than the previous one."
                );

            }

        }


        if (
            current.symptoms.length >
            previous.symptoms.length
        ) {

            parts.push(
                "You selected more symptoms than in the previous check-in."
            );

        }
        else if (
            current.symptoms.length <
            previous.symptoms.length
        ) {

            parts.push(
                "You selected fewer symptoms than in the previous check-in."
            );

        }


        return parts.join(" ");

    }


    // =====================================================
    // WHY AM I SEEING THIS?
    // =====================================================

    if (whyBtn) {

        whyBtn.addEventListener(
            "click",
            function () {

                const history =
                    getHistory();

                const current =
                    getLatest(history);

                const previous =
                    history.length > 1
                        ? history[1]
                        : null;


                whyBox.style.display =
                    "block";


                if (!current) {

                    whyBox.innerHTML = `

                        <strong>
                            Why am I seeing this?
                        </strong>

                        <p>
                            This section will explain insights
                            after you record a check-in.
                        </p>

                    `;

                    return;

                }


                let explanation =
                    "This insight is based only on the information you recorded " +
                    "in your Health Compass check-ins.";


                if (previous) {

                    explanation +=
                        " The comparison uses your latest check-in and the previous recorded check-in.";

                }
                else {

                    explanation +=
                        " This is your first recorded check-in, so there is not yet enough personal history for comparison.";

                }


                explanation +=
                    " The observations do not establish a medical cause or diagnosis.";


                whyBox.innerHTML = `

                    <strong>
                        Why am I seeing this?
                    </strong>

                    <p>
                        ${escapeHTML(explanation)}
                    </p>

                    <p>
                        Persistent or concerning changes should be discussed
                        with a qualified healthcare professional.
                    </p>

                `;

            }
        );

    }


    // =====================================================
    // ASK HEALTH HISTORY
    // =====================================================

    document
        .querySelectorAll(
            "[data-pcos-question]"
        )
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const type =
                        button.dataset.pcosQuestion;

                    answerHistoryQuestion(
                        type
                    );

                }
            );

        });


    function answerHistoryQuestion(
        type
    ) {

        const history =
            getHistory();


        historyAnswer.classList.add(
            "show"
        );


        if (!history.length) {

            historyAnswer.innerHTML = `
                No Health Compass check-ins have
                been recorded yet.
            `;

            return;

        }


        // -----------------------------------------
        // CYCLE
        // -----------------------------------------

        if (
            type === "cycle"
        ) {

            const cycleHistory =
                getCycleHistory();


            if (!cycleHistory.length) {

                historyAnswer.innerHTML =
                    "No cycle records are available yet.";

                return;

            }


            const longest =
                cycleHistory.reduce(
                    function (longestItem, item) {

                        return item.cycleLength >
                            longestItem.cycleLength
                            ? item
                            : longestItem;

                    }
                );


            historyAnswer.innerHTML = `

                <strong>
                    Your longest recorded cycle:
                </strong>

                ${escapeHTML(
                    String(
                        longest.cycleLength
                    )
                )}
                days on
                ${escapeHTML(
                    formatDate(
                        longest.lastPeriod
                    )
                )}.

            `;


            return;

        }


        // -----------------------------------------
        // SYMPTOMS
        // -----------------------------------------

        if (
            type === "symptoms"
        ) {

            const counts = {};


            history.forEach(
                function (item) {

                    (item.symptoms || [])
                        .forEach(
                            function (symptom) {

                                counts[symptom] =
                                    (
                                        counts[symptom] ||
                                        0
                                    ) + 1;

                            }
                        );

                }
            );


            const entries =
                Object.entries(
                    counts
                ).sort(
                    function (a, b) {

                        return b[1] - a[1];

                    }
                );


            if (!entries.length) {

                historyAnswer.innerHTML =
                    "No symptoms have been recorded yet.";

                return;

            }


            historyAnswer.innerHTML = `

                <strong>
                    Your recorded symptoms:
                </strong>

                <br><br>

                ${
                    entries
                        .map(function (item) {

                            return (
                                escapeHTML(
                                    item[0]
                                ) +
                                " — " +
                                item[1] +
                                " time(s)"
                            );

                        })
                        .join("<br>")
                }

            `;


            return;

        }


        // -----------------------------------------
        // SLEEP
        // -----------------------------------------

        if (
            type === "sleep"
        ) {

            const sleepRecords =
                history.filter(
                    function (item) {

                        return (
                            item.sleep !== null &&
                            item.sleep !== undefined
                        );

                    }
                );


            if (
                sleepRecords.length < 2
            ) {

                historyAnswer.innerHTML =
                    "At least two sleep records are needed to compare your sleep.";

                return;

            }


            const first =
                sleepRecords[
                    sleepRecords.length - 1
                ].sleep;


            const latest =
                sleepRecords[0].sleep;


            const difference =
                (
                    latest -
                    first
                ).toFixed(1);


            historyAnswer.innerHTML = `

                Your recorded sleep changed from

                <strong>
                    ${first} hours
                </strong>

                to

                <strong>
                    ${latest} hours
                </strong>.

                <br><br>

                Change:

                <strong>
                    ${difference} hours
                </strong>

            `;


            return;

        }


        // -----------------------------------------
        // STRESS
        // -----------------------------------------

        if (
            type === "stress"
        ) {

            const stressValues =
                history
                    .map(function (item) {

                        return item.stress;

                    })
                    .filter(function (value) {

                        return (
                            value &&
                            value !==
                            "Not recorded"
                        );

                    });


            if (!stressValues.length) {

                historyAnswer.innerHTML =
                    "No stress records have been recorded yet.";

                return;

            }


            historyAnswer.innerHTML = `

                <strong>
                    Recent stress records:
                </strong>

                <br><br>

                ${
                    stressValues
                        .slice(0, 10)
                        .map(function (value) {

                            return escapeHTML(
                                value
                            );

                        })
                        .join(" → ")
                }

            `;


            return;

        }


        // -----------------------------------------
        // ACTIVITY
        // -----------------------------------------

        if (
            type === "activity"
        ) {

            const activityValues =
                history
                    .map(function (item) {

                        return item.activity;

                    })
                    .filter(function (value) {

                        return (
                            value &&
                            value !==
                            "Not recorded"
                        );

                    });


            if (!activityValues.length) {

                historyAnswer.innerHTML =
                    "No physical activity records have been recorded yet.";

                return;

            }


            historyAnswer.innerHTML = `

                <strong>
                    Recent activity records:
                </strong>

                <br><br>

                ${
                    activityValues
                        .slice(0, 10)
                        .map(function (value) {

                            return escapeHTML(
                                value
                            );

                        })
                        .join(" → ")
                }

            `;

        }

    }


    // =====================================================
    // GET EXISTING CYCLE HISTORY
    // =====================================================

    function getCycleHistory() {

        try {

            const saved =
                localStorage.getItem(
                    "mediassist_period_history"
                );


            if (!saved) {
                return [];
            }


            const history =
                JSON.parse(
                    saved
                );


            return Array.isArray(history)
                ? history
                : [];

        }
        catch (error) {

            console.warn(
                "Cycle history could not be loaded."
            );

            return [];

        }

    }


    // =====================================================
    // TIMELINE
    // =====================================================

    function renderTimeline() {

        const history =
            getHistory();


        if (!timeline) {
            return;
        }


        if (!history.length) {

            timeline.innerHTML = `

                <div class="pcos-timeline-content">

                    No Health Compass check-ins have
                    been recorded yet.

                </div>

            `;

            return;

        }


        timeline.innerHTML =
            history
                .map(function (item) {

                    const symptoms =
                        item.symptoms &&
                        item.symptoms.length
                            ? item.symptoms.join(", ")
                            : "No symptoms recorded";


                    return `

                        <div class="pcos-timeline-item">

                            <div class="pcos-timeline-date">

                                ${escapeHTML(
                                    formatDate(
                                        item.date
                                    )
                                )}

                            </div>


                            <div class="pcos-timeline-content">

                                <strong>
                                    Period:
                                </strong>

                                ${escapeHTML(
                                    item.periodStatus
                                )}

                                <br>


                                <strong>
                                    Symptoms:
                                </strong>

                                ${escapeHTML(
                                    symptoms
                                )}

                                <br>


                                <strong>
                                    Sleep:
                                </strong>

                                ${
                                    item.sleep !== null
                                        ? escapeHTML(
                                            item.sleep +
                                            " hours"
                                        )
                                        : "Not recorded"
                                }

                                <br>


                                <strong>
                                    Stress:
                                </strong>

                                ${escapeHTML(
                                    item.stress
                                )}

                                <br>


                                <strong>
                                    Activity:
                                </strong>

                                ${escapeHTML(
                                    item.activity
                                )}

                            </div>

                        </div>

                    `;

                })
                .join("");

    }


    // =====================================================
    // DOCTOR SUMMARY
    // =====================================================

    if (doctorSummaryBtn) {

        doctorSummaryBtn.addEventListener(
            "click",
            function () {

                const history =
                    getHistory();


                if (!history.length) {

                    alert(
                        "Please record at least one Health Compass check-in first."
                    );

                    return;

                }


                const cycleHistory =
                    getCycleHistory();


                // -----------------------------------------
                // SYMPTOMS
                // -----------------------------------------

                const allSymptoms = [];


                history.forEach(
                    function (item) {

                        (
                            item.symptoms ||
                            []
                        ).forEach(
                            function (symptom) {

                                allSymptoms.push(
                                    symptom
                                );

                            }
                        );

                    }
                );


                const uniqueSymptoms =
                    [
                        ...new Set(
                            allSymptoms
                        )
                    ];


                // -----------------------------------------
                // SLEEP
                // -----------------------------------------

                const sleepValues =
                    history
                        .map(function (item) {

                            return item.sleep;

                        })
                        .filter(function (value) {

                            return (
                                value !== null &&
                                value !== undefined
                            );

                        });


                let averageSleep =
                    "Not available";


                if (
                    sleepValues.length
                ) {

                    const total =
                        sleepValues.reduce(
                            function (sum, value) {

                                return sum + value;

                            },
                            0
                        );


                    averageSleep =
                        (
                            total /
                            sleepValues.length
                        ).toFixed(1) +
                        " hours";

                }


                // -----------------------------------------
                // CYCLE
                // -----------------------------------------

                const cycleLengths =
                    cycleHistory
                        .map(function (item) {

                            return Number(
                                item.cycleLength
                            );

                        })
                        .filter(function (value) {

                            return (
                                !Number.isNaN(value) &&
                                value > 0
                            );

                        });


                let averageCycle =
                    "Not available";


                if (
                    cycleLengths.length
                ) {

                    const total =
                        cycleLengths.reduce(
                            function (
                                sum,
                                value
                            ) {

                                return sum + value;

                            },
                            0
                        );


                    averageCycle =
                        (
                            total /
                            cycleLengths.length
                        ).toFixed(1) +
                        " days";

                }


                // -----------------------------------------
                // SUMMARY
                // -----------------------------------------

                doctorSummary.innerHTML = `

                    <h4>
                        🩺 Personal Health Summary
                    </h4>


                    <div class="pcos-summary-row">

                        <strong>
                            Health Compass check-ins:
                        </strong>

                        ${history.length}

                    </div>


                    <div class="pcos-summary-row">

                        <strong>
                            Recorded cycle average:
                        </strong>

                        ${escapeHTML(
                            averageCycle
                        )}

                    </div>


                    <div class="pcos-summary-row">

                        <strong>
                            Average recorded sleep:
                        </strong>

                        ${escapeHTML(
                            averageSleep
                        )}

                    </div>


                    <div class="pcos-summary-row">

                        <strong>
                            Reported symptoms:
                        </strong>

                        ${
                            uniqueSymptoms.length
                                ? escapeHTML(
                                    uniqueSymptoms.join(
                                        ", "
                                    )
                                )
                                : "None recorded"
                        }

                    </div>


                    <div class="pcos-summary-row">

                        <strong>
                            Latest period status:
                        </strong>

                        ${escapeHTML(
                            history[0].periodStatus
                        )}

                    </div>


                    <div class="pcos-summary-row">

                        <strong>
                            Latest stress:
                        </strong>

                        ${escapeHTML(
                            history[0].stress
                        )}

                    </div>


                    <div class="pcos-summary-row">

                        <strong>
                            Latest activity:
                        </strong>

                        ${escapeHTML(
                            history[0].activity
                        )}

                    </div>


                    <div class="pcos-summary-note">

                        This summary contains information
                        recorded by the user and is intended
                        to support discussion with a healthcare
                        professional. It is not a diagnosis.

                    </div>


                    <br>


                    <button
                        type="button"
                        class="pcos-primary-btn"
                        id="printPCOSSummaryBtn"
                    >
                        🖨 Print / Save Summary
                    </button>

                `;


                doctorSummary.style.display =
                    "block";


                const printBtn =
                    document.getElementById(
                        "printPCOSSummaryBtn"
                    );


                if (printBtn) {

                    printBtn.addEventListener(
                        "click",
                        printDoctorSummary
                    );

                }

            }
        );

    }


    // =====================================================
    // PRINT SUMMARY
    // =====================================================

    function printDoctorSummary() {

        const summary =
            doctorSummary.innerHTML;


        const printWindow =
            window.open(
                "",
                "_blank",
                "width=900,height=700"
            );


        if (!printWindow) {

            alert(
                "Please allow pop-ups to print the summary."
            );

            return;

        }


        printWindow.document.write(`

            <!DOCTYPE html>

            <html>

            <head>

                <title>
                    MediAssist Health Summary
                </title>

                <style>

                    body {
                        font-family:
                            Arial,
                            sans-serif;

                        padding: 40px;

                        color: #172033;

                        line-height: 1.6;
                    }

                    h1 {
                        color: #c62e70;
                    }

                    .summary {
                        max-width: 750px;
                        margin: auto;
                    }

                    .note {
                        margin-top: 25px;
                        padding-top: 15px;
                        border-top:
                            1px solid #ddd;

                        color: #666;

                        font-size: 13px;
                    }

                    button {
                        display: none;
                    }

                </style>

            </head>


            <body>

                <div class="summary">

                    <h1>
                        MediAssist Health Summary
                    </h1>

                    <p>
                        Generated from user-recorded
                        Health Compass information.
                    </p>

                    ${summary}

                </div>

            </body>

            </html>

        `);


        printWindow.document.close();

        printWindow.focus();

        printWindow.print();

    }


    // =====================================================
    // RESET FORM
    // =====================================================

    function resetCheckInForm() {

        const period =
            document.getElementById(
                "pcosPeriodStatus"
            );

        const sleep =
            document.getElementById(
                "pcosSleepHours"
            );

        const stress =
            document.getElementById(
                "pcosStressLevel"
            );

        const activity =
            document.getElementById(
                "pcosActivityLevel"
            );


        if (period) {
            period.value = "";
        }

        if (sleep) {
            sleep.value = "";
        }

        if (stress) {
            stress.value = "";
        }

        if (activity) {
            activity.value = "";
        }


        document
            .querySelectorAll(
                ".pcos-symptom"
            )
            .forEach(
                function (checkbox) {

                    checkbox.checked =
                        false;

                }
            );

    }


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    renderTimeline();


    console.log(
        "PCOS Health Compass initialized."
    );

});