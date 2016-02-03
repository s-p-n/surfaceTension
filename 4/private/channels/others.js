module.exports = function (m, session) {
	var socket = session.socket;
	m.event.on('player-update', function (player) {
		if (session.user && session.user.username !== player.username) {
			//console.log('player updated:', player);
			socket.emit('others-update', {username: player.username, game: player.game});
		}
	});
}