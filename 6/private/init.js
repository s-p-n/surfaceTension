module.exports = function (m) {
	var dir = m.fs.readdirSync('./private/extensions');
	var index;
	for (index in dir) {
		if (dir[index].match(/[a-z]\.js/)) {
			require('./extensions/' + dir[index])(m);
		}
	}
};