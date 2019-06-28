"use strict";
var Brain = require('./brain.js');

// Possible drops for this mob- cumulative.
// 'item_name': (Integer 1-1000 where higher is more likely)
var drops = {
    'wool': 1000
}

function isClose (me, destination) {
    return !(me[0] + 50 < destination[0] ||
        me[1] + 25 < destination[1] ||
        destination[0] + 25 < me[0] ||
        destination[1] + 25 < me[1]);
}
function deserializePlace (serialPlace) {
    return serialPlace.split(',');
}
function allowedInPlace (place, m) {
    var serialPlace, itemRect;
    var myRect = myRectFromPlace(place);
    for (serialPlace in m.map.impassable) {
        itemRect = itemRectFromSerialPlace(serialPlace);
        if (intersects(myRect, itemRect)) {
            //console.log(myRect, "not allowed in place", itemRect);
            return false;
        }
    }
    return true;
}
function itemRectFromSerialPlace (serialPlace) {
    var place = deserializePlace(serialPlace);
    return {
        x: parseInt(place[0])+1,
        y: parseInt(place[1])+1,
        w: 23,
        h: 23
    };
}
function myRectFromPlace (place) {
    return {
        x: parseInt(place[0])+1,
        y: parseInt(place[1])+1,
        w: 50,
        h: 32
    };
}
function intersects (a, b) {
    return !(a.x + a.w < b.x ||
        a.y + a.h < b.y ||
        b.x + b.w < a.x ||
        b.y + b.h < a.y);
}

function canSee (me, destination) {
    return !(me[0] + 250 < destination[0] ||
        me[1] + 250 < destination[1] ||
        destination[0] + 250 < me[0] ||
        destination[1] + 250 < me[1]);
}

function calcLvlXp (lvl) {
    var i, xp = 100, multi = 1.3;
    for (i = 1; i < lvl; i += 1) {
        xp *= multi;
    }
    return xp;
}

function eatHerb (me, herb) {
    console.log(herb)
}

function hitUser (my, user, hit) {
    user.game.wellness.hp -= hit;
    my.skills.melee.experience += Math.round(hit);
    my.skills.life.experience += Math.round(hit/2);
    user.game.skills.life.experience += Math.round(hit/2);
    if (my.skills.melee.experience >= calcLvlXp(my.skills.melee.level)) {
        my.skills.melee.level += 1;
        my.skills.melee.experience = 0;
    }
    if (my.skills.life.experience >= calcLvlXp(my.skills.life.level)) {
        my.skills.life.level += 1;
        my.skills.life.experience = 0;
    }
    if (user.game.skills.life.experience >= calcLvlXp(user.game.skills.life.level)) {
        user.game.skills.life.level += 1;
        user.game.skills.life.experience = 0;
    }
}

function handleDrops (m, place) {
    var itemName, item = {name: '', place: place}, r;
    for (itemName in drops) {
        r = Math.ceil(Math.random() * 1000);
        //console.log("drop info:");
        //console.log(itemName, "needs less than", drops[itemName], "and got", r);
        if(drops[itemName] >= r) {
            item.name = itemName;
            m.game.objects.groundItems.instance.add(item);
        }
    }
}

function targetDest (target) {
    return [target.place[0], target.place[1]];
}

function getClosest (me, a, b) {
    var aDist = Math.abs((a.place[0] + a.place[1]) - (me[0] + me[1]));
    var bDist = Math.abs((b.place[0] + b.place[1]) - (me[0] + me[1]));
    if (aDist < bDist) {
        return a;
    }
    return b;
}

function randPlaceInBounds (bounds, curPlace) {
    var highX = (bounds[0] - 50);
    var highY = (bounds[1] - 50);
    var lowX = 25;
    var lowY = 25;
    var maxMove = 250;
    if ((curPlace[0] - maxMove) > lowX) {
        lowX = curPlace[0] - maxMove;
    }
    if ((curPlace[1] - maxMove) > lowY) {
        lowY = curPlace[1] - maxMove;
    } 
    if ((curPlace[0] + maxMove) < highX) {
        highX = curPlace[0] + maxMove;
    }
    if ((curPlace[1] + maxMove) < highY) {
        highY = curPlace[1] + maxMove;
    }
    return [
        Math.floor((Math.random() * highX) + lowX), 
        Math.floor((Math.random() * highY) + lowY)
    ];
}

