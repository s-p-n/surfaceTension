function Map (main) {
    "use strict";
    var self = this;
    self.preload = function () {
        main.game.load.image('grass', './assets/game/grass.png');
    };
    self.create = function () {
        self.map = main.game.add.group();
        self.map.create(0, 0, 'grass');
    };
    self.update = function () {};
    self.render = function () {};
}