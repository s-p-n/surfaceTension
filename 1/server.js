var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var events = require('events');
var fs = require('fs');
var port = 8080;

var main = {
	app: app,
	EventEmitter: events.EventEmitter,
	event: new events.EventEmitter(),
	express: express,
	fs: fs,
	io: io,
	root: __dirname,
	session: {}
};

require('./private/init.js')(main);

http.listen(port, function () {
	console.log('listening on *:' + port);
});