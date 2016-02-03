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
			event: new m.EventEmitter()
		};
		socket.on('disconnect', function () {
			console.log("someone disconnected");
			delete m.session[socket.id];
		});

		for (i in channels) {
			channels[i](m, m.session[socket.id]);
		}

	});
}