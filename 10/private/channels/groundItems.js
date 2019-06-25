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
module.exports = function (m, session) {
    var socket = session.socket;
    var groundItems = m.game.objects.groundItems;
    function groundItemAdded (item) {
        groundItems[item._id] = item;
        session.ifSectBroadcast('ground-item-added', item, item.place);
    }
    function placeItem (item) {
        var groundItem;
        console.log("placeItem:", item);
        if (session.user.inventory.remove(item.inventory_id)) {
            console.log("placed successfully");
            groundItem = {name: item.name, place: item.place};
            groundItems.instance.add(groundItem);
        }
    }
    if (groundItems.instance === null) {
        //console.log("Instantiating Herbs");
        groundItems.instance = new groundItems.class(m, function (item) {
            groundItemAdded(item);
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
        if (ready) {
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
                    groundItemAdded(item);
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