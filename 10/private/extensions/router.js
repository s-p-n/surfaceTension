var cookieParser = require('cookie-parser');
module.exports = function (m) {
	var express = m.express;
	var app = m.app;

	app.use(cookieParser());

	app.get('/', function (req, res) {
		//console.log('cookies:', req.cookies);
		res.sendFile(m.root + '/public/index.html');
	});
	app.get('/login', function (req, res) {
		res.sendFile(m.root + '/protected/login.html')
	});
	app.get('/logout', function (req, res) {
		res.redirect('/')
	});
	app.use(express.static(m.root + '/public'));
}