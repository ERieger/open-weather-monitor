// Logout script is shared across all pages
$('#logout').click(async () => {                    // When you hit the logout button
    await beamsClient.stop().catch(console.error);  // Stop getting beams client notifications
    window.location.href = "/logout";               // Redirect to logout endpoint
});