function togglePasswordView (elem) {
    let password = $(elem).parents().find('#password');
    
    if ($(password).attr('type') == 'password') {
        $(password).attr('type', 'text');
    } else {
        $(password).attr('type', 'password');
    }
}

$('#password-toggle').click(function() { togglePasswordView(this) });