function checkPlaces (p1, p2) {
    return (p1[0] === p2[0]) && (p1[1] === p2[1]);
}

function copyPlace (p1, p2) {
    p2[0] = p1[0];
    p2[1] = p1[1];
}

function WalkTowards(ai) {
    var self = this;
    var walkSpeed = 7.5;
    var lastPlace = [25, 25];
    if (!ai.memories.place) {
        ai.memories.place = lastPlace;
    }
    copyPlace(ai.memories.place, lastPlace);
    function canWalk () {
        return allowedInPlace(ai.memories.place, ai.memories.main)
    }
    function walk () {
        var destination;
        if (ai.memories.target) {
            destination = targetDest(ai.memories.target);
        } else {
            destination = ai.memories.destination;
        }
        var place = ai.memories.place;
        var xDistance = Math.abs(place[0] - destination[0]);
        var yDistance = Math.abs(place[1] - destination[1]);
        var i;
        if (xDistance > yDistance) {
            i = 0;
        } else {
            i = 1;
        }
        if (place[i] > destination[i]) {
            ai.memories.place[i] -= walkSpeed;
        } else {
            ai.memories.place[i] += walkSpeed;
        }
        if (!canWalk()) {
            copyPlace(lastPlace, ai.memories.place);
        }
    }
    function arrive () {
        ai.memories.destination;
    }
    self.cycle = function () {
        if (!isClose(lastPlace, ai.memories.destination)) {
            ai.addDecision({
                weight: 5,
                action: walk,
                title: 'move towards ' + ai.memories.destination
            });
        } else {
            ai.addDecision({
                weight: 5,
                action: function () {

                },
                title: 'arrived at ' + ai.memories.destination
            });
        }
        copyPlace(ai.memories.place, lastPlace);
    }
}

function EatHerb (ai) {
    const self = this;
    let doc = ai.memories.doc
    let eatTime = 500;
    let lastEat = Date.now();
    function eat () {
        let me, m, herb, herbs;
        if (lastEat + eatTime > Date.now()) {
            return;
        }
        lastEat = Date.now();
        me = ai.memories.doc;
        m = ai.memories.main;
        herb = ai.memories.target
        herbs = m.game.objects.herbs
        console.log("Eat:")
        console.log(me)
        console.log(herb)
        console.log(herbs[herb._id])
        herbs.instance.remove(herb)
        delete herbs[herb._id]
        console.log(herbs[herb._id])
        me.wellness.hunger = 0
        ai.memories.herb = null
    }
    self.cycle = function () {
        let doc = ai.memories.doc

        if (doc.wellness.hunger == 0) {
            // not hungry

        } else if (ai.memories.target &&
            ai.memories.main.map.inSection(ai.memories.place, ai.memories.main.map.getSection(ai.memories.target.place)) && 
            isClose(ai.memories.place, targetDest(ai.memories.target))) {
            ai.addDecision({
                weight: 25,
                action: eat,
                title: 'eat target'
            });
        }
    }
}
function FindHerb(ai) {
    var self = this;
    var lastPlace = [0, 0];
    copyPlace(ai.memories.place, lastPlace);
    ai.memories.destination = [0, 0];
    copyPlace(ai.memories.place, ai.memories.destination);
    ai.memories.target = null;
    function newDestination () {
        var place = ai.memories.place;
        var dest = [0, 0];
        var randIndex = Math.round(Math.random());
        copyPlace(place, dest);
        dest[randIndex] = randPlaceInBounds(ai.memories.bounds, place)[randIndex];
        ai.memories.destination = dest;
        console.log("Destination set:");
        console.log("From:", place, "To:", dest);
    }
    function newTarget () {
        //console.log("new target:", ai.memories.target);
    }
    function findTarget () {
        var herbId;
        var m = ai.memories.main;
        var herbs = ai.memories.main.game.objects.herbs;
        var closest = null;
        
        if(Object.keys(herbs).length > 0) {
            for (herbId in herbs) {
                if (closest === null) {
                    closest = herbs[herbId];
                    continue;
                }
                closest = getClosest(ai.memories.place, closest, herbs[herbId]);
            }
        }
        if (closest && canSee(ai.memories.place, targetDest(closest))) {
            //console.log("Found target:", closest.user.username);
            ai.memories.target = closest;
            return true;
        } else if (checkPlaces(lastPlace, ai.memories.place)) {
            newDestination();
        }
        copyPlace(ai.memories.place, lastPlace);
        
    }
    self.cycle = function () {
        //console.log("online users (me atk cycle):", ai.memories.main.game.onlineUsers);
        //console.log(!ai.memories.target)
        if (!ai.memories.target) {
            if (findTarget()) {
                /*ai.addDecision({
                    weight: 1,
                    action: newTarget,
                    title: 'found target'
                });*/
            } else if (checkPlaces(lastPlace, ai.memories.place)) {
                ai.addDecision({
                    weight: 1,
                    action: newDestination,
                    title: 'find destination'
                });
            }
            copyPlace(ai.memories.place, lastPlace);
        } else {
            if (!(ai.memories.target.id in ai.memories.main.session) ||
                !canSee(ai.memories.place, targetDest(ai.memories.target))
            ) {
                //console.log("lost target");
                ai.memories.target = null;
            } else {
                //console.log("going to target");
                /*ai.addDecision({
                    weight: 2,
                    action: WalkTowards,
                    title: 'walk towards target'
                });
                copyPlace(ai.memories.place, lastPlace);*/
            }
        }
    }
}

