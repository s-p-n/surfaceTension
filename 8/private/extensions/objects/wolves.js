"use strict";
var Wolf = require('./ai/wolf.js');
function Wolves (main, wolfTickCallback) {
    var self = this;
    var wolves = [];
    var wolfRemoval = [];
    var interval = void 0;
    var intervalTime = 250;
    function randLevel (max) {
        return Math.round(Math.random() * (max - 1) + 1);
    }
    function randPlaceInBounds () {
        return [
            Math.floor((Math.random() * (main.map.bounds[0] - 50)) + 25), 
            Math.floor((Math.random() * (main.map.bounds[1] - 50)) + 25)
        ];
    }
    function randWolfDoc(maxLife, maxMelee, maxBite) {
        var lifeLevel = randLevel(maxLife);
        var meleeLevel = randLevel(maxMelee);
        var biteLevel = randLevel(maxBite);
        var place = randPlaceInBounds();
        return {
            place: place,
            weaponMaxHit: biteLevel,
            wellness: {
                hp: (lifeLevel * 10),
                healRate: (lifeLevel * 0.1)
            },
            skills: {
                life: {
                    level: lifeLevel,
                    experience: 0
                },
                melee: {
                    level: meleeLevel,
                    experience: 0
                },
                bite: {
                    level: biteLevel,
                    experience: 0
                }
            }
        };
    }
    self.db = {
        each: function (fn, done) {
            main.db.wolves.find().forEach(function (err, doc) {
                if (!doc || err) {
                    // out of documents, or error.
                    if (!err) {
                        done();
                    } else {
                        console.log("Wolf Find Error!");
                        console.log(err);
                    }
                    return;
                }
                fn(doc);
            });
        },
        add: function (wolf, fn) {
            if (typeof fn === 'function') {
                main.db.wolves.insert(wolf, fn);
            } else {
                main.db.wolves.insert(wolf);
            }
        },
        remove: function (id) {
            main.db.wolves.remove({
                _id: id
            });
        }
    };
    self.spawn = function () {
        self.db.add(randWolfDoc(7, 4, 2), function (err, wolf) {
            console.log("Wolf spawned.");
            wolves.push(new Wolf(wolf));
            self.cycleCallback(wolf);
        });
    };
    self.remove = function (id) {
        self.db.remove(id);
        wolfRemoval.push(id);
    };
    self.start = function () {
        interval = setInterval(function () {
            wolves.forEach(function (wolf, index) {
                if (wolfRemoval.indexOf(wolf.doc._id) !== -1) {
                    wolves.splice(index, 1);
                    return;
                }
                if (wolf.cycle(main) === "kill") {
                    //console.log("wolf dead (2)");
                    wolves.splice(index, 1);
                    self.remove(wolf.doc._id);
                    self.cycleCallback(wolf.doc._id.toString());
                    return;
                }

                main.db.wolves.update({
                    '_id': wolf.doc._id
                }, wolf.doc);
                self.cycleCallback(wolf.doc);
            });
        }, intervalTime);
    };
    self.stop = function () {
        clearInterval(interval);
    }
    self.cycleCallback = wolfTickCallback;
    self.db.each(function (doc) {
        wolves.push(new Wolf(doc));
        self.cycleCallback(doc);
    }, function () {
        self.start();
    });
}
module.exports = Wolves;