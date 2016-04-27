"use strict";
var Brain = require('./brain.js');

function isClose (me, destination) {
    return !(me[0] + 50 < destination[0] ||
        me[1] + 25 < destination[1] ||
        destination[0] + 25 < me[0] ||
        destination[1] + 25 < me[1]);
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
        var destination = ai.memories.destination;
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

function FindDestination(ai) {
    var self = this;
    var lastPlace = [0, 0];
    copyPlace(ai.memories.place, lastPlace);
    ai.memories.destination = [0, 0];
    copyPlace(ai.memories.place, ai.memories.destination);
    function xInBounds (x) {
        return x > ai.memories.bounds[0] && x < ai.memories.bounds[2];
    }
    function yInBounds (y) {
        return y > ai.memories.bounds[1] && y < ai.memories.bounds[3];
    }
    function newDestination () {
        var place = ai.memories.place;
        var dest = randPlaceInBounds(ai.memories.bounds);
        ai.memories.destination = dest;
    }
    self.cycle = function () {
        if (checkPlaces(lastPlace, ai.memories.place)) {
            ai.addDecision({
                weight: 4,
                action: newDestination,
                title: 'find destination'
            });
        }
        copyPlace(ai.memories.place, lastPlace);
    }
}

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
    self.brain.left.createFeedback(FindDestination);
    self.brain.left.createFeedback(WalkTowards);
    self.cycle = function () {
        self.doc.place = memories.place;
        return self.brain.cycle();
    }
}

module.exports = Wolf;