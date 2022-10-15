window.onload = async () => {                               // On window load
    const stations = await getStations();                   // Get a list of the stations

    stations.forEach((station) => {                         // Add the stations as options in the dropdown
        $('#stationSelect').append(`<option value="${station.stationId}">${station.name}</option>`)
    });

    $('#sendBtn').click(() => {                             // Add click listener to the send button
        emulateStation();
    });

    // Updae the mqtt settings table
    $('#serverUrl').append(config.url);
    $('#serverPort').append(config.options.port);
    $('#reportTopic').append(config.reportTopic);
    $('#clearDb').click(() => { deleteReports(true) });     // Add function to the clear database button
    $('#addNotification').click(() => {                     // Add function to the add notification button
        $('#notification-add-row').addNotification();       // Call the function in the scope of the notification row
    });

    updateNotificationTable();                              // Update the notification table
};

$.fn.addNotification = async function () {                          // Function to add a notifaction
    let inputs = {                                                  // Get the value of the inputs
        field: $('#fieldSelect').val(),
        condition: $('#conditionSelect').val(),
        trigger: $('#triggerSelect').val()
    }

    let notification = {                                            // Define notification object in format of the database
        field: inputs.field.split(','),                             // Turn the comma seperated list into an array
        condition: inputs.condition,
        trigger: Number(inputs.trigger),
        subscribers: [`${await getUid()}`]                          // Add current user's ID to array of subscribers
    }

    $.post('/api/addNotification', notification, function (data) {  // Post the object to the server
        alert(`${JSON.stringify(data)}:
        ${JSON.stringify(notification)}`);                          // Alert the data that the server returns
    });

    updateNotificationTable();                                      // Update the notification table
}

$.fn.toggleNotification = async function (notification) {           // Toggle user from notification (accepts a notification id)
    let res = undefined;

    if ($(this).prop('checked')) {                                  // If subscribing
        console.log('Notification:', notification, 'State:', true);
        res = await toggleUserNotification(true, notification);         // Call toggle function with true and notification id
    } else {                                                        // If unsubscribing
        console.log('Notification:', notification, 'State:', false);
        res = await toggleUserNotification(false, notification);        // Call toggle function with false and notification id
    }

    alert(String(res));                                             // Alert what the server returns
    updateNotificationTable();                                      // Update the notificationt table
}

async function renderNotification(notification) {           // Function to render a notification row
    let user = await getUid();                              // Get the user id

    // Append a row to the start of the table substiuting the values in from the notification
    $('#notification-table-body').prepend(`
    <tr class="notification-row">
        <td>${JSON.stringify(notification.field)}</td>
        <td>${notification.condition}</td>
        <td>${notification.trigger}</td>
        <td>
            <div class="avatar-list avatar-list-stacked">
                ${await returnIcons(notification)}
            </div>
        </td>
        <td>
            <div class="btn-list"><a class="btn btn-primary btn-icon" aria-label="button">
                <svg class="icon icon-tabler icon-tabler-pencil" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewbox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M4 20h4l10.5 -10.5a1.5 1.5 0 0 0 -4 -4l-10.5 10.5v4"></path>
                    <line x1="13.5" y1="6.5" x2="17.5" y2="10.5"></line>
                </svg>
                </a><a class="btn btn-danger btn-icon" id="notificationDelete" onclick="deleteNot('${notification._id}')" aria-label="button">
                <svg class="icon icon-tabler icon-tabler-trash" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewbox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <line x1="4" y1="7" x2="20" y2="7"></line>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                    <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"></path>
                    <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"></path>
                </svg></a>
            </div>
        </td>
        <td> 
            <label class="form-check form-switch">
                <input class="form-check-input" type="checkbox" ${checkState(notification.subscribers, user)} onclick="$(this).toggleNotification('${notification._id}')" />
            </label>
        </td>
    </tr>
    `);
}

// Delete a notification with the id
async function deleteNot(notification) {
    alert(await deleteNotification(notification));
    updateNotificationTable(); // Update the database
}

// Check you are subscribed to the notification
function checkState(subscribers, user) {
    if (subscribers.includes(user)) { // Are you subscribed?
        return 'checked';             // Make switch checked
    } else {
        return '';                    // Make switch off
    }
}

// Convert the user ids into icons
async function returnIcons(notification) {
    let icons = '';

    for (let i = 0; i < notification.subscribers.length; i++) {                     // For each subscribed user
        let username = await unameFromId(notification.subscribers[i]);              // Get the username from the database
        icons += `<span class="avatar bg-blue-lt">${username.slice(0, 2)}</span>`;  // Put the first 2 characters of the name in the avatar
    }

    return icons;                                                                   // Return string of avatars
}

// Update the notification table
async function updateNotificationTable() {
    let notifications = await getNotifications();                           // Get all the notifications fromt he database

    $('#notification-table').find('.notification-row').each(function () {   // Delete all rows
        $(this).remove();                                                   // Remove the row
    });

    notifications.forEach((notification) => {                               // For each notification
        renderNotification(notification);                                   // Render a new notification row
    });
}
