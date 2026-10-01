console.log("profile.js loaded");


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


// ================= GET ELEMENTS =================

const profileForm =
    document.getElementById("profileForm");

const fullNameInput =
    document.getElementById("fullName");

const emailInput =
    document.getElementById("email");

const phoneInput =
    document.getElementById("phone");

const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");

const accountEmail =
    document.getElementById("accountEmail");

const topUserName =
    document.getElementById("topUserName");


// ================= TOKEN =================

function getToken() {
    return localStorage.getItem("token");
}


// ================= LOAD PROFILE =================

async function loadProfile() {

    const token = getToken();

    if (!token) {

        alert("Please login first.");

        window.location.href = "login.html";

        return;
    }


    try {

        const response = await fetch(
            `${API_BASE_URL}/api/auth/profile`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const data = await response.json();

        console.log("Profile response:", data);


        if (data.success) {

            const user = data.user;

            fullNameInput.value =
                user.fullName || "";

            emailInput.value =
                user.email || "";

            phoneInput.value =
                user.phone || "";


            profileName.textContent =
                user.fullName || "User";

            profileEmail.textContent =
                user.email || "";

            accountEmail.textContent =
                user.email || "-";

            topUserName.textContent =
                user.fullName || "User";


            // Update localStorage
            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );

        } else {

            alert(
                data.message ||
                "Unable to load profile."
            );

        }


    } catch (error) {

        console.error(
            "Load Profile Error:",
            error
        );

        alert(
            "Cannot connect to server."
        );
    }
}


// ================= UPDATE PROFILE =================

profileForm.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();


        const fullName =
            fullNameInput.value.trim();

        const email =
            emailInput.value.trim();

        const phone =
            phoneInput.value.trim();


        if (!fullName || !email) {

            alert(
                "Full name and email are required."
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
                    `${API_BASE_URL}/api/auth/profile`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({

                            fullName,
                            email,
                            phone

                        })
                    }
                );


            const data =
                await response.json();


            console.log(
                "Update Profile Response:",
                data
            );


            if (data.success) {

                alert(
                    "Profile updated successfully! ✅"
                );


                const user =
                    data.user;


                profileName.textContent =
                    user.fullName;

                profileEmail.textContent =
                    user.email;

                accountEmail.textContent =
                    user.email;

                topUserName.textContent =
                    user.fullName;


                localStorage.setItem(
                    "user",
                    JSON.stringify(user)
                );

            } else {

                alert(
                    data.message ||
                    "Unable to update profile."
                );

            }


        } catch (error) {

            console.error(
                "Update Profile Error:",
                error
            );

            alert(
                "Cannot connect to server."
            );

        }

    }
);


// ================= LOGOUT =================

const logoutBtn =
    document.getElementById("logoutBtn");


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        () => {

            localStorage.removeItem("token");

            localStorage.removeItem("user");

            window.location.href =
                "login.html";

        }
    );

}


// ================= START =================

loadProfile();