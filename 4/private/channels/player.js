var exec = {
	up: function (player) {
		player.game.y -= 7.5;
	},
	down: function (player) {
		player.game.y += 7.5;
	},
	left: function (player) {
		player.game.x -= 7.5;
	},
	right: function (player) {
		player.game.x += 7.5;
	}
};

module.exports = function (m, session) {
	var socket = session.socket;
	var player;
	var intervalTime = 100;
	var lastCmdTime = 0;

	function updatePlayer () {
		m.db.users.update({
			'username': player.username
		}, {
			$set: {game: player.game}
		}, {multi: false});
		m.event.emit('player-update', player);
	}

	function initPlayer () {
		var userId, other;
		socket.emit('player', {username: player.username, game: player.game});
		for (userId in m.session) {
			if (userId === session.id || m.session[userId].user === void 0) {
				continue;
			}
			other = m.session[userId].user;
			socket.emit('others-update', {username: other.username, game: other.game});
		}
	}
	session.event.on('logged_in', function (result) {
		if (result === true) {
			player = session.user;
		}
	});

	socket.on('game-ready', function () {
		if (player) {
			initPlayer();
		} else {
			session.event.on('logged_in', function (result) {
				if (result === true) {
					initPlayer();
				}
			});
		}
	});
	socket.on('player-input', function (data) {
		var now = Date.now();
		var lag = now - data.time;
		var cmd = data.action;

		console.log('cmd:', cmd, 'lag:', lag, 'step:', data.step);
		if (cmd in exec) {
			if ((lastCmdTime + intervalTime) > now) {
				console.log("Client moving too fast!", lastCmdTime, now);
			} else if (isNaN(lag) || lag < 0) {
				console.log("Client supplied invalid lag data!", data.lag);
			} else {
				exec[cmd](player);
			}
			lastCmdTime = now;
			
			socket.emit('player-move', {game: player.game, time: now - lag, step: data.step});
			updatePlayer();
		} else if (cmd === 'still') {
			//m.event.emit('player-update', player);
		}
	});
}