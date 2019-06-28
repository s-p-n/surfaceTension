function Player(main) {
    "use strict";
    var self = this;
    var lastMove = 0;
    var moveTime = 312.5;
    var horrSpeed = 25;
    var vertSpeed = 25;
    var step = 0;
    var evilTextColor = '#FFCCCC';
    var niceTextColor = '#FFFFFF';
    var textColor;
    var serverStep = 0;
    var tweenTime = 0.9;
    var hitSwitchInterval = null;
    var hitSwitchIntervalTime = 500;
    var inHitMode = false;
    var animations = {
        left: function () {
            if (inHitMode) {
                return 'hit_left';
            }
            return 'left';
        },
        right: function () {
            if (inHitMode) {
                return 'hit_right';
            }
            return 'right';
        },
        up: function () {
            if (inHitMode) {
                return 'hit_up';
            }
            return 'up';
        },
        down: function () {
            if (inHitMode) {
                return 'hit_down';
            }
            return 'down';
        }
    };
    var stillFrames = {
        left: function (check) {
            if (check === void 0) {
                check = true;
            }
            if (check && inHitMode) {
                return 15;
            }
            return 3;
        },
        right: function (check) {
            if (check === void 0) {
                check = true;
            }
            if (check && inHitMode) {
                return 18;
            }
            return 6;
        },
        up: function (check) {
            if (check === void 0) {
                check = true;
            }
            if (check && inHitMode) {
                return 21;
            }
            return 9;
        },
        down: function (check) {
            if (check === void 0) {
                check = true;
            }
            if (check && inHitMode) {
                return 12;
            }
            return 0;
        }
    };
    self.playerData;
    function Keys(game) {
        var keyList = {
            up: game.input.keyboard.addKey(Phaser.Keyboard.W),
            down: game.input.keyboard.addKey(Phaser.Keyboard.S),
            left: game.input.keyboard.addKey(Phaser.Keyboard.A),
            right: game.input.keyboard.addKey(Phaser.Keyboard.D),
            t: game.input.keyboard.addKey(Phaser.Keyboard.T),
            space: game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR),
            enter: game.input.keyboard.addKey(Phaser.Keyboard.ENTER)
        };
        var cursors = game.input.keyboard.createCursorKeys();
        this.isDown = function isDown(key) {
            //console.log(key, keyList[key]);
            if (window.bypassPhaserInput) {
                game.input.enabled = false;
                keyList.enter.reset();
                keyList.t.reset();
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
    }

    function hitModeOff () {
        inHitMode = false;
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
        if (self.rightWield) {
            self.rightWield.destroy();
        }
        if (self.shirt) {
            self.shirt.destroy();
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
        if (gear.rightWield) {
        
        
            if (gear.rightWield.type === 1) {
                self.rightWield = self.player.addChild(main.game.add.sprite(0, 0, 'player_rightWield1'));
                self.rightWield.anchor.setTo(self.player.anchor.x, self.player.anchor.y);

                self.rightWield.animations.add('down', [0, 1, 0, 2], 10, true);
                self.rightWield.animations.add('left', [3, 4, 3, 5], 10, true);
                self.rightWield.animations.add('right', [6, 7, 6, 8], 10, true);
                self.rightWield.animations.add('up', [9, 10, 9, 11], 10, true);
                self.rightWield.animations.add('hit_down', [12, 13, 12, 14], 10, true);
                self.rightWield.animations.add('hit_left', [15, 16, 15, 17], 10, true);
                self.rightWield.animations.add('hit_right', [18, 19, 18, 20], 10, true);
                self.rightWield.animations.add('hit_up', [21, 22, 21, 23], 10, true);

                self.rightWield.tint = gear.rightWield.color;
            }
            if (gear.rightWield.type === 2) {
                self.rightWield = self.player.addChild(main.game.add.sprite(0, 0, 'player_rightWield2'));
                self.rightWield.anchor.setTo(self.player.anchor.x, self.player.anchor.y);

                self.rightWield.animations.add('down', [0, 1, 0, 2], 10, true);
                self.rightWield.animations.add('left', [3, 4, 3, 5], 10, true);
                self.rightWield.animations.add('right', [6, 7, 6, 8], 10, true);
                self.rightWield.animations.add('up', [9, 10, 9, 11], 10, true);
                self.rightWield.animations.add('hit_down', [12, 13, 12, 14], 10, true);
                self.rightWield.animations.add('hit_left', [15, 16, 15, 17], 10, true);
                self.rightWield.animations.add('hit_right', [18, 19, 18, 20], 10, true);
                self.rightWield.animations.add('hit_up', [21, 22, 21, 23], 10, true);

                self.rightWield.tint = gear.rightWield.color;
            }
        }
        if (gear.shirt && gear.shirt.type === 1) {
            self.shirt = self.player.addChild(main.game.add.sprite(0, 0, 'player_shirt'));
            self.shirt.anchor.setTo(self.player.anchor.x, self.player.anchor.y);

            self.shirt.animations.add('down', [0, 1, 0, 2], 10, true);
            self.shirt.animations.add('left', [3, 4, 3, 5], 10, true);
            self.shirt.animations.add('right', [6, 7, 6, 8], 10, true);
            self.shirt.animations.add('up', [9, 10, 9, 11], 10, true);
            self.shirt.animations.add('hit_down', [12, 13, 12, 14], 10, true);
            self.shirt.animations.add('hit_left', [15, 16, 15, 17], 10, true);
            self.shirt.animations.add('hit_right', [18, 19, 18, 20], 10, true);
            self.shirt.animations.add('hit_up', [21, 22, 21, 23], 10, true);

            self.shirt.tint = gear.shirt.color;
        }
        if (gear.pants && gear.pants.type === 1) {
            self.pants = self.player.addChild(main.game.add.sprite(0, 0, 'player_pants'));
            self.pants.anchor.setTo(self.player.anchor.x, self.player.anchor.y);

            self.pants.animations.add('down', [0, 1, 0, 2], 10, true);
            self.pants.animations.add('left', [3, 4, 3, 5], 10, true);
            self.pants.animations.add('right', [6, 7, 6, 8], 10, true);
            self.pants.animations.add('up', [9, 10, 9, 11], 10, true);
            self.pants.animations.add('hit_down', [12, 13, 12, 14], 10, true);
            self.pants.animations.add('hit_left', [15, 16, 15, 17], 10, true);
            self.pants.animations.add('hit_right', [18, 19, 18, 20], 10, true);
            self.pants.animations.add('hit_up', [21, 22, 21, 23], 10, true);

            self.pants.tint = gear.pants.color;
        }
        if (gear.leftShoe && gear.leftShoe.type === 1) {
            self.leftShoe = self.player.addChild(main.game.add.sprite(0, 0, 'player_leftShoe'));
            self.leftShoe.anchor.setTo(self.player.anchor.x, self.player.anchor.y);

            self.leftShoe.animations.add('down', [0, 1, 0, 2], 10, true);
            self.leftShoe.animations.add('left', [3, 4, 3, 5], 10, true);
            self.leftShoe.animations.add('right', [6, 7, 6, 8], 10, true);
            self.leftShoe.animations.add('up', [9, 10, 9, 11], 10, true);

            self.leftShoe.tint = gear.leftShoe.color;
        }
        if (gear.rightShoe && gear.rightShoe.type === 1) {
            self.rightShoe = self.player.addChild(main.game.add.sprite(0, 0, 'player_rightShoe'));
            self.rightShoe.anchor.setTo(self.player.anchor.x, self.player.anchor.y);

            self.rightShoe.animations.add('down', [0, 1, 0, 2], 10, true);
            self.rightShoe.animations.add('left', [3, 4, 3, 5], 10, true);
            self.rightShoe.animations.add('right', [6, 7, 6, 8], 10, true);
            self.rightShoe.animations.add('up', [9, 10, 9, 11], 10, true);

            self.rightShoe.tint = gear.rightShoe.color;
        }
        if (gear.leftShoe && gear.leftShoe.type === 2) {
            self.leftShoe = self.player.addChild(main.game.add.sprite(0, 0, 'player_leftShoe2'));
            self.leftShoe.anchor.setTo(self.player.anchor.x, self.player.anchor.y);

            self.leftShoe.animations.add('down', [0, 1, 0, 2], 10, true);
            self.leftShoe.animations.add('left', [3, 4, 3, 5], 10, true);
            self.leftShoe.animations.add('right', [6, 7, 6, 8], 10, true);
            self.leftShoe.animations.add('up', [9, 10, 9, 11], 10, true);

            self.leftShoe.tint = gear.leftShoe.color;
        }
        if (gear.rightShoe && gear.rightShoe.type === 2) {
            self.rightShoe = self.player.addChild(main.game.add.sprite(0, 0, 'player_rightShoe2'));
            self.rightShoe.anchor.setTo(self.player.anchor.x, self.player.anchor.y);

            self.rightShoe.animations.add('down', [0, 1, 0, 2], 10, true);
            self.rightShoe.animations.add('left', [3, 4, 3, 5], 10, true);
            self.rightShoe.animations.add('right', [6, 7, 6, 8], 10, true);
            self.rightShoe.animations.add('up', [9, 10, 9, 11], 10, true);

            self.rightShoe.tint = gear.rightShoe.color;
        }
        //console.log("my pants sprite:", self.pants);
    }

    function gearLeft() {
        if (self.rightWield) {
            self.rightWield.animations.play(animations.left());
        }
        if (self.shirt) {
            self.shirt.animations.play(animations.left());
        }
        if (self.pants) {
            self.pants.animations.play(animations.left());
        }
        if (self.leftShoe) {
            self.leftShoe.animations.play('left');
        }
        if (self.rightShoe) {
            self.rightShoe.animations.play('left');
        }
    }

    function gearRight() {
        if (self.rightWield) {
            self.rightWield.animations.play(animations.right());
        }
        if (self.shirt) {
            self.shirt.animations.play(animations.right());
        }
        if (self.pants) {
            self.pants.animations.play(animations.right());
        }
        if (self.leftShoe) {
            self.leftShoe.animations.play('right');
        }
        if (self.rightShoe) {
            self.rightShoe.animations.play('right');
        }
    }

    function gearUp() {
        if (self.rightWield) {
            self.rightWield.animations.play(animations.up());
        }
        if (self.shirt) {
            self.shirt.animations.play(animations.up());
        }
        if (self.pants) {
            self.pants.animations.play(animations.up());
        }
        if (self.leftShoe) {
            self.leftShoe.animations.play('up');
        }
        if (self.rightShoe) {
            self.rightShoe.animations.play('up');
        }
    }

    function gearDown() {
        if (self.rightWield) {
            self.rightWield.animations.play(animations.down());
        }
        if (self.shirt) {
            self.shirt.animations.play(animations.down());
        }
        if (self.pants) {
            self.pants.animations.play(animations.down());
        }
        if (self.leftShoe) {
            self.leftShoe.animations.play('down');
        }
        if (self.rightShoe) {
            self.rightShoe.animations.play('down');
        }
    }

    function gearStop() {
        if (self.rightWield) {
            self.rightWield.animations.stop();
            self.rightWield.frame = stillFrames[self.direction]();
        }
        if (self.shirt) {
            self.shirt.animations.stop();
            self.shirt.frame = stillFrames[self.direction]();
        }
        if (self.pants) {
            self.pants.animations.stop();
            self.pants.frame = stillFrames[self.direction]();
        }
        if (self.leftShoe) {
            self.leftShoe.animations.stop();
            self.leftShoe.frame = stillFrames[self.direction](false);
        }
        if (self.rightShoe) {
            self.rightShoe.animations.stop();
            self.rightShoe.frame = stillFrames[self.direction](false);
        }
    }
    function updateHpBar() {
        var maxHp = self.playerData.game.skills.life.level * 10;
        var hp = self.playerData.game.wellness.hp;
        var width = 50;
        var height = 5;
        var greenWidth = (hp/maxHp)*width;
        var redWidth = width - greenWidth;
        var bmd = main.game.add.bitmapData(width, height);
        bmd.ctx.beginPath();
        bmd.ctx.rect(0, 0, greenWidth, height);
        bmd.ctx.fillStyle = '#00FF00';
        bmd.ctx.fill();
        bmd.ctx.closePath();
        bmd.ctx.beginPath();
        bmd.ctx.rect(greenWidth,0,redWidth, height);
        bmd.ctx.fillStyle = '#FF0000';
        bmd.ctx.fill();
        self.hpBar = main.game.add.sprite(12.5, -35, bmd);
        self.hpBar.anchor.setTo(0.5, 0.5);
        self.player.addChild(self.hpBar);
        //console.log('hp scale:', self.hpBar.scale.x, self.player.scale.x);
        self.hpBar.scale.x = self.player.scale.x;
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
        main.game.load.spritesheet('player_rightWield1', '/assets/game/dude_rightWield1_sprite.png', 25, 50);
        main.game.load.spritesheet('player_rightWield2', '/assets/game/dude_rightWield2_sprite.png', 25, 50);
        main.game.load.spritesheet('player_shirt', '/assets/game/dude_shirt_sprite.png', 25, 50);
        main.game.load.spritesheet('player_pants', '/assets/game/dude_pants_sprite.png', 25, 50);
        main.game.load.spritesheet('player_leftShoe', '/assets/game/dude_leftShoe_sprite.png', 25, 50);
        main.game.load.spritesheet('player_rightShoe', '/assets/game/dude_rightShoe_sprite.png', 25, 50);
        main.game.load.spritesheet('player_leftShoe2', '/assets/game/dude_leftShoe2_sprite.png', 25, 50);
        main.game.load.spritesheet('player_rightShoe2', '/assets/game/dude_rightShoe2_sprite.png', 25, 50);
    };
    self.createPlayer = function () {
        // Set up Player
        
        self.player = main.objects.create(self.playerData.game.x, self.playerData.game.y, 'player');
        //self.player.anchor.setTo(0, 0.9); // 0.35 0.9

        self.player.animations.add('down', [0, 1, 0, 2], 10, true);
        self.player.animations.add('left', [3, 4, 3, 5], 10, true);
        self.player.animations.add('right', [6, 7, 6, 8], 10, true);
        self.player.animations.add('up', [9, 10, 9, 11], 10, true);
        self.player.animations.add('hit_down', [12, 13, 12, 14], 10, true);
        self.player.animations.add('hit_left', [15, 16, 15, 17], 10, true);
        self.player.animations.add('hit_right', [18, 19, 18, 20], 10, true);
        self.player.animations.add('hit_up', [21, 22, 21, 23], 10, true);

        // Set up close rectangle
        self.closeRect = new Phaser.Rectangle(0, 0, 0, 0);

        // Set the still-frame- the direction the player should be standing- to facing the screen.
        self.stillFrame = 0;

        if (self.playerData.game.evilMode) {
            textColor = evilTextColor;
        } else {
            textColor = niceTextColor;
        }

        // Set up text above player
        self.text = main.game.add.text(self.playerData.game.x + 12.5, self.playerData.game.y - 20, self.playerData.username + ' (' + (self.playerData.game.skills.life.level * 10) + ')');
        self.text.anchor.setTo(0.5);
        self.text.align = 'center';
        self.text.font = 'Arial Black';
        self.text.fontSize = 16;
        self.text.stroke = '#000000';
        self.text.strokeThickness = 3;
        self.text.fill = textColor;

        // Set up the HP bar above player
        updateHpBar();

        // Set up listeners for keyboard input
        self.key = new Keys(main.game);

        // Make camera follow this player
        main.game.camera.follow(self.player);
        setUpGear();
        main.objects.sort('bottom', Phaser.Group.SORT_ASCENDING);
        self.direction = 'down';
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
        if (lastMove + moveTime < now) {
            if (self.playerData.game.evilMode) {
                textColor = evilTextColor;
            } else {
                textColor = niceTextColor;
            }
            self.text.text = self.playerData.username + ' (' + (self.playerData.game.skills.life.level * 10) + ')';
            self.text.fill = textColor;
            lastMove = now;
            if (step === serverStep) {
                step = 0;
                newPos = self.playerData.game;
            } else if (step !== 0) {
                //console.log("steps:", step, serverStep);
            }
            
            if (self.key.isDown('enter') || self.key.isDown('t')) {
                console.log("Game focusing chat");
                $('#chatInput:not(:focus)').focus();
            }
            if (self.key.isDown('space') || main.game.input.activePointer.isDown) {
                startHitMode();
            } else {
                stopHitMode();
            }
            if (self.key.isDown('left')) {
                // Move to left
                newPos.x -= horrSpeed;
                serverCommand('left');
                self.player.animations.play(animations.left());
                self.direction = 'left';
                gearLeft();
            } else if (self.key.isDown('right')) {
                // Move to right
                newPos.x += horrSpeed;
                serverCommand('right');
                self.player.animations.play(animations.right());
                self.direction = 'right';
                gearRight();
            } else if (self.key.isDown('up')) {
                // Move up
                newPos.y -= vertSpeed;
                serverCommand('up');
                self.player.animations.play(animations.up());
                self.direction = 'up';
                gearUp();
            } else if (self.key.isDown('down')) {
                // Move down
                newPos.y += vertSpeed;
                serverCommand('down');
                self.player.animations.play(animations.down());
                self.direction = 'down';
                gearDown();
            } else {
                // Player not moving

                self.player.animations.stop();
                self.player.frame = stillFrames[self.direction]();
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
                        x: newPos.x + 12.5, 
                        y: newPos.y - 20
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
        eatQueue.restore(data.game.eatQueue);
        statsUpdate(data.game);
        changeEvilMode(data.game.evilMode);
    });
    comms.on('inventory-update', function (data) {
        inventory.restore(data);
        crafting.restore({items: [], result: false})
    });

    comms.on('gear-update', function (data) {
        console.log("got gear-update", data);
        self.playerData.game.gear = data;
        setUpGear();
        gear.restore(data);
    });
    comms.on('player-move', function (data) {
        var lastHp = self.playerData.game.wellness.hp;
        changeEvilMode(data.game.evilMode);
        
        self.playerData.game = data.game;
        if (lastHp !== data.game.wellness.hp) {
            updateHpBar();
        }
        statsUpdate(data.game);
        if (data.step) {
            serverStep = data.step;
        }
    });
    comms.on('player-wellness', function (data) {
        var lastHp = self.playerData.game.wellness.hp;
        self.playerData.game.wellness = data;
        if (lastHp !== data.hp) {
            updateHpBar();
        }
        statsUpdate(self.playerData.game);
    });
    comms.on('eatqueue-update', function (data) {
        self.playerData.game.eatQueue = data;
        eatQueue.restore(data);
    });
    comms.on('craft-result', function (craftResult) {
        console.log("got craft result:", craftResult);
        crafting.restore(craftResult);
    });
    function changeEvilMode(mode) {
        $('#evilMode').prop('checked', mode);
        if (mode) {
            $('#evilMode').siblings('label').css('color', '#FFCCCC');
        } else {
            $('#evilMode').siblings('label').css('color', '#CCCCCC');
        }
    }

    $(document).on('change', '#evilMode', function (e) {
        self.playerData.game.evilMode = $(this).prop('checked');
        comms.emit('player-evilMode', $(this).prop('checked'));
        changeEvilMode($(this).prop('checked'));
    });
}