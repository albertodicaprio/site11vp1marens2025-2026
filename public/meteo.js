
function formatISODate(isoString) {
    const date = new Date(isoString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
}

function formatDayWeather(dayData) {
    const minTemp = dayData.TN_C;
    const maxTemp = dayData.TX_C;
    const precipProb = dayData.PROBPCP_PERCENT;
    return `Min: ${minTemp}°C, Max: ${maxTemp}°C, Précipitations: ${precipProb}%`;
}

function extractHour(isoString) {
    const date = new Date(isoString);
    const shortDate = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${shortDate}, ${hours}:${minutes}`;
}

function getHourMeteoDataByOffset(hoursArray, n) {
    const now = new Date();
    const currentHour = now.getHours();

    // Find the index of the first hour that matches or exceeds the current hour
    let startIndex = 0;
    for (let i = 0; i < hoursArray.length; i++) {
        const hourDate = new Date(hoursArray[i].date_time);
        if (hourDate.getHours() >= currentHour) {
            startIndex = i;
            break;
        }
    }

    // Return the hour at offset n from the start index
    const targetIndex = startIndex + n;
    if (targetIndex < hoursArray.length) {
        return hoursArray[targetIndex];
    }
    return null;
}

function formatHourWeather(dayData) {
    const temp = dayData.TTT_C;
    const precipProb = dayData.PROBPCP_PERCENT;
    return `Temp: ${temp}°C, Précipitations: ${precipProb}%`;
}

async function onMeteoPageLoad() {
    const meteoH1time = document.getElementById("meteo_h_1_time");
    const meteoH2time = document.getElementById("meteo_h_2_time");
    const meteoH3time = document.getElementById("meteo_h_3_time");
    const meteoH1value = document.getElementById("meteo_h_1_value");
    const meteoH2value = document.getElementById("meteo_h_2_value");
    const meteoH3value = document.getElementById("meteo_h_3_value");

    const meteoD1date = document.getElementById("meteo_d_1_date");
    const meteoD2date = document.getElementById("meteo_d_2_date");
    const meteoD3date = document.getElementById("meteo_d_3_date");
    const meteoD1value = document.getElementById("meteo_d_1_value");
    const meteoD2value = document.getElementById("meteo_d_2_value");
    const meteoD3value = document.getElementById("meteo_d_3_value");

    const res = await fetch("/api/meteo");
    const data = await res.json();

    meteoD1date.innerText = formatISODate(data.forecast.days[1].date_time);
    meteoD2date.innerText = formatISODate(data.forecast.days[2].date_time);
    meteoD3date.innerText = formatISODate(data.forecast.days[3].date_time);
    meteoD1value.innerText = formatDayWeather(data.forecast.days[1]);
    meteoD2value.innerText = formatDayWeather(data.forecast.days[2]);
    meteoD3value.innerText = formatDayWeather(data.forecast.days[3]);

    const hourData1 = getHourMeteoDataByOffset(data.forecast.hours, 1);
    meteoH1time.innerText = extractHour(hourData1.date_time);
    meteoH1value.innerText = formatHourWeather(hourData1);

    const hourData2 = getHourMeteoDataByOffset(data.forecast.hours, 2);
    meteoH2time.innerText = extractHour(hourData2.date_time);
    meteoH2value.innerText = formatHourWeather(hourData2);

    const hourData3 = getHourMeteoDataByOffset(data.forecast.hours, 3);
    meteoH3time.innerText = extractHour(hourData3.date_time);
    meteoH3value.innerText = formatHourWeather(hourData3);

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

    const currentTimeLine = {
        id: "currentTimeLine",
        afterDatasetsDraw(chart) {

            const { ctx, chartArea, scales } = chart;
            const xScale = scales.x;

            const xPos = xScale.getPixelForTick(closestIndex);

            ctx.save();
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(xPos, chartArea.top);
            ctx.lineTo(xPos, chartArea.bottom);
            ctx.stroke();

            ctx.restore();
        }
    };

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
        },
        plugins: [currentTimeLine]
    });
}

document.addEventListener('DOMContentLoaded', onMeteoPageLoad);
