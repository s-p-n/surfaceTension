function Mines(main) {
    "use strict";
    var self = this;
    var mines = {};
    function onDown (sprite) {
        var mine = mines[sprite._id];
        if (mine.bits > 0 &&
            main.utils.isClose(sprite) &&
            inventory.add(mines[sprite._id].name)
        ) {
            mine.bits -= 1;
            self.updateMine(mine);
            comms.emit('iron-mined', sprite._id);
        }
    }
    self.createMine = function (mine) {
        var sprite;
        if (!(mine._id in mines)) {
            sprite = main.objects.create(mine.place[0], mine.place[1], 'ironRock');
            mines[mine._id] = mine;
            mines[mine._id].sprite = sprite;
            sprite._id = mine._id;
            sprite.inputEnabled =  true;
            sprite.input.useHandCursor = true;
            sprite.events.onInputDown.add(onDown);
        } else {
            mines[mine._id].sprite.revive();
        }
    }
    self.updateMine = function (mine) {
        console.log("Updating mine:", mine);
        mines[mine._id].bits = mine.bits;
        if (mines[mine._id].bits <= 0) {
            mines[mine._id].sprite.tint = 0x777777;
        } else {
            mines[mine._id].sprite.tint = 0xFFFFFF;
        }
    }
    self.deleteHerb = function (id) {
        mines[id].sprite.destroy();
        delete mines[id];
    }
    self.preload = function () {
        main.game.load.image('ironRock', './assets/game/ironrock.png');
    };
    comms.on('mines-init', function (minesList) {
        console.log("got mines init:");
        console.log(minesList);
        var id;
        for (id in mines) {
            mines[id].sprite.kill();
        }
        for (id in minesList) {
            self.createMine(minesList[id]);
        }
        main.objects.sort('bottom', Phaser.Group.SORT_ASCENDING);
    });
    comms.on('iron-updated', function (mine) {
        self.updateMine(mine);
    });
}