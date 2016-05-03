function Wolves (main) {
    var self = this;
    var wolves = Object.create(null);
    var moveTime = 250;
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
    self.preload = function () {
        main.game.load.spritesheet('wolf', '/assets/game/wolf_sprite.png', 50, 32, 14);
    };
    /*
    self.create = function () {
        var testSprite = main.objects.create(
            250,
            250,
            'wolf'
        );
        testSprite.animations.add(
            'left',
            [7, 8, 9],
            7.5,
            true
        );
        testSprite.animations.play('left');
    }
    */
    self.update = function () {
        if (lastMove + moveTime < Date.now()) {
            lastMove = Date.now();
            cycleWolfQueues();
        }
    };
    comms.on('wolf-update', function (data) {
        //console.log("got wolf update", data.place);
        var game = {
            x: data.place[0],
            y: data.place[1],
            wellness: data.wellness,
            skills: data.skills
        };
        if (!(data._id in wolves)) {
            wolves[data._id] = {};
            wolves[data._id].stillFrames = {
                up: 0,
                down: 3,
                left: 6,
                right: 11
            };
            wolves[data._id].sprite = main.objects.create(
                data.place[0],
                data.place[1],
                'wolf'
            );
            //wolves[data._id].sprite.anchor.setTo(0.5, 0.9);
            wolves[data._id].sprite.animations.add(
                'down',
                [1, 2],
                2.5,
                true
            );
            wolves[data._id].sprite.animations.add(
                'up',
                [4, 5],
                2.5,
                true
            );
            wolves[data._id].sprite.animations.add(
                'left',
                [7, 8, 9],
                5,
                true
            );
            wolves[data._id].sprite.animations.add(
                'right',
                [11, 12, 13],
                5,
                true
            );
            wolves[data._id].text = main.game.add.text(
                data.place[0] - 2, 
                data.place[1] - 60, 
                'Wolf (' + (data.skills.life.level * 10) + ')'
            );
            wolves[data._id].text.anchor.setTo(0.5);
            wolves[data._id].text.align = 'center';
            wolves[data._id].text.font = 'Arial Black';
            wolves[data._id].text.fontSize = 16;
            wolves[data._id].text.stroke = '#000000';
            wolves[data._id].text.strokeThickness = 3;
            wolves[data._id].text.fill = '#FFCCCC';

            wolves[data._id].stillFrame = wolves[data._id].stillFrames.down;
            wolves[data._id].game = game;
            wolves[data._id].queue = [];
            wolves[data._id].maxHp = data.skills.life.level * 10;
            updateHpBar(wolves[data._id]);
            wolves[data._id].ready = true;
        }
        wolves[data._id].sprite.revive();
        wolves[data._id].text.revive();
        wolves[data._id].text.text = 'Wolf (' + (data.skills.life.level * 10) + ')';
        wolves[data._id].maxHp = (data.skills.life.level * 10);
        wolves[data._id].queue.push(game);
        var lastHp = wolves[data._id].game.wellness.hp;
        if (lastHp !== game.wellness.hp) {
            wolves[data._id].game.wellness = game.wellness;
            updateHpBar(wolves[data._id]);
        }
    });
    function destroyWolf (id) {
        if (wolves[id] !== void 0) {
            wolves[id].sprite.destroy();
            wolves[id].text.destroy();
            delete wolves[id];
        }
    }
    comms.on('wolf-removed', destroyWolf);
    comms.on('wolf-update-not-in-sect', function (wolf) {
        //console.log('removing wolf from sect');
        if (wolf._id in wolves) {
            wolves[wolf._id].sprite.kill();
            wolves[wolf._id].text.kill();
        }
    });
}