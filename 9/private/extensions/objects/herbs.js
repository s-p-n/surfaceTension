var Herb = require('./ai/herb.js');
function Herbs(main, childCallback) {
    "use strict";
    var self = this;
    var herbRemoval = [];
    var herbs = [];
    var interval = void 0;
    var intervalTime = 1000;
    function serializePlace(herb) {
        return herb.place[0] + 
            ',' + 
            herb.place[1];
    }
    function placeAvailable(herb) {
        console.log((main.map.places[serializePlace(herb)] === false),
            herb.place[0] > 0 ,
            herb.place[0] < main.map.bounds[0] ,
            herb.place[1] > 0 ,
            herb.place[1] < main.map.bounds[1]);
        return (main.map.places[serializePlace(herb)] === false &&
            herb.place[0] > 0 &&
            herb.place[0] < main.map.bounds[0] &&
            herb.place[1] > 0 &&
            herb.place[1] < main.map.bounds[1]);
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
        if (placeAvailable(herb)) {
            herbs.push(herb);
            main.map.places[serializePlace(herb)] = true;
            self.db.add(herb, fn);
        }
    };
    self.remove = function (data) {
        var serialPlace = serializePlace(data)
        main.map.places[serialPlace] = false;
        herbRemoval.push(serialPlace);
        self.db.remove(data._id);
    }
    self.stop = function () {
        clearInterval(interval);
    }
    self.start = function () {
        interval = setInterval(function () {
            herbs.forEach(function (herb, index) {
                var serialPlace = serializePlace(herb);
                var child;
                // remove if marked for removal
                if (herbRemoval.indexOf(serialPlace) !== -1) {
                    herbs.splice(index, 1);
                    return;
                }
                child = herb.cycle();
                if (child instanceof Herb && 
                    (placeAvailable(child))
                ) {
                    main.map.places[serializePlace(child)] = true;
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
        main.map.places[serializePlace(herb)] = true;
        herbs.push(herb);
        self.cycleCallback(doc);
    }, function () {
        self.start();
    });
}
module.exports = Herbs;