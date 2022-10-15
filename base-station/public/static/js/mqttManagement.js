// Define the MQTT server configuration
const config = {
    url: "ws://localhost",
    options: {
        port: 1884
    },
    reportTopic: "nodes/reports/+"
};

const client = mqtt.connect(config.url, config.options);    // Create a client connection to the server
const reportTopic = config.reportTopic;                     // Get the report topic

client.on('connect', () => {                                // On client connect
    client.subscribe(reportTopic, (err, granted) => {       // Subscribe to the report topic
        if (err) { console.log(err) };                      // Oh no! There was an Error. Log it!
        console.log(granted, 'granted');                    // Log that you were granted access to the server
    });
});

client.on('message', async (topicMsg, message, packet) => {                 // When you recieve a message
    if (mqttPatternMatches(reportTopic, topicMsg)) {                        // If the pattern of the topic matches the report topic
        let report = JSON.parse(message);                                   // Parse the message as a JSON
        let epochConversion = new Date(report.time * 1000);                 // Covert the epoch
        report.time = new Date(epochConversion);                            // Set the report date to the converted date
        console.log(`Report recieved from ${report.stationId}: `, report);  // Log the report to the console.
    }
});

// Function to generate a dummy report
function emulateStation() {
    client.publish(config.reportTopic.replace("+", $('#stationSelect').val()), JSON.stringify(  // Publsih a report to the mqtt server with random values
        {
            "stationId": $('#stationSelect').val(), // Get which station the user has selected
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
