// =====================================================
// MEDIASSIST - NEARBY DOCTORS
// =====================================================

const BACKEND_URL = "http://localhost:5000";


// =====================================================
// GET ELEMENTS
// =====================================================

const locationInput =
    document.getElementById("doctorLocation");

const searchDoctorsBtn =
    document.getElementById("searchDoctorsBtn");

const currentLocationBtn =
    document.getElementById("currentLocationBtn");

const doctorResults =
    document.getElementById("doctorResults");

const doctorSearchStatus =
    document.getElementById("doctorSearchStatus");


// =====================================================
// SHOW STATUS
// =====================================================

function showDoctorStatus(message) {

    if (!doctorSearchStatus) return;

    doctorSearchStatus.style.display = "block";

    doctorSearchStatus.textContent = message;
}


// =====================================================
// HIDE STATUS
// =====================================================

function hideDoctorStatus() {

    if (!doctorSearchStatus) return;

    doctorSearchStatus.style.display = "none";
}


// =====================================================
// SHOW LOADING
// =====================================================

function showDoctorLoading() {

    doctorResults.innerHTML = `

        <div class="doctor-loading">

            <div class="empty-icon">
                🔍
            </div>

            <h3>
                Searching...
            </h3>

            <p>
                Finding nearby healthcare facilities.
            </p>

        </div>

    `;
}


// =====================================================
// SEARCH USING LATITUDE + LONGITUDE
// =====================================================

async function searchNearbyDoctors(latitude, longitude) {

    try {

        showDoctorLoading();

        showDoctorStatus(
            "Finding healthcare facilities near you..."
        );


        const url =
            `${BACKEND_URL}/api/doctors/search` +
            `?lat=${encodeURIComponent(latitude)}` +
            `&lon=${encodeURIComponent(longitude)}`;


        console.log(
            "Doctor API:",
            url
        );


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "Doctor API Response:",
            data
        );


        if (!data.success) {

            throw new Error(
                data.message ||
                "Unable to find healthcare facilities."
            );

        }


        hideDoctorStatus();


        if (
            !data.results ||
            data.results.length === 0
        ) {

            showNoDoctors();

            return;

        }


        renderDoctors(data.results);


    } catch (error) {

        console.error(
            "Nearby Doctors Error:",
            error
        );


        doctorResults.innerHTML = `

            <div class="doctor-empty-state">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h3>
                    Unable to Find Doctors
                </h3>

                <p>
                    ${escapeHTML(error.message)}
                </p>

            </div>

        `;


        showDoctorStatus(
            "Could not connect to the MediAssist server."
        );

    }

}


// =====================================================
// RENDER DOCTOR CARDS
// =====================================================

