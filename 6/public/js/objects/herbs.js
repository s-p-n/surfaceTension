function Herbs (main) {
    "use strict";
    var self = this;
    var herbs = {};
    function onDown (sprite) {
        var herb = herbs[sprite._id];
        if (main.utils.isClose(sprite) &&
            inventory.add(herbs[sprite._id].name)
        ) {
            self.deleteHerb(sprite._id);
            comms.emit('herb-picked', sprite._id);
        }
    }
    self.createHerb = function (herb) {
        var sprite = main.objects.create(herb.place[0], herb.place[1], herb.name);
        herbs[herb._id] = herb;
        herbs[herb._id].sprite = sprite;
        sprite._id = herb._id;
        sprite.inputEnabled =  true;
        sprite.input.useHandCursor = true;
        sprite.events.onInputDown.add(onDown);
    }
    self.deleteHerb = function (id) {
        if (herbs[id] === void 0) {
            return;
        }
        herbs[id].sprite.destroy();
        delete herbs[id];
    }
    self.preload = function () {
        main.game.load.image('slire', './assets/game/slire.png');
    };
    comms.on('herbs-init', function (herbs) {
        console.log("got herbs init:");
        console.log(herbs);
        var id;
        for (id in herbs) {
            self.createHerb(herbs[id]);
        }
    });
    comms.on('herb-created', function (herb) {
        console.log("herb created");
        console.log(herb);
        self.createHerb(herb);
    });
    comms.on('herb-deleted', function (id) {
        console.log("herb deleted");
        console.log(id);
        self.deleteHerb(id);
    });
}