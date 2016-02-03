var Ai = require('./ai');
module.exports = (function () {
    "use strict";
    function nil() {
        return;
    }
    function Decision(ai) {
        var self = this;
        ai.decisions = [];
        ai.addDecision = function (dec) {
            var decision = {
                title: dec.title || "unknown",
                weight: dec.weight || 0,
                args: dec.args || [],
                action: dec.action || nil
            };
            ai.decisions.push(decision);
        };
        self.cycle = function () {
            ai.decisions = [{
                weight: 0,
                action: nil,
                title: "do nothing"
            }];
        };
    }
    function Remember(ai) {
        var self = this;
        ai.memories = {};
        self.cycle = nil;
    }
    return function Brain() {
        var self = this;
        self.right = new Ai();
        self.left = new Ai();
        self.left.sync = function (prop) {
            var chain = prop.split('.');
            var i;
            var l = self.left;
            var r = self.right;
            for (i = 0; i < chain.length - 1; i += 1) {
                r = r[chain[i]];
                l = l[chain[i]];
            }
            r[chain[chain.length - 1]] = l[chain[chain.length - 1]];
        };
        self.right.sync = function (prop) {
            var chain = prop.split('.');
            var i;
            var l = self.left;
            var r = self.right;
            for (i = 0; i < chain.length - 1; i += 1) {
                r = r[chain[i]];
                l = l[chain[i]];
            }
            l[chain[chain.length - 1]] = r[chain[chain.length - 1]];
        };
        function findDecision(list) {
            var i;
            var decision = list[0];
            for (i = 0; i < list.length; i += 1) {
                if (decision.weight < list[i].weight) {
                    decision = list[i];
                }
            }
            return decision;
        }
        function decide() {
            var decision;
            var context;
            var lDecision = findDecision(self.left.decisions);
            var rDecision = findDecision(self.right.decisions);
            if (!self.left.alive || !self.right.alive) {
                return;
            }
            if (lDecision.weight < rDecision.weight) {
                decision = rDecision;
                context = "right";
            } else {
                decision = lDecision;
                context = "left";
            }
            self[context].memories.lastAction = decision.title;
            return decision.action.apply(self[context], decision.args);
        }
        self.createFeedback = function (fn) {
            self.right.createFeedback(fn);
            self.left.createFeedback(fn);
        };
        self.cycle = function () {
            self.right.cycle();
            self.left.cycle();

            return decide();
        };
        self.createFeedback(Remember);
        self.createFeedback(Decision);
    };
}());