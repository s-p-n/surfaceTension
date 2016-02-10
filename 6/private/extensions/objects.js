var Herbs = require('./objects/herbs.js');
module.exports = function (m) {
	m.game.objects = {herbs: {}};
    var herbs = new Herbs(m, function (herb) {
        m.game.objects.herbs[herb._id] = herb;
        m.event.emit('herb-created', herb);
        console.log('herb created:', herb);
    });
    m.event.on('herb-picked', function (data) {
        var id = data.herb._id;
        var herb = m.game.objects.herbs[id];
        if (data.player.inventory.add(data.herb.name)) {
            herbs.remove(data.herb);
            delete m.game.objects.herbs[id];
            m.event.emit('herb-deleted', id);
        }
    });
    m.event.on('herb-planted', function (data) {
        console.log("saving herb:", data);
        herbs.add(data, function (err, herb) {
            if (err) {
                console.log("Insert error!");
                console.error(err);
                return;
            }
            console.log("herb created(2):", herb);
            m.game.objects.herbs[herb._id] = herb;
            m.event.emit('herb-created', herb);
        });
    });
}