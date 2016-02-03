var Brain = require('./brain.js');
function DevelopSeed(ai) {
    "use strict";
    var self = this;
    ai.memories.seeds = 0;
    ai.memories.endTime = Date.now() + ai.memories.seedTime;
    function createSeed() {
        ai.memories.seeds += 1;
        ai.memories.endTime = Date.now() + ai.memories.seedTime;
        ai.sync('memories.seeds');
    }
    self.cycle = function () {
        var now = Date.now();
        var weight = now - ai.memories.endTime;
        if (weight > 0 &&
            ai.memories.maxSeeds > ai.memories.seeds
        ) {
            ai.addDecision({
                weight: weight,
                action: createSeed,
                title: "create seed"
            });
        }
    }
}
function DropSeed(ai) {
    "use strict";
    var self = this;
    var weight = 5;
    var place = ai.memories.place;
    var size = ai.memories.size;
    var seedPlaces = [
        [place[0] - size[0], place[1] - size[1]],
        [place[0] - size[0], place[1]],
        [place[0] - size[0], place[1] + size[1]],
        [place[0], place[1] - size[1]],
        //[place[0], place[1]], // Should not put child at same place as parent
        [place[0], place[1] + size[1]],
        [place[0] + size[0], place[1] - size[1]],
        [place[0] + size[0], place[1]],
        [place[0] + size[0], place[1] + size[1]]
    ];
    function drop () {
        var randPlace = seedPlaces[Math.floor(Math.random() * 8)];
        ai.memories.seeds -= 1;
        ai.sync('memories.seeds');
        return ai.memories.offspring(randPlace[0], randPlace[1]);
    }
    self.cycle = function () {
        if (ai.memories.seeds > 0) {
            ai.addDecision({
                weight: weight,
                action: drop,
                title: "drop seed"
            });
        }
    }
}
function Plant(params) {
    "use strict";
    var self = this;
    var memories;
    function optional(name, defaultValue) {
        return params[name] !== void 0 ? params[name] : defaultValue;
    }
    function synchronize() {
        self.brain.left.sync('memories.maxSeeds');
        self.brain.left.sync('memories.seedTime');
        self.brain.left.sync('memories.place');
        self.brain.left.sync('memories.size');
        self.brain.left.sync('memories.offspring');
    }
    function makeChild (x, y) {
        var childParams = Object.create(params);
        childParams.place = [x, y];
        return new Plant(childParams);
    }
    self.brain = new Brain();
    memories = self.brain.left.memories;
    memories.maxSeeds = optional('maxSeeds', 2);
    memories.seedTime = optional('seedTime', 60000);
    memories.place = optional('place', [0, 0]);
    memories.size = optional('size', [25, 25]);
    memories.offspring = optional('offspring', makeChild);
    synchronize();
    self.brain.createFeedback(DevelopSeed);
    self.brain.createFeedback(DropSeed);
    self.cycle = function () {
        synchronize();
        return self.brain.cycle();
    }
}
module.exports = Plant;