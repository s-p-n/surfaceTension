function intersects (a, b) {
    return !(a.x + a.w < b.x ||
        a.y + a.h < b.y ||
        b.x + b.w < a.x ||
        b.y + b.h < a.y);
}

module.exports = function (m, session) {
    "use strict";
    var socket = session.socket;
    var herbs = m.game.objects.herbs;
    function herbCreated (herb) {
        session.state4Broadcast('herb-created', herb);
    }
    function herbDeleted (id) {
        session.state4Broadcast('herb-deleted', id);
    }
    if (herbs.instance === null) {
        //console.log("Instantiating Herbs");
        herbs.instance = new herbs.class(m, function (herb) {
            herbs[herb._id] = herb;
            herbCreated(herb);
            //console.log("Herb Created(1)", herb);
        });
    }
    session.event.on('game-ready', function (ready) {
        var result = {};
        var i;
        for (i in herbs) {
            //console.log('herb:', herbs[i]);
            if (m.map.inSection(herbs[i].place, session.user.section)) {
                result[i] = herbs[i];
            }
        }
        if (ready) {
            //console.log("Initializing Herbs:", result);
            socket.emit('herbs-init', result);
        }
    });
    socket.on('herb-picked', function (herbId) {
        var herb = herbs[herbId];
        if (session.state !== 4 || herb === void 0 || herb.place === void 0) {
            return;
        }
        var playerRect = {
            x: session.user.game.x - 50,
            y: session.user.game.y - 40,
            w: 100,
            h: 70
        };
        var herbRect = {
            x: herb.place[0],
            y: herb.place[1],
            w: 25,
            h: 25
        };
        if (intersects(playerRect, herbRect) &&
            session.user.inventory.add(herb.name)
        ) {
            herbs.instance.remove(herb);
            delete herbs[herbId];
            herbDeleted(herbId);
        } else {
            herbCreated(herb);
        }
    });
    session.event.on('herb-planted', function (herb) {
        if (session.state !== 4 || 
            herb === void 0 || 
            herb.inventory_id === void 0 ||
            herb.name === void 0 ||
            herb.place === void 0
        ) {
            return;
        }
        var inventoryItem = session.user.game.inventory[herb.inventory_id];
        //console.log("herb planted:");
        //console.log(inventoryItem);
        //console.log(herb);
        if (inventoryItem !== void 0 &&
            herb.place instanceof Array && 
            herb.place.length === 2 && 
            typeof herb.place[0] === 'number' &&
            herb.place[0] > 0 &&
            herb.place[0] < m.map.bounds[0] &&
            herb.place[0] % 25 === 0 &&
            typeof herb.place[1] === 'number' &&
            herb.place[1] > 0 &&
            herb.place[1] < m.map.bounds[1] &&
            herb.place[1] % 25 === 0 &&
            inventoryItem.name === herb.name
        ) {
            session.user.inventory.remove(herb.inventory_id);
            herbs.instance.add({
                name: herb.name,
                place: herb.place
            }, function (err, herb) {
                if (err) {
                    //console.log("Insert error!");
                    console.error(err);
                    return;
                }
                //console.log("herb created(2)");
                herbs[herb._id] = herb;
                herbCreated(herb);
            });
        }
    });
};
