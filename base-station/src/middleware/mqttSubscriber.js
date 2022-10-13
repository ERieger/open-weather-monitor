const mqtt = require('mqtt');                       // Require mqtt
const mqttPattern = require('mqtt-pattern');        // Validate if message matches path
const Report = require('../models/report.model');
const Station = require('../models/station.model');
const config = require("../config/config");          // Load config json
const client = mqtt.connect(config.mqtt.url, config.mqtt.options);    // Create a client
const reportTopic = config.mqtt.reportTopic;
const checkNotification = require('./notifications');

client.on('connect', () => {
    client.subscribe(reportTopic, (err, granted) => {
        if (err) { console.log(err) };
        console.log(granted, 'granted');
    });
});

client.on('message', async (topicMsg, message, packet) => {
    if (mqttPattern.matches(reportTopic, topicMsg)) {
        let report = JSON.parse(message);
        let epochConversion = new Date(report.time * 1000);
        report.time = new Date(epochConversion);
        // console.log(`Report recieved from ${report.stationId}: `, report);
        await Report.create((report));
        await Station.updateOne({ stationId: report.stationId }, { lastUpdate: report.time, status: true });

        checkNotification(report);
    }
});

client.on('packetsend', (packet) => {
    console.log(packet, 'packet2');
});
