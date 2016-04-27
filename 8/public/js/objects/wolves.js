function Wolves (main) {
    var self = this;
    var wolves = Object.create(null);
    var moveTime = 100;
    var tweenTime = 0.9;
    var lastMove = 0;
    var maxQueueLength = 3;
    function eachWolf(fn) {
        var id;
        for (id in wolves) {
            if (!wolves[id].ready) {
                continue;
            }
            fn(wolves[id], id);
        }
    }
    function moveWolf(wolf, destination) {
        console.log("moving wolf to: ", destination);
        wolf.sprite.x = wolf.game.x;
        wolf.sprite.y = wolf.game.y;

        if (destination.x < wolf.sprite.x) {
            wolf.sprite.animations.play('left');
            wolf.stillFrame = 3;
        } else if (destination.x > wolf.sprite.x) {
            wolf.sprite.animations.play('right');
            wolf.stillFrame = 3;
        } else if (destination.y < wolf.sprite.y) {
            wolf.sprite.animations.play('up');
            wolf.stillFrame = 6;
        } else if (destination.y > wolf.sprite.y) {
            wolf.sprite.animations.play('down');
            wolf.stillFrame = 0;
        }
        var pTween = main.game.add.tween(wolf.sprite);
        pTween.to(destination, moveTime * tweenTime, 'Linear');
        pTween.start();
        if (destination.y < wolf.sprite.y) {
            pTween.onComplete.add(function () {
                //console.log("bottom:", self.wolf.bottom);
                main.utils.sortUp(wolf.sprite);
            });
        } else if (destination.y > wolf.sprite.y) {
            pTween.onComplete.add(function () {
                //console.log("bottom:", self.wolf.bottom);
                main.utils.sortDown(wolf.sprite);
            });
        }
        main.game.add.tween(wolf.text).
            to({
                x: destination.x - 2,
                y: destination.y - 60
            }, moveTime * tweenTime, 'Linear').
            start();
    }
    function cycleWolfQueues() {
        var destination;
        eachWolf(function (wolf) {
            if (wolf.queue.length > 0) {
                console.log('queue size:', wolf.queue.length);
                if (wolf.queue.length > maxQueueLength) {
                    destination = wolf.queue.pop();
                    wolf.queue = [];
                } else {
                    destination = wolf.queue.shift();
                }
                
                moveWolf(wolf, destination);
                wolf.game = destination;
            } else {
                wolf.sprite.animations.stop();
                wolf.sprite.frame = wolf.stillFrame;
            }
        });
    }
    function updateHpBar(wolf) {
        var maxHp = wolf.maxHp;
        var hp = wolf.game.wellness.hp;
        var width = 50;
        var height = 5;
        var greenWidth = (hp/maxHp)*width;
        var redWidth = width - greenWidth;
        var bmd = main.game.add.bitmapData(width, height);
        console.log("Updating wolf HP bar", maxHp, hp);
        bmd.ctx.beginPath();
        bmd.ctx.rect(0, 0, greenWidth, height);
        bmd.ctx.fillStyle = '#00FF00';
        bmd.ctx.fill();
        bmd.ctx.closePath();
        bmd.ctx.beginPath();
        bmd.ctx.rect(greenWidth,0,redWidth, height);
        bmd.ctx.fillStyle = '#FF0000';
        bmd.ctx.fill();
        wolf.hpBar = main.game.add.sprite(0, -80, bmd);
        wolf.hpBar.anchor.setTo(0.5, 0.5);
        wolf.sprite.addChild(wolf.hpBar);
    }
    self.update = function () {
        if (lastMove + moveTime < Date.now()) {
            lastMove = Date.now();
            cycleWolfQueues();
        }
    };
    comms.on('wolf-update', function (data) {
        console.log("got wolf update", data.place);
        /*
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

            others[data.username].hit_sprite = main.objects.create(
                data.game.x, 
                data.game.y, 
                'player_hit'
            );
            others[data.username].hit_sprite.anchor.setTo(0.5, 0.9);
            others[data.username].hit_sprite.animations.add(
                'down', 
                [0, 1, 0, 2], 
                10, 
                true
            );
            others[data.username].hit_sprite.animations.add(
                'left', 
                [3, 4, 3, 5], 
                10, 
                true
            );
            others[data.username].hit_sprite.animations.add(
                'right', 
                [3, 4, 3, 5], 
                10, 
                true
            );
            others[data.username].hit_sprite.animations.add(
                'up', 
                [6, 7, 6, 8], 
                10, 
                true
            );
            others[data.username].hit_sprite.kill();

            // Set up text above player
            others[data.username].text = main.game.add.text(
                data.game.x - 2, 
                data.game.y - 60, 
                data.username + ' (' + data.maxHp + ')'
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
            others[data.username].lastDirection = 'down';
            others[data.username].game = data.game;
            others[data.username].queue = [];
            others[data.username].inHitMode = false;
            others[data.username].maxHp = data.maxHp;
            others[data.username].hitSwitchInterval = null;
            setUpGear(others[data.username]);
            updateHpBar(others[data.username]);
            others[data.username].ready = true;
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
        */
    });
    comms.on('wolf-removed', function (id) {
        if (others[id] !== void 0) {
            others[id].sprite.destroy();
            others[id].text.destroy();
            delete others[id];
        }
    });
}