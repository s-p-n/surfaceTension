function Others(main) {
    "use strict";
    var self = this;
    var others = Object.create(null);
    var moveTime = 100;
    var tweenTime = 0.9;
    var lastMove = 0;
    var maxQueueLength = 3;
    function eachPlayer(fn) {
        var username, player;
        for (username in others) {
            if (!others[username].ready) {
                continue;
            }
            fn(others[username], username);
        }
    }
    function movePlayer(player, destination) {
        console.log("moving to: ", destination);
        player.sprite.x = player.game.x;
        player.sprite.y = player.game.y;
        if (destination.x < player.sprite.x) {
            if (player.sprite.scale.x < 0) {
                player.sprite.scale.x *= -1;
            }
            player.sprite.animations.play('left');
            player.stillFrame = 3;
        } else if (destination.x > player.sprite.x) {
            if (player.sprite.scale.x > 0) {
                player.sprite.scale.x *= -1;
            }
            player.sprite.animations.play('right');
            player.stillFrame = 3;
        } else if (destination.y < player.sprite.y) {
            player.sprite.animations.play('up');
            player.stillFrame = 6;
        } else if (destination.y > player.sprite.y) {
            player.sprite.animations.play('down');
            player.stillFrame = 0;
        }
        main.game.add.tween(player.sprite).
            to(destination, moveTime * tweenTime, 'Linear').
            start();
        main.game.add.tween(player.text).
            to({
                x: destination.x - 2,
                y: destination.y - 60
            }, moveTime * tweenTime, 'Linear').
            start();
    }
    function cyclePlayerQueues() {
        var destination;
        eachPlayer(function (player) {
            if (player.queue.length > 0) {
                console.log('queue size:', player.queue.length);
                if (player.queue.length > maxQueueLength) {
                    destination = player.queue.pop();
                    player.queue = [];
                } else {
                    destination = player.queue.shift();
                }
                movePlayer(player, destination);
                player.game = destination;
            } else {
                player.sprite.animations.stop();
                player.sprite.frame = player.stillFrame;
            }
        });
    }
    self.update = function () {
        if (lastMove + moveTime < Date.now()) {
            lastMove = Date.now();
            cyclePlayerQueues();
        }
    };
    self.render = function () {};
    comms.on('others-update', function (data) {
        console.log("got other update", data);
        if (!(data.username in others)) {
            others[data.username] = {};
            // Set up player sprite
            others[data.username].sprite = main.objects.create(
                data.game.x, 
                data.game.y, 
                'player'
            );
            others[data.username].sprite.anchor.setTo(0.5, 0.9);
            others[data.username].sprite.animations.add(
                'down', 
                [0, 1, 0, 2], 
                10, 
                true
            );
            others[data.username].sprite.animations.add(
                'left', 
                [3, 4, 3, 5], 
                10, 
                true
            );
            others[data.username].sprite.animations.add(
                'right', 
                [3, 4, 3, 5], 
                10, 
                true
            );
            others[data.username].sprite.animations.add(
                'up', 
                [6, 7, 6, 8], 
                10, 
                true
            );

            // Set up text above player
            others[data.username].text = main.game.add.text(
                data.game.x - 2, 
                data.game.y - 60, 
                data.username
            );
            others[data.username].text.anchor.setTo(0.5);
            others[data.username].text.align = 'center';
            others[data.username].text.font = 'Arial Black';
            others[data.username].text.fontSize = 16;
            others[data.username].text.stroke = '#000000';
            others[data.username].text.strokeThickness = 3;
            others[data.username].text.fill = '#FFFFFF';

            // Set up miscellaneous data for player.
            others[data.username].stillFrame = 0;
            others[data.username].game = data.game;
            others[data.username].queue = [];
            others[data.username].ready = true;
        }
        others[data.username].queue.push(data.game);
    });
    comms.on('player-disconnect', function (player) {
        if (others[player] !== void 0) {
            others[player].sprite.destroy();
            others[player].text.destroy();
            delete others[player];
        }
    });
}