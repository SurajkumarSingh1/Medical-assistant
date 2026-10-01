console.log("emergency.js loaded");


// ================= USER NAME =================

const userNameElement =
    document.getElementById("userName");

const user =
    JSON.parse(
        localStorage.getItem("user") || "{}"
    );

if (userNameElement && user.fullName) {
    userNameElement.textContent =
        user.fullName;
}


// ================= CALL EMERGENCY =================

function callEmergency() {

    const confirmCall = confirm(
        "Do you want to call emergency medical services?"
    );

    if (!confirmCall) {
        return;
    }

    // India emergency number
    window.location.href = "tel:112";
}


// ================= CALL POLICE =================

function callPolice() {

    const confirmCall = confirm(
        "Do you want to call police emergency services?"
    );

    if (!confirmCall) {
        return;
    }

    // India police emergency number
    window.location.href = "tel:112";
}


// ================= FIND HOSPITAL =================

function findHospital() {

    if (!navigator.geolocation) {

        alert(
            "Location is not supported by your browser."
        );

        return;
    }

    navigator.geolocation.getCurrentPosition(

        function(position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;


            const mapURL =
                `https://www.google.com/maps/search/hospitals/@${latitude},${longitude},14z`;

            window.open(
                mapURL,
                "_blank"
            );
        },

        function(error) {

            console.error(
                "Location Error:",
                error
            );

            alert(
                "Unable to access your location. Please allow location permission."
            );
        }
    );
}


// ================= SHARE LOCATION =================

function shareLocation() {

    if (!navigator.geolocation) {

        alert(
            "Location is not supported by your browser."
        );

        return;
    }


    navigator.geolocation.getCurrentPosition(

        async function(position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;


            const locationURL =
                `https://www.google.com/maps?q=${latitude},${longitude}`;


            // Web Share API
            if (navigator.share) {

                try {

                    await navigator.share({

                        title: "My Emergency Location",

                        text:
                            "This is my current location. Please help me.",

                        url: locationURL

                    });

                } catch (error) {

                    console.log(
                        "Share cancelled."
                    );
                }

            } else {

                // Fallback

                try {

                    await navigator.clipboard.writeText(
                        locationURL
                    );

                    alert(
                        "Location link copied. You can now send it to a trusted person."
                    );

                } catch (error) {

                    prompt(
                        "Copy this location link:",
                        locationURL
                    );
                }
            }
        },

        function(error) {

            console.error(
                "Location Error:",
                error
            );

            alert(
                "Unable to get your location. Please allow location permission."
            );
        }
    );
}


// ================= LOGOUT =================

const logoutBtn =
    document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function() {

            localStorage.removeItem("token");

            localStorage.removeItem("user");

            window.location.href =
                "login.html";
        }
    );
}