function renderDoctors(doctors) {

    doctorResults.innerHTML = "";


    doctors.forEach((doctor) => {

        const card =
            document.createElement("div");


        card.className =
            "doctor-card";


        // ---------------------------------------------
        // ICON
        // ---------------------------------------------

        let icon = "🩺";


        if (doctor.type === "hospital") {

            icon = "🏥";

        } else if (doctor.type === "clinic") {

            icon = "🏨";

        }


        // ---------------------------------------------
        // TYPE
        // ---------------------------------------------

        const type =
            formatType(doctor.type);


        // ---------------------------------------------
        // PHONE
        // ---------------------------------------------

        let phoneHTML = "";


        if (doctor.phone) {

            phoneHTML = `

                <div class="doctor-info-item">

                    📞

                    <span>
                        ${escapeHTML(
                            doctor.phone
                        )}
                    </span>

                </div>

            `;

        }


        // ---------------------------------------------
        // ADDRESS
        // ---------------------------------------------

        let addressHTML = "";


        if (doctor.address) {

            addressHTML = `

                <div class="doctor-info-item">

                    📍

                    <span>
                        ${escapeHTML(
                            doctor.address
                        )}
                    </span>

                </div>

            `;

        }


        // ---------------------------------------------
        // OPENING HOURS
        // ---------------------------------------------

        let hoursHTML = "";


        if (doctor.openingHours) {

            hoursHTML = `

                <div class="doctor-info-item">

                    🕐

                    <span>
                        ${escapeHTML(
                            doctor.openingHours
                        )}
                    </span>

                </div>

            `;

        }


        // ---------------------------------------------
        // SPECIALITY
        // ---------------------------------------------

        let specialityHTML = "";


        if (doctor.speciality) {

            specialityHTML = `

                <div class="doctor-info-item">

                    👨‍⚕️

                    <span>
                        ${escapeHTML(
                            doctor.speciality
                        )}
                    </span>

                </div>

            `;

        }


        // ---------------------------------------------
        // CALL BUTTON
        // ---------------------------------------------

        let callButton = "";


        if (doctor.phone) {

            callButton = `

                <a
                    href="tel:${escapeHTML(
                        doctor.phone
                    )}"
                    class="doctor-call-btn"
                >
                    📞 Call
                </a>

            `;

        } else {

            callButton = `

                <button
                    type="button"
                    class="doctor-call-btn"
                    disabled
                >
                    📞 Call
                </button>

            `;

        }


        // ---------------------------------------------
        // OPENSTREETMAP LINK
        // ---------------------------------------------

        const mapLink =

            doctor.latitude &&
            doctor.longitude

                ? `https://www.openstreetmap.org/?mlat=${doctor.latitude}&mlon=${doctor.longitude}`

                : "#";


        // ---------------------------------------------
        // CARD HTML
        // ---------------------------------------------

        card.innerHTML = `

            <div class="doctor-card-top">

                <div class="doctor-icon">
                    ${icon}
                </div>


                <div>

                    <h3>
                        ${escapeHTML(
                            doctor.name
                        )}
                    </h3>


                    <span class="doctor-type">
                        ${escapeHTML(type)}
                    </span>

                </div>

            </div>


            <div class="doctor-info">

                ${addressHTML}

                ${specialityHTML}

                ${phoneHTML}

                ${hoursHTML}

            </div>


            <div class="doctor-actions">

                <a
                    href="${mapLink}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="doctor-details-btn"
                >
                    📍 View Location
                </a>


                ${callButton}

            </div>

        `;


        doctorResults.appendChild(card);

    });


    showDoctorStatus(
        `Found ${doctors.length} healthcare facilities nearby.`
    );

}


// =====================================================
// NO RESULTS
// =====================================================

function showNoDoctors() {

    doctorResults.innerHTML = `

        <div class="doctor-empty-state">

            <div class="empty-icon">
                🩺
            </div>

            <h3>
                No Healthcare Facilities Found
            </h3>

            <p>
                We couldn't find any healthcare facilities
                within 3 km of this location.
            </p>

        </div>

    `;

}


// =====================================================
// FORMAT TYPE
// =====================================================

