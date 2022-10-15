// Add function to the view password button
function togglePasswordView (elem) {
    let password = $(elem).parents().find('#password');
    
    if ($(password).attr('type') == 'password') {       // If type password
        $(password).attr('type', 'text');                   // Set to text so it shows contents
    } else {                                            // If type text
        $(password).attr('type', 'password');               // Set to password so it's hidden
    }
}

$('#password-toggle').click(function() { togglePasswordView(this) });   // Add event listener to toggle button