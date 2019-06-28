"use strict";
module.exports = function (m, session) {
    var socket = session.socket;
    var manySheep = m.game.objects.sheep;

    function sheepUpdate (sheep) {
        
        session.ifSectBroadcast('sheep-update', sheep, sheep.place);
    }

    function sheepRemoved (id) {
        console.log("sheep removal", id)
        session.state4Broadcast('sheep-removed', id);
        socket.emit('sheep-removed', id);
    }

    if (manySheep.instance === null) {
        console.log("Setting up sheep instance")
        manySheep.instance = new manySheep.class(m, function (sheep) {
            if (typeof sheep !== 'object') {
                // sheep should be an ID 
                // of the one to remove
                // in this case.
                console.log("sheep dead (3)");
                delete manySheep[sheep];
                sheepRemoved(sheep);
                return;
            }
            manySheep[sheep._id] = sheep;
            sheepUpdate(sheep);
        });
    }
    /*
    session.event.on('game-ready', function (ready) {
        var result = {};
        var i;
        for (i in manySheep) {
            //console.log('herb:', herbs[i]);
            if (m.map.inSection(manySheep[i].place, session.user.section)) {
                result[i] = manySheep[i];
            }
        }
        if (ready) {
            console.log("Initializing Wolves:", result);
            socket.emit('sheep-init', result);
        }
    });
    */
};