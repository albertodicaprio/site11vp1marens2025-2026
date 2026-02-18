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

function onIndexPageLoad() {
    const holidays = calculateDaysUntil(["2026-02-14", "2026-04-03", "2026-05-14", "2026-06-27"]);
    document.getElementById("holiday_days").innerText = "" + (holidays !== null ? holidays : "0");
    const exams = calculateDaysUntil(["2026-06-01"]);
    document.getElementById("exam_days").innerText = "" + (exams !== null ? exams : "0");
    const study = calculateDaysUntil(["2026-05-04"]);
    document.getElementById("study_days").innerText = "" + (study !== null ? study : "0");
}

async function onMeteoPageLoad() {
    const meteoH0time = document.getElementById("meteo_h_0_time");
    const meteoH1time = document.getElementById("meteo_h_1_time");
    const meteoH2time = document.getElementById("meteo_h_2_time");
    const meteoD1date = document.getElementById("meteo_d_1_date");
    const meteoD2date = document.getElementById("meteo_d_2_date");
    const meteoD3date = document.getElementById("meteo_d_3_date");

    const meteoH0value = document.getElementById("meteo_h_0_value");
    const meteoH1value = document.getElementById("meteo_h_1_value");
    const meteoH2value = document.getElementById("meteo_h_2_value");
    const meteoD1value = document.getElementById("meteo_d_1_value");
    const meteoD2value = document.getElementById("meteo_d_2_value");
    const meteoD3value = document.getElementById("meteo_d_3_value");

    const res = await fetch("/api/meteo");
    const data = await res.json();

    console.log("Meteo demain min:", data.forecast.days[1].min_color);

    // Example data - in a real app, this would come from an API
    meteoH0time.innerText = "00:00-01:00";
    meteoH1time.innerText = "01:00-02:00";
    meteoH2time.innerText = "02:00-03:00";
    meteoD1date.innerText = "Demain";
    meteoD2date.innerText = "Après-demain";
    meteoD3date.innerText = "Dans 3 jours";
    meteoH0value.innerText = "15°C, Ensoleillé";
    meteoH1value.innerText = "14°C, Partiellement nuageux";
    meteoH2value.innerText = "13°C, Pluvieux";
    meteoD1value.innerText = "16°C, Ensoleillé";
    meteoD2value.innerText = "17°C, Nuageux";
    meteoD3value.innerText = "18°C, Pluvieux";
}
