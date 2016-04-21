module.exports = function (m, session) {
    "use strict";
    var socket = session.socket;
    session.event.on('game-ready', function (ready) {
        var result = [];
        var i;
        for (i = 0; i < m.map.length; i += 1) {
            console.log(m.map[i]);
            if (m.map.inSection([m.map[i].x, m.map[i].y], session.user.section)) {
                result.push(m.map[i]);
            }
        }
        if (ready) {
            console.log("sending map:", result);
            socket.emit('map-init', result);
        }
    });
};