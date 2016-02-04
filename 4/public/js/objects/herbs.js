function Herbs (main) {
    "use strict";
    var self = this;
    self.preload = function () {
        main.game.load.image('slire', './assets/game/slire.png');
    };
    comms.on('herbs-init', function (herbs) {
        console.log("got herbs init:");
        console.log(herbs);
        herbs.forEach(function (herb) {
            main.objects.create(herb.place[0], herb.place[1], herb.name);
        });
    });
    comms.on('herb-created', function (herb) {
        console.log("herb created");
        console.log(herb);
        main.objects.create(herb.place[0], herb.place[1], herb.name);
    });
}