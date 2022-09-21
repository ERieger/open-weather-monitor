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