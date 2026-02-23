
async function onMeteoPageLoad() {

    const res = await fetch("/api/meteo");
    const data = await res.json();

    let lastDay = "";

    const labels = data.forecast.hours.map(entry => {
        const date = new Date(entry.date_time);
        const day = date.toLocaleDateString("fr-CH", { weekday: "short" });
        const hour = date.getHours().toString().padStart(2, "0") + ":00";

        if (day !== lastDay) {
            lastDay = day;
            return day + "\n" + hour; // Line break!
        }

        return hour;
    });

    const now = new Date();

    let closestIndex = 0;
    let smallestDiff = Infinity;

    data.forecast.hours.forEach((entry, index) => {
        const forecastTime = new Date(entry.date_time);
        const diff = Math.abs(forecastTime - now);

        if (diff < smallestDiff) {
            smallestDiff = diff;
            closestIndex = index;
        }
    });

    const temps = data.forecast.hours.map(entry =>
        entry.TTT_C
    );
    const precips = data.forecast.hours.map(entry =>
        entry.PROBPCP_PERCENT
    );

    const ctx = document.getElementById("tempChart");
    Chart.defaults.color = "#000000";

    new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Temperature (°C)",
                data: temps,
                type: "line",
                tension: 0.3,
                fill: true,
                backgroundColor: "rgba(255, 208, 0, 0.2)",
                borderColor: "orange",
                pointRadius: temps.map((_, i) =>
                    i === closestIndex ? 5 : 2
                ),
                pointBackgroundColor: temps.map((_, i) =>
                    i === closestIndex ? "red" : "rgba(255, 208, 0, 0.2)"
                ),
                pointBorderColor: temps.map((_, i) =>
                    i === closestIndex ? "black" : "orange"
                ),
                yAxisID: "y"
            },
            {
                label: "Précipitations (%)",
                data: precips,  // array of precipitation values matching labels
                type: "line",
                tension: 0.3,
                fill: true,
                backgroundColor: "rgba(0,150,255,0.2)",
                borderColor: "blue",
                pointRadius: temps.map((_, i) =>
                    i === closestIndex ? 5 : 2
                ),
                pointBackgroundColor: temps.map((_, i) =>
                    i === closestIndex ? "red" : "rgba(0,150,255,0.2)"
                ),
                pointBorderColor: temps.map((_, i) =>
                    i === closestIndex ? "black" : "blue"
                ),
                yAxisID: "y1"
            }]
        },
        options: {
            scales: {
                x: {
                    type: "category",
                    title: {
                        display: true,
                        text: "Hour"
                    }
                },
                y: {  // left axis for temperature
                    type: "linear",
                    position: "left",
                    title: { display: true, text: "Temperature °C", color: "black" },
                    ticks: { color: "black" },
                },
                y1: { // right axis for precipitation
                    type: "linear",
                    position: "right",
                    title: { display: true, text: "Précipitations %", color: "black" },
                    ticks: { color: "black" },
                    grid: { drawOnChartArea: false } // prevent overlapping gridlines
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', onMeteoPageLoad);
