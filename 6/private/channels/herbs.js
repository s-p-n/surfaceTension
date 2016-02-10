function intersects (a, b) {
    return !(a.x + a.w < b.x ||
        a.y + a.h < b.y ||
        b.x + b.w < a.x ||
        b.y + b.h < a.y);
}

module.exports = function (m, session) {
    "use strict";
    var socket = session.socket;
    m.event.on('herb-created', function (herb) {
        if (session.state === 4) {
            socket.emit('herb-created', herb);
        }
    });
    m.event.on('herb-deleted', function (id) {
        if (session.state === 4) {
            socket.emit('herb-deleted', id);
        }
    });
    session.event.on('game-ready', function (ready) {
        if (ready) {
            socket.emit('herbs-init', m.game.objects.herbs);
        }
    });
    socket.on('herb-picked', function (herbId) {
        var herb = m.game.objects.herbs[herbId];
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
        if (intersects(playerRect, herbRect)) {
            console.log("intersection!");
            m.event.emit('herb-picked', {herb: herb, player: session.user});
        } else {
            socket.emit('herb-created', herb);
        }
    });
    socket.on('herb-planted', function (herb) {
        if (state !== 4 || 
            herb === void 0 || 
            herb.inventory_id === void 0 ||
            herb.name === void 0 ||
            herb.place === void 0
        ) {
            return;
        }
        var inventoryItem = session.user.game.inventory[herb.inventory_id];
        console.log("herb planted:");
        console.log(inventoryItem);
        console.log(herb);
        if (inventoryItem !== void 0 &&
            herb.place instanceof Array && 
            herb.place.length === 2 && 
            typeof herb.place[0] === 'number' &&
            herb.place[0] > 0 &&
            herb.place[0] < 1000 &&
            herb.place[0] % 25 === 0 &&
            typeof herb.place[1] === 'number' &&
            herb.place[1] > 0 &&
            herb.place[1] < 450 &&
            herb.place[1] % 25 === 0 &&
            inventoryItem.name === herb.name
        ) {
            session.user.inventory.remove(herb.inventory_id);
            m.event.emit('herb-planted', {
                name: herb.name,
                place: herb.place
            });
        }
    });
};