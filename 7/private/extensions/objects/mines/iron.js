function Iron (params) {
    var self = this;
    var maxBits = 128;
    var bitIntervalTime = 10000;
    var interval = void 0;
    self._id = params._id;
    self.place = params.place;
    self.bits = params.bits;
    self.name = "iron";
    function bitInterval() {
        if (self.bits < maxBits) {
            self.bits += 1;
            if (typeof params.callback === 'function') {
                params.callback({
                    _id: self._id,
                    name: self.name,
                    place: self.place,
                    bits: self.bits
                });
            }
        }
    }
    self.start = function () {
        if (interval !== void 0) {
            self.stop();
        }
        interval = setInterval(bitInterval, bitIntervalTime);
    };
    self.stop = function () {
        clearInterval(interval);
        interval = void 0;
    };
}

module.exports = Iron;