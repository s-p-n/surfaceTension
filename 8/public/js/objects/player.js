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
    var hitSwitchInterval = null;
    var hitSwitchIntervalTime = 500;
    var inHitMode = false;
    var lastDirection = 'down';
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

    function hitModeOn () {
        inHitMode = true;
        self.hit_player.revive();
        self.player.kill();

        if (self.shirt) {
            self.hit_shirt.revive();
            self.shirt.kill();
        }
        if (self.pants) {
            self.hit_player.addChild(self.pants);
        }
        if (self.leftShoe) {
            self.hit_player.addChild(self.leftShoe);
        }
        if (self.rightShoe) {
            self.hit_player.addChild(self.rightShoe);
        }
    }

    function hitModeOff () {
        inHitMode = false;
        self.player.revive();
        self.hit_player.kill();

        if (self.shirt) {
            self.shirt.revive();
            self.hit_shirt.kill();
        }
        if (self.pants) {
            self.player.addChild(self.pants);
        }
        if (self.leftShoe) {
            self.player.addChild(self.leftShoe);
        }
        if (self.rightShoe) {
            self.player.addChild(self.rightShoe);
        }
    }

    function hitModeToggle () {
        console.log("HitModeToggle:", inHitMode);
        if (inHitMode) {
            hitModeOff();
        } else {
            hitModeOn();
        }
    }

    function startHitMode () {
        if (hitSwitchInterval === null && !inHitMode) {
            console.log("Starting hit mode.");
            serverCommand('startHit');
            hitModeOn();
            hitSwitchInterval = setInterval(hitModeToggle, hitSwitchIntervalTime);
        }
    }

    function stopHitMode () {
        if (hitSwitchInterval !== null && !inHitMode) {
            console.log("Stopping hit mode.");
            serverCommand('stopHit');
            clearInterval(hitSwitchInterval);
            hitSwitchInterval = null;
            hitModeOff();
        }
    }

    function setUpGear() {
        var gear = self.playerData.game.gear;
        console.log('gear:', gear);
        if (self.shirt) {
            self.shirt.destroy();
            self.hit_shirt.destroy();
        }
        if (self.pants) {
            self.pants.destroy();
        }
        if (self.leftShoe) {
            self.leftShoe.destroy();
        }
        if (self.rightShoe) {
            self.rightShoe.destroy();
        }

        if (gear.shirt.type === 1) {
            self.shirt = self.player.addChild(main.game.add.sprite(0, 0, 'player_shirt'));
            self.shirt.anchor.setTo(self.player.anchor.x, self.player.anchor.y);

            self.shirt.animations.add('down', [0, 1, 0, 2], 10, true);
            self.shirt.animations.add('left', [3, 4, 3, 5], 10, true);
            self.shirt.animations.add('right', [3, 4, 3, 5], 10, true);
            self.shirt.animations.add('up', [6, 7, 6, 8], 10, true);

            self.shirt.tint = gear.shirt.color;

            self.hit_shirt = self.hit_player.addChild(main.game.add.sprite(0, 0, 'player_hit_shirt'));
            self.hit_shirt.anchor.setTo(self.hit_player.anchor.x, self.hit_player.anchor.y);

            self.hit_shirt.animations.add('down', [0, 1, 0, 2], 10, true);
            self.hit_shirt.animations.add('left', [3, 4, 3, 5], 10, true);
            self.hit_shirt.animations.add('right', [3, 4, 3, 5], 10, true);
            self.hit_shirt.animations.add('up', [6, 7, 6, 8], 10, true);

            self.hit_shirt.tint = gear.shirt.color;

            self.hit_shirt.kill();
        }
        if (gear.pants.type === 1) {
            self.pants = self.player.addChild(main.game.add.sprite(0, 0, 'player_pants'));
            self.pants.anchor.setTo(self.player.anchor.x, self.player.anchor.y);

            self.pants.animations.add('down', [0, 1, 0, 2], 10, true);
            self.pants.animations.add('left', [3, 4, 3, 5], 10, true);
            self.pants.animations.add('right', [3, 4, 3, 5], 10, true);
            self.pants.animations.add('up', [6, 7, 6, 8], 10, true);

            self.pants.tint = gear.pants.color;
        }
        if (gear.leftShoe.type === 1) {
            self.leftShoe = self.player.addChild(main.game.add.sprite(0, 0, 'player_leftShoe'));
            self.leftShoe.anchor.setTo(self.player.anchor.x, self.player.anchor.y);

            self.leftShoe.animations.add('down', [0, 1, 0, 2], 10, true);
            self.leftShoe.animations.add('left', [3, 4, 3, 5], 10, true);
            self.leftShoe.animations.add('right', [3, 4, 3, 5], 10, true);
            self.leftShoe.animations.add('up', [6, 7, 6, 8], 10, true);

            self.leftShoe.tint = gear.leftShoe.color;
        }
        if (gear.rightShoe.type === 1) {
            self.rightShoe = self.player.addChild(main.game.add.sprite(0, 0, 'player_rightShoe'));
            self.rightShoe.anchor.setTo(self.player.anchor.x, self.player.anchor.y);

            self.rightShoe.animations.add('down', [0, 1, 0, 2], 10, true);
            self.rightShoe.animations.add('left', [3, 4, 3, 5], 10, true);
            self.rightShoe.animations.add('right', [3, 4, 3, 5], 10, true);
            self.rightShoe.animations.add('up', [6, 7, 6, 8], 10, true);

            self.rightShoe.tint = gear.rightShoe.color;
        }
        if (gear.leftShoe.type === 2) {
            self.leftShoe = self.player.addChild(main.game.add.sprite(0, 0, 'player_leftShoe2'));
            self.leftShoe.anchor.setTo(self.player.anchor.x, self.player.anchor.y);

            self.leftShoe.animations.add('down', [0, 1, 0, 2], 10, true);
            self.leftShoe.animations.add('left', [3, 4, 3, 5], 10, true);
            self.leftShoe.animations.add('right', [3, 4, 3, 5], 10, true);
            self.leftShoe.animations.add('up', [6, 7, 6, 8], 10, true);

            self.leftShoe.tint = gear.leftShoe.color;
        }
        if (gear.rightShoe.type === 2) {
            self.rightShoe = self.player.addChild(main.game.add.sprite(0, 0, 'player_rightShoe2'));
            self.rightShoe.anchor.setTo(self.player.anchor.x, self.player.anchor.y);

            self.rightShoe.animations.add('down', [0, 1, 0, 2], 10, true);
            self.rightShoe.animations.add('left', [3, 4, 3, 5], 10, true);
            self.rightShoe.animations.add('right', [3, 4, 3, 5], 10, true);
            self.rightShoe.animations.add('up', [6, 7, 6, 8], 10, true);

            self.rightShoe.tint = gear.rightShoe.color;
        }
        console.log("my pants sprite:", self.pants);
    }

    function gearLeft() {
        if (self.shirt) {
            self.shirt.anchor.x = 0.35;
            self.shirt.animations.play('left');
            self.hit_shirt.anchor.x = 0.35;
            self.hit_shirt.animations.play('left');
        }
        if (self.pants) {
            self.pants.anchor.x = 0.35;
            self.pants.animations.play('left');
        }
        if (self.leftShoe) {
            self.leftShoe.anchor.x = 0.35;
            self.leftShoe.animations.play('left');
        }
        if (self.rightShoe) {
            self.rightShoe.anchor.x = 0.35;
            self.rightShoe.animations.play('left');
        }
    }

    function gearRight() {
        if (self.shirt) {
            self.shirt.anchor.x = 0.5;
            self.shirt.animations.play('right');
            self.hit_shirt.anchor.x = 0.5;
            self.hit_shirt.animations.play('right');
        }
        if (self.pants) {
            self.pants.anchor.x = 0.5;
            self.pants.animations.play('right');
        }
        if (self.leftShoe) {
            self.leftShoe.anchor.x = 0.5;
            self.leftShoe.animations.play('right');
        }
        if (self.rightShoe) {
            self.rightShoe.anchor.x = 0.5;
            self.rightShoe.animations.play('right');
        }
    }

    function gearUp() {
        if (self.shirt) {
            self.shirt.animations.play('up');
            self.hit_shirt.animations.play('up');
        }
        if (self.pants) {
            self.pants.animations.play('up');
        }
        if (self.leftShoe) {
            self.leftShoe.animations.play('up');
        }
        if (self.rightShoe) {
            self.rightShoe.animations.play('up');
        }
    }

    function gearDown() {
        if (self.shirt) {
            self.shirt.animations.play('down');
            self.hit_shirt.animations.play('down');
        }
        if (self.pants) {
            self.pants.animations.play('down');
        }
        if (self.leftShoe) {
            self.leftShoe.animations.play('down');
        }
        if (self.rightShoe) {
            self.rightShoe.animations.play('down');
        }
    }

    function gearStop() {
        if (self.shirt) {
            self.shirt.animations.stop();
            self.shirt.frame = self.stillFrame;
            self.hit_shirt.animations.stop();
            self.hit_shirt.frame = self.stillFrame;
        }
        if (self.pants) {
            self.pants.animations.stop();
            self.pants.frame = self.stillFrame;
        }
        if (self.leftShoe) {
            self.leftShoe.animations.stop();
            self.leftShoe.frame = self.stillFrame;
        }
        if (self.rightShoe) {
            self.rightShoe.animations.stop();
            self.rightShoe.frame = self.stillFrame;
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
        main.game.load.spritesheet('player_hit', '/assets/game/dude_hit_sprite.png', 25, 50);
        main.game.load.spritesheet('player_shirt', '/assets/game/dude_shirt_sprite.png', 25, 50);
        main.game.load.spritesheet('player_hit_shirt', '/assets/game/dude_hit_shirt_sprite.png', 25, 50);
        main.game.load.spritesheet('player_pants', '/assets/game/dude_pants_sprite.png', 25, 50);
        main.game.load.spritesheet('player_leftShoe', '/assets/game/dude_leftShoe_sprite.png', 25, 50);
        main.game.load.spritesheet('player_rightShoe', '/assets/game/dude_rightShoe_sprite.png', 25, 50);
        main.game.load.spritesheet('player_leftShoe2', '/assets/game/dude_leftShoe2_sprite.png', 25, 50);
        main.game.load.spritesheet('player_rightShoe2', '/assets/game/dude_rightShoe2_sprite.png', 25, 50);
    };
    self.createPlayer = function () {
        // Set up Player
        
        self.player = main.objects.create(self.playerData.game.x, self.playerData.game.y, 'player');
        self.player.anchor.setTo(0.35, 0.9);

        self.player.animations.add('down', [0, 1, 0, 2], 10, true);
        self.player.animations.add('left', [3, 4, 3, 5], 10, true);
        self.player.animations.add('right', [3, 4, 3, 5], 10, true);
        self.player.animations.add('up', [6, 7, 6, 8], 10, true);

        self.hit_player = main.objects.create(self.playerData.game.x, self.playerData.game.y, 'player_hit');
        self.hit_player.anchor.setTo(0.35, 0.9);

        self.hit_player.animations.add('down', [0, 1, 0, 2], 10, true);
        self.hit_player.animations.add('left', [3, 4, 3, 5], 10, true);
        self.hit_player.animations.add('right', [3, 4, 3, 5], 10, true);
        self.hit_player.animations.add('up', [6, 7, 6, 8], 10, true);

        self.hit_player.kill();

        // Set up close rectangle
        self.closeRect = new Phaser.Rectangle(0, 0, 0, 0);

        // Set the still-frame- the direction the player should be standing- to facing the screen.
        self.stillFrame = 0;

        // Set up text above player
        self.text = main.game.add.text(self.playerData.game.x - 2, self.playerData.game.y - 60, self.playerData.username);
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
        self.hit_player.x = self.player.x;
        self.hit_player.y = self.player.y;
        if (lastMove + moveTime < now) {
            lastMove = now;
            if (step === serverStep) {
                step = 0;
                newPos = self.playerData.game;
            } else if (step !== 0) {
                //console.log("steps:", step, serverStep);
            }
            if (self.player.scale.x < 0) {
                self.player.scale.x *= -1;
                self.hit_player.scale.x *= -1;
            }
            if (self.key.isDown('space') || main.game.input.activePointer.isDown) {
                startHitMode();
            } else {
                stopHitMode();
            }
            if (self.key.isDown('left')) {
                // Move to left
                lastDirection = 'left';
                self.player.anchor.x = 0.35;
                self.hit_player.anchor.x = 0.35;
                newPos.x -= horrSpeed;
                serverCommand('left');
                self.player.animations.play('left');
                self.hit_player.animations.play('left');
                self.stillFrame = 3;
                gearLeft();
            } else if (self.key.isDown('right')) {
                // Move to right
                lastDirection = 'right';
                if (self.player.scale.x > 0) {
                    self.player.scale.x *= -1;
                    self.hit_player.scale.x *= -1;
                }
                self.player.anchor.x = 0.5;
                self.hit_player.anchor.x = 0.5;
                newPos.x += horrSpeed;
                serverCommand('right');
                self.player.animations.play('right');
                self.hit_player.animations.play('right');
                self.stillFrame = 3;
                gearRight();
            } else if (self.key.isDown('up')) {
                // Move up
                lastDirection = 'up';
                newPos.y -= vertSpeed;
                serverCommand('up');
                self.player.animations.play('up');
                self.hit_player.animations.play('up');
                self.stillFrame = 6;
                gearUp();
            } else if (self.key.isDown('down')) {
                // Move down
                lastDirection = 'down';
                newPos.y += vertSpeed;
                serverCommand('down');
                self.player.animations.play('down');
                self.hit_player.animations.play('down');
                self.stillFrame = 0;
                gearDown();
            } else {
                // Player not moving
                if (lastDirection === 'right') {
                    // force player to look right
                    if (self.player.scale.x > 0) {
                        self.player.scale.x *= -1;
                        self.hit_player.scale.x *= -1;
                    }
                }

                self.player.animations.stop();
                self.player.frame = self.stillFrame;

                self.hit_player.animations.stop();
                self.hit_player.frame = self.stillFrame;
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
                        main.utils.sortDown(self.hit_player);
                    });
                }
                main.game.add.tween(self.text).
                    to({
                        x: newPos.x - 2, 
                        y: newPos.y - 60
                    }, moveTime * tweenTime, 'Linear').
                    start();
                
                self.closeRect.x = self.player.x - 50;
                self.closeRect.y = self.player.y - 40;
                self.closeRect.width = 100;
                self.closeRect.height = 70;
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
        wellnessUpdate(data.game.wellness);
    });
    comms.on('inventory-update', function (data) {
        inventory.restore(data);
    });

    comms.on('gear-update', function (data) {
        console.log("got gear-update", data);
        self.playerData.game.gear = data;
        setUpGear();
        gear.restore(data);
    });
    comms.on('player-move', function (data) {
        //console.log('player-move:', data.game);
        var lag = Date.now() - data.time;
        self.playerData.game = data.game;
        //console.log("lag:", lag);
        serverStep = data.step;
    });
    comms.on('player-wellness', function (data) {
        self.playerData.game.welness = data;
        wellnessUpdate(data);
    });
}