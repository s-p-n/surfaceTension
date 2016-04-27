var edibleItems = ['slire_roll'];

function intersects (a, b) {
    return !(a.x + a.w < b.x ||
        a.y + a.h < b.y ||
        b.x + b.w < a.x ||
        b.y + b.h < a.y);
}
function makePlace(x, y) {
    x = Math.round(x);
    y = Math.round(y);
    var gridSize = 25;
    var xMod = x % gridSize;
    var yMod = y % gridSize;
    var result = [0, 0];
    if (xMod > gridSize / 2) {
       result[0] = x + (gridSize - xMod);
    } else {
        result[0] = x - xMod;
    }
    if (yMod > gridSize / 2) {
        result[1] = y + (gridSize - yMod);
    } else {
        result[1] = y - yMod;
    }
    return result;
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
/*
function generateId () {
    return Date.now() + '.' + Math.floor(Math.random() * 100);
}
var groundItems = {};
*/
module.exports = function (m, session) {
    var socket = session.socket;
    var groundItems = m.game.objects.groundItems;
    function placeItem (item) {
        var groundItem;
        // TODO: Create educated mapping system to determine what items should do
        // when they are placed.
        
        if (session.user.inventory.remove(item.inventory_id)) {
            groundItem = {name: item.name, place: item.place};
            groundItems.instance.add(groundItem, function (err, doc) {
                if (err) {
                    console.error(err);
                    return;
                }
                groundItems[doc._id] = doc;
                session.state4Broadcast('ground-item-added', doc);
            });

        }
    }
    if (groundItems.instance === null) {
        //console.log("Instantiating Herbs");
        groundItems.instance = new groundItems.class(m, function (item) {
            groundItems[item._id] = item;
        });
    }
    session.event.on('game-ready', function(ready) {
        var result = {};
        var i;
        for (i in groundItems) {
            //console.log('herb:', herbs[i]);
            if (m.map.inSection(groundItems[i].place, session.user.section)) {
                result[i] = groundItems[i];
            }
        }
        if (session.user.inventory === void 0) {
            session.user.inventory = new Inventory(m, session);
            socket.emit('ground-items-init', result);
        }
    });
    session.event.on('death-1', function() {
        var items = session.user.inventory.items;
        var place = makePlace(session.user.game.x, session.user.game.y);
        var bulk = m.db.groundItems.initializeOrderedBulkOp();
        console.log("Handling Death Drop");
        items.forEach(function (item) {
            while (item.num > 0) {
                item.num -= 1;
                bulk.insert({name: item.name, place: place});
            }
        });
        var gearName;
        var gear = session.user.gear.slots;
        for (gearName in gear) {
            if (gear[gearName].type > 0) {
                console.log(gearName, gear[gearName]);
                bulk.insert({
                    name: gearName.replace('rightS', 's').
                        replace('leftS', 's').
                        replace('rightG', 'g').
                        replace('leftG', 'g') + 
                        gear[gearName].type, 
                    place: place
                });
                gear[gearName].type = 0;
                gear[gearName].tint = 0xFFFFFF;
            }
        }
        items.length = 0;
        session.user.inventory.update();
        session.user.gear.update();
        bulk.execute();
        m.db.groundItems.find({place: place}, function (err, docs) {
            if (err) {
                console.error(err);
                return;
            }
            docs.forEach(function(item) {
                if (!(item._id in groundItems)) {
                    groundItems[item._id] = item;
                    session.state4Broadcast('ground-item-added', item);
                }
            });
        });
        session.event.emit('death-2');
    });
    socket.on('item-placed', placeItem);
    socket.on('item-planted', function (item) {
        if (item.name === 'slire_seed') {
            session.event.emit('herb-planted', item);
        } else {
            placeItem(item);
        }
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
            groundItems.instance.remove(item);
            delete groundItems[id];
            session.state4Broadcast('ground-item-removed', id);
        } else {
            socket.emit('ground-item-added', item);
            session.user.inventory.update();
        }
    });
}