function AssessHealth(ai) {
    var self = this;
    var lastAssessment = Date.now();
    var assessmentInterval = 1000;
    self.cycle = function () {
        if (lastAssessment + assessmentInterval > Date.now()) {
            return;
        }
        lastAssessment = Date.now();

        // Heal HP
        if (ai.memories.doc.wellness.hp < (ai.memories.doc.skills.life.level * 10)) {
            ai.memories.doc.wellness.hp += ai.memories.doc.skills.life.level * 0.5;
        }

        // Get Hungry
        if (ai.memories.doc.wellness.hunger < 100) {
            ai.memories.doc.wellness.hunger += 1;
        } else {
            ai.memories.doc.wellness.hp -= 1
        }

        console.log("assessing wellness:", ai.memories.doc.wellness.hp, ai.memories.doc.wellness.hunger )
    }
}
/*
function FindDestination(ai) {
    var self = this;
    var lastPlace = [0, 0];
    copyPlace(ai.memories.place, lastPlace);
    ai.memories.destination = [0, 0];
    copyPlace(ai.memories.place, ai.memories.destination);
    function newDestination () {
        var place = ai.memories.place;
        var dest = [0, 0];
        var randIndex = Math.round(Math.random());
        copyPlace(place, dest);
        dest[randIndex] = randPlaceInBounds(ai.memories.bounds)[randIndex];
        ai.memories.destination = dest;
    }
    self.cycle = function () {
        if (checkPlaces(lastPlace, ai.memories.place)) {
            ai.addDecision({
                weight: 1,
                action: newDestination,
                title: 'find destination'
            });
        }
        copyPlace(ai.memories.place, lastPlace);
    }
}
*/
function Sheep (params) {
    var self = this;
    var memories;
    function optional(name, defaultValue) {
        return params[name] !== void 0 ? params[name] : defaultValue;
    }
    self.brain = new Brain();
    self.doc = params;
    memories = self.brain.left.memories;
    memories.place = self.doc.place;
    memories.doc = self.doc;
    //self.brain.left.createFeedback(FindDestination);
    //self.brain.left.createFeedback(FindHerb);
    //self.brain.left.createFeedback(EatHerb);
    //self.brain.left.createFeedback(WalkTowards);
    //self.brain.left.createFeedback(AssessHealth);
    self.cycle = function (main) {
        if (!self.brain.left.memories.bounds) {
            self.brain.left.memories.bounds = main.map.bounds;
        }
        self.doc.place = memories.place;
        self.brain.left.memories.main = main;
        return self.brain.cycle();
    }
}

module.exports = Sheep;