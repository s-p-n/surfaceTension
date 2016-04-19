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
    function onOver (sprite) {
        sprite.tint = 0x333333;
    }
    function onOut (sprite) {
        sprite.tint = 0xFFFFFF;
    }
    function enable (id) {
        if (herbs[id] === void 0) {
            return false;
        }
        if (herbs[id].sprite !== void 0) {
            herbs[id].sprite.revive();
            return true;
        }
        var herb = herbs[id];
        var sprite = main.objects.create(herb.place[0], herb.place[1], herb.name);
        herbs[id].sprite = sprite;
        sprite._id = id;
        sprite.inputEnabled =  true;
        sprite.input.useHandCursor = true;
        sprite.events.onInputDown.add(onDown);
        sprite.events.onInputOver.add(onOver);
        sprite.events.onInputOut.add(onOut);
        return true;
    }
    function disable (id) {
        if (herbs[id] !== void 0) {
            return false;
        }
        if (herbs[id].sprite === void 0) {
            return true;
        }
        herbs[id].sprite.kill();
        delete herbs[id].sprite;
        return true;
    }
    function herbInView (id) {
        return herbs[id].sprite.inCamera;
    }
    self.viewChange = function () {
        var id;
        var visibleHerbs = 0;
        for (id in herbs) {
            if (herbInView(id)) {
                visibleHerbs += 1;
                enable(id);
            } else {
                disable(id);
            }
        }
        console.log("visible herbs:", visibleHerbs);
    };
    self.createHerb = function (herb) {
        herbs[herb._id] = herb;
        var sprite = main.objects.create(herb.place[0], herb.place[1], herb.name);
        sprite._id = herb._id;
        sprite.inputEnabled =  true;
        sprite.input.useHandCursor = true;
        sprite.events.onInputDown.add(onDown);
        sprite.events.onInputOver.add(onOver);
        sprite.events.onInputOut.add(onOut);
        herbs[herb._id].sprite = sprite;
        if (!herbInView(herb._id)) {
            disable(herb._id);
        } else {
            console.log("Herb not displayed:", herb);
        }
    };
    self.deleteHerb = function (id) {
        if (herbs[id] === void 0) {
            return;
        }
        herbs[id].sprite.destroy();
        delete herbs[id];
    };
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
        self.createHerb(herb);
    });
    comms.on('herb-deleted', function (id) {
        self.deleteHerb(id);
    });
}