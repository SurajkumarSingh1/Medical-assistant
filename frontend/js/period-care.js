document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // ELEMENTS
    // =====================================================

    const lastPeriodInput =
        document.getElementById("lastPeriod");

    const cycleLengthInput =
        document.getElementById("cycleLength");

    const periodDurationInput =
        document.getElementById("periodDuration");

    const calculateBtn =
        document.getElementById("calculateCycleBtn");

    const cycleDayElement =
        document.getElementById("cycleDay");

    const nextPeriodElement =
        document.getElementById("nextPeriod");

    const ovulationElement =
        document.getElementById("ovulationDate");

    const fertileWindowElement =
        document.getElementById("fertileWindow");

    const calendarElement =
        document.getElementById("calendar");

    const calendarTitle =
        document.getElementById("calendarTitle");

    const prevMonthBtn =
        document.getElementById("prevMonth");

    const nextMonthBtn =
        document.getElementById("nextMonth");

    const saveTrackingBtn =
        document.getElementById("saveTrackingBtn");

    const userNameElement =
        document.getElementById("userName");


    // =====================================================
    // DATA
    // =====================================================

    let cycleData = {
        lastPeriod: null,
        cycleLength: 28,
        periodDuration: 5,
        nextPeriod: null,
        ovulation: null,
        fertileStart: null,
        fertileEnd: null
    };


    let calendarDate = new Date();


    // =====================================================
    // USER NAME
    // =====================================================

    try {

        const user =
            JSON.parse(
                localStorage.getItem("user")
            );

        if (user) {

            const name =
                user.name ||
                user.username ||
                user.fullName;

            if (name && userNameElement) {
                userNameElement.textContent = name;
            }

        }

    } catch (error) {

        console.log(
            "User information could not be loaded."
        );

    }


    // =====================================================
    // LOGOUT
    // =====================================================

    const logoutBtn =
        document.getElementById("logoutBtn");

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            function () {

                localStorage.removeItem("token");
                localStorage.removeItem("user");
                localStorage.removeItem("mediassist_chat");

            }
        );

    }


    // =====================================================
    // DEFAULT DATE
    // =====================================================

    if (lastPeriodInput) {

        const today = new Date();

        /*
         * Set today's date as default only when
         * no previous date is saved.
         */

        const savedData =
            localStorage.getItem(
                "mediassist_period_data"
            );

        if (!savedData) {

            lastPeriodInput.value =
                formatDateForInput(today);

        }

    }


    // =====================================================
    // LOAD SAVED PERIOD DATA
    // =====================================================

    loadPeriodData();


    // =====================================================
    // CALCULATE CYCLE
    // =====================================================

    if (calculateBtn) {

        calculateBtn.addEventListener(
            "click",
            function () {

                calculateCycle();

            }
        );

    }


    // =====================================================
    // CALCULATE CYCLE FUNCTION
    // =====================================================

    function calculateCycle() {

        const lastPeriodValue =
            lastPeriodInput.value;

        const cycleLength =
            parseInt(
                cycleLengthInput.value,
                10
            );

        const periodDuration =
            parseInt(
                periodDurationInput.value,
                10
            );


        // -------------------------------------------------
        // VALIDATION
        // -------------------------------------------------

        if (!lastPeriodValue) {

            alert(
                "Please select your last period start date."
            );

            return;

        }


        if (
            isNaN(cycleLength) ||
            cycleLength < 21 ||
            cycleLength > 45
        ) {

            alert(
                "Please enter a cycle length between 21 and 45 days."
            );

            return;

        }


        if (
            isNaN(periodDuration) ||
            periodDuration < 1 ||
            periodDuration > 10
        ) {

            alert(
                "Please enter a period duration between 1 and 10 days."
            );

            return;

        }


        // -------------------------------------------------
        // CREATE DATES
        // -------------------------------------------------

        const lastPeriod =
            parseLocalDate(lastPeriodValue);


        /*
         * Next period:
         *
         * Last period + cycle length
         */

        const nextPeriod =
            addDays(
                lastPeriod,
                cycleLength
            );


        /*
         * Ovulation is estimated approximately
         * 14 days before the next period.
         */

        const ovulation =
            addDays(
                nextPeriod,
                -14
            );


        /*
         * Fertile window:
         *
         * Approximately 5 days before ovulation
         * through 1 day after ovulation.
         */

        const fertileStart =
            addDays(
                ovulation,
                -5
            );

        const fertileEnd =
            addDays(
                ovulation,
                1
            );


        // -------------------------------------------------
        // SAVE DATA
        // -------------------------------------------------

        cycleData = {

            lastPeriod:
                formatDateForStorage(
                    lastPeriod
                ),

            cycleLength:
                cycleLength,

            periodDuration:
                periodDuration,

            nextPeriod:
                formatDateForStorage(
                    nextPeriod
                ),

            ovulation:
                formatDateForStorage(
                    ovulation
                ),

            fertileStart:
                formatDateForStorage(
                    fertileStart
                ),

            fertileEnd:
                formatDateForStorage(
                    fertileEnd
                )

        };


        localStorage.setItem(
            "mediassist_period_data",
            JSON.stringify(cycleData)
        );


        // -------------------------------------------------
        // UPDATE UI
        // -------------------------------------------------

        updateSummary();

        calendarDate =
            new Date(
                lastPeriod.getFullYear(),
                lastPeriod.getMonth(),
                1
            );

        renderCalendar();


        // -------------------------------------------------
        // SUCCESS MESSAGE
        // -------------------------------------------------

        showMessage(
            "Cycle information calculated successfully."
        );

    }


    // =====================================================
    // UPDATE SUMMARY
    // =====================================================

    function updateSummary() {

        if (!cycleData.lastPeriod) {
            return;
        }


        const lastPeriod =
            parseStoredDate(
                cycleData.lastPeriod
            );

        const nextPeriod =
            parseStoredDate(
                cycleData.nextPeriod
            );

        const ovulation =
            parseStoredDate(
                cycleData.ovulation
            );


        // -------------------------------------------------
        // CURRENT CYCLE DAY
        // -------------------------------------------------

        const today =
            startOfDay(
                new Date()
            );


        let cycleDay =
            differenceInDays(
                today,
                lastPeriod
            ) + 1;


        /*
         * If the estimated next cycle has already passed,
         * calculate the current cycle approximately based
         * on repeated cycle lengths.
         */

        if (
            cycleDay >
            cycleData.cycleLength
        ) {

            const cyclesPassed =
                Math.floor(
                    (
                        cycleDay - 1
                    ) /
                    cycleData.cycleLength
                );


            const adjustedLastPeriod =
                addDays(
                    lastPeriod,
                    cyclesPassed *
                    cycleData.cycleLength
                );


            cycleDay =
                differenceInDays(
                    today,
                    adjustedLastPeriod
                ) + 1;

        }


        if (cycleDay < 1) {
            cycleDay = 1;
        }


        // -------------------------------------------------
        // DISPLAY
        // -------------------------------------------------

        cycleDayElement.textContent =
            "Day " + cycleDay;


        nextPeriodElement.textContent =
            formatDisplayDate(
                nextPeriod
            );


        ovulationElement.textContent =
            formatDisplayDate(
                ovulation
            );


        const fertileStart =
            parseStoredDate(
                cycleData.fertileStart
            );

        const fertileEnd =
            parseStoredDate(
                cycleData.fertileEnd
            );


        fertileWindowElement.textContent =
            formatShortDate(
                fertileStart
            ) +
            " - " +
            formatShortDate(
                fertileEnd
            );

    }


    // =====================================================
    // CALENDAR
    // =====================================================

    function renderCalendar() {

        if (!calendarElement) {
            return;
        }


        calendarElement.innerHTML = "";


        const year =
            calendarDate.getFullYear();

        const month =
            calendarDate.getMonth();


        // -------------------------------------------------
        // MONTH TITLE
        // -------------------------------------------------

        const monthName =
            calendarDate.toLocaleString(
                "en-US",
                {
                    month: "long"
                }
            );


        if (calendarTitle) {

            calendarTitle.textContent =
                monthName +
                " " +
                year;

        }


        // -------------------------------------------------
        // DAY NAMES
        // -------------------------------------------------

        const dayNames = [
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
            "Sun"
        ];


        dayNames.forEach(
            function (day) {

                const dayName =
                    document.createElement(
                        "div"
                    );

                dayName.className =
                    "calendar-day-name";

                dayName.textContent =
                    day;

                calendarElement.appendChild(
                    dayName
                );

            }
        );


        // -------------------------------------------------
        // FIRST DAY
        // -------------------------------------------------

        const firstDay =
            new Date(
                year,
                month,
                1
            );


        /*
         * JavaScript Sunday = 0.
         * Convert to Monday = 0.
         */

        let startingDay =
            firstDay.getDay() - 1;


        if (startingDay < 0) {
            startingDay = 6;
        }


        // -------------------------------------------------
        // PREVIOUS MONTH DAYS
        // -------------------------------------------------

        const previousMonthLastDate =
            new Date(
                year,
                month,
                0
            ).getDate();


        for (
            let i = startingDay - 1;
            i >= 0;
            i--
        ) {

            const dayNumber =
                previousMonthLastDate - i;


            const date =
                new Date(
                    year,
                    month - 1,
                    dayNumber
                );


            createCalendarDay(
                date,
                true
            );

        }


        // -------------------------------------------------
        // CURRENT MONTH DAYS
        // -------------------------------------------------

        const daysInMonth =
            new Date(
                year,
                month + 1,
                0
            ).getDate();


        for (
            let day = 1;
            day <= daysInMonth;
            day++
        ) {

            const date =
                new Date(
                    year,
                    month,
                    day
                );


            createCalendarDay(
                date,
                false
            );

        }


        // -------------------------------------------------
        // NEXT MONTH DAYS
        // -------------------------------------------------

        const totalCells =
            calendarElement.children.length;


        const remainingCells =
            42 - totalCells;


        for (
            let day = 1;
            day <= remainingCells;
            day++
        ) {

            const date =
                new Date(
                    year,
                    month + 1,
                    day
                );


            createCalendarDay(
                date,
                true
            );

        }

    }


    // =====================================================
    // CREATE CALENDAR DAY
    // =====================================================

    function createCalendarDay(
        date,
        otherMonth
    ) {

        const dayElement =
            document.createElement(
                "div"
            );


        dayElement.className =
            "calendar-day";


        if (otherMonth) {

            dayElement.classList.add(
                "other-month"
            );

        }


        dayElement.textContent =
            date.getDate();


        // -------------------------------------------------
        // TODAY
        // -------------------------------------------------

        if (
            isSameDate(
                date,
                new Date()
            )
        ) {

            dayElement.classList.add(
                "today"
            );

        }


        // -------------------------------------------------
        // PERIOD
        // -------------------------------------------------

        if (cycleData.lastPeriod) {

            const lastPeriod =
                parseStoredDate(
                    cycleData.lastPeriod
                );


            const periodEnd =
                addDays(
                    lastPeriod,
                    cycleData.periodDuration - 1
                );


            if (
                isDateBetween(
                    date,
                    lastPeriod,
                    periodEnd
                )
            ) {

                dayElement.classList.add(
                    "period"
                );

            }

        }


        // -------------------------------------------------
        // FERTILE WINDOW
        // -------------------------------------------------

        if (
            cycleData.fertileStart &&
            cycleData.fertileEnd
        ) {

            const fertileStart =
                parseStoredDate(
                    cycleData.fertileStart
                );

            const fertileEnd =
                parseStoredDate(
                    cycleData.fertileEnd
                );


            if (
                isDateBetween(
                    date,
                    fertileStart,
                    fertileEnd
                )
            ) {

                dayElement.classList.add(
                    "fertile"
                );

            }

        }


        // -------------------------------------------------
        // OVULATION
        // -------------------------------------------------

        if (cycleData.ovulation) {

            const ovulation =
                parseStoredDate(
                    cycleData.ovulation
                );


            if (
                isSameDate(
                    date,
                    ovulation
                )
            ) {

                dayElement.classList.add(
                    "ovulation"
                );

            }

        }


        calendarElement.appendChild(
            dayElement
        );

    }


    // =====================================================
    // PREVIOUS MONTH
    // =====================================================

    if (prevMonthBtn) {

        prevMonthBtn.addEventListener(
            "click",
            function () {

                calendarDate.setMonth(
                    calendarDate.getMonth() - 1
                );

                renderCalendar();

            }
        );

    }


    // =====================================================
    // NEXT MONTH
    // =====================================================

    if (nextMonthBtn) {

        nextMonthBtn.addEventListener(
            "click",
            function () {

                calendarDate.setMonth(
                    calendarDate.getMonth() + 1
                );

                renderCalendar();

            }
        );

    }


    // =====================================================
    // SYMPTOM SELECTION
    // =====================================================

    const symptomButtons =
        document.querySelectorAll(
            ".symptom-option"
        );


    symptomButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    button.classList.toggle(
                        "selected"
                    );

                }
            );

        }
    );


    // =====================================================
    // MOOD SELECTION
    // =====================================================

    const moodButtons =
        document.querySelectorAll(
            ".mood-option"
        );


    moodButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    /*
                     * Only one mood can be selected.
                     */

                    moodButtons.forEach(
                        function (otherButton) {

                            otherButton.classList.remove(
                                "selected"
                            );

                        }
                    );


                    button.classList.add(
                        "selected"
                    );

                }
            );

        }
    );


    // =====================================================
    // FLOW SELECTION
    // =====================================================

    const flowButtons =
        document.querySelectorAll(
            ".flow-option"
        );


    flowButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    /*
                     * Only one flow level can be selected.
                     */

                    flowButtons.forEach(
                        function (otherButton) {

                            otherButton.classList.remove(
                                "selected"
                            );

                        }
                    );


                    button.classList.add(
                        "selected"
                    );

                }
            );

        }
    );


    // =====================================================
    // SAVE TODAY'S TRACKING
    // =====================================================

    if (saveTrackingBtn) {

        saveTrackingBtn.addEventListener(
            "click",
            function () {

                const selectedSymptoms = [];


                document
                    .querySelectorAll(
                        ".symptom-option.selected"
                    )
                    .forEach(
                        function (button) {

                            selectedSymptoms.push(
                                button.dataset.value
                            );

                        }
                    );


                const selectedMood =
                    document.querySelector(
                        ".mood-option.selected"
                    );


                const selectedFlow =
                    document.querySelector(
                        ".flow-option.selected"
                    );


                const trackingData = {

                    date:
                        formatDateForStorage(
                            new Date()
                        ),

                    symptoms:
                        selectedSymptoms,

                    mood:
                        selectedMood
                            ? selectedMood.dataset.value
                            : null,

                    flow:
                        selectedFlow
                            ? selectedFlow.dataset.value
                            : null

                };


                localStorage.setItem(
                    "mediassist_period_tracking",
                    JSON.stringify(
                        trackingData
                    )
                );


                showMessage(
                    "Today's period tracking has been saved."
                );

            }
        );

    }


    // =====================================================
    // LOAD TRACKING
    // =====================================================

    loadTracking();


    function loadTracking() {

        try {

            const saved =
                localStorage.getItem(
                    "mediassist_period_tracking"
                );


            if (!saved) {
                return;
            }


            const data =
                JSON.parse(saved);


            // -------------------------------------------------
            // SYMPTOMS
            // -------------------------------------------------

            if (
                Array.isArray(
                    data.symptoms
                )
            ) {

                document
                    .querySelectorAll(
                        ".symptom-option"
                    )
                    .forEach(
                        function (button) {

                            if (
                                data.symptoms.includes(
                                    button.dataset.value
                                )
                            ) {

                                button.classList.add(
                                    "selected"
                                );

                            }

                        }
                    );

            }


            // -------------------------------------------------
            // MOOD
            // -------------------------------------------------

            if (data.mood) {

                document
                    .querySelectorAll(
                        ".mood-option"
                    )
                    .forEach(
                        function (button) {

                            if (
                                button.dataset.value ===
                                data.mood
                            ) {

                                button.classList.add(
                                    "selected"
                                );

                            }

                        }
                    );

            }


            // -------------------------------------------------
            // FLOW
            // -------------------------------------------------

            if (data.flow) {

                document
                    .querySelectorAll(
                        ".flow-option"
                    )
                    .forEach(
                        function (button) {

                            if (
                                button.dataset.value ===
                                data.flow
                            ) {

                                button.classList.add(
                                    "selected"
                                );

                            }

                        }
                    );

            }

        } catch (error) {

            console.error(
                "Unable to load tracking data:",
                error
            );

        }

    }


    // =====================================================
    // LOAD PERIOD DATA
    // =====================================================

    function loadPeriodData() {

        try {

            const saved =
                localStorage.getItem(
                    "mediassist_period_data"
                );


            if (!saved) {

                renderCalendar();

                return;

            }


            const data =
                JSON.parse(saved);


            if (
                !data ||
                !data.lastPeriod
            ) {

                renderCalendar();

                return;

            }


            cycleData = data;


            // -------------------------------------------------
            // FORM VALUES
            // -------------------------------------------------

            if (lastPeriodInput) {

                lastPeriodInput.value =
                    data.lastPeriod;

            }


            if (cycleLengthInput) {

                cycleLengthInput.value =
                    data.cycleLength || 28;

            }


            if (periodDurationInput) {

                periodDurationInput.value =
                    data.periodDuration || 5;

            }


            // -------------------------------------------------
            // CALENDAR DATE
            // -------------------------------------------------

            const lastPeriod =
                parseStoredDate(
                    data.lastPeriod
                );


            calendarDate =
                new Date(
                    lastPeriod.getFullYear(),
                    lastPeriod.getMonth(),
                    1
                );


            // -------------------------------------------------
            // UPDATE
            // -------------------------------------------------

            updateSummary();

            renderCalendar();

        } catch (error) {

            console.error(
                "Unable to load period data:",
                error
            );

            renderCalendar();

        }

    }


    // =====================================================
    // SHOW MESSAGE
    // =====================================================

    function showMessage(message) {

        /*
         * Use a simple temporary message instead of
         * depending on another HTML element.
         */

        const oldMessage =
            document.querySelector(
                ".period-success-message"
            );


        if (oldMessage) {
            oldMessage.remove();
        }


        const messageElement =
            document.createElement(
                "div"
            );


        messageElement.className =
            "period-success-message";


        messageElement.textContent =
            "✓ " + message;


        messageElement.style.position =
            "fixed";

        messageElement.style.right =
            "25px";

        messageElement.style.bottom =
            "25px";

        messageElement.style.zIndex =
            "9999";

        messageElement.style.background =
            "#e83e8c";

        messageElement.style.color =
            "#ffffff";

        messageElement.style.padding =
            "12px 18px";

        messageElement.style.borderRadius =
            "9px";

        messageElement.style.fontSize =
            "13px";

        messageElement.style.fontWeight =
            "600";

        messageElement.style.boxShadow =
            "0 6px 20px rgba(0,0,0,0.15)";


        document.body.appendChild(
            messageElement
        );


        setTimeout(
            function () {

                messageElement.remove();

            },
            2500
        );

    }


    // =====================================================
    // DATE HELPERS
    // =====================================================

    function parseLocalDate(value) {

        const parts =
            value.split("-");


        return new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            Number(parts[2])
        );

    }


    function parseStoredDate(value) {

        return parseLocalDate(value);

    }


    function startOfDay(date) {

        return new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );

    }


    function addDays(
        date,
        days
    ) {

        const result =
            new Date(date);


        result.setDate(
            result.getDate() + days
        );


        return result;

    }


    function differenceInDays(
        date1,
        date2
    ) {

        const first =
            startOfDay(date1);

        const second =
            startOfDay(date2);


        const difference =
            first.getTime() -
            second.getTime();


        return Math.round(
            difference /
            (1000 * 60 * 60 * 24)
        );

    }


    function isSameDate(
        date1,
        date2
    ) {

        return (
            date1.getFullYear() ===
            date2.getFullYear()
        &&
            date1.getMonth() ===
            date2.getMonth()
        &&
            date1.getDate() ===
            date2.getDate()
        );

    }


    function isDateBetween(
        date,
        start,
        end
    ) {

        const current =
            startOfDay(date).getTime();

        const startTime =
            startOfDay(start).getTime();

        const endTime =
            startOfDay(end).getTime();


        return (
            current >= startTime &&
            current <= endTime
        );

    }


    function formatDateForInput(date) {

        const year =
            date.getFullYear();


        const month =
            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const day =
            String(
                date.getDate()
            ).padStart(
                2,
                "0"
            );


        return (
            year +
            "-" +
            month +
            "-" +
            day
        );

    }


    function formatDateForStorage(date) {

        return formatDateForInput(date);

    }


    function formatDisplayDate(date) {

        if (!date) {
            return "--";
        }


        return date.toLocaleDateString(
            "en-US",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );

    }


    function formatShortDate(date) {

        if (!date) {
            return "--";
        }


        return date.toLocaleDateString(
            "en-US",
            {
                day: "numeric",
                month: "short"
            }
        );

    }


    // =====================================================
    // INITIAL CALENDAR
    // =====================================================

    renderCalendar();

});

