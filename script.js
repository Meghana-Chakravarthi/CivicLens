// =========================================
// CIVICLENS REGISTER
// =========================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const name =
            document.getElementById("name").value.trim();

        const contact =
            document.getElementById("contact").value.trim();

        const password =
            document.getElementById("password").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        const message =
            document.getElementById("registerMessage");


        // -----------------------------------------
        // CHECK NAME
        // -----------------------------------------

        if (name.length < 3) {

            message.textContent =
                "Please enter your full name.";

            message.style.color = "red";

            return;
        }


        // -----------------------------------------
        // CHECK EMAIL OR PHONE
        // -----------------------------------------

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const phonePattern =
            /^[0-9]{10}$/;

        const isEmail =
            emailPattern.test(contact);

        const isPhone =
            phonePattern.test(contact);


        if (!isEmail && !isPhone) {

            message.textContent =
                "Enter a valid email address or 10-digit phone number.";

            message.style.color = "red";

            return;
        }


        // -----------------------------------------
        // CHECK PASSWORD
        // -----------------------------------------

        if (password.length < 6) {

            message.textContent =
                "Password must contain at least 6 characters.";

            message.style.color = "red";

            return;
        }


        // -----------------------------------------
        // CONFIRM PASSWORD
        // -----------------------------------------

        if (password !== confirmPassword) {

            message.textContent =
                "Passwords do not match.";

            message.style.color = "red";

            return;
        }


        // -----------------------------------------
        // CREATE USER
        // -----------------------------------------

        const user = {

            name: name,

            contact: contact,

            password: password

        };


        // -----------------------------------------
        // SAVE USER
        // -----------------------------------------

        localStorage.setItem(
            "civicLensUser",
            JSON.stringify(user)
        );


        // -----------------------------------------
        // SUCCESS MESSAGE
        // -----------------------------------------

        message.textContent =
            "Account created successfully!";

        message.style.color = "green";


        // Clear form

        registerForm.reset();


        // -----------------------------------------
        // GO TO LOGIN
        // -----------------------------------------

        setTimeout(function () {

            window.location.href = "login.html";

        }, 1200);

    });

}



// =========================================
// CIVICLENS LOGIN
// =========================================

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();


        const contact =
            document.getElementById("loginContact").value.trim();

        const password =
            document.getElementById("loginPassword").value;


        const message =
            document.getElementById("loginMessage");


        // -----------------------------------------
        // GET REGISTERED USER
        // -----------------------------------------

        const storedUser =
            localStorage.getItem("civicLensUser");


        if (!storedUser) {

            message.textContent =
                "No account found. Please create an account first.";

            message.style.color = "red";

            return;
        }


        const user =
            JSON.parse(storedUser);


        // -----------------------------------------
        // CHECK LOGIN
        // -----------------------------------------

        if (
            contact === user.contact &&
            password === user.password
        ) {

            message.textContent =
                "Login successful!";

            message.style.color =
                "green";


            // Save login status

            localStorage.setItem(
                "civicLensLoggedIn",
                "true"
            );


            // Save logged-in user's name

            localStorage.setItem(
                "civicLensUserName",
                user.name
            );


            // -----------------------------------------
            // GO TO DASHBOARD
            // -----------------------------------------

            setTimeout(function () {

                window.location.href =
                    "dashboard.html";

            }, 1000);


        } else {

            message.textContent =
                "Invalid email/phone number or password.";

            message.style.color =
                "red";

        }

    });

}



// =========================================
// CIVICLENS - REPORT ISSUE
// =========================================

