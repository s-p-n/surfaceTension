var content = {
	register: null,
	loginOption: null,
	game: null
}

module.exports = function (m, session) {
	var socket = session.socket;
	let url = socket.request.headers.referer.match(/\/[^\/]*$/)[0]
	let gameSent = false;
	function sendLoginOption() {
		socket.emit("content", {
			selector: "#account",
			html: content.loginOption || (content.loginOption = m.fs.readFileSync(m.root + '/protected/loginOption.html', 'utf8'))
		});
	}
	function sendLogoutOption () {
		socket.emit("content", {
			selector: "#account",
			html: content.logoutOption || (content.logoutOption = m.fs.readFileSync(m.root + '/protected/logoutOption.html', 'utf8'))
		});
	}
	function sendRegisterForm() {
		socket.emit("content", {
			selector: "#top",
			html: (content.register || (content.register = m.fs.readFileSync(m.root + '/protected/register.htm', 'utf8'))).replace(/\%username\%/g, session.user.username)
		});
	}
	function sendGame() {
		if (!gameSent) {
			gameSent = true
		
			socket.emit("content", {
				selector: "#canvas",
				html: content.game || (content.game = m.fs.readFileSync(m.root + '/protected/game.html', 'utf8'))
			});
		} else {
			//console.log("game already sent, skipped.")
		}
	}

	socket.on("show-register", sendRegisterForm);

	if (url !== '/login' && !socket.request.cookies.sessionID) {
		sendLoginOption()
		process.nextTick(function () {
			//console.log("No session ID, setting up guest")
			session.event.emit("setup-guest");
		});
	}

	session.event.on("logged_in", function (success) {
		if (success === true) {
			if (session.user.password === false) {
				sendLoginOption();
			} else {
				sendLogoutOption();
			}
			sendGame();
		} else {
			sendLoginForm();
		}
	});
}