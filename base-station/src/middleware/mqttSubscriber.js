const mqtt = require('mqtt');                       // Require mqtt
const mqttPattern = require('mqtt-pattern');        // Validate if message matches path
const client = mqtt.connect('mqtt://127.0.0.1');    // Create a client
const Report = require('../models/report.model');
const Station = require('../models/station.model');
const topic = 'nodes/reports/+'

client.on('connect', () => {
    client.subscribe(topic, (err, granted) => {
        if (err) { console.log(err) };
        console.log(granted, 'granted');
    });
});

client.on('message', (topicMsg, message, packet) => {
    if (mqttPattern.matches(topic, topicMsg)) {
        let report = JSON.parse(message);
        console.log(`Report recieved from ${report.stationId}: `, report);
        Report.create((report), function (err) {
            if (err) return handleError(err);
        });
        
        Station.updateOne({ stationId: report.stationId }, { lastUpdate: report.time, status: true }, function (err) {
            if (err) return handleError(err);
        });
    }
});

client.on('packetsend', (packet) => {
    console.log(packet, 'packet2');
});