/* =========================================================
   PERIOD CARE HISTORY - WORKING VERSION
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const historyButton =
        document.getElementById("periodHistoryBtn");

    const historyPanel =
        document.getElementById("periodHistoryPanel");

    const cycleHistoryList =
        document.getElementById("cycleHistoryList");

    const trackingHistoryList =
        document.getElementById("trackingHistoryList");

    const clearCycleHistoryBtn =
        document.getElementById("clearCycleHistoryBtn");

    const clearTrackingHistoryBtn =
        document.getElementById("clearTrackingHistoryBtn");

    const calculateCycleBtn =
        document.getElementById("calculateCycleBtn");

    const saveTrackingBtn =
        document.getElementById("saveTrackingBtn");


    /* =====================================================
       SHOW / HIDE HISTORY
    ===================================================== */

    if (historyButton && historyPanel) {

        historyButton.addEventListener("click", function () {

            const isOpen =
                historyPanel.classList.contains("show");

            if (isOpen) {

                historyPanel.classList.remove("show");

                historyButton.classList.remove("active");

                historyButton.textContent =
                    "📋 View History";

            } else {

                historyPanel.classList.add("show");

                historyButton.classList.add("active");

                historyButton.textContent =
                    "✕ Hide History";

                loadPeriodHistory();

                /* Scroll to history */
                setTimeout(function () {

                    historyPanel.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }, 100);

            }

        });

    }


    /* =====================================================
       SAVE CYCLE HISTORY
    ===================================================== */

    if (calculateCycleBtn) {

        calculateCycleBtn.addEventListener("click", function () {

            setTimeout(function () {

                const savedCycle =
                    localStorage.getItem(
                        "mediassist_period_data"
                    );

                if (!savedCycle) {
                    return;
                }

                try {

                    const cycleData =
                        JSON.parse(savedCycle);

                    saveCycleHistory(cycleData);

                } catch (error) {

                    console.error(
                        "Unable to save cycle history:",
                        error
                    );

                }

            }, 100);

        });

    }


    function saveCycleHistory(data) {

        let history = [];

        try {

            history =
                JSON.parse(
                    localStorage.getItem(
                        "mediassist_period_history"
                    ) || "[]"
                );

            if (!Array.isArray(history)) {
                history = [];
            }

        } catch (error) {

            history = [];

        }


        /* Avoid duplicate records */
        const alreadyExists =
            history.some(function (item) {

                return (
                    item.lastPeriod === data.lastPeriod &&
                    Number(item.cycleLength) ===
                        Number(data.cycleLength) &&
                    Number(item.periodDuration) ===
                        Number(data.periodDuration)
                );

            });


        if (!alreadyExists) {

            history.unshift({

                ...data,

                savedAt:
                    new Date().toISOString()

            });

        }


        localStorage.setItem(
            "mediassist_period_history",
            JSON.stringify(history)
        );


        /* Update history if it is currently open */
        if (
            historyPanel &&
            historyPanel.classList.contains("show")
        ) {

            loadPeriodHistory();

        }

    }


    /* =====================================================
       LOAD CYCLE HISTORY
    ===================================================== */

    function loadPeriodHistory() {

        renderCycleHistory();

        renderTrackingHistory();

    }


    /* =====================================================
       RENDER CYCLE HISTORY
    ===================================================== */

    function renderCycleHistory() {

        if (!cycleHistoryList) {
            return;
        }


        let history = [];

        try {

            history =
                JSON.parse(
                    localStorage.getItem(
                        "mediassist_period_history"
                    ) || "[]"
                );

            if (!Array.isArray(history)) {
                history = [];
            }

        } catch (error) {

            history = [];

        }


        if (history.length === 0) {

            cycleHistoryList.innerHTML = `
                <div class="history-empty">
                    No cycle history yet.
                    Calculate your cycle to save a record here.
                </div>
            `;

            return;

        }


        cycleHistoryList.innerHTML =
            history.map(function (item, index) {

                return `

                    <div class="history-item">

<div class="history-item-top">

    <div class="history-date">
        🩸 Cycle Record ${index + 1}
    </div>

    <div class="history-actions">

        <span class="history-badge">
            Saved
        </span>

        <button
            type="button"
            class="delete-history-btn"
            data-history-type="cycle"
            data-history-index="${index}"
        >
            🗑 Delete
        </button>

    </div>

</div>


                        <div class="history-details">

                            <div class="history-detail">

                                <span>
                                    Last Period
                                </span>

                                <strong>
                                    ${formatHistoryDate(
                                        item.lastPeriod
                                    )}
                                </strong>

                            </div>


                            <div class="history-detail">

                                <span>
                                    Cycle Length
                                </span>

                                <strong>
                                    ${item.cycleLength || "--"} days
                                </strong>

                            </div>


                            <div class="history-detail">

                                <span>
                                    Period Duration
                                </span>

                                <strong>
                                    ${item.periodDuration || "--"} days
                                </strong>

                            </div>


                            <div class="history-detail">

                                <span>
                                    Next Period
                                </span>

                                <strong>
                                    ${formatHistoryDate(
                                        item.nextPeriod
                                    )}
                                </strong>

                            </div>


                            <div class="history-detail">

                                <span>
                                    Estimated Ovulation
                                </span>

                                <strong>
                                    ${formatHistoryDate(
                                        item.ovulation
                                    )}
                                </strong>

                            </div>


                            <div class="history-detail">

                                <span>
                                    Fertile Window
                                </span>

                                <strong>
                                    ${formatHistoryDate(
                                        item.fertileStart
                                    )}
                                    -
                                    ${formatHistoryDate(
                                        item.fertileEnd
                                    )}
                                </strong>

                            </div>

                        </div>

                    </div>

                `;

            }).join("");

    }


    /* =====================================================
       RENDER DAILY HEALTH HISTORY
    ===================================================== */

    function renderTrackingHistory() {

        if (!trackingHistoryList) {
            return;
        }


        let history = [];

        try {

            history =
                JSON.parse(
                    localStorage.getItem(
                        "mediassist_period_tracking_history"
                    ) || "[]"
                );

            if (!Array.isArray(history)) {
                history = [];
            }

        } catch (error) {

            history = [];

        }


        /* Also include the current saved tracking record */
        const currentTracking =
            localStorage.getItem(
                "mediassist_period_tracking"
            );


        if (
            history.length === 0 &&
            currentTracking
        ) {

            try {

                const current =
                    JSON.parse(currentTracking);

                history = [current];

            } catch (error) {

                console.error(
                    "Unable to read current tracking:",
                    error
                );

            }

        }


        if (history.length === 0) {

            trackingHistoryList.innerHTML = `
                <div class="history-empty">
                    No daily health tracking saved yet.
                </div>
            `;

            return;

        }


        trackingHistoryList.innerHTML =
            history.map(function (item, index) {

                const symptoms =
                    Array.isArray(item.symptoms) &&
                    item.symptoms.length > 0
                        ? item.symptoms.join(", ")
                        : "None selected";


                return `

                    <div class="history-item">
                    <div class="history-item-top">

    <div class="history-date">
        💢 Health Record ${index + 1}
    </div>

    <div class="history-actions">

        <span class="history-badge">
            Saved
        </span>

        <button
            type="button"
            class="delete-history-btn"
            data-history-type="tracking"
            data-history-index="${index}"
        >
            🗑 Delete
        </button>

    </div>

</div>


                        <div class="history-detail">

    <span>
        Date & Time
    </span>

    <strong>
        ${formatHistoryDateTime(
            item.savedAt || item.date
        )}
    </strong>

</div>


                            <div class="history-detail">

                                <span>
                                    Symptoms
                                </span>

                                <strong>
                                    ${escapeHistoryHtml(
                                        symptoms
                                    )}
                                </strong>

                            </div>


                            <div class="history-detail">

                                <span>
                                    Mood
                                </span>

                                <strong>
                                    ${escapeHistoryHtml(
                                        item.mood || "Not selected"
                                    )}
                                </strong>

                            </div>


                            <div class="history-detail">

                                <span>
                                    Flow
                                </span>

                                <strong>
                                    ${escapeHistoryHtml(
                                        item.flow || "Not selected"
                                    )}
                                </strong>

                            </div>

                        </div>

                    </div>

                `;

            }).join("");

    }


    /* =====================================================
       CLEAR CYCLE HISTORY
    ===================================================== */

    if (clearCycleHistoryBtn) {

        clearCycleHistoryBtn.addEventListener(
            "click",
            function () {

                const confirmed =
                    confirm(
                        "Clear all saved cycle history?"
                    );

                if (!confirmed) {
                    return;
                }


                localStorage.removeItem(
                    "mediassist_period_history"
                );


                renderCycleHistory();

            }
        );

    }


    /* =====================================================
       CLEAR HEALTH HISTORY
    ===================================================== */

    if (clearTrackingHistoryBtn) {

        clearTrackingHistoryBtn.addEventListener(
            "click",
            function () {

                const confirmed =
                    confirm(
                        "Clear all saved daily health history?"
                    );

                if (!confirmed) {
                    return;
                }


                localStorage.removeItem(
                    "mediassist_period_tracking_history"
                );

                localStorage.removeItem(
                    "mediassist_period_tracking"
                );


                renderTrackingHistory();

            }
        );

    }

    /* =====================================================
   DELETE INDIVIDUAL HISTORY RECORD
===================================================== */

