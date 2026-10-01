console.log("login.js loaded");

const loginForm = document.getElementById("loginForm");

// =====================================================
// API BASE URL
// =====================================================
// Local development:
// Frontend runs on localhost:5500
// Backend runs on localhost:5000
//
// Vercel deployment:
// Frontend and API use the same Vercel domain.
// =====================================================

const API_BASE_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : "";


loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;


    try {

        const response = await fetch(
            `${API_BASE_URL}/api/auth/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    password
                })
            }
        );


        const data = await response.json();

        console.log("Login response:", data);


        if (data.success) {

            alert("Login successful!");


            // Save token
            localStorage.setItem(
                "token",
                data.token
            );


            // Save user information
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );


            // Open dashboard
            window.location.href =
                "dashboard.html";

        } else {

            alert(data.message);

        }

    } catch (error) {

        console.error("Login Error:", error);

        alert(
            "Cannot connect to server. Make sure backend is running."
        );

    }

});