
const spawn = require('child_process').spawn;
const path = require('path');
const pyFile = path.join(process.cwd(), '/private/extensions/objects/sheep/sheep.py')
const py = spawn('python3', ["-u", pyFile]);
const outQueue = []
const config = {
	"siteDistance": 10,
	"tileSize": 32
};

const legend = [
	'empty',
	'self',
	'herb',
	'sheep',
	'user',
	'wolf',
	'impassable'
];


py.on("exit", function () {
	console.log("python exit:", arguments)
});
py.on("error", function () {
	console.log("python error:", arguments)
});

py.stdout.setEncoding("utf8")
py.stdout.on("data", data => data.
	split("\n").
	forEach(answer => {
		if (answer.length == 0) {
			return;
		}
		if (outQueue.length > 0) {
			return outQueue.shift()(answer);
		}
		throw "Sheep Gateway: regarding python's stdout: outQueue underflow";
	}));

function Gateway (me={
	place: [25, 25],
	color: 0xFFFFFF
}) {
	const self = this;
	self.doc = me;
	self.fieldOfView = [];
	self.thingsInView = {
		herbs: [],
		sheep: [],
		users: [],
		wolves: [],
		impassable: [],
	};
	self.printFOV = function printFOV () {
		let str = "";
		for (let x = 0; x < self.fieldOfView.length; x += 1) {
			for (let y = 0; y < self.fieldOfView[x].length; y += 1) {
				str += " " + self.fieldOfView[x][y];
			}
			str += "\n";
		}
		console.log(str);
	};
	function isClose (a, b) {
		return !(a[0] + config.tileSize < b[0] ||
		a[1] + config.tileSize < b[1] ||
		b[0] + config.tileSize < a[0] ||
		b[1] + config.tileSize < a[1]);
	}

	function getUserArray(m) {
		let users = [];
		let mySection = m.map.getSection(self.doc.place);
		if(m.game.onlineUsers > 0) {
            for (let id in m.session) {
            	let user = m.session[id].user;
                if (m.session[id].state === 4 && 
                	m.map.inSection([user.game.x, user.game.y], mySection)) {
                	users.push(user);
                } else {
                	console.log("skipped user", user.username)
                	//console.log(user)
                }
            }
        }
        return users;
	}

	function getArray(m, name) {
		let objects = m.game.objects[name];
		let mySection = m.map.getSection(self.doc.place);
		let arr = [];
		for (let id in objects) {
			let obj = objects[id];
			if (obj.place instanceof Array && 
				m.map.inSection(obj.place, mySection)) {
				arr.push(obj)
			}
		}
		return arr;
	}

	function setFOV(m) {
		let sheep = self.thingsInView.sheep = getArray(m, 'sheep');
		let herbs = self.thingsInView.herbs = getArray(m, 'herbs');
		let wolves = self.thingsInView.wolves = getArray(m, 'wolves');
		let users = self.thingsInView.users = getUserArray(m);
		let sect = m.map.sections[m.map.getSection(self.doc.place)];

		self.fieldOfView = [];
		
		for (let x = sect.x; x < sect.w; x += config.tileSize) {
			let a = (x - sect.x) / config.tileSize;
			self.fieldOfView[a] = [];
			for (let y = sect.y; y < sect.h; y += config.tileSize) {
				
				let b = (y - sect.y) / config.tileSize;
				//console.log([a,b], [x,y])
				if (m.map.impassable[[x,y]]) {
					self.fieldOfView[a][b] = legend.indexOf("impassable");

				} else if (isClose(self.doc.place, [x, y])) {
					self.fieldOfView[a][b] = legend.indexOf("self");

				} else if (sheep.some(them => isClose(them.place, [x, y]))) {
					self.fieldOfView[a][b] = legend.indexOf("sheep");

				} else if (wolves.some(them => isClose(them.place, [x, y]))) {
					self.fieldOfView[a][b] = legend.indexOf("wolf");

				} else if (users.some(them => isClose([them.game.x, them.game.y], [x, y]))) {
					self.fieldOfView[a][b] = legend.indexOf("user");

				} else if (herbs.some(them => isClose(them.place, [x, y]))) {
					self.fieldOfView[a][b] = legend.indexOf("herb");

				} else {
					self.fieldOfView[a][b] = legend.indexOf("empty");
				}
			}
		}
		//self.printFOV()
		//process.exit()
	}

	function askModel(env, callback) {
		outQueue.push(callback);
		let result = JSON.stringify([env, self.doc])
		py.stdin.write(result + "\n");
		//console.log(result)
		//process.exit()
	}

	// Is the data a sample from a uniform distribution over [0, 1]?
	function isUniformNumber (data) {
		return (typeof data === "number") && 
			(data > 0) &&
			(data < 1);
	}

	// Is the data an array like [0.3, 0.7, 0.1]? 
	function isInputData (data) {
		return data instanceof Array &&
			data.length === 3 &&
			data.every(item => typeof item === "number");
	}
	self.cycle = function cycle (main) {
		return new Promise(function (accept, reject) {
			setFOV(main);
			askModel(self.fieldOfView, function (data) {
				data = JSON.parse(data.toString());
				if (isInputData(data)) {
					accept(data);
				} else {
					reject(data);
				}
			});
		});
	}
}

module.exports = Gateway;