"use strict";
module.exports = function (m, session) {
    var socket = session.socket;
    var wolves = m.game.objects.wolves;

    function wolfUpdate (wolf) {
        session.state4Broadcast('wolf-update', wolf);
        socket.emit('wolf-update', wolf);
    }

    function wolfRemoved (id) {
        session.state4Broadcast('wolf-removed', id);
        socket.emit('wolf-removed', id);
    }

    if (wolves.instance === null) {
        //console.log("Instantiating Herbs");
        wolves.instance = new wolves.class(m, function (wolf) {
            //console.log(typeof wolf);
            if (typeof wolf !== 'object') {
                // wolf should be an ID 
                // of the one to remove
                // in this case.
                //console.log("wolf dead (3)");
                delete wolves[wolf];
                wolfRemoved(wolf);
                return;
            }
            wolves[wolf._id] = wolf;
            wolfUpdate(wolf);
        });
    }
    /*
    session.event.on('game-ready', function (ready) {
        var result = {};
        var i;
        for (i in wolves) {
            //console.log('herb:', herbs[i]);
            if (m.map.inSection(wolves[i].place, session.user.section)) {
                result[i] = wolves[i];
            }
        }
        if (ready) {
            console.log("Initializing Wolves:", result);
            socket.emit('wolves-init', result);
        }
    });
    */
};