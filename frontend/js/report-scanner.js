document.addEventListener("DOMContentLoaded", function () {
        const API_BASE_URL =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
            ? "http://localhost:5000"
            : "";

    // =====================================================
    // ELEMENTS
    // =====================================================

    const fileInput =
        document.getElementById("reportFile");

    const fileName =
        document.getElementById("fileName");

    const scanButton =
        document.getElementById("scanReportBtn");

    const uploadArea =
        document.getElementById("uploadArea");

    const resultArea =
        document.getElementById("resultArea");

    const newAnalysisBtn =
        document.getElementById("newAnalysisBtn");


    // =====================================================
    // CHECK REQUIRED ELEMENTS
    // =====================================================

    if (
        !fileInput ||
        !fileName ||
        !scanButton ||
        !uploadArea ||
        !resultArea
    ) {

        console.error(
            "Report Scanner: Required HTML elements not found."
        );

        return;
    }


    // =====================================================
    // ADD SCANNER STYLES
    // =====================================================

    const scannerStyle =
        document.createElement("style");

    scannerStyle.textContent = `

        /* =================================================
           FILE PREVIEW
        ================================================= */

        .medical-file-preview {

            position: relative;

            width: 100%;
            max-width: 650px;

            min-height: 180px;

            margin: 25px auto;

            border-radius: 18px;

            overflow: hidden;

            background:
                linear-gradient(
                    145deg,
                    #f8fafc,
                    #eef4f7
                );

            border:
                1px solid #dce7ec;

            box-shadow:
                0 10px 30px rgba(0,0,0,0.08);

            display: flex;

            align-items: center;

            justify-content: center;
        }


        /* IMAGE */

        .medical-file-preview img {

            display: block;

            width: 100%;

            max-height: 430px;

            object-fit: contain;

            background: #111827;
        }


        /* PDF */

        .medical-file-preview iframe {

            display: block;

            width: 100%;

            height: 430px;

            border: none;

            background: white;
        }


        /* DOCUMENT */

        .document-preview {

            width: 100%;

            padding: 45px 25px;

            text-align: center;

            background: white;
        }


        .document-preview-icon {

            font-size: 60px;

            margin-bottom: 12px;
        }


        .document-preview-name {

            font-weight: 700;

            color: #17212b;

            word-break: break-word;
        }


        /* =================================================
           SCANNING OVERLAY
        ================================================= */

        .medical-scan-overlay {

            position: absolute;

            inset: 0;

            z-index: 20;

            pointer-events: none;

            display: none;

            overflow: hidden;

            background:
                linear-gradient(
                    to bottom,
                    rgba(0,255,220,0.01),
                    rgba(0,255,220,0.06)
                );
        }


        .medical-file-preview.scanning
        .medical-scan-overlay {

            display: block;
        }


        /* =================================================
           SCANNING LINE
        ================================================= */

        .medical-scan-line {

            position: absolute;

            left: 0;

            right: 0;

            top: 0;

            height: 5px;

            z-index: 30;

            background:
                linear-gradient(
                    90deg,
                    transparent 0%,
                    rgba(0,255,220,0.15) 10%,
                    #00ffd5 30%,
                    #00ffff 50%,
                    #00ffd5 70%,
                    rgba(0,255,220,0.15) 90%,
                    transparent 100%
                );

            box-shadow:
                0 0 8px #00ffd5,
                0 0 18px #00ffff,
                0 0 35px rgba(0,255,220,0.9),
                0 0 70px rgba(0,255,220,0.5);

            animation:
                medicalScanMove 2.2s
                ease-in-out infinite;
        }


        @keyframes medicalScanMove {

            0% {

                top: 0%;

                opacity: 0.45;
            }

            10% {

                opacity: 1;
            }

            50% {

                top: calc(100% - 5px);

                opacity: 1;
            }

            90% {

                opacity: 1;
            }

            100% {

                top: 0%;

                opacity: 0.45;
            }
        }


        /* =================================================
           SCANNING LIGHT
        ================================================= */

        .medical-scan-glow {

            position: absolute;

            left: 0;

            right: 0;

            top: 0;

            height: 100px;

            z-index: 25;

            pointer-events: none;

            background:
                linear-gradient(
                    to bottom,
                    rgba(0,255,255,0.28),
                    rgba(0,255,255,0.08),
                    transparent
                );

            filter: blur(3px);

            animation:
                medicalScanGlow 2.2s
                ease-in-out infinite;
        }


        @keyframes medicalScanGlow {

            0% {

                transform:
                    translateY(-110px);

                opacity: 0;
            }

            15% {

                opacity: 1;
            }

            50% {

                transform:
                    translateY(calc(100% + 10px));

                opacity: 0.9;
            }

            100% {

                transform:
                    translateY(-110px);

                opacity: 0;
            }
        }


        /* =================================================
           SCANNER CORNERS
        ================================================= */

        .scan-corner {

            position: absolute;

            width: 35px;

            height: 35px;

            z-index: 35;

            border-color: #00ffe0;

            border-style: solid;

            filter:
                drop-shadow(
                    0 0 8px
                    rgba(0,255,220,0.9)
                );
        }


        .scan-corner.top-left {

            top: 15px;

            left: 15px;

            border-width:
                3px 0 0 3px;
        }


        .scan-corner.top-right {

            top: 15px;

            right: 15px;

            border-width:
                3px 3px 0 0;
        }


        .scan-corner.bottom-left {

            bottom: 15px;

            left: 15px;

            border-width:
                0 0 3px 3px;
        }


        .scan-corner.bottom-right {

            bottom: 15px;

            right: 15px;

            border-width:
                0 3px 3px 0;
        }


        /* =================================================
           SCANNING STATUS
        ================================================= */

        .scanning-status {

            position: absolute;

            left: 50%;

            bottom: 22px;

            transform:
                translateX(-50%);

            z-index: 50;

            padding:
                10px 18px;

            border-radius: 999px;

            background:
                rgba(8, 20, 30, 0.82);

            color: #ffffff;

            font-size: 14px;

            font-weight: 700;

            white-space: nowrap;

            backdrop-filter: blur(8px);

            box-shadow:
                0 5px 20px
                rgba(0,0,0,0.25);
        }


        .scanning-status::before {

            content: "";

            display: inline-block;

            width: 8px;

            height: 8px;

            margin-right: 9px;

            border-radius: 50%;

            background: #00ffd5;

            box-shadow:
                0 0 10px #00ffd5;

            animation:
                scanningDot 0.8s
                ease-in-out infinite
                alternate;
        }


        @keyframes scanningDot {

            from {

                opacity: 0.35;

                transform: scale(0.8);
            }

            to {

                opacity: 1;

                transform: scale(1.2);
            }
        }


        /* =================================================
           DISABLE UPLOAD DURING SCAN
        ================================================= */

        .upload-area.scanning
        .choose-file-btn {

            pointer-events: none;

            opacity: 0.55;
        }


        .upload-area.scanning
        .file-name {

            opacity: 0.65;
        }


        /* =================================================
           RESULT LOADING
        ================================================= */

        .analysis-loading {

            text-align: center;

            padding: 20px;
        }


        .analysis-loading-spinner {

            width: 42px;

            height: 42px;

            margin: 0 auto 15px;

            border-radius: 50%;

            border:
                4px solid #dbeafe;

            border-top-color:
                #0ea5e9;

            animation:
                resultSpinner 0.8s
                linear infinite;
        }


        @keyframes resultSpinner {

            to {

                transform:
                    rotate(360deg);
            }
        }


        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 700px) {

            .medical-file-preview {

                max-width: 100%;

                border-radius: 12px;
            }

            .medical-file-preview img {

                max-height: 330px;
            }

            .medical-file-preview iframe {

                height: 350px;
            }

            .scanning-status {

                font-size: 12px;

                padding:
                    8px 13px;
            }
        }

    `;

    document.head.appendChild(
        scannerStyle
    );


    // =====================================================
    // PREVIEW CONTAINER
    // =====================================================

    let previewContainer =
        document.getElementById(
            "reportPreview"
        );


    if (!previewContainer) {

        previewContainer =
            document.createElement("div");

        previewContainer.id =
            "reportPreview";

        previewContainer.className =
            "report-preview-container";


        /*
         * Put preview before scan button.
         */

        uploadArea.insertBefore(
            previewContainer,
            scanButton
        );
    }


    // =====================================================
    // CURRENT FILE
    // =====================================================

    let currentFile = null;

    let objectUrl = null;


    // =====================================================
    // FILE SELECT
    // =====================================================

    fileInput.addEventListener(
        "change",
        function () {

            if (
                fileInput.files.length === 0
            ) {

                clearPreview();

                fileName.textContent =
                    "No file selected";

                currentFile = null;

                return;
            }


            const file =
                fileInput.files[0];


            // -------------------------------------------------
            // MAX SIZE
            // -------------------------------------------------

            const maxSize =
                10 * 1024 * 1024;


            if (file.size > maxSize) {

                alert(
                    "File is too large. Maximum size is 10 MB."
                );

                fileInput.value = "";

                fileName.textContent =
                    "No file selected";

                clearPreview();

                currentFile = null;

                return;
            }


            currentFile = file;


            fileName.textContent =
                "Selected: " + file.name;


            // -------------------------------------------------
            // SHOW PREVIEW
            // -------------------------------------------------

            showFilePreview(file);

        }
    );


    // =====================================================
    // SHOW FILE PREVIEW
    // =====================================================

    function showFilePreview(file) {

        clearPreview();


        if (!file) {
            return;
        }


        const type =
            file.type || "";


        // =================================================
        // IMAGE
        // =================================================

        if (
            type.startsWith("image/")
        ) {

            objectUrl =
                URL.createObjectURL(file);


            previewContainer.innerHTML = `

                <div class="medical-file-preview">

                    <img
                        src="${objectUrl}"
                        alt="Uploaded medical report"
                    >

                    ${createScannerOverlay()}

                </div>

            `;

            return;
        }


        // =================================================
        // PDF
        // =================================================

        if (
            type === "application/pdf"
        ) {

            objectUrl =
                URL.createObjectURL(file);


            previewContainer.innerHTML = `

                <div class="medical-file-preview">

                    <iframe
                        src="${objectUrl}"
                        title="Uploaded medical PDF"
                    ></iframe>

                    ${createScannerOverlay()}

                </div>

            `;

            return;
        }


        // =================================================
        // TEXT / DOCUMENT
        // =================================================

        previewContainer.innerHTML = `

            <div class="medical-file-preview">

                <div class="document-preview">

                    <div class="document-preview-icon">
                        📄
                    </div>

                    <div class="document-preview-name">
                        ${escapeHTML(file.name)}
                    </div>

                    <p>
                        Medical document ready for AI analysis
                    </p>

                </div>

                ${createScannerOverlay()}

            </div>

        `;
    }


    // =====================================================
    // CREATE SCANNER OVERLAY
    // =====================================================

    function createScannerOverlay() {

        return `

            <div class="medical-scan-overlay">

                <div class="medical-scan-line"></div>

                <div class="medical-scan-glow"></div>

                <div class="scan-corner top-left"></div>

                <div class="scan-corner top-right"></div>

                <div class="scan-corner bottom-left"></div>

                <div class="scan-corner bottom-right"></div>

                <div class="scanning-status">
                    Scanning medical report...
                </div>

            </div>

        `;
    }


    // =====================================================
    // START SCANNING
    // =====================================================

    function startScanning() {

        const preview =
            previewContainer.querySelector(
                ".medical-file-preview"
            );


        if (!preview) {
            return;
        }


        preview.classList.add(
            "scanning"
        );


        const status =
            preview.querySelector(
                ".scanning-status"
            );


        if (!status) {
            return;
        }


        const messages = [

            "Scanning medical report...",

            "Reading uploaded file...",

            "Extracting medical information...",

            "Analyzing report...",

            "Checking important findings...",

            "Preparing explanation..."

        ];


        let index = 0;


        status.textContent =
            messages[0];


        if (
            window.reportScanMessageTimer
        ) {

            clearInterval(
                window.reportScanMessageTimer
            );
        }


        window.reportScanMessageTimer =
            setInterval(
                function () {

                    index =
                        (index + 1) %
                        messages.length;

                    status.textContent =
                        messages[index];

                },
                1600
            );
    }


    // =====================================================
    // STOP SCANNING
    // =====================================================

    function stopScanning() {

        const preview =
            previewContainer.querySelector(
                ".medical-file-preview"
            );


        if (preview) {

            preview.classList.remove(
                "scanning"
            );
        }


        if (
            window.reportScanMessageTimer
        ) {

            clearInterval(
                window.reportScanMessageTimer
            );

            window.reportScanMessageTimer =
                null;
        }
    }


    // =====================================================
    // SCAN REPORT
    // =====================================================

    scanButton.addEventListener(
        "click",
        async function () {

            // -------------------------------------------------
            // CHECK FILE
            // -------------------------------------------------

            if (
                fileInput.files.length === 0
            ) {

                alert(
                    "Please choose a medical report first."
                );

                return;
            }


            const file =
                fileInput.files[0];


            currentFile = file;


            // -------------------------------------------------
            // CHECK FILE SIZE
            // -------------------------------------------------

            const maxSize =
                10 * 1024 * 1024;


            if (file.size > maxSize) {

                alert(
                    "File is too large. Maximum size is 10 MB."
                );

                return;
            }


            // -------------------------------------------------
            // FORM DATA
            // -------------------------------------------------

            const formData =
                new FormData();


            /*
             * IMPORTANT:
             * Must match upload.single("report")
             */

            formData.append(
                "report",
                file
            );


            // -------------------------------------------------
            // DISABLE BUTTON
            // -------------------------------------------------

            scanButton.disabled = true;

            scanButton.textContent =
                "🔄 Analyzing Report...";


            // -------------------------------------------------
            // START VISUAL SCANNING
            // -------------------------------------------------

            startScanning();


            // -------------------------------------------------
            // SHOW LOADING RESULT
            // -------------------------------------------------

            resultArea.classList.remove(
                "hidden"
            );


            resultArea.innerHTML = `

                <div class="analysis-loading">

                    <div class="analysis-loading-spinner"></div>

                    <h3>
                        Analyzing Medical Report...
                    </h3>

                    <p>
                        MediAssist is reading your uploaded
                        report using AI.
                    </p>

                    <p>
                        Please wait. This may take a few seconds.
                    </p>

                </div>

            `;


            try {

                // =================================================
                // SEND FILE TO BACKEND
                // =================================================

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/reports/analyze`,
                        {
                            method: "POST",
                            body: formData
                        }
                    );


                // -------------------------------------------------
                // GET JSON
                // -------------------------------------------------

                const data =
                    await response.json();


                console.log(
                    "Report Analysis Response:",
                    data
                );


                // -------------------------------------------------
                // HANDLE ERROR
                // -------------------------------------------------

                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Unable to analyze report."
                    );
                }


                // -------------------------------------------------
                // SHOW RESULT
                // -------------------------------------------------

                displayAnalysis(
                    data
                );


            } catch (error) {

                console.error(
                    "Report Scanner Error:",
                    error
                );


                resultArea.innerHTML = `

                    <div class="success-icon">
                        ❌
                    </div>

                    <h3>
                        Analysis Failed
                    </h3>

                    <p>
                        ${escapeHTML(
                            error.message
                        )}
                    </p>

                    <p>
                        Please make sure the backend server
                        is running and try again.
                    </p>

                `;

            } finally {

                // -------------------------------------------------
                // STOP SCANNING
                // -------------------------------------------------

                stopScanning();


                // -------------------------------------------------
                // RESET BUTTON
                // -------------------------------------------------

                scanButton.disabled =
                    false;

                scanButton.textContent =
                    "🔍 Scan Report";

            }

        }
    );


    // =====================================================
    // DISPLAY AI ANALYSIS
    // =====================================================

    function displayAnalysis(data) {

        const file =
            data.file || {};


        const analysis =
            data.analysis || {};


        const patient =
            analysis.patientInformation || {};


        const findings =
            Array.isArray(
                analysis.findings
            )
                ? analysis.findings
                : [];


        const importantFindings =
            Array.isArray(
                analysis.importantFindings
            )
                ? analysis.importantFindings
                : [];


        const possibleExplanations =
            Array.isArray(
                analysis.possibleExplanations
            )
                ? analysis.possibleExplanations
                : [];


        const nextSteps =
            Array.isArray(
                analysis.recommendedNextSteps
            )
                ? analysis.recommendedNextSteps
                : [];


        const medicalHelp =
            Array.isArray(
                analysis.whenToSeekMedicalHelp
            )
                ? analysis.whenToSeekMedicalHelp
                : [];


        const questions =
            Array.isArray(
                analysis.questionsForDoctor
            )
                ? analysis.questionsForDoctor
                : [];


        const limitations =
            Array.isArray(
                analysis.limitations
            )
                ? analysis.limitations
                : [];


        // =================================================
        // FINDINGS TABLE
        // =================================================

        let findingsHTML = "";


        if (
            findings.length > 0
        ) {

            findingsHTML = `

                <h3>
                    🧪 Test Results
                </h3>

                <div class="report-table-wrapper">

                    <table class="report-table">

                        <thead>

                            <tr>

                                <th>Test</th>

                                <th>Value</th>

                                <th>Unit</th>

                                <th>Reference Range</th>

                                <th>Status</th>

                                <th>Explanation</th>

                            </tr>

                        </thead>

                        <tbody>

                            ${findings.map(
                                function (item) {

                                    return `

                                        <tr>

                                            <td>
                                                <strong>
                                                    ${escapeHTML(
                                                        item.testName || "-"
                                                    )}
                                                </strong>
                                            </td>

                                            <td>
                                                ${escapeHTML(
                                                    item.value || "-"
                                                )}
                                            </td>

                                            <td>
                                                ${escapeHTML(
                                                    item.unit || "-"
                                                )}
                                            </td>

                                            <td>
                                                ${escapeHTML(
                                                    item.referenceRange || "-"
                                                )}
                                            </td>

                                            <td>
                                                <strong>
                                                    ${escapeHTML(
                                                        item.status || "-"
                                                    )}
                                                </strong>
                                            </td>

                                            <td>
                                                ${escapeHTML(
                                                    item.explanation || "-"
                                                )}
                                            </td>

                                        </tr>

                                    `;

                                }
                            ).join("")}

                        </tbody>

                    </table>

                </div>

            `;

        } else {

            findingsHTML = `

                <p>
                    No clearly readable test values were
                    detected in this report.
                </p>

            `;
        }


        // =================================================
        // LIST HELPER
        // =================================================

        function createList(items) {

            if (!items.length) {

                return `

                    <p>
                        No specific information available.
                    </p>

                `;
            }


            return `

                <ul>

                    ${items.map(
                        function (item) {

                            return `

                                <li>
                                    ${escapeHTML(item)}
                                </li>

                            `;

                        }
                    ).join("")}

                </ul>

            `;
        }


        // =================================================
        // FINAL RESULT
        // =================================================

        resultArea.innerHTML = `

            <div class="success-icon">
                ✓
            </div>


            <h3>
                Report Analyzed Successfully
            </h3>


            <p>

                Your file

                <strong>
                    ${escapeHTML(
                        file.name ||
                        "Medical Report"
                    )}
                </strong>

                has been analyzed using AI.

            </p>


            <div class="report-info">

                <p>

                    <strong>
                        File:
                    </strong>

                    ${escapeHTML(
                        file.name || "-"
                    )}

                </p>


                <p>

                    <strong>
                        Type:
                    </strong>

                    ${escapeHTML(
                        file.type || "-"
                    )}

                </p>


                <p>

                    <strong>
                        Size:
                    </strong>

                    ${formatFileSize(
                        file.size || 0
                    )}

                </p>

            </div>


            <hr>


            <h3>
                📄 Report Type
            </h3>

            <p>
                ${escapeHTML(
                    analysis.documentType || "-"
                )}
            </p>


            <h3>
                🩺 Overall Summary
            </h3>

            <p>
                ${escapeHTML(
                    analysis.summary || "-"
                )}
            </p>


            <h3>
                📊 Overall Status
            </h3>

            <p>
                ${escapeHTML(
                    analysis.overallStatus || "-"
                )}
            </p>


            <h3>
                👤 Patient Information
            </h3>


            <div class="patient-info">

                <p>

                    <strong>
                        Name:
                    </strong>

                    ${escapeHTML(
                        patient.name ||
                        "Not available"
                    )}

                </p>


                <p>

                    <strong>
                        Age:
                    </strong>

                    ${escapeHTML(
                        patient.age ||
                        "Not available"
                    )}

                </p>


                <p>

                    <strong>
                        Gender:
                    </strong>

                    ${escapeHTML(
                        patient.gender ||
                        "Not available"
                    )}

                </p>


                <p>

                    <strong>
                        Date:
                    </strong>

                    ${escapeHTML(
                        patient.date ||
                        "Not available"
                    )}

                </p>

            </div>


            ${findingsHTML}


            <h3>
                ⚠️ Important Findings
            </h3>

            ${createList(
                importantFindings
            )}


            <h3>
                🔎 Possible Explanations
            </h3>

            ${createList(
                possibleExplanations
            )}


            <h3>
                💡 What It May Mean
            </h3>

            <p>
                ${escapeHTML(
                    analysis.whatItMayMean ||
                    "-"
                )}
            </p>


            <h3>
                📌 Recommended Next Steps
            </h3>

            ${createList(
                nextSteps
            )}


            <h3>
                🚨 When to Seek Medical Help
            </h3>

            ${createList(
                medicalHelp
            )}


            <h3>
                👨‍⚕️ Questions You Can Ask Your Doctor
            </h3>

            ${createList(
                questions
            )}


            <h3>
                ℹ️ Analysis Limitations
            </h3>

            ${createList(
                limitations
            )}


            <h3>
                ⚕️ Medical Disclaimer
            </h3>

            <p>
                ${escapeHTML(
                    analysis.disclaimer ||
                    "This AI-generated explanation is for general educational purposes only and is not a medical diagnosis or a substitute for professional medical advice."
                )}
            </p>

        `;


        // -------------------------------------------------
        // SCROLL TO RESULT
        // -------------------------------------------------

        resultArea.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }


    // =====================================================
    // NEW ANALYSIS
    // =====================================================

    if (newAnalysisBtn) {

        newAnalysisBtn.addEventListener(
            "click",
            function () {

                // -------------------------------------------------
                // STOP SCANNER
                // -------------------------------------------------

                stopScanning();


                // -------------------------------------------------
                // CLEAR FILE
                // -------------------------------------------------

                fileInput.value = "";


                currentFile = null;


                fileName.textContent =
                    "No file selected";


                // -------------------------------------------------
                // CLEAR PREVIEW
                // -------------------------------------------------

                clearPreview();


                // -------------------------------------------------
                // SHOW UPLOAD
                // -------------------------------------------------

                uploadArea.classList.remove(
                    "hidden"
                );


                // -------------------------------------------------
                // HIDE RESULT
                // -------------------------------------------------

                resultArea.classList.add(
                    "hidden"
                );


                resultArea.innerHTML =
                    "";


                // -------------------------------------------------
                // RESET BUTTON
                // -------------------------------------------------

                scanButton.disabled =
                    false;

                scanButton.textContent =
                    "🔍 Scan Report";

            }
        );

    }


    // =====================================================
    // DRAG & DROP
    // =====================================================

    uploadArea.addEventListener(
        "dragover",
        function (event) {

            event.preventDefault();

            uploadArea.classList.add(
                "dragging"
            );

        }
    );


    uploadArea.addEventListener(
        "dragleave",
        function () {

            uploadArea.classList.remove(
                "dragging"
            );

        }
    );


    uploadArea.addEventListener(
        "drop",
        function (event) {

            event.preventDefault();

            uploadArea.classList.remove(
                "dragging"
            );


            const files =
                event.dataTransfer.files;


            if (
                files.length === 0
            ) {
                return;
            }


            const file =
                files[0];


            // -------------------------------------------------
            // MAX SIZE
            // -------------------------------------------------

            const maxSize =
                10 * 1024 * 1024;


            if (
                file.size > maxSize
            ) {

                alert(
                    "File is too large. Maximum size is 10 MB."
                );

                return;
            }


            // -------------------------------------------------
            // SET FILE
            // -------------------------------------------------

            try {

                const dataTransfer =
                    new DataTransfer();


                dataTransfer.items.add(
                    file
                );


                fileInput.files =
                    dataTransfer.files;

            } catch (error) {

                console.warn(
                    "Unable to set dropped file:",
                    error
                );

            }


            currentFile = file;


            fileName.textContent =
                "Selected: " + file.name;


            // -------------------------------------------------
            // SHOW PREVIEW
            // -------------------------------------------------

            showFilePreview(file);

        }
    );


    // =====================================================
    // CLEAR PREVIEW
    // =====================================================

    function clearPreview() {

        stopScanning();


        if (objectUrl) {

            try {

                URL.revokeObjectURL(
                    objectUrl
                );

            } catch (error) {

                console.warn(
                    "Unable to revoke object URL.",
                    error
                );
            }

            objectUrl = null;
        }


        previewContainer.innerHTML =
            "";
    }


    // =====================================================
    // FILE SIZE
    // =====================================================

    function formatFileSize(bytes) {

        if (!bytes) {

            return "0 Bytes";
        }


        const units = [

            "Bytes",

            "KB",

            "MB",

            "GB"

        ];


        const i =
            Math.floor(
                Math.log(bytes) /
                Math.log(1024)
            );


        return (

            parseFloat(

                (
                    bytes /
                    Math.pow(
                        1024,
                        i
                    )
                ).toFixed(2)

            ) +

            " " +

            units[i]

        );
    }


    // =====================================================
    // ESCAPE HTML
    // =====================================================

    function escapeHTML(text) {

        const div =
            document.createElement(
                "div"
            );


        div.textContent =
            String(text);


        return div.innerHTML;
    }

});