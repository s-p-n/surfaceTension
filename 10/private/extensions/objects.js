"use strict";
function setupGameObj (obj, objClass) {
    Object.defineProperties(obj, {
        "class": {
            value: objClass,
            writable: false,
            configurable: false,
            enumerable: false
        },
        "instance": {
            value: null,
            writable: true,
            configurable: false,
            enumerable: false
        }
    });
}
module.exports = function (m) {
    var dir = m.fs.readdirSync('./private/extensions/objects');
    var index, objName;
    m.game.objects = {};
    for (index in dir) {
        if (dir[index].match(/[a-z]\.js/)) {
            objName = dir[index].substr(0, dir[index].indexOf('.'));
            m.game.objects[objName] = {};
            setupGameObj(m.game.objects[objName], require('./objects/' + dir[index]));
        }
    }
    //console.log("Set up game objects:", m.game.objects);
};
