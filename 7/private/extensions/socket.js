var cookieParser = require('socket.io-cookie-parser');
module.exports = function (m) {
	var io = m.io;
	var channels = [];
	var dir = m.fs.readdirSync('./private/channels');
	for (index in dir) {
		channels.push(require('../channels/' + dir[index]));
	}
	io.use(cookieParser());
	io.on('connection', function (socket) {
		var i;
		console.log("someone connected.");
		m.session[socket.id] = {
			id: socket.id,
			socket: socket,
			state: 1,
			event: new m.EventEmitter(),
			state4Broadcast: function state4Broadcast(name, data) {
				var id, sess;
				for (id in m.session) {
					sess = m.session[id];
					if (sess.state === 4) {
						sess.socket.emit(name, data);
					}
				}
			}
		};
		socket.on('disconnect', function () {
			console.log("someone disconnected");
			if (m.session[socket.id].state === 4) {
				m.session[socket.id].state4Broadcast(
					'player-disconnect', 
					m.session[socket.id].user.username
				);
			}
			delete m.session[socket.id];
		});

		for (i in channels) {
			channels[i](m, m.session[socket.id]);
		}

	});
}