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
	var intervalTime = 75;
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
		session.state = 4;
		session.event.emit('game-ready', true);
		socket.emit('player', {username: player.username, game: player.game});
		m.event.emit('player-update', player);
		for (userId in m.session) {
			if (userId === session.id || m.session[userId].user === void 0) {
				continue;
			}
			other = m.session[userId].user;
			socket.emit('others-update', {username: other.username, game: {
				x: other.game.x,
				y: other.game.y,
				gear: other.game.gear
			}});
		}
	}
	session.event.on('logged_in', function (result) {
		if (result === true) {
			player = session.user;
			session.state = 3;
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
		if (session.state !== 4) {
			return;
		}
		console.log('cmd:', cmd, 'lag:', lag, 'step:', data.step);
		if (cmd in exec) {
			if ((lastCmdTime + intervalTime) > now * 2) {
				console.log("Client moving too fast!", lastCmdTime, now);
			//} else if (isNaN(lag) || lag < 0) {
			//	console.log("Client supplied invalid lag data!", data.time);
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