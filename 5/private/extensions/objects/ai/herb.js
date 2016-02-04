var Plant = require('./plant.js');
function Herb(params) {
    "use strict";
    var self = this;
    self.name = params.name;
    self.place = params.place;
    var plantParams = Object.create(params);
    plantParams.offspring = function (x, y) {
        var childParams = Object.create(params);
        childParams.place = [x, y];
        return new Herb(childParams);
    };
    Plant.call(self, plantParams);
}
Herb.prototype = Object.create(Plant.prototype);
Herb.prototype.constructor = Herb;
module.exports = Herb;