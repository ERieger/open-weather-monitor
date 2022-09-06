const mqtt = require('mqtt');                       // Require mqtt
const mqttPattern = require('mqtt-pattern');        // Validate if message matches path
const Report = require('../models/report.model');
const Station = require('../models/station.model');
const config = require("../config/config");          // Load config json
const client = mqtt.connect(config.mqtt.url, config.mqtt.options);    // Create a client
const reportTopic = config.mqtt.reportTopic;

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
        await Report.create((report));
        await Station.updateOne({ stationId: report.stationId }, { lastUpdate: report.time, status: true });
    }
});

client.on('packetsend', (packet) => {
    console.log(packet, 'packet2');
});
