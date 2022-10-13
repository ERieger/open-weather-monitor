const Notification = require('../models/notification.model');
const PushNotifications = require("@pusher/push-notifications-server");
const dotenv = require('dotenv');
dotenv.config({ path: `${__dirname}/config/.env` });

let beamsClient = new PushNotifications({
    instanceId: process.env.BEAMS_INSTANCE_ID,
    secretKey: process.env.BEAMS_SECRET_KEY,
});

module.exports = async (report) => {
    console.log(`Checking report: ${JSON.stringify(report)}`);
    // await Notification.create({
    //     'field': ['temperature'],
    //     'condition': '>',
    //     'trigger': 15,
    //     'subscribers': ['6305cec63f16be9dc8b6eb0b']
    // });

    let notificationListeners = await Notification.find({});

    notificationListeners.forEach((listener) => {
        listener.ref = cleanField(listener.field);
        console.log(`Checking ${listener.field} (${eval(listener.ref)}) for value ${listener.condition} ${listener.trigger}`);

        switch (listener.condition) {
            case '==':
                if (eval(listener.ref) == listener.trigger) {
                    console.log(`${eval(listener.ref)} == ${listener.trigger}`);
                    sendPushNotification(listener, report)
                }
                break;

            case '>':
                if (eval(listener.ref) > listener.trigger) {
                    console.log(`${eval(listener.ref)} > ${listener.trigger}`);
                    sendPushNotification(listener, report)
                }
                break;

            case '<':
                if (eval(listener.ref) < listener.trigger) {
                    console.log(`${eval(listener.ref)} < ${listener.trigger}`);
                    sendPushNotification(listener, report)
                }
                break;
        }
    });
};

function sendPushNotification(listener, report) {
    beamsClient
        .publishToUsers(listener.subscribers, {
            web: {
                notification: {
                    title: `Open weather ${listener.field} alert triggered.`,
                    body: `The ${listener.field} at ${report.stationId} has reached ${listener.condition}${listener.trigger} (${eval(listener.ref)})`,
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

function cleanField(fields) {
    let str = 'report';
    fields.forEach((field) => {
        str += `['${field}']`;
    });

    return str;
}