window.onload = async () => {
    const stations = await getStations();

    stations.forEach((station) => {
        $('#stationSelect').append(`<option value="${station.stationId}">${station.name}</option>`)
    });

    $('#sendBtn').click(() => {
        emulateStation();
    });

    $('#serverUrl').append(config.url);
    $('#serverPort').append(config.options.port);
    $('#reportTopic').append(config.reportTopic);
    $('#clearDb').click(() => { deleteReports(true) });
    $('#addNotification').click((self) => {
        $('#notification-add-row').addNotification();
    });

    updateNotificationTable();
};



$.fn.addNotification = async function () {
    let inputs = {
        field: $('#fieldSelect').val(),
        condition: $('#conditionSelect').val(),
        trigger: $('#triggerSelect').val()
    }

    let notification = {
        field: inputs.field.split(','),
        condition: inputs.condition,
        trigger: Number(inputs.trigger),
        subscribers: [`${await getUid()}`]
    }

    $.post('/api/addNotification', notification, function (data) {
        alert(`${JSON.stringify(data)}:
        ${JSON.stringify(notification)}`);
    });

    updateNotificationTable();
}

async function renderNotification(notification) {
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
                </a><a class="btn btn-danger btn-icon" aria-label="button">
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
                <input class="form-check-input" type="checkbox" checked="checked" />
            </label>
        </td>
    </tr>
    `);
}

async function returnIcons(notification) {
    let icons = '';

    for (let i = 0; i < notification.subscribers.length; i++) {
        let username = await unameFromId(notification.subscribers[i]);
        icons += `<span class="avatar bg-blue-lt">${username.slice(0, 2)}</span>`;
    }

    return icons;
}

async function updateNotificationTable() {
    let notifications = await getNotifications();
    
    $('#notification-table').find('.notification-row').each(function () {
        $(this).remove();
    });

    notifications.forEach((notification) => {
        renderNotification(notification);
    });
}