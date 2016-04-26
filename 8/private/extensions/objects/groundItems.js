function GroundItems(main, childCallback) {
    "use strict";
    var self = this;
    var items = [];

    function serializePlace(item) {
        return item.place[0] + 
            ',' + 
            item.place[1];
    }
    function placeAvailable(item) {
        console.log((main.map.places[serializePlace(item)] === false),
            item.place[0] > 0 ,
            item.place[0] < main.map.bounds[0] ,
            item.place[1] > 0 ,
            item.place[1] < main.map.bounds[1]);
        return (main.map.places[serializePlace(item)] === false &&
            item.place[0] > 0 &&
            item.place[0] < main.map.bounds[0] &&
            item.place[1] > 0 &&
            item.place[1] < main.map.bounds[1]);
    }
    self.db = {
        each: function (fn, done) {
            main.db.groundItems.find().forEach(function (err, doc) {
                if (!doc || err) {
                    // out of documents, or error.
                    if (!err && typeof done === "function") {
                        done();
                    } else {
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
    self.add = function (item, fn) {
        if (placeAvailable(item)) {
            items.push(item);
            main.map.places[serializePlace(item)] = true;
            self.db.add(item, fn);
        }
    };
    self.remove = function (item) {
        var serialPlace = serializePlace(item)
        main.map.places[serialPlace] = false;
        self.db.remove(item._id);
    };
    self.cycleCallback = childCallback;
    // Construct the items list from db:
    self.db.each(function (item) {
        main.map.places[serializePlace(item)] = true;
        items.push(item);
        self.cycleCallback(item);
    });
}
module.exports = GroundItems;