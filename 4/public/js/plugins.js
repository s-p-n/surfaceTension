function Plugins() {
    "use strict";
    var self = this;
    var args = Array.apply(null, arguments);
    var preloads = [];
    var creates = [];
    var updates = [];
    var renders = [];
    function run (fn) {
        fn();
    }
    self.add = function (plugin) {
        if (typeof plugin.preload === 'function') {
            preloads.push(plugin.preload);
        }
        if (typeof plugin.create === 'function') {
            creates.push(plugin.create);
        }
        if (typeof plugin.update === 'function') {
            updates.push(plugin.update);
        }
        if (typeof plugin.render === 'function') {
            renders.push(plugin.render);
        }
    };
    self.preload = function () {
        preloads.forEach(run);
    };
    self.create = function () {
        creates.forEach(run);
    };
    self.update = function () {
        updates.forEach(run);
    };
    self.render = function () {
        renders.forEach(run);
    };
    args.forEach(self.add);
}