function formatType(type) {

    if (!type) {

        return "Healthcare Facility";

    }


    return type
        .replace(/_/g, " ")
        .replace(/\b\w/g, letter =>
            letter.toUpperCase()
        );

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


// =====================================================
// USE MY LOCATION
// =====================================================

if (currentLocationBtn) {

    currentLocationBtn.addEventListener(
        "click",
        () => {


            // -----------------------------------------
            // CHECK BROWSER LOCATION SUPPORT
            // -----------------------------------------

            if (!navigator.geolocation) {

                showDoctorStatus(
                    "Your browser does not support location services."
                );

                return;

            }


            // -----------------------------------------
            // SHOW LOADING
            // -----------------------------------------

            showDoctorStatus(
                "Requesting your location..."
            );

            showDoctorLoading();


            // -----------------------------------------
            // GET LOCATION
            // -----------------------------------------

navigator.geolocation.getCurrentPosition(

    // ==========================================
    // LOCATION SUCCESS
    // ==========================================

    (position) => {

        const latitude =
            position.coords.latitude;

        const longitude =
            position.coords.longitude;


        console.log(
            "📍 Location detected:",
            latitude,
            longitude
        );


        showDoctorStatus(
            "Location found! Searching nearby healthcare..."
        );


        searchNearbyDoctors(
            latitude,
            longitude
        );

    },


    // ==========================================
    // LOCATION ERROR
    // ==========================================

    (error) => {

        console.error(
            "❌ Location Error:",
            error
        );


        let message =
            "Unable to get your location.";


        if (error.code === 1) {

            message =
                "Location permission was denied. Please allow location access for localhost.";

        }
        else if (error.code === 2) {

            message =
                "Your location could not be determined.";

        }
        else if (error.code === 3) {

            message =
                "Location request timed out. Please try again.";

        }


        doctorResults.innerHTML = `

            <div class="doctor-empty-state">

                <div class="empty-icon">
                    📍
                </div>

                <h3>
                    Location Not Available
                </h3>

                <p>
                    ${escapeHTML(message)}
                </p>

                <button
                    type="button"
                    onclick="location.reload()"
                    class="doctor-search-btn"
                    style="margin-top: 18px;"
                >
                    🔄 Try Again
                </button>

            </div>

        `;


        showDoctorStatus(message);

    },


    // ==========================================
    // LOCATION OPTIONS
    // ==========================================

    {
        // Don't wait for high-accuracy GPS
        enableHighAccuracy: false,

        // Stop waiting after 5 seconds
        timeout: 5000,

        // Allow a recent cached location
        maximumAge: 60000

    }

);

        }
    );

}


// =====================================================
// SEARCH BUTTON
// =====================================================

// =====================================================
// SEARCH BY LOCATION NAME
// =====================================================

if (searchDoctorsBtn) {

    searchDoctorsBtn.addEventListener(
        "click",
        async () => {

            const location =
                locationInput?.value.trim();


            // =============================================
            // VALIDATE INPUT
            // =============================================

            if (!location) {

                showDoctorStatus(
                    "Please enter a city or location."
                );

                locationInput?.focus();

                return;

            }


            // =============================================
            // SHOW LOADING
            // =============================================

            showDoctorLoading();

            showDoctorStatus(
                `Searching healthcare facilities in ${location}...`
            );


            try {

                // =========================================
                // CALL BACKEND WITH LOCATION
                // =========================================

                const url =
                    `${BACKEND_URL}/api/doctors/search` +
                    `?location=${encodeURIComponent(location)}`;


                console.log(
                    "📍 Location Search:",
                    url
                );


                const response =
                    await fetch(url);


                // =========================================
                // CHECK RESPONSE
                // =========================================

                if (!response.ok) {

                    throw new Error(
                        `Server returned ${response.status}`
                    );

                }


                const data =
                    await response.json();


                console.log(
                    "🏥 Location Search Response:",
                    data
                );


                // =========================================
                // CHECK SUCCESS
                // =========================================

                if (!data.success) {

                    throw new Error(
                        data.message ||
                        "Unable to find healthcare facilities."
                    );

                }


                // =========================================
                // NO RESULTS
                // =========================================

                if (
                    !data.results ||
                    data.results.length === 0
                ) {

                    doctorResults.innerHTML = `

                        <div class="doctor-empty-state">

                            <div class="empty-icon">
                                🏥
                            </div>

                            <h3>
                                No Healthcare Facilities Found
                            </h3>

                            <p>
                                No doctors, clinics or hospitals
                                were found near
                                <strong>
                                    ${escapeHTML(location)}
                                </strong>.
                            </p>

                        </div>

                    `;


                    showDoctorStatus(
                        `No healthcare facilities found in ${location}.`
                    );


                    return;

                }


                // =========================================
                // DISPLAY RESULTS
                // =========================================

                renderDoctors(
                    data.results
                );


                // =========================================
                // SHOW LOCATION FOUND
                // =========================================

                const foundLocation =
                    data.searchedLocation ||
                    location;


                showDoctorStatus(

                    `Found ${data.results.length} healthcare facilities near ${foundLocation}.`

                );


            } catch (error) {

                console.error(
                    "❌ Location Search Error:",
                    error
                );


                doctorResults.innerHTML = `

                    <div class="doctor-empty-state">

                        <div class="empty-icon">
                            ⚠️
                        </div>

                        <h3>
                            Search Failed
                        </h3>

                        <p>
                            ${escapeHTML(
                                error.message
                            )}
                        </p>

                    </div>

                `;


                showDoctorStatus(
                    "Unable to search this location."
                );

            }

        }
    );

}


// =====================================================
// ENTER KEY
// =====================================================

if (locationInput) {

    locationInput.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {

                event.preventDefault();

                searchDoctorsBtn?.click();

            }

        }
    );

}