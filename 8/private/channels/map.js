module.exports = function (m, session) {
    "use strict";
    var socket = session.socket;
    session.event.on('game-ready', function (ready) {
        var result = [];
        var i;
        for (i = 0; i < m.map.length; i += 1) {
            if (m.map.inSection([m.map[i].x, m.map[i].y], session.user.section)) {
                result.push(m.map[i]);
            }
        }
        if (ready) {
            socket.emit('map-init', result);
        }
    });
};