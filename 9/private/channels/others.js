module.exports = function (m, session) {
	var socket = session.socket;
    function sendOtherPlayer (player) {
        //console.log(player);
        if (session.state === 4 && player.username !== session.user.username /*&& player.section === session.user.section*/) {
            //console.log('player updated:', player);
            session.ifSectEmit('others-update', {username: player.username, game: {
                x: player.game.x,
                y: player.game.y,
                gear: player.game.gear,
                evilMode: player.game.evilMode,
                wellness: {
                    hp: player.game.wellness.hp
                },
            }, hitMode: player.hitMode, maxHp: player.game.skills.life.level * 10}, [player.game.x, player.game.y]);
        }
    }
	m.event.on('player-update', sendOtherPlayer);
    session.event.on('game-ready', function (ready) {
        var userId;
        if (ready) {
            for (userId in m.session) {
                if (userId === session.id || m.session[userId].user === void 0) {
                    continue;
                }
                sendOtherPlayer(m.session[userId].user);
            }
        }
    })
}