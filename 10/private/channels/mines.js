function intersects (a, b) {
    return !(a.x + a.w < b.x ||
        a.y + a.h < b.y ||
        b.x + b.w < a.x ||
        b.y + b.h < a.y);
}
module.exports = function (m, session) {
    "use strict";
    var socket = session.socket;
    var mines = m.game.objects.ironMines;
    function mineUpdated(iron) {
        session.state4Broadcast('iron-updated', iron);
    }
    if (mines.instance === null) {
        //console.log("Instantiating Mines");
        mines.instance = new mines.class(m, function (iron) {
            mines[iron._id] = iron;
            mineUpdated(iron);
            //console.log("Iron Mine Updated(1)", iron);
        });
    }
    session.event.on('game-ready', function (ready) {
        var result = {};
        var i;
        for (i in mines) {
            //console.log('mine:', mines[i]);
            if (m.map.inSection(mines[i].place, session.user.section)) {
                result[i] = mines[i];
            }
        }
        if (ready) {
            //console.log("Initializing Mines:", result);
            socket.emit('mines-init', result);
        }
    });
    socket.on('iron-mined', function (id) {
        var iron = mines[id];
        if (session.state !== 4 || 
            iron === void 0 || 
            iron.place === void 0 ||
            iron.bits <= 0
        ) {
            return;
        }
        var playerRect = {
            x: session.user.game.x - 50,
            y: session.user.game.y - 40,
            w: 100,
            h: 70
        };
        var ironRect = {
            x: iron.place[0],
            y: iron.place[1],
            w: 50,
            h: 25
        };
        if (intersects(playerRect, ironRect) &&
            session.user.inventory.add(iron.name)
        ) {
            //console.log("Mining iron:", iron._id);
            iron.bits -= 1;
            mines.instance.updateBits(iron._id, iron.bits, function (err, iron) {
                if (err) {
                    //console.log("Iron Update Error!", err);
                    return;
                }
                //console.log("Updated iron in db:", iron);
            });
        }
        mineUpdated(iron);
    });
};
