// This file contains an API abstraction of all the application endpoints.
function deleteReports(confirm) {                   // Calls the delete reports endpoint
    if (confirm) { // Check if user has parsed true to the function call (confirmation that you want to delete all records) 
        $.ajax({ // Post confirmation to the endpoint
            type: 'POST',
            async: false,
            url: '/api/deleteReports',
            data: {
                confirm: confirm
            },
            success: function (data) {
                console.log(data); // Log result
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('error ' + textStatus + " " + errorThrown);
            }
        });
    } else { // User did not parse true into the function
        console.log('To confirm deletetion of all reports, parse argument \'true\'.'); // Ask user to call function with confirmation bool
        return;
    }
}

// Function to get the uid of the logged in user
async function getUid() {
    return await $.get('/api/uid'); // Call endpoint, await response, return result
}

// Return all documents in notifications collection
async function getNotifications() {
    return await $.getJSON('/api/getNotifications'); // Call endpoint, await response, return result
}

// Toggle a defined notification to a defined state
async function toggleUserNotification(state, notification) {
    // Call endpoint, await response, return result
    // Parse the target notification, state, and current user
    // Before sending call get the uid of the current user through api call
    return await $.post('/api/toggleNotification', { notification: notification, state: state, user: await $.get('/api/uid') });
}

// Delete a defined notification
async function deleteNotification(notification) {
    // Parse notification id to call
    return await $.post('/api/deleteNotification', { notification }); // Call endpoint, await response, return result
}

// Get the username from a user ID
async function unameFromId(id) {
    let response = undefined;
    await $.post('/api/unameFromId', { id: id }, function (data) { // Call endpoint, await response, return result
        response = data.username;
    });
    return response; // Return response
}

// Get the first station in the database
function getFirstStation() {
    let result = undefined;
    $.ajax({
        type: 'GET',
        async: false,
        url: '/api/firstStation',
        dataType: 'json',
        success: function (data) {
            result = data;
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log('error ' + textStatus + " " + errorThrown);
        }
    });
    return result;
}

// Get all stations registered in the database
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

// Get object containing most recent record for defined station with defined start-time
async function getTotals(station, start) {
    let data = await $.getJSON('/api/totals', {
        station: station,
        start: start
    });

    return data;
}

// Get all wind data for station from particular start-time
// Returns an object which apex chart can use
async function getWind(station, start) {
    let data = await $.getJSON('/api/windSpeed', {
        station: station,
        start: start
    });

    return data;
}

// Get all teperature data for station from particular start-time
// Returns an object which apex chart can use
async function getTemperature(station, start) {
    let data = await $.getJSON('/api/temperature', {
        station: station,
        start: start
    });

    return data;
}

// Get all humidity data for station from particular start-time
// Returns an object which apex chart can use
async function getHumidity(station, start) {
    let data = await $.getJSON('/api/humidity', {
        station: station,
        start: start
    });

    return data;
}

// Get all rainfall data for station from particular start-time
// Returns an object which apex chart can use
async function getRainfall(station, start) {
    let data = await $.getJSON('/api/rainfall', {
        station: station,
        start: start
    });

    return data;
}

// Get all wind direction data for station from particular start-time
// Returns an object which apex chart can use
async function getWindDirection(station, start) {
    let data = await $.get('/api/windDirection', {
        station: station,
        start: start
    });

    return data;
}