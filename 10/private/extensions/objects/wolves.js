"use strict";
var Wolf = require('./ai/wolf.js');
function Wolves (main, wolfTickCallback) {
    var self = this;
    var wolves = [];
    var maxWolves = 100;
    var naturalSpawnTime = 60000;
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
                "hunger" : 0,
                "infection" : {
                    "minor" : [ ],
                    "normal" : [ ],
                    "chronic" : [ ]
                },
                "illness" : {
                    "minor" : [ ],
                    "normal" : [ ],
                    "chronic" : [ ]
                },
                "disease" : {
                    "minor" : [ ],
                    "normal" : [ ],
                    "chronic" : [ ]
                }

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
    self.spawn = function (place) {
        var randWolf = randWolfDoc(7, 4, 2);
        if (place) {
            randWolf.place = place;
        }
        self.db.add(randWolf, function (err, wolf) {
            wolves.push(new Wolf(wolf));
            self.cycleCallback(wolf);
        });
    };
    self.remove = function (id) {
        self.db.remove(id);
        wolfRemoval.push(id);
    };
    self.start = function () {
        var lastSpawn = 0;
        interval = setInterval(function () {
            if (wolves.length < maxWolves &&
                (lastSpawn + naturalSpawnTime) < Date.now()) {
                lastSpawn = Date.now();
                self.spawn();
                console.log("wolf spawned naturally");
            }
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
                //console.log(wolf.brain.left.memories.lastAction);
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