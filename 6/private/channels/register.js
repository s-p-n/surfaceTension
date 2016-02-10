var expected = {
	'username' : /^[a-zA-Z][a-zA-Z0-9-_\.]{1,20}$/,
	'password' : /^.{5,512}$/
}
module.exports = function (m, session) {
	var socket = session.socket;
	socket.on('register', function (data) {
		socket.emit('login', {'status': "Processing Registration.."});
		console.log("Processing Registration..");
		console.log(data.username, socket.id);
		var result = m.form.process(expected, data);
		
		if (result === false) {
			console.log("Register Error: incompatible input");
			socket.emit('login', {'status': "(4) No Bueno.", 'code': 4});
			return;
		}
		m.db.users.findOne({
			username: result.username
		}, function (err, user) {
			if (err) {
				socket.emit('login', {'status': "(5) No Bueno.", 'code': 5});
				return;
			}
			if (user !== null) {
				socket.emit('login', {'status': "(6) Username already exists.", 'code': 6});
				return;
			} else {
				var myKey = false;
				if (result.keepMeIn) {
					myKey = m.form.hash(Date.now() + '' + Math.random() + socket.id);
					socket.emit('cookie', {'name': 'sessionID', 'value': myKey, 'days': 14});
				}
				m.db.users.insert({
					username: result.username, 
					password: m.form.hash(result.password),
					key: myKey,
					game: {x: 250, y: 250, inventory: []}
				}, function (err, user) {
					session.user = user;
					session.event.emit('logged_in', true);
				});
			}
		});
	});
}