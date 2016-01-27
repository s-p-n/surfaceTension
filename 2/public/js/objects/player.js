function Player (main) {
    "use strict";
    var self = this;
    var lastMove = 0;
    var moveTime = 100;
    var horrSpeed = 7.5;
    var vertSpeed = 7.5;
    var step = 0;
    var serverStep = 0;
    var tweenTime = .9;
    self.playerData;
    function Keys(game) {
        var keyList = {
            up: game.input.keyboard.addKey(Phaser.Keyboard.W),
            down: game.input.keyboard.addKey(Phaser.Keyboard.S),
            left: game.input.keyboard.addKey(Phaser.Keyboard.A),
            right: game.input.keyboard.addKey(Phaser.Keyboard.D),
            space: game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
        };
        var cursors = game.input.keyboard.createCursorKeys();
        this.isDown = function isDown(key) {
            if (key in keyList && keyList[key].isDown) {
                return true;
            }
            if (key in cursors && cursors[key].isDown) {
                return true;
            }
            return false;
        };
    }
    function serverCommand(command) {
        var t = 500;//Math.floor(Math.random() * 1000);
        var data;
        step += 1;
        data = {time: Date.now(), action: command, step: step};
        setTimeout(function () {
            comms.emit('player-input', data);
        }, t);
    }
    self.preload = function () {
        main.game.load.spritesheet('player', '/assets/game/dude_sprite.png', 25, 50);
    };
    self.create = function () {
        // Set up Player
        self.player = main.game.add.sprite(250, 250, 'player');
        self.player.anchor.setTo(.5, .9);
        self.player.animations.add('down', [0, 1, 0, 2], 10, true);
        self.player.animations.add('left', [3, 4, 3, 5], 10, true);
        self.player.animations.add('right', [3, 4, 3, 5], 10, true);
        self.player.animations.add('up', [6, 7, 6, 8], 10, true);

        // Set the still-frame- the direction the player should be standing- to facing the screen.
        self.stillFrame = 0;

        // Set up text above player
        self.text = main.game.add.text(250, 190, 'Loading..');
        self.text.anchor.set(0.5);
        self.text.align = 'center';
        self.text.font = 'Arial Black';
        self.text.fontSize = 16;
        self.text.stroke = '#000000';
        self.text.strokeThickness = 3;
        self.text.fill = '#FFFFFF';

        // Set up listeners for keyboard input
        self.key = new Keys(main.game);

        // Make camera follow this player
        main.game.camera.follow(self.player);
    };
    self.update = function () {
        var now = Date.now();
        var newPos = {x: self.player.x, y: self.player.y};
        if (self.playerData === void 0) {
            return;
        }
        if (self.playerData.username !== self.text.text) {
            self.text.text = self.playerData.username;
            newPos = self.playerData.game;
            main.game.camera.focusOnXY(self.playerData.game.x, self.playerData.game.y);
        }
        if (lastMove + moveTime < now) {
            lastMove = now;
            if (step === serverStep) {
                step = 0;
                newPos = self.playerData.game;
            } else if (step !== 0) {
                console.log("steps:", step, serverStep);
            }
            if (self.key.isDown('left')) {
                // Move to left
                if (self.player.scale.x < 0) {
                    self.player.scale.x *= -1;
                }
                newPos.x -= horrSpeed;
                serverCommand('left');
                self.player.animations.play('left');
                self.stillFrame = 3;
            } else if (self.key.isDown('right')) {
                // Move to right
                if (self.player.scale.x > 0) {
                    self.player.scale.x *= -1;
                }
                newPos.x += horrSpeed;
                serverCommand('right');
                self.player.animations.play('right');
                self.stillFrame = 3;
            } else if (self.key.isDown('up')) {
                // Move up
                newPos.y -= vertSpeed;
                serverCommand('up');
                self.player.animations.play('up');
                self.stillFrame = 6;
            } else if (self.key.isDown('down')) {
                // Move down
                newPos.y += vertSpeed;
                serverCommand('down');
                self.player.animations.play('down');
                self.stillFrame = 0;
            } else {
                // Player not moving
                self.player.animations.stop();
                self.player.frame = self.stillFrame;
            }
            main.game.add.tween(self.player).
                to(newPos, moveTime * tweenTime, 'Linear').
                start();
            main.game.add.tween(self.text).
                to({
                    x: newPos.x - 2, 
                    y: newPos.y - 60
                }, moveTime * tweenTime, 'Linear').
                start();
        }
    };
    self.render = function () {};
    comms.on('player', function (data) {
        self.playerData = data;
    });
    comms.on('player-move', function (data) {
        console.log('player-move:', data.game);
        var lag = Date.now() - data.time;
        self.playerData.game = data.game;
        console.log("lag:", lag);
        serverStep = data.step;
    });
}