function GroundItems(main) {
    "use strict";
    var self = this;
    self.items = {};
    function onDown(sprite) {
        var item = self.items[sprite._id];
        if (main.utils.isClose(sprite) &&
            inventory.add(self.items[sprite._id].name)
        ) {
            self.removeItem(sprite._id);
            comms.emit('item-picked', sprite._id);
        }
    }
    self.createItem = function (item) {
        item.sprite = main.objects.create(item.place[0], item.place[1], item.name);
        item.sprite._id = item._id;
        item.sprite.inputEnabled = true;
        item.sprite.input.useHandCursor = true;
        item.sprite.events.onInputDown.add(onDown);
        self.items[item._id] = item;
    };
    self.removeItem = function (id) {
        if (self.items[id] === void 0) {
            return;
        }
        self.items[id].sprite.destroy();
        delete self.items[id];
    };
    comms.on('ground-items-init', function (items) {
        var id;
        console.log("Ground items init:", items);
        for (id in items) {
            self.createItem(items[id]);
        }
    });
    comms.on('ground-item-added', function (item) {
        console.log("Ground item added:", item);
        self.createItem(item);
    });
    comms.on('ground-item-removed', function (id) {
        console.log("Ground item removed:", id);
        self.removeItem(id);
    });
}