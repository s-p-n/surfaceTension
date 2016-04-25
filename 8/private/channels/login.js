var expected = {
	'username' : /^[a-zA-Z][a-zA-Z0-9-_\.]{1,20}$/,
	'password' : /^.{5,512}$/,
	'keepMeIn' : /^true|false$/
}
module.exports = function (m, session) {
	var socket = session.socket;

	if (socket.request.cookies.sessionID) {
		m.db.users.findOne({
			key: socket.request.cookies.sessionID
		}, function (err, user) {
			if (err) {
				console.log(err);
				return;
			}
			if (user !== null) {
				console.log("logged in via cookie")
				session.user = user;
				session.event.emit('logged_in', true);
			} else {
				console.log("cookie was invalid.");
				session.event.emit('logged_in', false);
			}
		});
	}

	socket.on("login", function (data) {
		socket.emit('login', {'status': "Processing Login.."});
		console.log("Processing Login..");
		console.log(data.username, socket.id);
		var result = m.form.process(expected, data);
		
		if (result === false) {
			console.log("Login Error: incompatible input");
			socket.emit('login', {'status': "(1) No Bueno.", 'code': 1});
			return;
		}
		result.keepMeIn = JSON.parse(result.keepMeIn);
		m.db.users.findOne({
			username: result.username
		}, function (err, user) {
			if (err) {
				console.log('login', {'status': "(2) No Bueno."});
				socket.emit('login', {'status': "(2) No Bueno.", 'code': 2});
				return;
			}
			
			if (user === null || !m.form.compare(result.password, user.password)) {
				console.log('login', {'status': "(3) Unable to find user."});
				socket.emit('login', {'status': "(3) Unable to find user.", 'code': 3});
				return;
			}
			session.user = user;
			console.log("User:", user.username);
			session.event.emit('logged_in', true);
			var myKey = false;
			if (result.keepMeIn) {
				myKey = m.form.hash(Date.now() + '' + Math.random() + socket.id);
				socket.emit('cookie', {'name': 'sessionID', 'value': myKey, 'days': 14});
			}
			m.db.users.update({username: result.username}, {$set: {key: myKey, 'game.spawn': [user.game.x, user.game.y]}}, {multi: false});
		});
	});
};
