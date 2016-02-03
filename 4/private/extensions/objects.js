var Herbs = require('./objects/herbs.js');
module.exports = function (m) {
	m.game.objects = {herbs: []};
    var herbs = new Herbs(m, function (herb) {
        m.game.objects.herbs.push(herb);
        m.event.emit('herb-created', herb);
        console.log("herb created:", herb);
    });
}