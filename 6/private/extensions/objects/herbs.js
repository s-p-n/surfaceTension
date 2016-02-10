var Herb = require('./ai/herb.js');
function Herbs(main, childCallback) {
    "use strict";
    var self = this;
    var herbPlaces = [];
    var herbs = [];
    var interval = void 0;
    var intervalTime = 1000;
    function serializePlace(herb) {
        return herb.place[0] + 
            ',' + 
            herb.place[1];
    }
    self.db = {
        each: function (fn, done) {
            main.db.herbs.find().forEach(function (err, doc) {
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
            if (typeof fn === 'function') {
                main.db.herbs.insert({
                    name: herb.name,
                    place: herb.place
                }, fn);
            } else {
                main.db.herbs.insert({
                    name: herb.name,
                    place: herb.place
                });
            }
        },
        remove: function (herbId) {
            main.db.herbs.remove({
                _id: herbId
            });
        }
    };
    self.add = function (data, fn) {
        var herb = new Herb(data);
        if (herbPlaces.indexOf(serializePlace(herb)) === -1) {
            herbs.push(herb);
            herbPlaces.push(serializePlace(herb));
            self.db.add(herb, fn);
        }
    };
    self.remove = function (data) {
        var index = herbPlaces.indexOf(serializePlace(data));
        herbPlaces.splice(index, 1);
        herbs.splice(index, 1);
        self.db.remove(data._id);
    }
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
                    herbPlaces.push(serializePlace(child));
                    herbs.push(child);
                    self.db.add(child, function (err, doc) {
                        if (!err) {
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