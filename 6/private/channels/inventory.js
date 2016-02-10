function intersects (a, b) {
    return !(a.x + a.w < b.x ||
        a.y + a.h < b.y ||
        b.x + b.w < a.x ||
        b.y + b.h < a.y);
}
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
        console.log('first empty slot:', firstEmptySlot);
        self.items[firstEmptySlot] = {
            name: item,
            num: 1
        };
        console.log('items:', self.items);
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
        console.log('inventory update:');
        console.log(player._id, self.items);
        db.users.update({_id: player._id}, {$set: {'game.inventory': self.items}});
        socket.emit('inventory-update', self.items);
    }
}
function generateId () {
    return Date.now() + '.' + Math.floor(Math.random() * 100);
}
var groundItems = {};
module.exports = function (m, session) {
    var socket = session.socket;

    session.event.on('game-ready', function(ready) {
        if (ready) {
            session.user.inventory = new Inventory(m, session);
            socket.emit('ground-items-init', groundItems);
        }
    });
    socket.on('item-placed', function (item) {
        var groundItem;
        if (item.name === 'slire') {
            session.event.emit('herb-planted', item);
            return;
        }
        if (session.user.inventory.remove(item.inventory_id)) {
            groundItem = {name: item.name, place: item.place, _id: generateId()};
            groundItems[groundItem._id] = groundItem;
            session.state4Broadcast('ground-item-added', groundItem);
        }
    });
    socket.on('item-picked', function (id) {
        var item = groundItems[id];
        if (
            session.state !== 4 || 
            item === void 0 || 
            item.place === void 0
        ) {
            return;
        }
        var playerRect = {
            x: session.user.game.x - 50,
            y: session.user.game.y - 40,
            w: 100,
            h: 70
        };
        var itemRect = {
            x: item.place[0],
            y: item.place[1],
            w: 25,
            h: 25
        };
        if (intersects(playerRect, itemRect) &&
            session.user.inventory.add(item.name)
        ) {
            console.log("Picking ground item:", item);
            delete groundItems[id];
            session.state4Broadcast('ground-item-removed', id);
        } else {
            socket.emit('ground-item-added', item);
        }
    });
}