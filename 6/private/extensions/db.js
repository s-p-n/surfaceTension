var db = require('mongojs')('surfaceTension', ['users', 'sheep', 'herbs']);
module.exports = function (m) {
	m.db = db;
};
db.on('error', function (err) {
    console.log('database error', err)
});

db.on('connect', function () {
    console.log('database connected')
});