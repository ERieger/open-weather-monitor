const mqtt = require('mqtt');                       // Require mqtt
const mqttPattern = require('mqtt-pattern');        // Validate if message matches path
const client = mqtt.connect('mqtt://127.0.0.1');    // Create a client
const Report = require('../models/report.model');
const Station = require('../models/station.model');
const reportTopic = 'nodes/reports/+';

client.on('connect', () => {
    client.subscribe(reportTopic, (err, granted) => {
        if (err) { console.log(err) };
        console.log(granted, 'granted');
    });
});

client.on('message', async (topicMsg, message, packet) => {
    if (mqttPattern.matches(reportTopic, topicMsg)) {
        let report = JSON.parse(message);
        console.log(`Report recieved from ${report.stationId}: `, report);
        await Report.create((report), function (err) { if (err) return handleError(err) });
        await Station.updateOne({ stationId: report.stationId }, { lastUpdate: report.time, status: true }, function (err) { if (err) return handleError(err) });
    }
});

client.on('packetsend', (packet) => {
    console.log(packet, 'packet2');
});
