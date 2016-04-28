"use strict";
var Brain = require('./brain.js');

// Possible drops for this mob- cumulative.
// 'item_name': (Integer 1-1000 where higher is more likely)
var drops = {
    'wolf_tooth': 100
}

function isClose (me, destination) {
    return !(me[0] + 50 < destination[0] ||
        me[1] + 25 < destination[1] ||
        destination[0] + 25 < me[0] ||
        destination[1] + 25 < me[1]);
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

function wolfHitsUser (wolf, user, hit) {
    user.game.wellness.hp -= hit;
    wolf.skills.melee.experience += Math.round(hit);
    wolf.skills.life.experience += Math.round(hit/2);
    user.game.skills.life.experience += Math.round(hit/2);
    if (wolf.skills.melee.experience >= calcLvlXp(wolf.skills.melee.level)) {
        wolf.skills.melee.level += 1;
        wolf.skills.melee.experience = 0;
    }
    if (wolf.skills.life.experience >= calcLvlXp(wolf.skills.life.level)) {
        wolf.skills.life.level += 1;
        wolf.skills.life.experience = 0;
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
        console.log("drop info:");
        console.log(itemName, "needs less than", drops[itemName], "and got", r);
        if(drops[itemName] >= r) {
            item.name = itemName;
            m.game.objects.groundItems.instance.add(item);
        }
    }
}

function targetDest (target) {
    return [target.user.game.x, target.user.game.y];
}

function getClosest (me, a, b) {
    var aDist = Math.abs((a.user.game.x + a.user.game.y) - (me[0] + me[1]));
    var bDist = Math.abs((b.user.game.x + b.user.game.y) - (me[0] + me[1]));
    if (aDist < bDist) {
        return a;
    }
    return b;
}

function randPlaceInBounds (bounds) {
    return [
        Math.floor((Math.random() * (bounds[0] - 50)) + 25), 
        Math.floor((Math.random() * (bounds[1] - 50)) + 25)
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
    var lastPlace = [0, 0];
    copyPlace(ai.memories.place, lastPlace);
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
    }
    self.cycle = function () {
        if (!isClose(lastPlace, ai.memories.destination)) {
            ai.addDecision({
                weight: 5,
                action: walk,
                title: 'move towards'
            });
        }
        copyPlace(ai.memories.place, lastPlace);
    }
}

function AttackPrey(ai) {
    var self = this;
    var doc = ai.memories.doc;
    var hitTime = 500;
    var lastHit = Date.now();
    function attack () {
        var maxHit, hit, user, userHit, userMax, wolf, m;
        if (lastHit + hitTime > Date.now()) {
            return;
        }
        lastHit = Date.now();
        wolf = ai.memories.doc;

        m = ai.memories.main;
        maxHit = doc.skills.bite.level + (doc.skills.melee.level * 0.3);
        hit = parseFloat((Math.random() * maxHit).toFixed(1));
        user = ai.memories.target.user;
        /*
        //console.log("wolf gonna hit:", hit);
        if (user.hitMode) {
            userMax = 1 + (user.game.skills.melee.level * 0.3);
            userHit = parseFloat((Math.random() * userMax).toFixed(1));
            userHitsWolf(user, wolf, userHit);
            //console.log("user gonna hit:", userHit);
        }
        */
        
        console.log("wolf hitting " + user.username);
        wolfHitsUser(wolf, user, hit);
        m.db.users.update({
            'username': user.username
        }, {
            $set: {game: user.game}
        });
        m.db.wolves.update({
            '_id': wolf._id
        }, wolf);
        if (user.game.wellness.hp <= 0) {
            ai.memories.target.event.emit('death-1');
        }
        m.event.emit('player-update', user);
        ai.memories.target.socket.emit('player-move', {game: user.game});
    }
    function die () {
        return "kill";
    }
    self.cycle = function () {
        if (ai.memories.doc.wellness.hp < 0) {
            // If wolf is dead
            // signal to kill this wolf.
            handleDrops(ai.memories.main, ai.memories.place);
            //console.log("Wolf dead (1)");
            ai.addDecision({
                weight: 9999,
                action: die,
                title: 'die'
            });
            return;
        } else if (ai.memories.target &&
            ai.memories.main.map.inSection(ai.memories.place, ai.memories.target.user.section) && 
            isClose(ai.memories.place, targetDest(ai.memories.target))) {
            ai.addDecision({
                weight: 25,
                action: attack,
                title: 'attack target'
            });
        }
    }
}

function FindPrey(ai) {
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
        dest[randIndex] = randPlaceInBounds(ai.memories.bounds)[randIndex];
        ai.memories.destination = dest;
    }
    function newTarget () {}
    function findTarget () {
        var userId;
        var m = ai.memories.main;
        var closest = null;
        if(ai.memories.main.game.onlineUsers > 0) {
            for (userId in m.session) {
                if (m.session[userId].state !== 4) {
                    continue;
                }
                if (closest === null) {
                    closest = m.session[userId];
                    continue;
                }
                closest = getClosest(ai.memories.place, closest, m.session[userId]);
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
        //console.log("online users (wolf atk cycle):", ai.memories.main.game.onlineUsers);
        if (!ai.memories.target) {
            if (findTarget()) {
                ai.addDecision({
                    weight: 1,
                    action: newTarget,
                    title: 'found target'
                });
            } else if (checkPlaces(lastPlace, ai.memories.place)) {
                ai.addDecision({
                    weight: 1,
                    action: newDestination,
                    title: 'find destination'
                });
            }
            copyPlace(ai.memories.place, lastPlace);
        } else {
            if (ai.memories.target && (
                    !(ai.memories.target.id in ai.memories.main.session) ||
                    !canSee(ai.memories.place, targetDest(ai.memories.target))
                )
            ) {
                console.log("lost target");
                ai.memories.target = null;
            }
        }
    }
}

function Heal(ai) {
    var self = this;
    var lastHeal = Date.now();
    var healTime = 10000;
    self.cycle = function () {
        if (lastHeal + healTime > Date.now()) {
            return;
        }
        lastHeal = Date.now();
        if (ai.memories.doc.wellness.hp < (ai.memories.doc.skills.life.level * 10)) {
            ai.memories.doc.wellness.hp += ai.memories.doc.skills.life.level * 0.5;
        }
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
function Wolf (params) {
    var self = this;
    var memories;
    function optional(name, defaultValue) {
        return params[name] !== void 0 ? params[name] : defaultValue;
    }
    self.brain = new Brain();
    self.doc = params;
    memories = self.brain.left.memories;
    memories.place = self.doc.place;
    memories.bounds = [2000, 2000];
    memories.doc = self.doc;
    //self.brain.left.createFeedback(FindDestination);
    self.brain.left.createFeedback(FindPrey);
    self.brain.left.createFeedback(AttackPrey);
    self.brain.left.createFeedback(WalkTowards);
    self.brain.left.createFeedback(Heal);
    self.cycle = function (main) {
        self.doc.place = memories.place;
        self.brain.left.memories.main = main;
        return self.brain.cycle();
    }
}

module.exports = Wolf;