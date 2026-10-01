console.log("settings.js loaded");


// =====================================================
// MEDIASSIST SETTINGS
// =====================================================


// =====================================================
// HTML ELEMENT
// =====================================================

const html = document.documentElement;


// =====================================================
// USER NAME
// =====================================================

const userNameElement =
    document.getElementById("userName");


let user = {};

try {

    user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

} catch (error) {

    console.error(
        "Unable to read user information:",
        error
    );

}


if (
    userNameElement &&
    user.fullName
) {

    userNameElement.textContent =
        user.fullName;

}


// =====================================================
// NOTIFICATION TOGGLE
// =====================================================

const notificationToggle =
    document.getElementById(
        "notificationToggle"
    );


const savedNotifications =
    localStorage.getItem(
        "notifications"
    );


if (
    notificationToggle &&
    savedNotifications !== null
) {

    notificationToggle.checked =
        savedNotifications === "true";

}


if (notificationToggle) {

    notificationToggle.addEventListener(
        "change",
        function () {

            localStorage.setItem(
                "notifications",
                notificationToggle.checked
            );


            if (notificationToggle.checked) {

                alert(
                    "Notifications enabled. 🔔"
                );

            } else {

                alert(
                    "Notifications disabled."
                );

            }

        }
    );

}


// =====================================================
// DARK MODE
// =====================================================

const darkModeToggle =
    document.getElementById(
        "darkModeToggle"
    );


// =====================================================
// GET CURRENT THEME
// =====================================================

function getCurrentTheme() {

    // First priority:
    // Global MediAssist theme system

    if (
        window.MediAssistTheme &&
        typeof window.MediAssistTheme.getTheme ===
            "function"
    ) {

        return window.MediAssistTheme.getTheme();

    }


    // Second priority:
    // HTML data-theme

    const htmlTheme =
        html.getAttribute(
            "data-theme"
        );


    if (
        htmlTheme === "dark" ||
        htmlTheme === "light"
    ) {

        return htmlTheme;

    }


    // Third priority:
    // New global localStorage key

    const savedTheme =
        localStorage.getItem(
            "mediassist_theme"
        );


    if (savedTheme === "dark") {

        return "dark";

    }


    // Fourth priority:
    // Old localStorage key

    const oldDarkMode =
        localStorage.getItem(
            "darkMode"
        );


    if (oldDarkMode === "true") {

        return "dark";

    }


    // Default

    return "light";

}


// =====================================================
// APPLY THEME
// =====================================================

function applySettingsTheme(theme) {

    if (
        theme !== "dark" &&
        theme !== "light"
    ) {

        theme = "light";

    }


    // Apply to HTML

    html.setAttribute(
        "data-theme",
        theme
    );


    // Keep old darkMode key synchronized

    localStorage.setItem(
        "darkMode",
        theme === "dark"
            ? "true"
            : "false"
    );


    // Keep global theme key synchronized

    localStorage.setItem(
        "mediassist_theme",
        theme
    );


    // Update toggle

    if (darkModeToggle) {

        darkModeToggle.checked =
            theme === "dark";

    }

}


// =====================================================
// INITIALIZE DARK MODE
// =====================================================

const initialTheme =
    getCurrentTheme();


applySettingsTheme(
    initialTheme
);


// =====================================================
// DARK MODE TOGGLE
// =====================================================

if (darkModeToggle) {

    darkModeToggle.addEventListener(
        "change",
        function () {

            const newTheme =
                darkModeToggle.checked
                    ? "dark"
                    : "light";


            // Use global theme system
            // if theme.js is available

            if (
                window.MediAssistTheme &&
                typeof window.MediAssistTheme.setTheme ===
                    "function"
            ) {

                window.MediAssistTheme.setTheme(
                    newTheme
                );


                // Also keep old key synchronized

                localStorage.setItem(
                    "darkMode",
                    newTheme === "dark"
                        ? "true"
                        : "false"
                );

            } else {

                // Fallback

                applySettingsTheme(
                    newTheme
                );

            }

        }
    );

}


// =====================================================
// KEEP TOGGLE IN SYNC
// =====================================================

window.addEventListener(
    "storage",
    function (event) {

        if (
            event.key ===
                "mediassist_theme"
        ) {

            const theme =
                event.newValue === "dark"
                    ? "dark"
                    : "light";


            // Don't call global setTheme here.
            // Just update this page.

            html.setAttribute(
                "data-theme",
                theme
            );


            if (darkModeToggle) {

                darkModeToggle.checked =
                    theme === "dark";

            }

        }

    }
);


// =====================================================
// CHANGE PASSWORD
// =====================================================

function changePassword() {

    const newPassword =
        prompt(
            "Enter your new password:"
        );


    // Cancel / empty

    if (!newPassword) {

        return;

    }


    // Minimum password length

    if (
        newPassword.length < 6
    ) {

        alert(
            "Password must be at least 6 characters."
        );

        return;

    }


    const confirmPassword =
        prompt(
            "Confirm your new password:"
        );


    // Password mismatch

    if (
        newPassword !==
        confirmPassword
    ) {

        alert(
            "Passwords do not match."
        );

        return;

    }


    alert(
        "Password change feature will be connected to the backend in the next step."
    );

}


// =====================================================
// LOGOUT
// =====================================================

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function () {

            const confirmLogout =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmLogout) {

                return;

            }


            // Remove authentication

            localStorage.removeItem(
                "token"
            );


            localStorage.removeItem(
                "user"
            );


            // Redirect

            window.location.href =
                "login.html";

        }
    );

}


// =====================================================
// DEBUG
// =====================================================

console.log(
    "Current MediAssist theme:",
    getCurrentTheme()
);