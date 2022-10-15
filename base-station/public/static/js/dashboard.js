const d = new Date();           // Initialise a new data instance at local timezone
d.setHours(0, 0, 0, 0);         // Set time to 12:00AM on the day
const start = d;                // Set start time as this date

// Add a listener to the refresh button to update the page with the first station
$('#refreshBtn').click(() => updatePage(getFirstStation().stationId));

window.onload = () => {
    updatePage(getFirstStation().stationId); // Once the window has loaded update the page with the first station
};

// Leaflets map config
let map = L.map('map').setView([-34.9507911, 138.6029232], 12.35);      // Set the map view

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {     // Set the base layer and associated config
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);                                                          // Add the layer to the map

let stationMarkers = L.layerGroup().addTo(map);                         // Add a new layergroup to the map for the station markers
let stationIcon = L.icon({                                              // Define configuration for the custom icon
    iconUrl: '/images/stationIcon.svg',
    shadowUrl: '/images/stationShadow.svg',

    iconSize: [35, 35],                                                 // size of the icon
    shadowSize: [40, 40],                                               // size of the shadow
    iconAnchor: [0, 0],                                                 // point of the icon which will correspond to marker's location
    shadowAnchor: [0, 0],                                               // the same for the shadow
    popupAnchor: [0, 0]                                                 // point from which the popup should open relative to the iconAnchor
});

// Function to update the stations on the map (accepts an array of stations as an argument)
function updateMap(stations) {
    console.log('Adding station to the map:', stations)
    stations.forEach((station) => { // Loop through the array of stations
        if (station.status == true) { // If the station is active
            let stationMarker = new L.marker([station.loc.lat, station.loc.lon], { icon: stationIcon }) // Create a new leaflets marker instance with current station
                .bindPopup(`<h1>${station.name}</h1><br>
                            <a onclick="updatePage('${station.stationId}')" class="btn btn-primary text-white">Select</a>`) // Bind a popup with a button and title
                .addTo(stationMarkers); // Add the marker to the stationMarkers layer                                        // onlick update page with station id
        }
    });

    stationMarkers.addTo(map); // Add the updated layer to the map
}

// Function to disable the refresh button and make it into a loading spinner
function toggleRefreshButton() {
    // Static references to the elements
    let spinner = $('#refreshSpinner');
    let button = $('#refreshBtn');

    if (spinner.hasClass('d-none')) {   // If refreshing
        button.toggleClass('d-none');       // Hide the button
        spinner.toggleClass('d-block');     // Set display block
        spinner.toggleClass('d-none');      // Remove hidden class
    } else {                            // If done refreshing
        spinner.toggleClass('d-none');      // Hide the spinner
        button.toggleClass('d-block');      // Set display block
        button.toggleClass('d-none');       // Hide Show the button
    }
}

// Utility function to clear the page
function clearPage() {
    stationMarkers.clearLayers(); // Clear the stations from the map
}

// Main utility function that update everything!
function updatePage(target) {                           // Accept a station as a target
    let stations = getStations();                       // Get list of all stations
    $('#refreshBtn').unbind('click');                   // Disable refresh button
    $('#refreshBtn').click(() => updatePage(target));   // Update the spinner so it triggers an update of the currently shown station

    toggleRefreshButton();                              // Disable refresh button and make it show loading spinner

    clearPage();                                        // Clear the page

    updateMap(stations);                                // Update the map with the current list of active stations

    for (let i = 0; i < stations.length; i++) {         // For each station
        if (stations[i].stationId == target) {          // If the station == the target
            updateStationInfo(target, stations[i]);         // Update the station info
            break;
        } else {                                        // If not the target
            continue;                                       // Skip this iteration of the loop
        }
    }

    // Call utilities to update the statistics parse the target to the function
    updateTotals(target);                               // Update the numbers shown in the cards on the top right
    renderWindPeek(target);                             // Render wind graph in card
    renderTempPeek(target);                             // Render temperature graph in card
    renderHumidityPeek(target);                         // Render humidity graph in card
    renderRainPeek(target);                             // Render rain graph in card
    renderWindDirectionChart(target);                   // Render wind direction chart
    renderTemperatureChart(target);                     // Render large temperature chart

    toggleRefreshButton();                              // Re-enable the refresh button
}

// Update the station name and location
function updateStationInfo(station, data) {
    console.log('Rendering:', data.name, 'At:', data.loc);
    $('#node-name').text(data.name);
    $('#node-loc').text(`${data.loc.lat}, ${data.loc.lon}`);
}

// Function to update the numbers in the card (accepts a station and data)
async function updateTotals(station, data) {
    let report = undefined;
    if (typeof data == 'undefined') {                       // If you didn't parse data
        report = await getTotals(station, start);               // Get data
    } else {                                                // If you did parse data
        report = data;                                          // Use the data
    }

    // Update the totals with jquery
    $('#wind-speed').text(`${report.wind.speed}km/h`);
    $('#temperature').text(`${report.temperature}\u00B0C`);
    $('#rel-humidity').text(`${report.relHumidity}%`);
    $('#rain').text(`${report.rainfall}mm`);
}

// Quick peek charts
// Each of these fucntions is basically the same so I will just comment one
async function renderWindPeek(station, data) {
    var options = Object.assign(peekGraphTemplate, { colors: ['#ae3ec9'] });    // Load the configuration dropin and combine it with a custom configuration object
    var chart = new ApexCharts(document.querySelector("#wind-peek"), options);  // Create a new apex chart instance in the element
    chart.render();                                                             // Render the chart

    if (typeof data == 'undefined') {                                           // If you are not parsing data
        chart.updateSeries([await getWind(station, start)]);                        // Update the chart with a database call
    } else {                                                                    // If you are parsing data
        chart.updateSeries([data]);                                                 // Update the chart with your data
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
// This function is the same as all the others however the data is returned in a different format
// It is formatted by the server - this function simply renders it with some labels
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
