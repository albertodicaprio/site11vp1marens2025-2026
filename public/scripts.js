fetch("/header.html").then(r => r.text()).then(t => {
    document.getElementById("header").innerHTML = t;
});

fetch("/api/logout_button").then(r => r.json()).then(t => {
    document.getElementById("logout_button").innerHTML = t.html;
});

async function login() {
    const password = document.getElementById("password").value;

    const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
    });

    const data = await res.json();

    if (data.success) {
        window.location.href = "/private.html";
    } else {
        alert("Wrong password");
    }
}

async function logout() {
    await fetch("/api/logout", { cache: 'no-store' });
    location.href = "/index.html";
}

function calculateDaysUntil(dates) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
    
    for (const dateStr of dates) {
        const date = new Date(dateStr);
        date.setHours(0, 0, 0, 0); // Set to start of day
        
        if (date > today) {
            const timeDifference = date - today;
            const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
            return daysDifference;
        }
    }
    
    // If all dates are in the past, return null
    return null;
}

function onPageLoad() {
    const holidays = calculateDaysUntil(["2026-02-14", "2026-04-03", "2026-05-14", "2026-06-27"]);
    document.getElementById("holiday_days").innerText = "" + (holidays !== null ? holidays : "0");
    const exams = calculateDaysUntil(["2026-06-01"]);
    document.getElementById("exam_days").innerText = "" + (exams !== null ? exams : "0");
}

// Ensure `onPageLoad` runs when the document is ready
document.addEventListener('DOMContentLoaded', onPageLoad);
