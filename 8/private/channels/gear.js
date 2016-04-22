function Gear (main, session) {
    var player = session.user;
    var socket = session.socket;
    var db = main.db;
    var self = this;
    self.slots = player.game.gear;
    self.add = function (slot, type) {
        if (!(slot in self.slots)) {
            return false;
        }
        if (slot in self.slots &&
            self.slots[slot].type === 0
        ) {
            self.slots[slot].type = type;
            self.update();
        } else {
            self.remove(slot);
            self.slots[slot].type = type;
        }
        return true;
    }
    self.remove = function (slot) {
        if (self.slots[slot].type !== 0 &&
            player.inventory.add(slot + self.slots[slot].type)
            ) {
            self.slots[slot].type = 0;
            self.update();
            return true;
        }
        return false;
    }

    self.update = function () {
        console.log('gear update:');
        console.log(player._id, self.slots);
        db.users.update({_id: player._id}, {$set: {'game.gear': self.slots}}, function (err, doc) {
            if (err) {
                console.error(err);
                return;
            }
            player.game.gear = self.slots;
            main.event.emit('player-update', player);
        });
        socket.emit('gear-update', self.slots);
    }
}

module.exports = function (m, session) {
    var socket = session.socket;

    session.event.on('game-ready', function(ready) {
        if (ready && session.user.gear === void 0) {
            session.user.gear = new Gear(m, session);
        }
    });

    socket.on('gear-removed', function (slot) {
        session.user.gear.remove(slot);
    });
}