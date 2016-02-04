var content = {
	login: null,
	game: null
}

module.exports = function (m, session) {
	var socket = session.socket;
	function sendLoginForm() {
		socket.emit("content", {
			selector: "#canvas",
			html: content.login || (content.login = m.fs.readFileSync(m.root + '/protected/login.html', 'utf8'))
		});
	}
	function sendGame() {
		socket.emit("content", {
			selector: "#canvas",
			html: content.game || (content.game = m.fs.readFileSync(m.root + '/protected/game.html', 'utf8'))
		});
	}
	if (!socket.request.cookies.sessionID) {
		sendLoginForm();
	}

	session.event.on("logged_in", function (success) {
		if (success === true) {
			sendGame();
		} else {
			sendLoginForm();
		}
	});
}