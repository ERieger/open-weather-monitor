const beamsClient = new PusherPushNotifications.Client({
    instanceId: '8c5c47d2-824f-4c24-80a0-09b47a65b308',
});

const beamsTokenProvider = new PusherPushNotifications.TokenProvider({
    url: "/api/beams-auth"
});

$.getJSON('/api/authInfo', (res) => {
    console.log(`Last login: ${new Date(res.lastLogin)}, Cookie expiry: ${new Date(res.cookieExpiry)}, Form redirect?:${res.loginWithForm}`);
    if (new Date(res.lastLogin) > new Date(res.cookieExpiry) || res.loginWithForm) { // Is the last login after the cookie expiry time or did you just log in with passport?
        $.get('/api/user', (res) => {
            if (res != 'User not authenticated.') {// Are you logged in?
                $.get('/api/uid', function (uid) {
                    console.log(uid);
                    beamsClient
                        .start()
                        .then(() => beamsClient.setUserId(uid, beamsTokenProvider))
                        .catch(console.error);
                });
            }
        });
        $.post('/api/updateLastLogin', { lastLogin: new Date() });
        $.post('/api/toggleFormLoginState');
    } else {
        console.log('Already subscribed to notifications.');
    }
});

$.get('/api/uid', function (uid) {
    beamsClient
        .getUserId()
        .then((userId) => {
            // Check if the Beams user matches the user that is currently logged in
            if (userId !== uid) {
                // Unregister for notifications
                return beamsClient.stop();
            }
        })
        .catch(console.error);

});
