function deleteReports(confirm) {
    if (confirm) {
        $.ajax({
            type: 'POST',
            async: false,
            url: '/api/deleteReports',
            data: {
                confirm: confirm
            },
            success: function (data) {
                console.log(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('error ' + textStatus + " " + errorThrown);
            }
        });
    } else {
        console.log('To confirm deletetion of all reports, parse argument \'true\'.');
        return;
    }
}

function getUid() {
    return $.get('/api/uid');
}

function getNotifications() {
    return $.getJSON('/api/getNotifications');
}

async function toggleUserNotification(state, notification) {
    return await $.post('/api/toggleNotification', { notification: notification, state: state, user: await $.get('/api/uid') });
}

async function deleteNotification(notification) {
    let response = undefined;
    await $.post('/api/deleteNotification', { notification }, function (data) {
        response = data;
    });
    return response;
}

async function unameFromId(id) {
    let response = undefined;
    await $.post('/api/unameFromId', { id: id }, function (data) {
        response = data.username;
    });
    return response;
}

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

async function getTotals(station, start) {
    let data = await $.getJSON('/api/totals', {
        station: station,
        start: start
    });

    return data;
}

async function getWind(station, start) {
    let data = await $.getJSON('/api/windSpeed', {
        station: station,
        start: start
    });

    return data;
}

async function getTemperature(station, start) {
    let data = await $.getJSON('/api/temperature', {
        station: station,
        start: start
    });

    return data;
}

async function getHumidity(station, start) {
    let data = await $.getJSON('/api/humidity', {
        station: station,
        start: start
    });

    return data;
}

async function getRainfall(station, start) {
    let data = await $.getJSON('/api/rainfall', {
        station: station,
        start: start
    });

    return data;
}

async function getWindDirection(station, start) {
    let data = await $.get('/api/windDirection', {
        station: station,
        start: start
    });

    return data;
}