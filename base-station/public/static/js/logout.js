$('#logout').click(async () => {
    console.log('aa');
    await beamsClient.stop().catch(console.error);
    window.location.href = "/logout";
});