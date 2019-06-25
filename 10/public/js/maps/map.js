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
    self.render = function () {};
    comms.on('map-tile', addTile);
    comms.on('map-init', function (data) {
        self.map.forEach(function(item) {
            item.kill();
        });
        data.tiles.forEach(addTile);

        main.game.world.setBounds(0, 0, data.bounds[0] * main.scale, data.bounds[1] * main.scale);
        main.game.world.scale.setTo(main.scale, main.scale);
    });
}