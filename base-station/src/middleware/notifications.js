const Notification = require('../models/notification.model');               // Import notifications schema
const Station = require('../models/station.model');                         // Import station schema
const PushNotifications = require("@pusher/push-notifications-server");     // Import beams server api
const dotenv = require('dotenv');                                           // Import .env library
dotenv.config({ path: `${__dirname}/config/.env` });                        // Configure env file path

let beamsClient = new PushNotifications({                                   // New Beams Client Instance
    instanceId: process.env.BEAMS_INSTANCE_ID,                              // Load instance ID from environment variables
    secretKey: process.env.BEAMS_SECRET_KEY,                                // Load secret key from environment variables
});

module.exports = async (report) => {                                                    // Export function as module to check a report
    console.log(`Checking report: ${JSON.stringify(report)}`);
    let notificationListeners = await Notification.find({});                            // Get all notifications from the database

    notificationListeners.forEach((listener) => {                                       // Loop through the notifications
        if (listener.subscribers.length >= 1) {                                         // If there are people subscribed to the notification
            listener.ref = cleanField(listener.field);                                  // Convert the field option so the program can read it
            console.log(`Checking ${listener.field} (${eval(listener.ref)}) for value ${listener.condition} ${listener.trigger}`);

            switch (listener.condition) {                                               // Get the condition of the notification
                case '==':
                    if (eval(listener.ref) == listener.trigger) {                       // Evaluate the object reference - if condition == trigger
                        console.log(`${eval(listener.ref)} == ${listener.trigger}`);
                        sendPushNotification(listener, report)                          // Send notification
                    }
                    break;
                case '>':
                    if (eval(listener.ref) > listener.trigger) {                        // Get the condition of the notification
                        console.log(`${eval(listener.ref)} > ${listener.trigger}`);
                        sendPushNotification(listener, report)                          // Send notification
                    }
                    break;
                case '<':
                    if (eval(listener.ref) < listener.trigger) {                        // Get the condition of the notification
                        console.log(`${eval(listener.ref)} < ${listener.trigger}`);
                        sendPushNotification(listener, report)                          // Send notification
                    }
                    break;
            }
        } else {                                                                        // Skip this notification as there are no subscribers
            return;
        }
    });
};

async function sendPushNotification(listener, report) {                                 // Send a notification accept the listener and the report
    let station = await Station.findOne({ stationId: report.stationId }, {name: 1});    // Lookup the stationId and return the human readable name
    beamsClient
        .publishToUsers(listener.subscribers, {                                         // Publish to all users in the subscription list
            web: {
                notification: {                                                         // Substitute in the values to the notification
                    title: `Open weather ${listener.field} alert triggered.`,
                    body: `The ${listener.field} at ${station.name} has reached ${listener.condition}${listener.trigger} (${eval(listener.ref)})`,
                },
            },
        })
        .then((publishResponse) => {
            console.log("Just published:", publishResponse.publishId);
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

// Convert the field array to a property reference
function cleanField(fields) {       // Get fields
    let str = 'report';             // Template string
    fields.forEach((field) => {     // For each field in name
        str += `['${field}']`;      // Append the reference
    });

    return str;                     // Return object reference
}