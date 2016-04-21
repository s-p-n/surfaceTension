function Player(main) {
    "use strict";
    var self = this;
    var lastMove = 0;
    var moveTime = 100;
    var horrSpeed = 7.5;
    var vertSpeed = 7.5;
    var step = 0;
    var serverStep = 0;
    var tweenTime = 0.9;
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
            //console.log(key, keyList[key]);
            if (window.bypassPhaserInput) {
                game.input.enabled = false;
                return false;
            } else {
                game.input.enabled = true;
            }
            if (key in keyList && keyList[key].isDown) {
                return true;
            }
            if (key in cursors && cursors[key].isDown) {
                return true;
            }
            return false;
        };
    }

    function setUpGear() {
        var gear = self.playerData.game.gear;
        console.log('gear:', gear);
        if (gear.shirt.type === 1) {
            self.shirt = self.player.addChild(main.game.add.sprite(0, 0, 'player_shirt'));
            self.shirt.anchor.setTo(0.35, 0.9);

            self.shirt.animations.add('down', [0, 1, 0, 2], 10, true);
            self.shirt.animations.add('left', [3, 4, 3, 5], 10, true);
            self.shirt.animations.add('right', [3, 4, 3, 5], 10, true);
            self.shirt.animations.add('up', [6, 7, 6, 8], 10, true);

            self.shirt.tint = gear.shirt.color;
        }
        if (gear.pants.type === 1) {
            self.pants = self.player.addChild(main.game.add.sprite(0, 0, 'player_pants'));
            self.pants.anchor.setTo(0.35, 0.9);

            self.pants.animations.add('down', [0, 1, 0, 2], 10, true);
            self.pants.animations.add('left', [3, 4, 3, 5], 10, true);
            self.pants.animations.add('right', [3, 4, 3, 5], 10, true);
            self.pants.animations.add('up', [6, 7, 6, 8], 10, true);

            self.pants.tint = gear.pants.color;
        }

    }

    function gearLeft() {
        if (self.shirt) {
            self.shirt.anchor.x = 0.35;
            self.shirt.animations.play('left');
        }
        if (self.pants) {
            self.pants.anchor.x = 0.35;
            self.pants.animations.play('left');
        }
    }

    function gearRight() {
        if (self.shirt) {
            self.shirt.anchor.x = 0.5;
            self.shirt.animations.play('right');
        }
        if (self.pants) {
            self.pants.anchor.x = 0.5;
            self.pants.animations.play('right');
        }
    }

    function gearUp() {
        if (self.shirt) {
            self.shirt.animations.play('up');
        }
        if (self.pants) {
            self.pants.animations.play('up');
        }
    }

    function gearDown() {
        if (self.shirt) {
            self.shirt.animations.play('down');
        }
        if (self.pants) {
            self.pants.animations.play('down');
        }
    }

    function gearStop() {
        if (self.shirt) {
            self.shirt.animations.stop();
            self.shirt.frame = self.stillFrame;
        }
        if (self.pants) {
            self.pants.animations.stop();
            self.pants.frame = self.stillFrame;
        }
    }

    function serverCommand(command) {
        var t = 500;//Math.floor(Math.random() * 1000);
        var data;
        step += 1;
        data = {time: Date.now(), action: command, step: step};
        //setTimeout(function () {
            comms.emit('player-input', data);
        //}, t);
    }
    self.preload = function () {
        main.game.load.spritesheet('player', '/assets/game/dude_sprite.png', 25, 50);
        main.game.load.spritesheet('player_shirt', '/assets/game/dude_shirt_sprite.png', 25, 50);
        main.game.load.spritesheet('player_pants', '/assets/game/dude_pants_sprite.png', 25, 50);
    };
    self.createPlayer = function () {
        // Set up Player
        
        self.player = main.objects.create(self.playerData.game.x, self.playerData.game.y, 'player');
        self.player.anchor.setTo(0.35, 0.9);

        self.player.animations.add('down', [0, 1, 0, 2], 10, true);
        self.player.animations.add('left', [3, 4, 3, 5], 10, true);
        self.player.animations.add('right', [3, 4, 3, 5], 10, true);
        self.player.animations.add('up', [6, 7, 6, 8], 10, true);

        // Set up close rectangle
        self.closeRect = new Phaser.Rectangle(0, 0, 0, 0);

        // Set the still-frame- the direction the player should be standing- to facing the screen.
        self.stillFrame = 0;

        // Set up text above player
        self.text = main.game.add.text(250, 190, self.playerData.username);
        self.text.anchor.setTo(0.5);
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
        setUpGear();
        main.objects.sort('bottom', Phaser.Group.SORT_ASCENDING);
    };
    self.update = function () {
        if (self.playerData === void 0) {
            return;
        }
        var now = Date.now();
        var newPos = {x: self.player.x, y: self.player.y};
        /*
        if (self.playerData.username !== self.text.text) {
            setUpGear();
            self.text.text = self.playerData.username;
            newPos = self.playerData.game;
            main.game.camera.focusOnXY(self.playerData.game.x, self.playerData.game.y);
            main.game.camera.follow(self.player);
            main.objects.sort('bottom', Phaser.Group.SORT_ASCENDING);
        }
        */
        self.closeRect.x = self.player.x - 50;
        self.closeRect.y = self.player.y - 40;
        self.closeRect.width = 100;
        self.closeRect.height = 70;
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
                    //self.pants.scale.x *= -1;
                }
                self.player.anchor.x = 0.35;
                newPos.x -= horrSpeed;
                serverCommand('left');
                self.player.animations.play('left');
                self.stillFrame = 3;
                gearLeft();
            } else if (self.key.isDown('right')) {
                // Move to right
                if (self.player.scale.x > 0) {
                    self.player.scale.x *= -1;
                    //self.pants.scale.x *= -1;
                }
                self.player.anchor.x = 0.5;
                newPos.x += horrSpeed;
                serverCommand('right');
                self.player.animations.play('right');
                self.stillFrame = 3;
                gearRight();
            } else if (self.key.isDown('up')) {
                // Move up
                newPos.y -= vertSpeed;
                serverCommand('up');
                self.player.animations.play('up');
                self.stillFrame = 6;
                gearUp();
            } else if (self.key.isDown('down')) {
                // Move down
                newPos.y += vertSpeed;
                serverCommand('down');
                self.player.animations.play('down');
                self.stillFrame = 0;
                gearDown();
            } else {
                // Player not moving
                self.player.animations.stop();
                self.player.frame = self.stillFrame;
                gearStop();
            }
            if (self.player.x !== newPos.x || self.player.y !== newPos.y) {
                var pTween = main.game.add.tween(self.player);
                pTween.to(newPos, moveTime * tweenTime, 'Linear');
                pTween.start();
                if (newPos.y < self.player.y) {
                    pTween.onComplete.add(function () {
                        //console.log("bottom:", self.player.bottom);
                        main.utils.sortUp(self.player);
                    });
                } else if (newPos.y > self.player.y) {
                    pTween.onComplete.add(function () {
                        //console.log("bottom:", self.player.bottom);
                        main.utils.sortDown(self.player);
                    });
                }
                main.game.add.tween(self.text).
                    to({
                        x: newPos.x - 2, 
                        y: newPos.y - 60
                    }, moveTime * tweenTime, 'Linear').
                    start();
            }
        }
    };
    /*
    self.render = function () {
        
        main.game.debug.geom(self.closeRect, 'rgba(255, 0, 0, .5)');
    }
    */
    comms.on('player', function (data) {
        self.playerData = data;
        self.createPlayer();
        inventory.restore(data.game.inventory);
        gear.restore(data.game.gear);
    });
    comms.on('inventory-update', function (data) {
        inventory.restore(data);
    });
    comms.on('player-move', function (data) {
        console.log('player-move:', data.game);
        var lag = Date.now() - data.time;
        self.playerData.game = data.game;
        console.log("lag:", lag);
        serverStep = data.step;
    });
}