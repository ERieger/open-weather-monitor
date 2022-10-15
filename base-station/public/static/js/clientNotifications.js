// Register the client API
const beamsClient = new PusherPushNotifications.Client({
    instanceId: '8c5c47d2-824f-4c24-80a0-09b47a65b308',
});

// Define the application's beams token endpoint
// Returns a beams token associated with the authenticated user's ID
const beamsTokenProvider = new PusherPushNotifications.TokenProvider({
    url: "/api/beams-auth"
});

// Register a newly logged in user
$.getJSON('/api/authInfo', (res) => { // Get user's last login, session cookie expiry date, and if they were redirected form the login page
    console.log('Last login:', new Date(res.lastLogin), 'Cookie expiry:', new Date(res.cookieExpiry), 'Form redirect?:', res.loginWithForm);

    // Is the last login after the cookie expiry time or did you just log in with passport?
    if (new Date(res.lastLogin) > new Date(res.cookieExpiry) || res.loginWithForm) {
        $.get('/api/user', (res) => { // Get auth state - returns username if authenticated or 'User not authenticated.' if not.
            if (res != 'User not authenticated.') { // Are you logged in?
                $.get('/api/uid', function (uid) { // Get your userID
                    console.log('Registering user for notifications:', uid);
                    // Start recieving notifications with beams
                    beamsClient
                        .start()
                        .then(() => beamsClient.setUserId(uid, beamsTokenProvider))
                        .catch(console.error);
                });
            }
        });
        $.post('/api/updateLastLogin', { lastLogin: new Date() }); // Update your last login in database
        $.post('/api/toggleFormLoginState'); // Toggle your form redirect state to false                       
    } else { // You are returning to your auth session and don't need to be registered again
        console.log('Already subscribed to notifications.');
    }
});

// Ensure that if not logged in you aren't subscribed to a user's notifications
// If your session expired and you were forcefully logged out then we need to make sure that you aren't subscribed to notifications still
$.get('/api/uid', function (uid) { // Get user uid
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
