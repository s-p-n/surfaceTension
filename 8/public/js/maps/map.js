function Map (main) {
    "use strict";
    var self = this;
    function addTile (tile) {
        var ref;
        if (tile._id in self.map._tiles) {
            self.map._tiles[tile._id].revive();
            return;
        }
        ref = self.map.create(tile.x, tile.y, tile.name);
        self.map._tiles[tile._id] = ref;
    }
    self.preload = function () {
        main.game.load.image('grass', './assets/game/grass.png');
    };
    self.create = function () {
        self.map = main.game.add.group();
        self.map._tiles = {};
    };
    self.update = function () {};
    self.render = function () {};
    comms.on('map-tile', addTile);
    comms.on('map-init', function (tiles) {
        self.map.forEach(function(item) {
            item.kill();
        });
        tiles.forEach(addTile);
    });
}