module.exports = function (m, session) {
    "use strict";
    var socket = session.socket;
    m.event.on('herb-created', function (herb) {
        if (session.state === 4) {
            socket.emit('herb-created', herb);
        }
    });
    session.event.on('game-ready', function (ready) {
        if (ready) {
            socket.emit('herbs-init', m.game.objects.herbs);
        }
    });
};