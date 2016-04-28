function Inventory (main, session) {
    "use strict";
    var player = session.user;
    var socket = session.socket;
    var db = main.db;
    var self = this;
    self.items = player.game.inventory;
    self.add = function (item) {
        var i, firstEmptySlot = 30;
        for (i = 0; i < 30; i += 1) {
            if (self.items[i] !== void 0 && 
                self.items[i].name === item && 
                self.items[i].num < 64
            ) {
                self.items[i].num += 1;
                self.update();
                return true;
            }
            if (self.items[i] === void 0 && firstEmptySlot === 30) {
                firstEmptySlot = i;
            }
        }
        if (firstEmptySlot === 30) {
            return false;
        }
        //console.log('first empty slot:', firstEmptySlot);
        self.items[firstEmptySlot] = {
            name: item,
            num: 1
        };
        //console.log('items:', self.items);
        self.update();
        return true;
    };
    self.remove = function (id) {
        if (self.items[id].num > 1) {
            self.items[id].num -= 1;
        } else if (self.items[id].num === 1) {
            self.items.splice(id, 1);
        } else {
            return false;
        }
        self.update();
        return true;
    };
    self.update = function () {
        //console.log('inventory update:');
        //console.log(player._id, self.items);
        db.users.update({_id: player._id}, {$set: {'game.inventory': self.items}}, function (err, result) {
            if (err) {
                console.error(err);
                return;
            }
            //console.log("inventory update result:", result);
        });
        socket.emit('inventory-update', self.items);
    }
}
module.exports = function (m, session) {
    var socket = session.socket;
    session.event.on('game-ready', function(ready) {
        if (session.user.inventory === void 0) {
            session.user.inventory = new Inventory(m, session);
        }
    });
};