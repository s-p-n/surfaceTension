const spawn = require("child_process").spawn;
const SIZE = 10;
let env;



let legend = [
	"-",
	"h",
	"w",
	"s"
];

let py = spawn("python3", ["-u", "sheep.py"], {
	stdio: [

	]
});

function randPlace () {
	return {
		x: randInt(SIZE-1),
		y: randInt(SIZE-1)
	}
}

function randEnv () {
	let things = {
		s: randPlace(),
		w: randPlace(),
		h: randPlace()
	}
	let env = new Array(SIZE);
	for (let x = 0 ; x < SIZE; x += 1) {
		env[x] = new Array(SIZE);
		for (let y = 0; y < SIZE; y += 1) {
			env[x][y] = 0
			for (thing in things) {
				p = things[thing]
				if (p.x == x && p.y == y) {
					env[x][y] = legend.indexOf(thing)
				}
			}
		}
	}
	return env;
}

function printEnv () {
	for (let x = 0; x < env.length; x += 1) {
		sub = env[x];
		line = ""
		for (let y = 0; y < sub.length; y += 1) {
			line += legend[sub[y]];
		}
		console.log(line);
	}
}

function randInt (max) {
	return Math.round(Math.random() * Math.floor(max));
}

env = randEnv()
printEnv();
process.exit();

py.stdout.on("data", function (data) {
	data = data.toString();
	data = data.substr(0, data.length-1)
	console.log("data:", '"' + data + '"');
	setTimeout(function () {
		console.log("Env:");
		printEnv();
		py.stdin.write(JSON.stringify(env) + "\n")
	}, 100)
});
py.on("exit", function () {
	console.log("exit:", arguments)
});
py.on("error", function () {
	console.log("error:", arguments)
});
py.stdin.write("[1,2,3]\n")
console.log("Started.")