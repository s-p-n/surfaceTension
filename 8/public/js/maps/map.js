function Map (main) {
    "use strict";
    var self = this;
    function addTile (tile) {
        self.map.create(tile.x, tile.y, tile.name);
    }
    self.preload = function () {
        main.game.load.image('grass', './assets/game/grass.png');
    };
    self.create = function () {
        self.map = main.game.add.group();
    };
    self.update = function () {};
    self.render = function () {};
    comms.on('map-tile', addTile);
    comms.on('map-init', function (tiles) {
        tiles.forEach(addTile);
    });
}