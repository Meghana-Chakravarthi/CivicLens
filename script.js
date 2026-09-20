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
// CIVICLENS - DASHBOARD
// =========================================

if (window.location.pathname.includes("dashboard.html")) {

    const reports =
        JSON.parse(
            localStorage.getItem("civicLensReports")
        ) || [];

    // -------------------------------
    // USER INFORMATION
    // -------------------------------

    const storedUser =
        localStorage.getItem("civicLensUser");

    if (storedUser) {

        const user =
            JSON.parse(storedUser);

        const nameElement =
            document.getElementById("dashboardUserName");

        const profileCircle =
            document.getElementById("profileCircle");

        if (nameElement && user.name) {
            nameElement.textContent =
                user.name;
        }

        if (profileCircle && user.name) {
            profileCircle.textContent =
                user.name.charAt(0).toUpperCase();

            profileCircle.onclick =
                function () {
                    window.location.href =
                        "profile.html";
                };
        }
    }


    // -------------------------------
    // DASHBOARD STATISTICS
    // -------------------------------

    const totalReports =
        reports.length;

    const underReview =
        reports.filter(
            report =>
                report.status === "Under Review"
        ).length;

    const inProgress =
        reports.filter(
            report =>
                report.status === "In Progress"
        ).length;

    const resolved =
        reports.filter(
            report =>
                report.status === "Resolved"
        ).length;


    document.getElementById(
        "totalReports"
    ).textContent = totalReports;

    document.getElementById(
        "underReview"
    ).textContent = underReview;

    document.getElementById(
        "inProgress"
    ).textContent = inProgress;

    document.getElementById(
        "resolved"
    ).textContent = resolved;


    // -------------------------------
    // RECENT REPORTS
    // -------------------------------

    const recentReports =
        document.getElementById(
            "recentReports"
        );

    if (reports.length === 0) {

        recentReports.innerHTML = `

            <div class="empty-reports">

                <div class="empty-icon">
                    ▣
                </div>

                <h3>
                    No reports yet
                </h3>

                <p>
                    You haven't reported any civic issues.
                    Start by submitting your first report.
                </p>

                <a
                    href="report.html"
                    class="report-button"
                >
                    + Report an Issue
                </a>

            </div>

        `;

    } else {

        // Show latest 3 reports
        const latestReports =
            reports.slice(-3).reverse();

        recentReports.innerHTML =
            latestReports.map(
                report => {

                    const statusClass =
                        getStatusClass(
                            report.status
                        );

                    return `

                        <div class="recent-report">

                            <div class="report-info">

                                <h3>
                                    ${report.category}
                                </h3>

                                <p>
                                    ${report.description}
                                </p>

                                <div class="report-date">
                                    Report ID:
                                    ${report.id}
                                    &nbsp; • &nbsp;
                                    ${report.date}
                                </div>

                            </div>

                            <span class="status-badge ${statusClass}">
                                ${report.status}
                            </span>

                        </div>

                    `;
                }
            ).join("");
    }
}


// =========================================
// CIVICLENS - STATUS CLASS
// =========================================

function getStatusClass(status) {

    if (status === "Under Review") {
        return "status-review";
    }

    if (status === "In Progress") {
        return "status-progress";
    }

    if (status === "Resolved") {
        return "status-resolved";
    }

    return "status-reported";
}


// =========================================
// CIVICLENS - MY REPORTS
// =========================================

if (
    window.location.pathname.includes(
        "my-reports.html"
    )
) {

    const container =
        document.getElementById(
            "myReportsContainer"
        );

    const reports =
        JSON.parse(
            localStorage.getItem(
                "civicLensReports"
            )
        ) || [];


    if (reports.length === 0) {

        container.innerHTML = `

            <div class="empty-my-reports">

                <h2>
                    No Reports Found
                </h2>

                <p>
                    You have not submitted any civic issues yet.
                </p>

                <a
                    href="report.html"
                    class="new-report-btn"
                >
                    + Report an Issue
                </a>

            </div>

        `;

    } else {

        container.innerHTML =
            reports
            .slice()
            .reverse()
            .map(
                report => {

                    return createReportCard(
                        report
                    );

                }
            )
            .join("");
    }
}


// =========================================
// CREATE REPORT CARD
// =========================================

function createReportCard(report) {

    const status =
        report.status || "Reported";


    const statusOrder = [
        "Reported",
        "Under Review",
        "In Progress",
        "Resolved"
    ];


    const currentIndex =
        statusOrder.indexOf(status);


    const steps =
        statusOrder.map(
            (step, index) => {

                let className = "";

                if (index < currentIndex) {
                    className = "completed";
                }

                if (index === currentIndex) {
                    className = "current";
                }

                return `

                    <div class="timeline-step ${className}">

                        <div class="timeline-dot">

                            ${
                                index < currentIndex
                                ? "✓"
                                : index + 1
                            }

                        </div>

                        <div class="timeline-label">
                            ${step}
                        </div>

                    </div>

                `;
            }
        ).join("");


    return `

        <div class="full-report-card">

            <div class="report-top">

                <div>

                    <div class="report-id">
                        REPORT ID: ${report.id}
                    </div>

                    <h2 class="report-title">
                        ${report.category}
                    </h2>

                    <p class="report-description">
                        ${report.description}
                    </p>

                </div>

                <span
                    class="status-badge
                    ${getStatusClass(status)}"
                >
                    ${status}
                </span>

            </div>


            <div class="report-meta">

                <div class="meta-item">
                    <strong>Submitted:</strong>
                    ${report.date}
                </div>

                <div class="meta-item">
                    <strong>Location:</strong>
                    ${report.location || "Not provided"}
                </div>

            </div>


            <div class="status-title">
                Issue Status
            </div>


            <div class="status-timeline">

                ${steps}

            </div>

        </div>

    `;
}


// =========================================
// CIVICLENS - PROFILE
// =========================================

if (
    window.location.pathname.includes(
        "profile.html"
    )
) {

    const storedUser =
        localStorage.getItem(
            "civicLensUser"
        );


    const reports =
        JSON.parse(
            localStorage.getItem(
                "civicLensReports"
            )
        ) || [];


    if (storedUser) {

        const user =
            JSON.parse(storedUser);


        const profileName =
            document.getElementById(
                "profileName"
            );

        const profileFullName =
            document.getElementById(
                "profileFullName"
            );

        const profileContact =
            document.getElementById(
                "profileContact"
            );

        const profileInitial =
            document.getElementById(
                "largeProfileInitial"
            );

        const profileReportCount =
            document.getElementById(
                "profileReportCount"
            );


        if (profileName) {
            profileName.textContent =
                user.name;
        }

        if (profileFullName) {
            profileFullName.textContent =
                user.name;
        }

        if (profileContact) {
            profileContact.textContent =
                user.contact;
        }

        if (profileInitial) {
            profileInitial.textContent =
                user.name
                    .charAt(0)
                    .toUpperCase();
        }

        if (profileReportCount) {
            profileReportCount.textContent =
                reports.length;
        }
    }
}


// =========================================
// CIVICLENS - LOGOUT
// =========================================

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


            if (confirmLogout) {

                localStorage.removeItem(
                    "civicLensLoggedIn"
                );

                localStorage.removeItem(
                    "civicLensUserName"
                );

                window.location.href =
                    "login.html";
            }

        }
    );
}

