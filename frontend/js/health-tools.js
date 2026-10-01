console.log("Health Tools loaded");


function openBMI() {

    const height = prompt(
        "Enter your height in centimeters:"
    );

    const weight = prompt(
        "Enter your weight in kilograms:"
    );


    if (!height || !weight) {

        alert("Please enter both height and weight.");

        return;
    }


    const heightInMeters =
        Number(height) / 100;

    const weightInKg =
        Number(weight);


    if (
        isNaN(heightInMeters) ||
        isNaN(weightInKg) ||
        heightInMeters <= 0 ||
        weightInKg <= 0
    ) {

        alert("Please enter valid numbers.");

        return;
    }


    const bmi =
        weightInKg /
        (heightInMeters * heightInMeters);


    let category;


    if (bmi < 18.5) {

        category = "Underweight";

    } else if (bmi < 25) {

        category = "Normal weight";

    } else if (bmi < 30) {

        category = "Overweight";

    } else {

        category = "Obese";

    }


    alert(
        "Your BMI is: " +
        bmi.toFixed(1) +
        "\n\nCategory: " +
        category
    );

}


function openWater() {

    const weight = prompt(
        "Enter your weight in kilograms:"
    );

    if (!weight) {
        alert("Please enter your weight.");
        return;
    }

    const weightKg = Number(weight);

    if (isNaN(weightKg) || weightKg <= 0) {
        alert("Please enter a valid weight.");
        return;
    }

    // Approximate daily water requirement
    const waterMl = weightKg * 35;

    const waterLiters =
        waterMl / 1000;

    alert(
        "Your approximate daily water intake is: " +
        waterLiters.toFixed(1) +
        " liters\n\n" +
        "This is only a general estimate."
    );
}


function openHeartRate() {

    const heartRate = prompt(
        "Enter your resting heart rate (BPM):"
    );

    if (!heartRate) {
        alert("Please enter your heart rate.");
        return;
    }

    const bpm = Number(heartRate);

    if (isNaN(bpm) || bpm <= 0) {
        alert("Please enter a valid heart rate.");
        return;
    }

    let result;

    if (bpm < 60) {

        result = "Below the typical adult resting range.";

    } else if (bpm <= 100) {

        result = "Within the typical adult resting range.";

    } else {

        result = "Above the typical adult resting range.";

    }

    alert(
        "Heart Rate: " +
        bpm +
        " BPM\n\n" +
        result +
        "\n\n" +
        "This is general information, not a diagnosis."
    );
}


function openCalories() {

    const age = prompt("Enter your age:");

    const weight = prompt(
        "Enter your weight in kilograms:"
    );

    const height = prompt(
        "Enter your height in centimeters:"
    );

    const gender = prompt(
        "Enter your gender (male/female):"
    );


    if (!age || !weight || !height || !gender) {

        alert("Please enter all details.");

        return;
    }


    const ageNum = Number(age);
    const weightNum = Number(weight);
    const heightNum = Number(height);


    if (
        isNaN(ageNum) ||
        isNaN(weightNum) ||
        isNaN(heightNum) ||
        ageNum <= 0 ||
        weightNum <= 0 ||
        heightNum <= 0
    ) {

        alert("Please enter valid numbers.");

        return;
    }


    let bmr;


    if (gender.toLowerCase() === "male") {

        bmr =
            10 * weightNum +
            6.25 * heightNum -
            5 * ageNum +
            5;

    } else if (gender.toLowerCase() === "female") {

        bmr =
            10 * weightNum +
            6.25 * heightNum -
            5 * ageNum -
            161;

    } else {

        alert(
            "Please enter male or female."
        );

        return;
    }


    // Approximate maintenance calories
    const calories =
        bmr * 1.2;


    alert(
        "Estimated daily calorie requirement: " +
        Math.round(calories) +
        " kcal/day\n\n" +
        "This is only a general estimate."
    );
}

/* ================= USER NAME ================= */

const user =
    JSON.parse(
        localStorage.getItem("user") || "{}"
    );

const userName =
    document.getElementById("userName");

if (userName && user.fullName) {

    userName.textContent =
        user.fullName;

}


/* ================= LOGOUT ================= */

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