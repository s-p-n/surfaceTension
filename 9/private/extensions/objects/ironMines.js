var Iron = require('./mines/iron.js');
function IronMines(m, bitUpdateCallback) {
    var self = this;
    self.mines = Object.create(null);
    function addToPlaces(mine) {
        var a = mine.place[0] + ',' + mine.place[1];
        var b = mine.place[0] + 25 + ',' + mine.place[1];
        m.map.places[a] = true;
        m.map.places[b] = true;
        m.map.impassable[a] = true;
        m.map.impassable[b] = true;
    }
    self.db = {
        each: function (fn, done) {
            m.db.mines.find({name: 'iron'}).forEach(function (err, doc) {
                if (!doc || err) {
                    // out of documents, or error.
                    if (!err) {
                        done();
                    } else {
                        console.log('Iron Mine Find Error!');
                        console.log(err);
                    }
                    return;
                }
                fn(doc);
            });
        },
        add: function (place, fn) {
            if (typeof fn === 'function') {
                m.db.mines.insert({name: 'iron', place: place, bits: 0}, fn);
            } else {
                m.db.mines.insert({name: 'iron', place: place, bits: 0});
            }
        },
        updateBits: function (id, newBits, fn) {
            if (typeof fn === "function") {
                m.db.mines.update({_id: id}, {$set: {bits: newBits}}, fn);
            } else {
                m.db.mines.update({_id: id}, {$set: {bits: newBits}});
            }
        }
    };
    self.updateBits = function (id, newBits, fn) {
        self.mines[id].bits = newBits;
        self.db.updateBits(id, newBits, fn);
    };
    self.add = function (place, fn) {
        self.db.add(place, function (err, doc) {
            if (err) {
                console.log("Add Iron Mine Error:");
                console.log(err);
                return;
            }
            var params = {
                _id: doc._id,
                place: doc.place,
                bits: doc.bits,
                callback: function (iron) {
                    self.mines[iron._id].bits = iron.bits;
                    self.db.updateBits(iron._id, iron.bits);
                    self.cycleCallback(iron);
                }
            };
            self.mines[doc._id] = new Iron(params);
            addToPlaces(doc);
            fn(self.mines[doc._id]);
            self.mines[doc._id].start();
        });
    }
    self.start = function () {
        var id;
        for(id in self.mines) {
            self.mines[id].start();
        }
    };
    self.stop = function () {
        var id;
        for(id in self.mines) {
            self.mines[id].stop();
        }
    }
    self.cycleCallback = bitUpdateCallback;
    self.db.each(function (doc) {
        var params = {
            _id: doc._id,
            place: doc.place,
            bits: doc.bits,
            callback: function (iron) {
                self.mines[iron._id].bits = iron.bits;
                self.db.updateBits(iron._id, iron.bits);
                self.cycleCallback(iron);
            }
        };
        self.mines[doc._id] = new Iron(params);
        addToPlaces(doc);
        self.cycleCallback(self.mines[doc._id]);
    }, function () {
        self.start();
    });
}
module.exports = IronMines;