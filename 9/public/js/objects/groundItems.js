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
        if (!(item._id in self.items)) {
            item.sprite = main.objects.create(item.place[0], item.place[1], item.name);
            item.sprite._id = item._id;
            item.sprite.inputEnabled = true;
            item.sprite.input.useHandCursor = true;
            item.sprite.events.onInputDown.add(onDown);
            self.items[item._id] = item;
        } else {
            self.items[item._id].sprite.revive();
        }
    };
    self.removeItem = function (id) {
        if (self.items[id] === void 0) {
            return;
        }
        self.items[id].sprite.destroy();
        delete self.items[id];
    };
    self.preload = function () {
        main.game.load.image('wolf_tooth', './assets/game/items/wolf_tooth.png');
        main.game.load.image('block', './assets/game/items/block.png');
        main.game.load.image('iron', './assets/game/items/iron.png');
        main.game.load.image('slire_roll', './assets/game/items/slire_roll.png');
        main.game.load.image('slire_seed', './assets/game/items/slire_seed.png');
        main.game.load.image('shirt1', './assets/game/items/shirt1.png');
        main.game.load.image('pants1', './assets/game/items/pants1.png');
        main.game.load.image('shoe1', './assets/game/items/shoe1.png');
        main.game.load.image('shoe2', './assets/game/items/shoe2.png');
    }
    comms.on('ground-items-init', function (items) {
        var id;
        console.log("Ground items init:", items);
        for (id in self.items) {
            self.items[id].sprite.kill();
        }
        for (id in items) {
            self.createItem(items[id]);
        }
        main.objects.sort('bottom', Phaser.Group.SORT_ASCENDING);
    });
    comms.on('ground-item-added', function (item) {
        console.log("Ground item added:", item);
        self.createItem(item);
        main.objects.sort('bottom', Phaser.Group.SORT_ASCENDING);
    });
    comms.on('ground-item-removed', function (id) {
        console.log("Ground item removed:", id);
        self.removeItem(id);
    });
}