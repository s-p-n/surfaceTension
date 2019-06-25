function Others(main) {
    "use strict";
    var self = this;
    var others = Object.create(null);
    var moveTime = 312.5;
    var tweenTime = 0.9;
    var evilTextColor = '#FFCCCC';
    var niceTextColor = '#FFFFFF';
    var lastMove = 0;
    var maxQueueLength = 3;
    var hitSwitchIntervalTime = 500;
    var animations = {
        left: function (p) {
            if (p.inHitMode) {
                return 'hit_left';
            }
            return 'left';
        },
        right: function (p) {
            if (p.inHitMode) {
                return 'hit_right';
            }
            return 'right';
        },
        up: function (p) {
            if (p.inHitMode) {
                return 'hit_up';
            }
            return 'up';
        },
        down: function (p) {
            if (p.inHitMode) {
                return 'hit_down';
            }
            return 'down';
        }
    };
    var stillFrames = {
        left: function (p, check) {
            if (check === void 0) {
                check = true;
            }
            if (check && p.inHitMode) {
                return 15;
            }
            return 3;
        },
        right: function (p, check) {
            if (check === void 0) {
                check = true;
            }
            if (check && p.inHitMode) {
                return 18;
            }
            return 6;
        },
        up: function (p, check) {
            if (check === void 0) {
                check = true;
            }
            if (check && p.inHitMode) {
                return 21;
            }
            return 9;
        },
        down: function (p, check) {
            if (check === void 0) {
                check = true;
            }
            if (check && p.inHitMode) {
                return 12;
            }
            return 0;
        }
    };
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
            player.direction = 'left';
            player.sprite.animations.play(animations.left(player));
            gearLeft(player);
        } else if (destination.x > player.sprite.x) {
            player.direction = 'right';
            player.sprite.animations.play(animations.right(player));
            gearRight(player);
        } else if (destination.y < player.sprite.y) {
            player.direction = 'up';
            player.sprite.animations.play(animations.up(player));
            gearUp(player);
        } else if (destination.y > player.sprite.y) {
            player.direction = 'down';
            player.sprite.animations.play(animations.down(player));
            gearDown(player);
        }
        var pTween = main.game.add.tween(player.sprite);
        pTween.to(destination, moveTime * tweenTime, 'Linear');
        pTween.start();
        if (destination.y < player.sprite.y) {
            pTween.onComplete.add(function () {
                //console.log("bottom:", self.player.bottom);
                main.utils.sortUp(player.sprite);
            });
        } else if (destination.y > player.sprite.y) {
            pTween.onComplete.add(function () {
                //console.log("bottom:", self.player.bottom);
                main.utils.sortDown(player.sprite);
            });
        }
        main.game.add.tween(player.text).
            to({
                x: destination.x + 12.5,
                y: destination.y - 20
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
                player.sprite.frame = stillFrames[player.direction](player);
                gearStop(player);
            }
        });
    }

    function hitModeOn (p) {
        p.inHitMode = true;
    }

    function hitModeOff (p) {
        p.inHitMode = false;
    }

    function hitModeToggle (p) {
        console.log("HitModeToggle:", p.inHitMode);
        if (p.inHitMode) {
            hitModeOff(p);
        } else {
            hitModeOn(p);
        }
    }

    function startHitMode (p) {
        if (p.hitSwitchInterval === null && !p.inHitMode) {
            console.log("Starting hit mode.");
            hitModeOn(p);
            p.hitSwitchInterval = setInterval(hitModeToggle, hitSwitchIntervalTime, p);
        }
    }

    function stopHitMode (p) {
        if (p.hitSwitchInterval !== null && !p.inHitMode) {
            console.log("Stopping hit mode.");
            clearInterval(p.hitSwitchInterval);
            p.hitSwitchInterval = null;
            hitModeOff(p);
        }
    }

    function destroyGear(p) {
        if (p.rightWield) {
            p.rightWield.destroy();
        }
        if (p.shirt) {
            p.shirt.destroy();
        }
        if (p.pants) {
            p.pants.destroy();
        }
        if (p.leftShoe) {
            p.leftShoe.destroy();
        }
        if (p.rightShoe) {
            p.rightShoe.destroy();
        }
    }

    function gearShouldUpdate(p, newGear) {
        if (p.game.gear.rightWield.type !== newGear.rightWield.type ||
            p.game.gear.rightWield.type !== newGear.rightWield.type ||
            p.game.gear.pants.type !== newGear.pants.type ||
            p.game.gear.leftShoe.type !== newGear.leftShoe.type ||
            p.game.gear.rightShoe.type !== newGear.rightShoe.type) {
            return true;
        }
        return false;
    }

    function setUpGear(p) {
        var gear = p.game.gear;
        console.log('other gear:', gear);
        destroyGear(p);
        if (gear.rightWield.type === 1) {
            p.rightWield = p.sprite.addChild(main.game.add.sprite(0, 0, 'player_rightWield1'));
            p.rightWield.anchor.setTo(p.sprite.anchor.x, p.sprite.anchor.y);

            p.rightWield.animations.add('down', [0, 1, 0, 2], 10, true);
            p.rightWield.animations.add('left', [3, 4, 3, 5], 10, true);
            p.rightWield.animations.add('right', [6, 7, 6, 8], 10, true);
            p.rightWield.animations.add('up', [9, 10, 9, 11], 10, true);
            p.rightWield.animations.add('hit_down', [12, 13, 12, 14], 10, true);
            p.rightWield.animations.add('hit_left', [15, 16, 15, 17], 10, true);
            p.rightWield.animations.add('hit_right', [18, 19, 18, 20], 10, true);
            p.rightWield.animations.add('hit_up', [21, 22, 21, 23], 10, true);

            p.rightWield.tint = gear.rightWield.color;
        }
        if (gear.rightWield.type === 2) {
            p.rightWield = p.sprite.addChild(main.game.add.sprite(0, 0, 'player_rightWield2'));
            p.rightWield.anchor.setTo(p.sprite.anchor.x, p.sprite.anchor.y);

            p.rightWield.animations.add('down', [0, 1, 0, 2], 10, true);
            p.rightWield.animations.add('left', [3, 4, 3, 5], 10, true);
            p.rightWield.animations.add('right', [6, 7, 6, 8], 10, true);
            p.rightWield.animations.add('up', [9, 10, 9, 11], 10, true);
            p.rightWield.animations.add('hit_down', [12, 13, 12, 14], 10, true);
            p.rightWield.animations.add('hit_left', [15, 16, 15, 17], 10, true);
            p.rightWield.animations.add('hit_right', [18, 19, 18, 20], 10, true);
            p.rightWield.animations.add('hit_up', [21, 22, 21, 23], 10, true);

            p.rightWield.tint = gear.rightWield.color;
        }
        if (gear.shirt.type === 1) {
            p.shirt = p.sprite.addChild(main.game.add.sprite(0, 0, 'player_shirt'));
            p.shirt.anchor.setTo(p.sprite.anchor.x, p.sprite.anchor.y);

            p.shirt.animations.add('down', [0, 1, 0, 2], 10, true);
            p.shirt.animations.add('left', [3, 4, 3, 5], 10, true);
            p.shirt.animations.add('right', [6, 7, 6, 8], 10, true);
            p.shirt.animations.add('up', [9, 10, 9, 11], 10, true);
            p.shirt.animations.add('hit_down', [12, 13, 12, 14], 10, true);
            p.shirt.animations.add('hit_left', [15, 16, 15, 17], 10, true);
            p.shirt.animations.add('hit_right', [18, 19, 18, 20], 10, true);
            p.shirt.animations.add('hit_up', [21, 22, 21, 23], 10, true);

            p.shirt.tint = gear.shirt.color;
        }
        if (gear.pants.type === 1) {
            p.pants = p.sprite.addChild(main.game.add.sprite(0, 0, 'player_pants'));
            p.pants.anchor.setTo(p.sprite.anchor.x, p.sprite.anchor.y);

            p.pants.animations.add('down', [0, 1, 0, 2], 10, true);
            p.pants.animations.add('left', [3, 4, 3, 5], 10, true);
            p.pants.animations.add('right', [6, 7, 6, 8], 10, true);
            p.pants.animations.add('up', [9, 10, 9, 11], 10, true);
            p.pants.animations.add('hit_down', [12, 13, 12, 14], 10, true);
            p.pants.animations.add('hit_left', [15, 16, 15, 17], 10, true);
            p.pants.animations.add('hit_right', [18, 19, 18, 20], 10, true);
            p.pants.animations.add('hit_up', [21, 22, 21, 23], 10, true);

            p.pants.tint = gear.pants.color;
        }
        if (gear.leftShoe.type === 1) {
            p.leftShoe = p.sprite.addChild(main.game.add.sprite(0, 0, 'player_leftShoe'));
            p.leftShoe.anchor.setTo(p.sprite.anchor.x, p.sprite.anchor.y);

            p.leftShoe.animations.add('down', [0, 1, 0, 2], 10, true);
            p.leftShoe.animations.add('left', [3, 4, 3, 5], 10, true);
            p.leftShoe.animations.add('right', [6, 7, 6, 8], 10, true);
            p.leftShoe.animations.add('up', [9, 10, 9, 11], 10, true);

            p.leftShoe.tint = gear.leftShoe.color;
        }
        if (gear.rightShoe.type === 1) {
            p.rightShoe = p.sprite.addChild(main.game.add.sprite(0, 0, 'player_rightShoe'));
            p.rightShoe.anchor.setTo(p.sprite.anchor.x, p.sprite.anchor.y);

            p.rightShoe.animations.add('down', [0, 1, 0, 2], 10, true);
            p.rightShoe.animations.add('left', [3, 4, 3, 5], 10, true);
            p.rightShoe.animations.add('right', [6, 7, 6, 8], 10, true);
            p.rightShoe.animations.add('up', [9, 10, 9, 11], 10, true);

            p.rightShoe.tint = gear.rightShoe.color;
        }
        if (gear.leftShoe.type === 2) {
            p.leftShoe = p.sprite.addChild(main.game.add.sprite(0, 0, 'player_leftShoe2'));
            p.leftShoe.anchor.setTo(p.sprite.anchor.x, p.sprite.anchor.y);

            p.leftShoe.animations.add('down', [0, 1, 0, 2], 10, true);
            p.leftShoe.animations.add('left', [3, 4, 3, 5], 10, true);
            p.leftShoe.animations.add('right', [6, 7, 6, 8], 10, true);
            p.leftShoe.animations.add('up', [9, 10, 9, 11], 10, true);

            p.leftShoe.tint = gear.leftShoe.color;
        }
        if (gear.rightShoe.type === 2) {
            p.rightShoe = p.sprite.addChild(main.game.add.sprite(0, 0, 'player_rightShoe2'));
            p.rightShoe.anchor.setTo(p.sprite.anchor.x, p.sprite.anchor.y);

            p.rightShoe.animations.add('down', [0, 1, 0, 2], 10, true);
            p.rightShoe.animations.add('left', [3, 4, 3, 5], 10, true);
            p.rightShoe.animations.add('right', [6, 7, 6, 8], 10, true);
            p.rightShoe.animations.add('up', [9, 10, 9, 11], 10, true);

            p.rightShoe.tint = gear.rightShoe.color;
        }
    }

    function gearLeft(p) {
        if (p.rightWield) {
            p.rightWield.animations.play(animations.left(p));
        }
        if (p.shirt) {
            p.shirt.animations.play(animations.left(p));
        }
        if (p.pants) {
            p.pants.animations.play(animations.left(p));
        }
        if (p.leftShoe) {
            p.leftShoe.animations.play('left');
        }
        if (p.rightShoe) {
            p.rightShoe.animations.play('left');
        }
    }

    function gearRight(p) {
        if (p.rightWield) {
            p.rightWield.animations.play(animations.right(p));
        }
        if (p.shirt) {
            p.shirt.animations.play(animations.right(p));
        }
        if (p.pants) {
            p.pants.animations.play(animations.right(p));
        }
        if (p.leftShoe) {
            p.leftShoe.animations.play('right');
        }
        if (p.rightShoe) {
            p.rightShoe.animations.play('right');
        }
    }

    function gearUp(p) {
        if (p.rightWield) {
            p.rightWield.animations.play(animations.up(p));
        }
        if (p.shirt) {
            p.shirt.animations.play(animations.up(p));
        }
        if (p.pants) {
            p.pants.animations.play(animations.up(p));
        }
        if (p.leftShoe) {
            p.leftShoe.animations.play('up');
        }
        if (p.rightShoe) {
            p.rightShoe.animations.play('up');
        }
    }

    function gearDown(p) {
        if (p.rightWield) {
            p.rightWield.animations.play(animations.down(p));
        }
        if (p.shirt) {
            p.shirt.animations.play(animations.down(p));
        }
        if (p.pants) {
            p.pants.animations.play(animations.down(p));
        }
        if (p.leftShoe) {
            p.leftShoe.animations.play('down');
        }
        if (p.rightShoe) {
            p.rightShoe.animations.play('down');
        }
    }

    function gearStop(p) {
        if (p.rightWield) {
            p.rightWield.animations.stop();
            p.rightWield.frame = stillFrames[p.direction](p);
        }
        if (p.shirt) {
            p.shirt.animations.stop();
            p.shirt.frame = stillFrames[p.direction](p);
        }
        if (p.pants) {
            p.pants.animations.stop();
            p.pants.frame = stillFrames[p.direction](p);
        }
        if (p.leftShoe) {
            p.leftShoe.animations.stop();
            p.leftShoe.frame = stillFrames[p.direction](p, false);
        }
        if (p.rightShoe) {
            p.rightShoe.animations.stop();
            p.rightShoe.frame = stillFrames[p.direction](p, false);
        }
    }

    function updateHpBar(p) {
        var maxHp = p.maxHp;
        var hp = p.game.wellness.hp;
        var width = 50;
        var height = 5;
        var greenWidth = (hp/maxHp)*width;
        var redWidth = width - greenWidth;
        var bmd = main.game.add.bitmapData(width, height);
        console.log("Updating other HP bar", maxHp, hp);
        bmd.ctx.beginPath();
        bmd.ctx.rect(0, 0, greenWidth, height);
        bmd.ctx.fillStyle = '#00FF00';
        bmd.ctx.fill();
        bmd.ctx.closePath();
        bmd.ctx.beginPath();
        bmd.ctx.rect(greenWidth,0,redWidth, height);
        bmd.ctx.fillStyle = '#FF0000';
        bmd.ctx.fill();
        p.hpBar = main.game.add.sprite(12.5, -35, bmd);
        p.hpBar.anchor.setTo(0.5, 0.5);
        p.sprite.addChild(p.hpBar);
        //console.log('hp scale:', p.hpBar.scale.x, p.sprite.scale.x);
        p.hpBar.scale.x = p.sprite.scale.x;
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
                [6, 7, 6, 8], 
                10, 
                true
            );
            others[data.username].sprite.animations.add(
                'up', 
                [9, 10, 9, 11], 
                10, 
                true
            );
            others[data.username].sprite.animations.add(
                'hit_down', 
                [12, 13, 12, 14], 
                10, 
                true
            );
            others[data.username].sprite.animations.add(
                'hit_left', 
                [15, 16, 15, 17], 
                10, 
                true
            );
            others[data.username].sprite.animations.add(
                'hit_right', 
                [18, 19, 18, 20], 
                10, 
                true
            );
            others[data.username].sprite.animations.add(
                'hit_up', 
                [21, 22, 21, 23], 
                10, 
                true
            );

            // Set up text above player
            others[data.username].text = main.game.add.text(
                data.game.x + 12.5, 
                data.game.y - 20, 
                data.username + ' (' + data.maxHp + ')'
            );
            others[data.username].text.anchor.setTo(0.5);
            others[data.username].text.align = 'center';
            others[data.username].text.font = 'Arial Black';
            others[data.username].text.fontSize = 16;
            others[data.username].text.stroke = '#000000';
            others[data.username].text.strokeThickness = 3;

            // Set up miscellaneous data for player.
            others[data.username].stillFrame = 0;
            others[data.username].direction = 'down';
            others[data.username].game = data.game;
            others[data.username].queue = [];
            others[data.username].inHitMode = false;
            others[data.username].maxHp = data.maxHp;
            others[data.username].hitSwitchInterval = null;
            setUpGear(others[data.username]);
            updateHpBar(others[data.username]);
            others[data.username].ready = true;
        }
        if (data.game.evilMode) {
            others[data.username].text.fill = evilTextColor;
        } else {
            others[data.username].text.fill = niceTextColor;
        }
        others[data.username].text.text = data.username + ' (' + data.maxHp + ')';
        others[data.username].maxHp = data.maxHp;
        others[data.username].queue.push(data.game);
        if (data.hitMode) {
            startHitMode(others[data.username]);
        } else {
            stopHitMode(others[data.username]);
        }
        console.log(others[data.username].game);
        var lastHp = others[data.username].game.wellness.hp;
        if (lastHp !== data.game.wellness.hp) {
            others[data.username].game.wellness = data.game.wellness;
            updateHpBar(others[data.username]);
        }
        if (gearShouldUpdate(others[data.username], data.game.gear)) {
            console.log('updating other players gear');
            others[data.username].game.gear = data.game.gear;
            setUpGear(others[data.username]);
        }
    });
    function destroyPlayer(player) {
        if (others[player] !== void 0) {
            destroyGear(others[player]);
            others[player].text.destroy();
            others[player].hpBar.destroy();
            others[player].sprite.destroy();
            clearInterval(others[player].hitSwitchInterval);
            others[player].hitSwitchInterval = null;
            delete others[player];
        }
    }
    comms.on('others-update-not-in-sect', function (data) {
        var player = data.username;
        destroyPlayer(player)
    });
    comms.on('player-disconnect', destroyPlayer);
}