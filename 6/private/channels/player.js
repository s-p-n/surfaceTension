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

function Inventory (main, session) {
	"use strict";
	var player = session.user;
	var socket = session.socket;
	var db = main.db;
	var self = this;
	self.items = player.game.inventory;
    self.add = function (item) {
        var i, firstEmptySlot = 30;
        for (i = 0; i < 30; i += 1) {
            if (self.items[i] !== void 0 && 
                self.items[i].name === item && 
                self.items[i].num < 64
            ) {
                self.items[i].num += 1;
            	self.update();
                return true;
            }
            if (self.items[i] === void 0 && firstEmptySlot === 30) {
                firstEmptySlot = i;
            }
        }
        if (firstEmptySlot === 30) {
            return false;
        }
        console.log('first empty slot:', firstEmptySlot);
        self.items[firstEmptySlot] = {
            name: item,
            num: 1
        };
        console.log('items:', self.items);
        self.update();
        return true;
    };
    self.remove = function (id) {
    	if (self.items[id].num > 1) {
    		self.items[id].num -= 1;
    	} else if (self.items[id].num === 1) {
    		self.items.splice(id, 1);
    	} else {
    		return false;
    	}
    	self.update();
    	return true;
    };
    self.update = function () {
    	console.log('inventory update:');
    	console.log(player._id, self.items);
    	db.users.update({_id: player._id}, {$set: {'game.inventory': self.items}});
    	socket.emit('inventory-update', self.items);
    }
}

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
		session.state = 4;
		session.user.inventory = new Inventory(m, session);
		session.event.emit('game-ready', true);
		socket.emit('player', {username: player.username, game: player.game});
		for (userId in m.session) {
			if (userId === session.id || m.session[userId].user === void 0) {
				continue;
			}
			other = m.session[userId].user;
			socket.emit('others-update', {username: other.username, game: {
				x: other.game.x,
				y: other.game.y
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