const config = {
    url: "ws://localhost",
    options: {
        port: 1884
    },
    reportTopic: "nodes/reports/+"
};

window.onload = () => {
    const stations = getStations();

    stations.forEach((station) => {
        $('#stationSelect').append(`<option value="${station.stationId}">${station.name}</option>`)
    });

    $('#sendBtn').click(() => {
        emulateStation();
    });

    $('#serverUrl').append(config.url);
    $('#serverPort').append(config.options.port);
    $('#reportTopic').append(config.reportTopic);

    console.log(stations)
};

const client = mqtt.connect(config.url, config.options);    // Create a client
const reportTopic = config.reportTopic;

client.on('connect', () => {
    client.subscribe(reportTopic, (err, granted) => {
        if (err) { console.log(err) };
        console.log(granted, 'granted');
    });
});

client.on('message', async (topicMsg, message, packet) => {
    if (mqttPatternMatches(reportTopic, topicMsg)) {
        let report = JSON.parse(message);
        let epochConversion = new Date(report.time * 1000);
        report.time = new Date(epochConversion);
        console.log(`Report recieved from ${report.stationId}: `, report);
    }
});

function emulateStation() {
    client.publish(config.reportTopic.replace("+", $('#stationSelect').val()), JSON.stringify(
        {
            "stationId": $('#stationSelect').val(),
            "time": new Date().getTime()/1000,
            "wind": {
                "speed": Math.floor(Math.random() * 21),
                "direction": Math.floor(Math.random() * 361),
                "gust": Math.floor(Math.random() * (30 - 15 + 1) + 15),
                "gust_direction": Math.floor(Math.random() * 361)
            },
            "rainfall": Math.floor(Math.random() * 11),
            "temperature": Math.floor(Math.random() * 31),
            "pressure": Math.floor(Math.random() * (1500 - 500 + 1) + 500),
            "relHumidity": Math.floor(Math.random() * 101),
            "light": Math.floor(Math.random() * 51),
            "system": {
                "battery": Math.floor(Math.random() * 101)
            }
        })
    );
}

client.on('packetsend', (packet) => {
    console.log(packet, 'packet2');
});
