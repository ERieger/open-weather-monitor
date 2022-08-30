const d = new Date();
const start = new Date(d.getFullYear(), d.getMonth(), d.getDay(), 00, 00, 00, 00).toUTCString();

const peekGraphTemplate = {
    series: [],
    chart: {
        type: 'area',
        height: '100%',
        zoom: {
            enabled: false
        },
        toolbar: {
            show: false
        }
    },
    stroke: {
        curve: 'smooth',
    },
    dataLabels: {
        enabled: false
    },
    xaxis: {
        type: 'datetime',
        floating: true,
        axisTicks: {
            show: false
        },
        labels: {
            show: false
        },
        axisBorder: {
            show: false
        }
    },
    yaxis: {
        floating: true,
        axisTicks: {
            show: false
        },
        labels: {
            show: false
        },
        axisBorder: {
            show: false
        }
    },
    grid: {
        show: false,
    },
    noData: {
        text: 'Loading...'
    }
}

$('#refreshBtn').click(() => updatePage(getFirstStation().stationId));

window.onload = () => {
    let station = getFirstStation();
    console.log(station)
    updatePage(station.stationId);
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

function getFirstStation() {
    let result = undefined;
    $.ajax({
        type: 'GET',
        async: false,
        url: '/api/firstStation',
        dataType: 'json',
        success: function (data) {
            console.log(data)
            result = data;
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log('error ' + textStatus + " " + errorThrown);
        }
    });
    return result;
}

function getStations() {
    let docs;
    $.ajax({
        type: 'GET',
        async: false,
        url: '/api/stations',
        dataType: 'json',
        success: function (data) {
            docs = data;
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log('error ' + textStatus + " " + errorThrown);
        }
    });

    return docs;
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

    renderWindPeek(target);
    renderTempPeek(target);
    renderHumidityPeek(target);
    renderRainPeek(target);
    renderWindDirectionChart(target);
    renderTemperatureChart(target);

    toggleRefreshButton();
}

// Quick peek charts
function renderWindPeek(station, data) {
    var options = Object.assign(peekGraphTemplate, { colors: ['#ae3ec9'] });
    var chart = new ApexCharts(document.querySelector("#wind-peek"), options);
    chart.render();
    console.log(station, data)

    if (typeof data == 'undefined') {
        $.ajax({
            type: 'POST',
            async: false,
            url: '/api/windSpeed',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                station: station,
                start: start
            }),
            success: function (data) {
                console.log(data)
                chart.updateSeries([data]);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('error ' + textStatus + " " + errorThrown);
            }
        });
    } else {
        chart.updateSeries([data]);
    }
}

function renderTempPeek(station, data) {
    var options = Object.assign(peekGraphTemplate, { colors: ['#d63939'] });
    var chart = new ApexCharts(document.querySelector("#temp-peek"), options);
    chart.render();

    if (typeof data == 'undefined') {
        $.ajax({
            type: 'POST',
            async: false,
            url: '/api/temperature',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                station: station,
                start: start
            }),
            success: function (data) {
                chart.updateSeries([data]);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('error ' + textStatus + " " + errorThrown);
            }
        });

    } else {
        chart.updateSeries([data]);
    }
}
function renderHumidityPeek(station, data) {
    var options = Object.assign(peekGraphTemplate, { colors: ['#2fb344'] });
    var chart = new ApexCharts(document.querySelector("#humidity-peek"), options);
    chart.render();

    if (typeof data == 'undefined') {
        $.ajax({
            type: 'POST',
            async: false,
            url: '/api/humidity',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                station: station,
                start: start
            }),
            success: function (data) {
                chart.updateSeries([data]);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('error ' + textStatus + " " + errorThrown);
            }
        });

    } else {
        chart.updateSeries([data]);
    }
}
function renderRainPeek(station, data) {
    var options = Object.assign(peekGraphTemplate, { colors: ['#4263eb'] });
    var chart = new ApexCharts(document.querySelector("#rain-peek"), options);
    chart.render();

    if (typeof data == 'undefined') {
        $.ajax({
            type: 'POST',
            async: false,
            url: '/api/rainfall',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                station: station,
                start: start
            }),
            success: function (data) {
                chart.updateSeries([data]);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('error ' + textStatus + " " + errorThrown);
            }
        });
    } else {
        chart.updateSeries([data]);
    }
}



// Wind direction chart
function renderWindDirectionChart(station, data) {
    var options = {
        series: [0, 0, 0, 0, 1, 5, 10, 19, 20, 25, 29, 25, 10, 6, 5, 1],
        labels: ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'],
        chart: {
            type: 'polarArea',
        },
        stroke: {
            colors: ['#fff']
        },
        fill: {
            opacity: 0.8
        },
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    width: 200
                },
                legend: {
                    position: 'bottom'
                }
            }
        }]
    };

    var chart = new ApexCharts(document.querySelector("#wind-direction-chart"), options);
    chart.render();
}

// Temperature chart
function renderTemperatureChart(station, data) {
    var options = {
        series: [],
        chart: {
            height: '100%',
            type: 'line',
            zoom: {
                enabled: false
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth'
        },
        grid: {
            row: {
                colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                opacity: 0.5
            },
        },
        xaxis: {
            type: 'datetime'
        },
        noData: {
            text: 'Loading...'
        }
    };

    var chart = new ApexCharts(document.querySelector("#temperature-chart"), options);
    chart.render();

    $.ajax({
        type: 'POST',
        async: false,
        url: '/api/temperature',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
            station: station.stationId,
            start: start
        }),
        success: function (data) {
            chart.updateSeries([data])
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log('error ' + textStatus + " " + errorThrown);
        }
    });
}
