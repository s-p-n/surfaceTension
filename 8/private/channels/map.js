module.exports = function (m, session) {
    "use strict";
    var socket = session.socket;
    session.event.on('game-ready', function (ready) {
        if (ready) {
            console.log("sending map:", m.map);
            socket.emit('map-init', m.map);
        }
    });
};