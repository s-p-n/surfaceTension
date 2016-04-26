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

var itemStats = {
	'slire_roll': {
		'hunger': 10,
		'hp': 4
	}
};

module.exports = function (m, session) {
	var socket = session.socket;
	var player;
	var intervalTime = 75;
	var lastCmdTime = 0;
	var hungerIntervalTime = 5000;
	var hungerInterval = null;
	var isDead = false;

	function handleDeath () {
		if (isDead || player.game.wellness.hp > 0) {
			return false;
		}
		isDead = true;
		session.event.emit('death-1');
		return true;
	}

	function updatePlayer () {
		var sect;
		
		if (handleDeath()) {
			return;
		}
		
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
	socket.on('disconnect', function () {
		if (hungerInterval !== null) {
			clearInterval(hungerInterval);
			hungerInterval = null;
		}
	});
	function hungerIntervalFunction () {
		var maxHP = player.game.skills.life.level * 10;
		if (player.game.wellness.hunger < 100) {
			player.game.wellness.hunger += 1;
		} else {
			player.game.wellness.hp -= 1;
		}
		if (player.game.eatQueue !== null) {
			if (player.game.wellness.hunger > (.75 * itemStats[player.game.eatQueue.name].hunger) ||
				(maxHP - player.game.wellness.hp) > (.75 * itemStats[player.game.eatQueue.name].hp)
			) {
				player.game.wellness.hunger -= itemStats[player.game.eatQueue.name].hunger;
				player.game.wellness.hp += itemStats[player.game.eatQueue.name].hp;
				if (player.game.eatQueue.num > 1) { 
					player.game.eatQueue.num -= 1;
				} else {
					player.game.eatQueue = null;
				}
				m.db.users.update({id: player._id}, {$set:{
					'game.eatQueue': player.game.eatQueue
				}});
				socket.emit('eatqueue-update', player.game.eatQueue)
			}
		}
		if (player.game.wellness.hunger < 0) {
			player.game.wellness.hunger = 0;
		}
		if (player.game.wellness.hp > maxHP) {
			player.game.wellness.hp = maxHP;
		}
		socket.emit('player-wellness', player.game.wellness);
		updatePlayer();
	}

	function initPlayer () {
		var userId, other;
		session.state = 4;
		player.section = m.map.getSection([player.game.x, player.game.y]);
		player.hitMode = false;
		hungerInterval = setInterval(hungerIntervalFunction, hungerIntervalTime);
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
	session.event.on('death-2', function () {
		player.game.x = player.game.spawn[0];
		player.game.y = player.game.spawn[1];
		player.game.wellness = {
			"hp": player.game.skills.life.level * 10,
			"hunger": 0,
			"infection" : {
                    "minor" : [],
                    "normal" : [],
                    "chronic" : []
            },
            "illness" : {
                    "minor" : [],
                    "normal" : [],
                    "chronic" : []
            },
            "disease" : {
                    "minor" : [],
                    "normal" : [],
                    "chronic" : []
            }
        };
        isDead = false;
        updatePlayer();
	})
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