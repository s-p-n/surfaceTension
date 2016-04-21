function Ai() {
    "use strict";
    var self = this;
    var feedbackLoops = [];
    self.alive = true;
    function doFeedback(fn) {
        if (self.alive) {
            fn.cycle();
        }
    }
    self.createFeedback = function (Fn) {
        feedbackLoops.push(new Fn(self));
    };
    self.cycle = function () {
        feedbackLoops.forEach(doFeedback);
    };
}
module.exports = Ai;