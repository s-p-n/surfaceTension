(function ($) {
var sendMsg = function () {
    var val = $('#chatInput').val();
    if (val.replace(/\s/g, '').length === 0) {
        return false;
    }
    $('#chatInput').val('');
    comms.emit('chat-input', val);
}

var recvMsg = function (data) {
   
    $('#chatText').append($('<li class="chatItem">').text(data.text));
}

$('#chatInput').keypress(function (e) {
    if (e.keyCode === 13) {
        sendMsg();
        e.preventDefault();
        return false;
    }
});
$('#chatBtn').click(sendMsg)
$('#chatInput').focus(function () {
    window.bypassPhaserInput = true;
});
$('#chatInput').blur(function () {
    window.bypassPhaserInput = false;
});
comms.on('chat-msg', recvMsg);

}(jQuery));