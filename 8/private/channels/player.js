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
function calcLvlXp (lvl) {
    var i, xp = 100, multi = 1.3;
    for (i = 1; i < lvl; i += 1) {
        xp *= multi;
    }
    return xp;
}
function setXpAfterDeath (game, skill) {
	var penaltyPerc = 0.09; // 9%
	var nextLvlXp = calcLvlXp(game.skills[skill].level);
	var penalty = penaltyPerc * nextLvlXp;
	var leftoverPenalty = 0;
	if ((game.skills[skill].experience - penalty) > 0) {
		game.skills[skill].experience -= penalty;
	} else if (game.skills[skill].level > 1) {
		game.skills[skill].level -= 1;
		leftoverPenalty = penalty - game.skills[skill].experience;
		game.skills[skill].experience = calcLvlXp(game.skills[skill].level) - leftoverPenalty;
	}
}
function intersects (a, b) {
    return !(a.x + a.w < b.x ||
        a.y + a.h < b.y ||
        b.x + b.w < a.x ||
        b.y + b.h < a.y);
}
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
	var hitIntervalTime = 500;
	var hitInterval = null;
	var isDead = false;
	var weaponMaxHit = 1;

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
	function hitIntervalFunction () {
		var playerRect, otherRect, userId, other, maxHit, hit;
		if (!player.hitMode) {
			return;
		}
		console.log(player.username, "hitting!");
		playerRect = {
	        x: player.game.x - 50,
	        y: player.game.y - 40,
	        w: 100,
	        h: 70
	    };
	    otherRect = {
	        x: player.game.x - 50,
	        y: player.game.y - 40,
	        w: 100,
	        h: 70
	    };
	    maxHit = weaponMaxHit + (player.game.skills.melee.level * 0.3);
	    hit = parseFloat((Math.random() * maxHit).toFixed(1));
	    for (userId in m.session) {
			if (userId === session.id || m.session[userId].user === void 0) {
				continue;
			}
			other = m.session[userId].user;
			otherRect.x = other.game.x - 50;
			otherRect.y = other.game.y - 40;
			if (intersects(playerRect, otherRect)) {
				console.log(other.username, hit);
				other.game.wellness.hp -= hit;
				player.game.skills.melee.experience += Math.ceil(hit);
				other.game.skills.life.experience += Math.ceil(hit);
				if (player.game.skills.melee.experience >= calcLvlXp(player.game.skills.melee.level)) {
					player.game.skills.melee.level += 1;
					player.game.skills.melee.experience = 0;
				}
				if (other.game.skills.life.experience >= calcLvlXp(other.game.skills.life.level)) {
					other.game.skills.life.level += 1;
					other.game.skills.life.experience = 0;
				}
				m.db.users.update({
					'username': other.username
				}, {
					$set: {game: other.game}
				});
				m.db.users.update({
					'username': player.username
				}, {
					$set: {game: player.game}
				});
				if (other.game.wellness.hp <= 0) {
					m.session[userId].event.emit('death-1');
				}
				m.event.emit('player-update', other);
				m.session[userId].socket.emit('player-move', {game: other.game});
				session.socket.emit('player-move', {game: player.game});
			}
		}

	}
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
					gear: other.game.gear,
	                wellness: {
	                    hp: other.game.wellness.hp
	                }
				}, hitMode: other.hitMode, maxHp: other.game.skills.life.level * 10});
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
        setXpAfterDeath(player.game, 'life');
        setXpAfterDeath(player.game, 'medic');
        setXpAfterDeath(player.game, 'melee');
        isDead = false;
        socket.emit('player-move', {game: player.game});
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
				if (hitInterval === null && player.hitMode) {
					hitInterval = setInterval(hitIntervalFunction, hitIntervalTime);
				} else if (hitInterval !== null && !player.hitMode) {
					clearInterval(hitInterval);
					hitInterval = null;
				} 
			}
			lastCmdTime = now;
			
			socket.emit('player-move', {game: player.game, time: now - lag, step: data.step});
			updatePlayer();
		}
	});
}