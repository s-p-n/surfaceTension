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
    var scrollHeight = $('#chatText')[0].scrollHeight;
    var scrollPos = $('#chatText').innerHeight() + $('#chatText').scrollTop();
    $('#chatText').append($('<li class="chatItem">').text(data.text));
    if (((scrollHeight - scrollPos) / scrollHeight) === 0) {
        $('#chatText').animate({
            scrollTop: $('#chatText')[0].scrollHeight
        }, 700);
    }
}

$('#chatInput').keyup(function (e) {
    if (e.keyCode === 13) {
        sendMsg();
        if (e.shiftKey) {
            console.log("shift+enter");
            $('#chatInput').blur();
            //$('#canvas').focus();
        }
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