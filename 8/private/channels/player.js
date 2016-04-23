var exec = {
	up: function (player, m) {
		if (player.game.y - 7.5 > 0) {
			player.game.y -= 7.5;
		}
	},
	down: function (player, m) {
		if (player.game.y + 7.5 < m.map.bounds[1]) {
			player.game.y += 7.5;
		}
	},
	left: function (player, m) {
		if (player.game.x - 7.5 > 0) {
			player.game.x -= 7.5;
		}
	},
	right: function (player, m) {
		if (player.game.x + 7.5 < m.map.bounds[0]) {
			player.game.x += 7.5;
		}
	},
	startHit: function (player, m) {
		player.hitMode = true;
	},
	stopHit: function (player, m) {
		player.hitMode = false;
	}
};



module.exports = function (m, session) {
	var socket = session.socket;
	var player;
	var intervalTime = 75;
	var lastCmdTime = 0;

	function updatePlayer () {
		var sect;
		m.db.users.update({
			'username': player.username
		}, {
			$set: {game: player.game}
		}, {multi: false});
		sect = m.map.getSection([player.game.x, player.game.y]);
		if (player.section !== sect) {
			player.section = sect;
			session.event.emit('game-ready', true);
		}
		m.event.emit('player-update', player);
	}

	function initPlayer () {
		var userId, other;
		session.state = 4;
		player.section = m.map.getSection([player.game.x, player.game.y]);
		player.hitMode = false;
		session.event.emit('game-ready', true);
		socket.emit('player', {username: player.username, game: player.game});
		m.event.emit('player-update', player);
		for (userId in m.session) {
			if (userId === session.id || m.session[userId].user === void 0) {
				continue;
			}
			other = m.session[userId].user;
			//if (other.section === player.section) {
				socket.emit('others-update', {username: other.username, game: {
					x: other.game.x,
					y: other.game.y,
					gear: other.game.gear
				}});
			//}
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
		if (cmd in exec) {
			if ((lastCmdTime + intervalTime) > now * 2) {
			} else {
				exec[cmd](player, m);
			}
			lastCmdTime = now;
			
			socket.emit('player-move', {game: player.game, time: now - lag, step: data.step});
			updatePlayer();
		}
	});
}