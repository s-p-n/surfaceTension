function Herbs (main) {
    "use strict";
    var self = this;
    var herbs = {};
    function intersects (a, b) {
        return !(a.x + a.w < b.x ||
            a.y + a.h < b.y ||
            b.x + b.w < a.x ||
            b.y + b.h < a.y);
    }
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
        //herbs[id].sprite.destroy();
        //delete herbs[id].sprite;
        return true;
    }
    function herbInView (id) {
        var obj1 = {
            x: herbs[id].place[0],
            y: herbs[id].place[1],
            w: 25,
            h: 25
        };
        var obj2 = {
            x: (main.game.camera.view.x / main.game.camera.scale.x) || 0,
            y: (main.game.camera.view.y / main.game.camera.scale.y) || 0,
            w: (main.game.camera.view.width / main.game.camera.scale.x) || 0,
            h: (main.game.camera.view.height / main.game.camera.scale.y) || 0
        };
        //console.log(main.game.camera);
        return intersects(obj1, obj2);
    }
    self.viewChange = function () {
        var id;
        var visibleHerbs = 0;
        console.log((main.game.camera.view.x / main.game.camera.scale.x));
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
        /*
        var sprite = main.objects.create(herb.place[0], herb.place[1], herb.name);
        sprite._id = herb._id;
        sprite.inputEnabled =  true;
        sprite.input.useHandCursor = true;
        sprite.events.onInputDown.add(onDown);
        sprite.events.onInputOver.add(onOver);
        sprite.events.onInputOut.add(onOut);
        herbs[herb._id].sprite = sprite;
        */
        if (!herbInView(herb._id)) {
            disable(herb._id);
        } else {
            enable(herb._id)
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
        //console.log("got herbs init:");
        //console.log(herbs);
        var id;
        for (id in herbs) {
            self.createHerb(herbs[id]);
        }

        console.log(main.objects);
    });
    comms.on('herb-created', function (herb) {
        self.createHerb(herb);
    });
    comms.on('herb-deleted', function (id) {
        self.deleteHerb(id);
    });
}