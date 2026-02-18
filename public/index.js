
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

document.addEventListener('DOMContentLoaded', onIndexPageLoad);
