
const spawn = require('child_process').spawn;
const pyFile = process.cwd() + '/private/extensions/py/sheep.py'
const py = spawn('python3', ["-u", pyFile]);
const outQueue = []

py.on("exit", function () {
	console.log("python exit:", arguments)
});
py.on("error", function () {
	console.log("python error:", arguments)
});

py.stdout.setEncoding("utf8")
py.stdout.on("data", function (data) {
	let lines = data.split("\n");
	lines.forEach(answer => {
		if (answer.length == 0) {
			return;
		}
		if (outQueue.length > 0) {
			return outQueue.shift()(answer);
		}
		console.error("Queue underflow")
	});
});
function Sheep (me={
	place: [25, 25],
	color: 0xFFFFFF
}) {
	const self = this;
	function getEnv(m) {
		let sheep = m.game.objects.sheep;
		let herbs = m.game.objects.herbs;
		let wolves = m.game.objects.wolves;
		let env = {sheep, herbs, wolves};
		//console.log(env);
		return env;
	}

	function askModel(env, callback) {
		outQueue.push(callback);
		py.stdin.write(JSON.stringify(env) + "\n");
	}

	self.cycle = function cycle (main) {
		return new Promise(function (accept, reject) {
			let env = getEnv(main);
			askModel(env, function (data) {
				data = data.toString();
				data = JSON.parse(data);
				//console.log(data);
				if (data == "error") {
					reject("error");
				} else {
					accept(data);
				}
			})
		});
	}

}

module.exports = Sheep;