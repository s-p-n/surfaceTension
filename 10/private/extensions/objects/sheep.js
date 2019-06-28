const OneSheep = require('./sheep/gateway.js');
const defaultSheep = require("./sheep/default.json")
let pinkSheep = new OneSheep({place: [100, 100], color: 0xFF99FF});
let t = 0;
module.exports = function Sheep (main, sheepTickCallback) {
    const self = this;
    const manySheep = [];
    const walkSpeed = 7.5;
    const maxSheep = 100;
    const naturalSpawnTime = 60000;
    const sheepRemoval = [];
    const intervalTime = 1000;
    let interval = void 0;

    function isWithin (a, b, within=25) {
        return !((a + within < b) || (b + within < a));
    }

    function isClose (a, b, within=25) {
        return isWithin(a[0], b[0], within) && isWithin(a[1], b[1], within);
    }

    function randLevel (max) {
        return Math.round(Math.random() * (max - 1) + 1);
    }

    function randPlaceInBounds () {
        return [
            Math.floor((Math.random() * (main.map.bounds[0] - 50)) + 25), 
            Math.floor((Math.random() * (main.map.bounds[1] - 50)) + 25)
        ];
    }
    function getClosestObj (me, a, b) {
        var aDist = Math.abs((a.place[0] + a.place[1]) - (me[0] + me[1]));
        var bDist = Math.abs((b.place[0] + b.place[1]) - (me[0] + me[1]));
        if (aDist < bDist) {
            return a;
        }
        return b;
    }

    function getClosestUser (me, a, b) {
        var aDist = Math.abs((a.x + a.y) - (me[0] + me[1]));
        var bDist = Math.abs((b.x + b.y) - (me[0] + me[1]));
        if (aDist < bDist) {
            return a;
        }
        return b;
    }
    function randSheepDoc(maxLife, maxMelee, maxBite) {
        let template = require('./sheep/default.json');
        var lifeLevel = randLevel(maxLife);
        var meleeLevel = randLevel(maxMelee);
        var biteLevel = randLevel(maxBite);
        var place = randPlaceInBounds();
        template.place = place;
        template.weaponMaxHit = biteLevel;
        template.wellness.hp = lifeLevel * 10;
        template.skills.life.level = lifeLevel;
        template.skills.melee.level = meleeLevel;
        template.skills.bite.level = biteLevel;
        return template;
    }

    function takeAction(sheep, inputs) {
        let click = inputs[0] > 0;
        
        if (sheep.doc.wellness.hunger < 100) {
            sheep.doc.wellness.hunger += 0.1
        } else {
            sheep.doc.wellness.hp -= 1;
        }

        if (!click) {
            return;
        }
        let place = sheep.doc.place;
        let section = main.map.sections[main.map.getSection(place)];
        let x = Math.round(inputs[1] * 32) + section.x;
        let y = Math.round(inputs[2] * 32) + section.y;
        let dirx = (isWithin(x, place[0], 128) ? 0 : (x < place[0] ? -1 : 1)) * walkSpeed;
        let diry = (isWithin(y, place[1], 128) ? 0 : (y < place[1] ? -1 : 1)) * walkSpeed;
        place[0] += dirx;
        place[1] += diry;
        console.log(`actions: x: ${x}, y: ${y}, click: ${click}`)
        if (dirx === 0 && diry === 0) {
            console.log("click near me");
            let things = sheep.thingsInView;
            let closestHerb = null;
            things.herbs.forEach(herb => {
                if (isClose(herb.place, place)) {
                    if (!closestHerb) {
                        closestHerb = herb;
                        return;
                    }
                    closestHerb = getClosestObj(place, herb, closestHerb);
                }
            });
            if (closestHerb) {
                console.log("eating herb");
                main.game.objects.herbs.instance.remove(closestHerb);
            }
        } else {
            //console.log(place, {x, dx}, {y, dy})
        }
        
    }

    self.db = {
        each: function (fn, done) {
            main.db.sheep.find().forEach(function (err, doc) {
                if (!doc || err) {
                    // out of documents, or error.
                    if (!err) {
                        done();
                    } else {
                        console.log("Sheep Find Error!");
                        console.log(err);
                    }
                    return;
                }
                fn(doc);
            });
        },
        add: function (sheep, fn) {
            if (typeof fn === 'function') {
                main.db.sheep.insert(sheep, fn);
            } else {
                main.db.sheep.insert(sheep);
            }
        },
        remove: function (id) {
            main.db.sheep.remove({
                _id: id
            });
        }
    };
    self.spawn = function (place) {
        var randSheep = randSheepDoc(7, 4, 2);
        if (place) {
            randSheep.place = place;
        }
        self.db.add(randSheep, function (err, sheep) {
            manySheep.push(new OneSheep(sheep));
            self.cycleCallback(sheep);
        });
    };
    self.remove = function (id) {
        self.db.remove(id);
        sheepRemoval.push(id);
    };
    self.start = function () {
        interval = setInterval(() => manySheep.
            forEach(sheep => sheep.cycle(main).
                then(inputs => {
                    takeAction(sheep, inputs);
                    return self.cycleCallback(sheep.doc);
                }).
                catch(err => {
                    console.error("sheep action error", err)
                })
            ), 
            intervalTime
        );
        return interval;
    };
    self.stop = function () {
        clearInterval(interval);
    }
    self.cycleCallback = sheepTickCallback;
    self.db.each(function (doc) {
        manySheep.push(new OneSheep(doc));
        self.cycleCallback(doc);
    }, function () {
        self.start();
    });
}