if (window.location.pathname.includes("report.html")) {

    const reportForm =
        document.getElementById("reportForm");


    const description =
        document.getElementById("description");


    const characterCount =
        document.getElementById("characterCount");


    const issuePhoto =
        document.getElementById("issuePhoto");


    const imagePreview =
        document.getElementById("imagePreview");


    const locationButton =
        document.getElementById("locationButton");


    const locationInput =
        document.getElementById("location");


    const locationMessage =
        document.getElementById("locationMessage");


    const reportMessage =
        document.getElementById("reportMessage");


    // =====================================
    // SHOW USER INITIAL
    // =====================================

    const storedUser =
        localStorage.getItem("civicLensUser");


    const profileInitial =
        document.getElementById("profileInitial");


    if (storedUser) {

        const user =
            JSON.parse(storedUser);


        if (profileInitial && user.name) {

            profileInitial.textContent =
                user.name.charAt(0).toUpperCase();

        }

    }



    // =====================================
    // DESCRIPTION CHARACTER COUNT
    // =====================================

    if (description) {

        description.addEventListener(
            "input",
            function () {

                characterCount.textContent =
                    description.value.length;

            }
        );


        description.setAttribute(
            "maxlength",
            "500"
        );

    }



    // =====================================
    // PHOTO PREVIEW
    // =====================================

    if (issuePhoto) {

        issuePhoto.addEventListener(
            "change",
            function () {

                const file =
                    issuePhoto.files[0];


                if (!file) {

                    imagePreview.style.display =
                        "none";

                    return;

                }


                // Check file size

                if (file.size > 5 * 1024 * 1024) {

                    alert(
                        "Photo size must be less than 5MB."
                    );

                    issuePhoto.value = "";

                    imagePreview.style.display =
                        "none";

                    return;

                }


                // Check image type

                if (!file.type.startsWith("image/")) {

                    alert(
                        "Please select an image file."
                    );

                    issuePhoto.value = "";

                    return;

                }


                const reader =
                    new FileReader();


                reader.onload =
                    function (event) {

                        imagePreview.innerHTML =

                            `<img
                                src="${event.target.result}"
                                alt="Selected civic issue photo"
                            >`;

                        imagePreview.style.display =
                            "block";

                    };


                reader.readAsDataURL(file);

            }
        );

    }



    // =====================================
    // USE MY LOCATION
    // =====================================

    if (locationButton) {

        locationButton.addEventListener(
            "click",
            function () {

                if (!navigator.geolocation) {

                    locationMessage.textContent =
                        "Location is not supported by this browser.";

                    return;

                }


                locationMessage.textContent =
                    "Getting your location...";


                navigator.geolocation.getCurrentPosition(

                    function (position) {

                        const latitude =
                            position.coords.latitude;

                        const longitude =
                            position.coords.longitude;


                        locationInput.value =
                            `Latitude: ${latitude.toFixed(6)}, Longitude: ${longitude.toFixed(6)}`;


                        locationMessage.textContent =
                            "Location detected successfully.";

                    },


                    function () {

                        locationMessage.textContent =
                            "Unable to get your location. Please enter it manually.";

                    }

                );

            }
        );

    }



    // =====================================
    // SUBMIT REPORT
    // =====================================

    if (reportForm) {

        reportForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const category =
                    document.getElementById(
                        "issueCategory"
                    ).value;


                const descriptionText =
                    description.value.trim();


                const location =
                    locationInput.value.trim();


                const photoFile =
                    issuePhoto.files[0];


                // Validate photo

                if (!photoFile) {

                    reportMessage.textContent =
                        "Please upload a photograph.";

                    reportMessage.style.color =
                        "#d64545";

                    return;

                }


                // =================================
                // CREATE REPORT ID
                // =================================

                const reportId =
                    "CL-" +
                    Date.now().toString().slice(-8);


                // =================================
                // CREATE DATE
                // =================================

                const reportDate =
                    new Date().toLocaleDateString(
                        "en-IN"
                    );


                // =================================
                // GET EXISTING REPORTS
                // =================================

                let reports =
                    JSON.parse(
                        localStorage.getItem(
                            "civicLensReports"
                        )
                    ) || [];


                // =================================
                // SAVE REPORT
                // =================================

                const newReport = {

                    id: reportId,

                    category: category,

                    description: descriptionText,

                    location: location,

                    date: reportDate,

                    status: "Reported"

                };


                reports.push(newReport);


                localStorage.setItem(
                    "civicLensReports",
                    JSON.stringify(reports)
                );


                // =================================
                // SUCCESS MESSAGE
                // =================================

                reportMessage.textContent =
                    `Report submitted successfully! Your Report ID is ${reportId}`;


                reportMessage.style.color =
                    "#176b4d";


                // =================================
                // RESET FORM
                // =================================

                reportForm.reset();


                if (characterCount) {

                    characterCount.textContent =
                        "0";

                }


                imagePreview.innerHTML =
                    "";

                imagePreview.style.display =
                    "none";


                locationMessage.textContent =
                    "";


                // =================================
                // GO TO DASHBOARD
                // =================================

                setTimeout(
                    function () {

                        window.location.href =
                            "dashboard.html";

                    },
                    2000
                );

            }
        );

    }

}



// =========================================
// CIVICLENS - UPDATE DASHBOARD STATISTICS
// =========================================

if (window.location.pathname.includes("dashboard.html")) {

    // Get reports saved in localStorage

    const reports =
        JSON.parse(
            localStorage.getItem("civicLensReports")
        ) || [];


    // Calculate report counts

    const totalReports =
        reports.length;


    const underReview =
        reports.filter(
            report => report.status === "Under Review"
        ).length;


    const inProgress =
        reports.filter(
            report => report.status === "In Progress"
        ).length;


    const resolved =
        reports.filter(
            report => report.status === "Resolved"
        ).length;


    // Display numbers

    const totalElement =
        document.getElementById("totalReports");

    const reviewElement =
        document.getElementById("underReview");

    const progressElement =
        document.getElementById("inProgress");

    const resolvedElement =
        document.getElementById("resolved");


    if (totalElement) {

        totalElement.textContent =
            totalReports;

    }


    if (reviewElement) {

        reviewElement.textContent =
            underReview;

    }


    if (progressElement) {

        progressElement.textContent =
            inProgress;

    }


    if (resolvedElement) {

        resolvedElement.textContent =
            resolved;

    }

}