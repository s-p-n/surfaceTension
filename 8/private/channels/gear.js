var edibleItems = ['slire_roll'];
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
        var invItem = slot.replace('rightS', 's').replace('leftS', 's').replace('rightG', 'g').replace('leftG', 'g') + self.slots[slot].type;
        if (self.slots[slot].type !== 0 &&
            player.inventory.add(invItem)
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

    socket.on('gear-equipped', function (item) {
        if (session.user.inventory.remove(item.inventory_id)) {
            if (!session.user.gear.add(item.gear.slot, parseInt(item.gear.type))) {
                session.user.inventory.add(item.name);
            }
        }
    });
    socket.on('eatQueue-item-added', function (item) {
        if ((session.user.game.eatQueue !== null && 
            item.name !== session.user.game.eatQueue.name) ||
            (edibleItems.indexOf(item.name) === -1) ||
            (!session.user.inventory.remove(item.inventory_id))
        ) {
            console.log("eatQueue add failed");
            // do nothing
        } else {
            if (session.user.game.eatQueue === null) {
                session.user.game.eatQueue = {name: item.name, num: 1};
            } else {
                session.user.game.eatQueue.num += 1;
            }
            m.db.users.update({_id: session.user._id}, {$set:{
                'game.eatQueue': session.user.game.eatQueue
            }});
        }
        socket.emit('eatqueue-update', session.user.game.eatQueue);
    });
    socket.on('eatQueue-item-removed', function () {
        if (session.user.game.eatQueue !== null && 
            session.user.inventory.add(session.user.game.eatQueue.name)
        ) {
            if (session.user.game.eatQueue.num > 1) {
                session.user.game.eatQueue.num -= 1;
            } else {
                session.user.game.eatQueue = null;
            }
            m.db.users.update({_id: session.user._id}, {$set:{
                'game.eatQueue': session.user.game.eatQueue
            }});
        }
        socket.emit('eatqueue-update', session.user.game.eatQueue);
    });
}