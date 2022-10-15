const mqtt = require('mqtt');                       // Require mqtt
const mqttPattern = require('mqtt-pattern');        // Validate if message matches path
const Report = require('../models/report.model');
const Station = require('../models/station.model');
const config = require("../config/config");          // Load config json
const client = mqtt.connect(config.mqtt.url, config.mqtt.options);    // Create a client
const reportTopic = config.mqtt.reportTopic;
const checkNotification = require('./notifications');

client.on('connect', () => {                            // On broker connection
    client.subscribe(reportTopic, (err, granted) => {   // Subscribe to defined topic
        if (err) { console.log(err) };                  // Log any errors
        console.log(granted, 'access granted');         // Confirm access
    });
});

client.on('message', async (topicMsg, message, packet) => {                                                     // On new message
    if (mqttPattern.matches(reportTopic, topicMsg)) {                                                           // If the topic matches the subscribed topic
        let report = JSON.parse(message);                                                                       // Parse the message as JSON
        let epochConversion = new Date(report.time * 1000);                                                     // Convert the epoch
        report.time = new Date(epochConversion);                                                                // Assign the converted time to the report time
        console.log(`Report recieved from ${report.stationId}: `, report);
        await Report.create((report));                                                                          // Add report to the database
        await Station.updateOne({ stationId: report.stationId }, { lastUpdate: report.time, status: true });    // Update the station last update time, and  status

        checkNotification(report);                                                                              // Check report against configured notificatons
    }
});

// Used for debugging packet server connections
// client.on('packetsend', (packet) => {
//     console.log(packet, 'packet2');
// });
