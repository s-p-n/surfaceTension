function Herbs (main) {
    "use strict";
    var self = this;
    self.preload = function () {
        main.game.load.image('slire', './assets/game/slire.png');
    };
    self.create = function () {};
    self.update = function () {};
    self.render = function () {};
    comms.on('herbs-init', function (herbs) {
        console.log("got herbs init:");
        console.log(herbs);
        herbs.forEach(function (herb) {
            main.game.add.sprite(herb.place[0], herb.place[1], herb.name);
        });
    });
    comms.on('herb-created', function (herb) {
        console.log("herb created");
        console.log(herb);
        main.game.add.sprite(herb.place[0], herb.place[1], herb.name);
    });
}