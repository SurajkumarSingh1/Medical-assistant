console.log("dashboard.js loaded");


// =====================================================
// CHECK LOGIN
// =====================================================

const token = localStorage.getItem("token");

const userData =
    JSON.parse(localStorage.getItem("user") || "{}");


// If user is not logged in, go to login page

if (!token) {

    window.location.href = "login.html";

}


// =====================================================
// USER NAME
// =====================================================

const userName =
    userData.fullName || "User";


const userNameElement =
    document.getElementById("userName");


if (userNameElement) {

    userNameElement.textContent =
        userName;

}


// =====================================================
// OPTIONAL WELCOME TEXT
// =====================================================
// This element does not currently exist in your
// dashboard.html, so we check before using it.

const welcomeText =
    document.getElementById("welcomeText");


if (welcomeText) {

    welcomeText.textContent =
        `Welcome, ${userName}!`;

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

            console.log("Logout clicked");


            // Remove login information

            localStorage.removeItem("token");

            localStorage.removeItem("user");


            // Redirect to login page

            window.location.href =
                "login.html";

        }
    );

} else {

    console.error(
        "Logout button with id='logoutBtn' was not found."
    );

}