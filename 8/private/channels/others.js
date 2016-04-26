module.exports = function (m, session) {
	var socket = session.socket;
	m.event.on('player-update', function (player) {
		if (session.state === 4 && player.username !== session.user.username /*&& player.section === session.user.section*/) {
			//console.log('player updated:', player);
			socket.emit('others-update', {username: player.username, game: {
                x: player.game.x,
                y: player.game.y,
                gear: player.game.gear,
                wellness: {
                    hp: player.game.wellness.hp
                },
            }, hitMode: player.hitMode, maxHp: player.game.skills.life.level * 10});
		}
	});
}