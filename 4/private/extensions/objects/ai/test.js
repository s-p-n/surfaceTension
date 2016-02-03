(function () {
    "use strict";
    var Plant = require('./plant.js');
    var plants = [new Plant({
        maxSeeds: 5, 
        seedTime: 5000,
        place: [500, 500],
        size: [25, 25]
    })];
    var plantPlaces = ['500,500'];
    function serializePlace(plant) {
        return plant.brain.left.memories.place[0] + ',' + plant.brain.left.memories.place[1];
    }
    var interval = setInterval(function () {
        process.stdout.write('\033c');
        plants.forEach(function (plant) {
            var child = plant.cycle();
            if (child instanceof Plant && 
                (plantPlaces.indexOf(serializePlace(child)) === -1)
            ) {
                plants.push(child);
                plantPlaces.push(serializePlace(child));
            }
            console.log(plant.brain.left.memories.place);
        });
        console.log("Total plants:", plants.length);
    }, 1000);
}());