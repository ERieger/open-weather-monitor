const d = new Date();
d.setHours(0, 0, 0, 0);
const start = d;

$('#refreshBtn').click(() => updatePage(getFirstStation().stationId));

window.onload = () => {
    updatePage(getFirstStation().stationId);
};

// Leaflets map config
let map = L.map('map').setView([-34.9507911, 138.6029232], 12.35);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

let stationMarkers = L.layerGroup().addTo(map);
let stationIcon = L.icon({
    iconUrl: '/images/stationIcon.svg',
    shadowUrl: '/images/stationShadow.svg',

    iconSize: [35, 35], // size of the icon
    shadowSize: [40, 40], // size of the shadow
    iconAnchor: [0, 0], // point of the icon which will correspond to marker's location
    shadowAnchor: [0, 0],  // the same for the shadow
    popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor
});

function updateMap(stations) {
    stations.forEach((station) => {
        if (station.status == true) {
            let stationMarker = new L.marker([station.loc.lat, station.loc.lon], { icon: stationIcon })
                .bindPopup(`<h1>${station.name}</h1><br>
                            <a onclick="updatePage('${station.stationId}')" class="btn btn-primary text-white">Select</a>`)
                .addTo(stationMarkers);
        }
    });

    stationMarkers.addTo(map);
}

function toggleRefreshButton() {
    let spinner = $('#refreshSpinner');
    let button = $('#refreshBtn');

    if (spinner.hasClass('d-none')) {
        button.toggleClass('d-none');
        spinner.toggleClass('d-block');
        spinner.toggleClass('d-none');
    } else {
        spinner.toggleClass('d-none');
        button.toggleClass('d-block');
        button.toggleClass('d-none');
    }
}

function clearPage() {
    stationMarkers.clearLayers();
}

function updatePage(target) {
    let stations = getStations();
    $('#refreshBtn').unbind('click');
    $('#refreshBtn').click(() => updatePage(target));

    toggleRefreshButton();

    clearPage();

    updateMap(stations);

    for (let i = 0; i < stations.length; i++) {
        if (stations[i].stationId == target) {
            updateStationInfo(target, stations[i]);
            break;
        }
    }

    updateTotals(target);
    renderWindPeek(target);
    renderTempPeek(target);
    renderHumidityPeek(target);
    renderRainPeek(target);
    renderWindDirectionChart(target);
    renderTemperatureChart(target);

    toggleRefreshButton();
}

function updateStationInfo(station, data) {
    console.log(station, data)
    $('#node-name').text(data.name);
    $('#node-loc').text(`${data.loc.lat}, ${data.loc.lon}`);

}

async function updateTotals(station, data) {
    let report = undefined;
    if (typeof data == 'undefined') {
        report = await getTotals(station, start);
    } else {
        report = data;
    }

    $('#wind-speed').text(`${report.wind.speed}km/h`);
    $('#temperature').text(`${report.temperature}\u00B0C`);
    $('#rel-humidity').text(`${report.relHumidity}%`);
    $('#rain').text(`${report.rainfall}mm`);
}

// Quick peek charts
async function renderWindPeek(station, data) {
    var options = Object.assign(peekGraphTemplate, { colors: ['#ae3ec9'] });
    var chart = new ApexCharts(document.querySelector("#wind-peek"), options);
    chart.render();

    if (typeof data == 'undefined') {
        chart.updateSeries([await getWind(station, start)]);
    } else {
        chart.updateSeries([data]);
    }
}

async function renderTempPeek(station, data) {
    var options = Object.assign(peekGraphTemplate, { colors: ['#d63939'] });
    var chart = new ApexCharts(document.querySelector("#temp-peek"), options);
    chart.render();

    if (typeof data == 'undefined') {
        chart.updateSeries([await getTemperature(station, start)]);
    } else {
        chart.updateSeries([data]);
    }
}

async function renderHumidityPeek(station, data) {
    var options = Object.assign(peekGraphTemplate, { colors: ['#2fb344'] });
    var chart = new ApexCharts(document.querySelector("#humidity-peek"), options);
    chart.render();

    if (typeof data == 'undefined') {
        chart.updateSeries([await getHumidity(station, start)]);


    } else {
        chart.updateSeries([data]);
    }
}

async function renderRainPeek(station, data) {
    var options = Object.assign(peekGraphTemplate, { colors: ['#4263eb'] });
    var chart = new ApexCharts(document.querySelector("#rain-peek"), options);
    chart.render();

    if (typeof data == 'undefined') {
        chart.updateSeries([await getRainfall(station, start)]);

    } else {
        chart.updateSeries([data]);
    }
}



// Wind direction chart
async function renderWindDirectionChart(station, data) {
    var options = windDirectionChartTemplate;

    var chart = new ApexCharts(document.querySelector("#wind-direction-chart"), options);
    chart.render();

    if (typeof data == 'undefined') {
        chart.updateOptions({
            labels: ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
        }, false, true);
        chart.updateSeries(await getWindDirection(station, start));
    } else {
        chart.updateOptions({
            labels: ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
        }, false, true);
        chart.updateSeries(data);
    }
}

// Temperature chart
async function renderTemperatureChart(station, data) {
    var options = tempChartTemplate;

    var chart = new ApexCharts(document.querySelector("#temperature-chart"), options);
    chart.render();
    if (typeof data == 'undefined') {
        chart.updateSeries([await getTemperature(station, start)]);
    } else {
        chart.updateSeries([data]);
    }
}
