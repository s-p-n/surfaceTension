module.exports = function (m) {
    "use strict";
    m.map = [];
    m.map.bounds = [0, 0];
    m.map.places = {};
    function initWorld () {
        var gridSize = 25;
        var x, y;
        console.log('map bounds:', m.map.bounds);
        for (x = 0; x < m.map.bounds[0]; x += gridSize) {
            for (y = 0; y < m.map.bounds[1]; y += gridSize) {
                m.map.places[x + "," + y] = false;
            }
        }
    }
    var tileSize = 512;
    m.db.map.find().forEach(function (err, tile) {
        if (err) {
            console.error(err);
            return;
        }
        if (!tile) {
            initWorld();
            return;
        }
        if (tile.x + tileSize > m.map.bounds[0]) {
            m.map.bounds[0] = tile.x + tileSize;
        }
        if (tile.y + tileSize > m.map.bounds[1]) {
            m.map.bounds[1] = tile.y + tileSize;
        }
        m.map.push(tile);
    });
};
