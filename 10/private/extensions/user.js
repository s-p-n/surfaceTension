const UG = require('username-generator');
module.exports = function (m) {
	m.user = {
		config: {
			game: {
				x: 250, 
				y: 250, 
				spawn: [250, 250],
				eatQueue: null,
				evilMode: false,
				inventory: [{name: 'slire_roll', num: 5}, {name: 'slire_seed', num: 10}], 
				gear: {
					head: {type: 0, color: 0xFFFFFF},
					pants: {type: 1, color: 0xFFFFFF},
					shirt: {type: 1, color: 0xFFFFFF},
					rightGlove: {type: 0, color: 0xFFFFFF},
					leftGlove: {type: 0, color: 0xFFFFFF},
					rightShoe: {type: 1, color: 0xFFFFFF},
					leftShoe: {type: 1, color: 0xFFFFFF},
					rightWield: {type: 0, color: 0xFFFFFF},
					leftWield: {type: 0, color: 0xFFFFFF}
				},
				wellness: {
					hp: 10,
					hunger: 0,
					infection: {
						minor: [],
						normal: [],
						chronic: []
					},
					illness: {
						minor: [],
						normal: [],
						chronic: []
					},
					disease: {
						minor: [],
						normal: [],
						chronic: []
					}
				},
				skills: {
					life: {
						experience: 0,
						level: 1
					},
					medic: {
						experience: 0,
						level: 1
					},
					melee: {
						experience: 0,
						level: 1
					}
				}
			}
		}
	}

	m.user.setupGuest = function () {
		return {
			username: UG.generateUsername(),
			password: false,
			key: false,
			game: JSON.parse(JSON.stringify(m.user.config.game))
		};
	};
}