function deleteIndividualHistory(type, index) {

    const storageKey =
        type === "cycle"
            ? "mediassist_period_history"
            : "mediassist_period_tracking_history";

    let history = [];

    try {

        history = JSON.parse(
            localStorage.getItem(storageKey) || "[]"
        );

        if (!Array.isArray(history)) {
            history = [];
        }

    } catch (error) {

        console.error(
            "Unable to read history:",
            error
        );

        return;
    }


    /* Check that the selected record exists */

    if (
        index < 0 ||
        index >= history.length
    ) {
        return;
    }


    const historyName =
        type === "cycle"
            ? "cycle history"
            : "daily health history";


    const confirmed = confirm(
        `Delete this ${historyName} record?`
    );


    if (!confirmed) {
        return;
    }

/* Remove only the selected record */

history.splice(index, 1);


/* =====================================================
   IMPORTANT:
   If the last DAILY HEALTH record is deleted,
   also remove the current tracking record.
   Otherwise renderTrackingHistory() will recreate it.
===================================================== */

if (
    type === "tracking" &&
    history.length === 0
) {

    localStorage.removeItem(
        "mediassist_period_tracking"
    );

}


/* Save the remaining records */

localStorage.setItem(
    storageKey,
    JSON.stringify(history)
);


/* Refresh the correct history list */

if (type === "cycle") {

    renderCycleHistory();

} else {

    renderTrackingHistory();

}
    

}


