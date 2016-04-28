function GroundItems(main, childCallback) {
    "use strict";
    var self = this;

    function serializePlace(item) {
        return item.place[0] + 
            ',' + 
            item.place[1];
    }
    function placeAvailable(item) {
        return (item.place[0] > 0 &&
            item.place[0] < main.map.bounds[0] &&
            item.place[1] > 0 &&
            item.place[1] < main.map.bounds[1]);
    }
    self.db = {
        each: function (fn, done) {
            main.db.groundItems.find().forEach(function (err, doc) {
                if (!doc || err) {
                    // out of documents, or error.
                    if (err) {
                        console.log("GroundItem Find Error!");
                        console.log(err);
                    }
                    return;
                }
                fn(doc);
            });
        },
        add: function (item, fn) {
            if (typeof fn === 'function') {
                main.db.groundItems.insert({
                    name: item.name,
                    place: item.place
                }, fn);
            } else {
                main.db.groundItems.insert({
                    name: item.name,
                    place: item.place
                });
            }
        },
        remove: function (itemId) {
            main.db.groundItems.remove({
                _id: itemId
            });
        }
    };
    self.add = function (item) {
        self.db.add(item, function (err, doc) {
            if (err) {
                console.error(err);
                return;
            }
            self.cycleCallback(doc);
        });
    };
    self.remove = function (item) {
        self.db.remove(item._id);
    };
    self.cycleCallback = childCallback;
    // Construct the items list from db:
    self.db.each(function (item) {
        self.cycleCallback(item);
    });
}
module.exports = GroundItems;