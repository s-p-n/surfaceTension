var bcrypt = require('bcrypt');
//console.log(bcrypt.genSaltSync(7, 10));
var form = {
	process: function (expected, data) {
		var key;
		var i = 0;
		var result = {};
		for (key in expected) {
			if (!data[i] || !(data[i].name in expected) || 
				data[i].value.match(expected[key]) === null
			) {
				return false;
			}
			result[data[i].name] = data[i].value;
			i += 1;
		}
		return result;
	},
	hash: function (str) {
		return bcrypt.hashSync(str, 10);
	},
	compare: function (pass, hash) {
		return bcrypt.compareSync(pass, hash);
	}
};
module.exports = function (m) {
	m.form = form;
};
