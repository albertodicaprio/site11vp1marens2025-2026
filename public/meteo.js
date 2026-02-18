
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
}

document.addEventListener('DOMContentLoaded', onMeteoPageLoad);
