var Herb = require('./ai/herb.js');
function Herbs(main, childCallback) {
    "use strict";
    var self = this;
    var herbPlaces = [];
    var herbs = [];
    var interval = void 0;
    var intervalTime = 1000;
    var db = main.db;
    function serializePlace(herb) {
        return herb.brain.left.memories.place[0] + ',' + herb.brain.left.memories.place[1];
    }
    self.db = {
        each: function (fn, done) {
            db.herbs.find().forEach(function (err, doc) {
                if (!doc || err) {
                    // out of documents, or error.
                    if (!err) {
                        done();
                    } else {
                        console.log("Herb Find Error!");
                        console.log(err);
                    }
                    return;
                }
                fn(doc);
            });
        },
        add: function (herb, fn) {
            db.herbs.insert({
                name: herb.name,
                place: herb.brain.left.memories.place
            }, fn);
        }
    };
    self.stop = function () {
        clearInterval(interval);
    }
    self.start = function () {
        interval = setInterval(function () {
            herbs.forEach(function (herb) {
                var child = herb.cycle();
                if (child instanceof Herb && 
                    (herbPlaces.indexOf(serializePlace(child)) === -1)
                ) {
                    self.db.add(child, function (err, doc) {
                        if (!err) {
                            herbPlaces.push(serializePlace(child));
                            herbs.push(child);
                            self.cycleCallback(doc);
                        } else {
                            console.log("Herb Insertion Error!");
                            console.log(err);
                        }
                    });
                }
            });
        }, intervalTime);
    };
    self.cycleCallback = childCallback;
    // Construct the herbs list from db:
    self.db.each(function (doc) {
        var herb = new Herb(doc);
        herbPlaces.push(serializePlace(herb));
        herbs.push(herb);
        self.cycleCallback(doc);
    }, function () {
        self.start();
    });
}
module.exports = Herbs;