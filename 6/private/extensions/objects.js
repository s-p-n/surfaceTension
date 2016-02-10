"use strict";
var Herbs = require('./objects/herbs.js');
var IronMines = require('./objects/ironMines.js');

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
	m.game.objects = {
        herbs: {},
        ironMines: {}
    };
    setupGameObj(m.game.objects.herbs, Herbs);
    setupGameObj(m.game.objects.ironMines, IronMines);
};
