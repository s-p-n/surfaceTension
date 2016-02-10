var Herbs = require('./objects/herbs.js');
module.exports = function (m) {
	m.game.objects = {
        herbs: {}
    };
    Object.defineProperties(m.game.objects.herbs, {
        "class": {
            value: Herbs,
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
};
