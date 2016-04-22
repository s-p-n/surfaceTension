module.exports = function (m) {
    "use strict";
    m.map = [];
    m.map.bounds = [0, 0];
    m.map.sections = [];
    m.map.getSection = function (place) {
        var i, s;
        for (i = 0; i < m.map.sections.length; i += 1) {
            if (m.map.inSection(place, i)) {
                return i;
            }
        }
    }
    m.map.inSection = function (place, sectionIndex) {
        return (place[0] >= m.map.sections[sectionIndex].x && 
                place[0] < m.map.sections[sectionIndex].w + m.map.sections[sectionIndex].x &&
                place[1] >= m.map.sections[sectionIndex].y &&
                place[1] < m.map.sections[sectionIndex].h + m.map.sections[sectionIndex].y
            )
    }
    m.map.places = {};
    function initWorld () {
        var gridSize = 25;
        var sectSize = 512;
        var x, y;
        for (x = 0; x < m.map.bounds[0]; x += gridSize) {
            for (y = 0; y < m.map.bounds[1]; y += gridSize) {
                m.map.places[x + "," + y] = false;
            }
        }
        for (x = 0; x < m.map.bounds[0]; x += sectSize) {
            for (y = 0; y < m.map.bounds[1]; y += sectSize) {
                m.map.sections.push({
                    x: x,
                    y: y,
                    w: sectSize,
                    h: sectSize
                });
            }
        }
        //console.log(m.map.sections);
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