/* =====================================================
   INDIVIDUAL DELETE BUTTON CLICK
===================================================== */

if (cycleHistoryList) {

    cycleHistoryList.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    ".delete-history-btn"
                );


            if (!button) {
                return;
            }


            const type =
                button.dataset.historyType;


            const index =
                Number(
                    button.dataset.historyIndex
                );


            deleteIndividualHistory(
                type,
                index
            );

        }
    );

}


if (trackingHistoryList) {

    trackingHistoryList.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    ".delete-history-btn"
                );


            if (!button) {
                return;
            }


            const type =
                button.dataset.historyType;


            const index =
                Number(
                    button.dataset.historyIndex
                );


            deleteIndividualHistory(
                type,
                index
            );

        }
    );

}


/* =====================================================
   SAVE DAILY TRACKING TO HISTORY
   MULTIPLE RECORDS ARE ALLOWED
===================================================== */

if (saveTrackingBtn) {

    saveTrackingBtn.addEventListener(
        "click",
        function () {

            setTimeout(function () {

                const savedTracking =
                    localStorage.getItem(
                        "mediassist_period_tracking"
                    );

                if (!savedTracking) {
                    return;
                }


                try {

                    const trackingData =
                        JSON.parse(savedTracking);


                    /* =========================================
                       GET EXISTING HISTORY
                    ========================================= */

                    let history = [];

                    try {

                        history =
                            JSON.parse(
                                localStorage.getItem(
                                    "mediassist_period_tracking_history"
                                ) || "[]"
                            );

                        if (!Array.isArray(history)) {
                            history = [];
                        }

                    } catch (error) {

                        history = [];

                    }


                    /* =========================================
                       CREATE A NEW RECORD EVERY TIME
                    ========================================= */

                    const newHistoryRecord = {

                        ...trackingData,

                        date:
                            trackingData.date ||
                            new Date()
                                .toISOString()
                                .split("T")[0],

                        savedAt:
                            new Date().toISOString()

                    };


                    /* =========================================
                       ALWAYS ADD NEW RECORD
                       DO NOT REPLACE OLD RECORD
                    ========================================= */

                    history.unshift(
                        newHistoryRecord
                    );


                    /* =========================================
                       SAVE ALL HISTORY
                    ========================================= */

                    localStorage.setItem(
                        "mediassist_period_tracking_history",
                        JSON.stringify(history)
                    );


                    /* =========================================
                       REFRESH HISTORY IF OPEN
                    ========================================= */

                    if (
                        historyPanel &&
                        historyPanel.classList.contains("show")
                    ) {

                        renderTrackingHistory();

                    }


                    console.log(
                        "New daily health history saved:",
                        newHistoryRecord
                    );


                } catch (error) {

                    console.error(
                        "Unable to save health history:",
                        error
                    );

                }

            }, 150);

        }
    );

}

    /* =====================================================
       FORMAT DATE
    ===================================================== */

    function formatHistoryDate(dateValue) {

        if (!dateValue) {
            return "--";
        }


        const date =
            new Date(dateValue);


        if (isNaN(date.getTime())) {
            return dateValue;
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
    function formatHistoryDateTime(dateValue) {

    if (!dateValue) {
        return "--";
    }

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
        return dateValue;
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


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHistoryHtml(value) {

        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    if (historyPanel) {

        /* Keep it hidden when page loads */
        historyPanel.classList.remove("show");

    }

});