function makePlace(x, y) {
    x = Math.round(x);
    y = Math.round(y);
    var gridSize = 25;
    var xMod = x % gridSize;
    var yMod = y % gridSize;
    var result = [0, 0];
    if (xMod > gridSize / 2) {
       result[0] = x + (gridSize - xMod);
    } else {
        result[0] = x - xMod;
    }
    if (yMod > gridSize / 2) {
        result[1] = y + (gridSize - yMod);
    } else {
        result[1] = y - yMod;
    }
    return result;
}

var commands = {
    'put': function (subCmd, m, session) {
        var entity;
        console.log('put', subCmd);
        switch(subCmd) {
            case "slire":
                entity = {
                    name: 'slire',
                    place: makePlace(session.user.game.x, session.user.game.y)
                };
                console.log("placing slire..", entity);
                m.game.objects.herbs.instance.add(entity, function (err, herb) {
                    if (err) {
                        //console.log("Insert error!");
                        console.error(err);
                        return;
                    }
                    console.log("herb created(3)");
                    m.game.objects.herbs[herb._id] = herb;
                    session.state4Broadcast('herb-created', herb);
                });
                break;
            case "mine":
                entity = makePlace(session.user.game.x, session.user.game.y);
                console.log("placing iron mine..", entity);
                m.game.objects.ironMines.instance.add(entity, function (mine) {
                    entity = {};
                    entity[mine._id] = mine;
                    console.log("mine created");
                    session.state4Broadcast('mines-init', entity);
                });
                break;
            /*
            case "bits":
                console.log('put iron bits down');
                break;
            */
            default:
                return false;
        }
        return true;
    }
}

function splitCmd (str) {
    return [str.substr(1, str.indexOf(' ') - 1), str.substr(str.indexOf(' ') + 1)];
}

module.exports = function (m, session) {
    var socket = session.socket;
    socket.on('chat-input', function (data) {
        var text, command;
        if (session.state !== 4) {
            socket.emit('chat-msg', {text: 'Server: You must log in to chat.'});
            return;
        }
        if (typeof data !== "string") {
            socket.emit('chat-msg', {text: 'Server: Incorrect data-type.'});
            return;
        } else if (data.replace(/\s/g, '').length === 0) {
            socket.emit('chat-msg', {text: 'Server: Please don\'t send empty messages.'});
            return;
        } else if (data.length > 100) {
            socket.emit('chat-msg', {text: 'Server: Please don\'t send large messages.'});
            return;
        }

        if (data[0] === '\\') {
            command = splitCmd(data);
            console.log("command:", command);
            if (command[0] in commands && commands[command[0]](command[1], m, session)) {
                socket.emit('chat-msg', {text: 'Server: Command executed.'});
                return;
            } else {
                socket.emit('chat-msg', {text: 'Server: Command not found.'});
                return;
            }
        }
        text = session.user.username + ': ' + data;
        session.state4Broadcast('chat-msg', {text: text});
    });
}