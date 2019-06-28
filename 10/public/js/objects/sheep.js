function Sheep (main) {
    var self = this;
    var manySheep = Object.create(null);
    var moveTime = 250;
    var tweenTime = 0.9;
    var lastMove = 0;
    var maxQueueLength = 3;
    function eachSheep(fn) {
        var id;
        for (id in manySheep) {
            if (!manySheep[id].ready) {
                continue;
            }
            fn(manySheep[id], id);
        }
    }
    function moveSheep(sheep, destination) {
        console.log("moving sheep to: ", destination);
        sheep.sprite.x = sheep.game.x;
        sheep.sprite.y = sheep.game.y;

        if (destination.x < sheep.sprite.x) {
            sheep.sprite.animations.play('left');
            sheep.stillFrame = 3;
        } else if (destination.x > sheep.sprite.x) {
            sheep.sprite.animations.play('right');
            sheep.stillFrame = 3;
        } else if (destination.y < sheep.sprite.y) {
            sheep.sprite.animations.play('up');
            sheep.stillFrame = 6;
        } else if (destination.y > sheep.sprite.y) {
            sheep.sprite.animations.play('down');
            sheep.stillFrame = 0;
        }
        var pTween = main.game.add.tween(sheep.sprite);
        pTween.to(destination, moveTime * tweenTime, 'Linear');
        pTween.start();
        if (destination.y < sheep.sprite.y) {
            pTween.onComplete.add(function () {
                //console.log("bottom:", self.sheep.bottom);
                main.utils.sortUp(sheep.sprite);
            });
        } else if (destination.y > sheep.sprite.y) {
            pTween.onComplete.add(function () {
                //console.log("bottom:", self.sheep.bottom);
                main.utils.sortDown(sheep.sprite);
            });
        }
        main.game.add.tween(sheep.text).
            to({
                x: destination.x - 2,
                y: destination.y - 60
            }, moveTime * tweenTime, 'Linear').
            start();
    }
    function cycleSheepQueues() {
        var destination;
        eachSheep(function (sheep) {
            if (sheep.queue.length > 0) {
                console.log('queue size:', sheep.queue.length);
                if (sheep.queue.length > maxQueueLength) {
                    destination = sheep.queue.pop();
                    sheep.queue = [];
                } else {
                    destination = sheep.queue.shift();
                }
                
                moveSheep(sheep, destination);
                sheep.game = destination;
            } else {
                sheep.sprite.animations.stop();
                sheep.sprite.frame = sheep.stillFrame;
            }
        });
    }
    function updateHpBar(sheep) {
        var maxHp = sheep.maxHp;
        var hp = sheep.game.wellness.hp;
        var width = 50;
        var height = 5;
        var greenWidth = (hp/maxHp)*width;
        var redWidth = width - greenWidth;
        var bmd = main.game.add.bitmapData(width, height);
        console.log("Updating sheep HP bar", maxHp, hp);
        bmd.ctx.beginPath();
        bmd.ctx.rect(0, 0, greenWidth, height);
        bmd.ctx.fillStyle = '#00FF00';
        bmd.ctx.fill();
        bmd.ctx.closePath();
        bmd.ctx.beginPath();
        bmd.ctx.rect(greenWidth,0,redWidth, height);
        bmd.ctx.fillStyle = '#FF0000';
        bmd.ctx.fill();
        sheep.hpBar = main.game.add.sprite(0, -80, bmd);
        sheep.hpBar.anchor.setTo(0.5, 0.5);
        sheep.sprite.addChild(sheep.hpBar);
    }
    self.preload = function () {
        main.game.load.spritesheet('sheep', '/assets/game/sheep_sprite.png', 40, 40, 16);
    };
    /*
    self.create = function () {
        var testSprite = main.objects.create(
            250,
            250,
            'sheep'
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
            cycleSheepQueues();
        }
    };
    comms.on('sheep-update', function (data) {
        //console.log("got sheep update", data.place);
        var game = {
            x: data.place[0],
            y: data.place[1],
            wellness: data.wellness,
            skills: data.skills
        };
        if (!(data._id in manySheep)) {
            manySheep[data._id] = {};
            manySheep[data._id].stillFrames = {
                up: 1,
                down: 9,
                left: 5,
                right: 5
            };
            manySheep[data._id].sprite = main.objects.create(
                data.place[0],
                data.place[1],
                'sheep'
            );
            //manySheep[data._id].sprite.anchor.setTo(0.5, 0.9);
            manySheep[data._id].sprite.animations.add(
                'down',
                [8,9,10,11],
                0,
                true
            );
            manySheep[data._id].sprite.animations.add(
                'up',
                [0,1,2,3],
                0,
                true
            );
            manySheep[data._id].sprite.animations.add(
                'left',
                [4,5,6,7],
                0,
                true
            );
            manySheep[data._id].sprite.animations.add(
                'right',
                [12,13,14,15],
                0,
                true
            );
            manySheep[data._id].text = main.game.add.text(
                data.place[0] - 2, 
                data.place[1] - 60, 
                'Sheep (' + (data.skills.life.level * 10) + ')'
            );
            manySheep[data._id].text.anchor.setTo(0.5);
            manySheep[data._id].text.align = 'center';
            manySheep[data._id].text.font = 'Arial Black';
            manySheep[data._id].text.fontSize = 16;
            manySheep[data._id].text.stroke = '#000000';
            manySheep[data._id].text.strokeThickness = 3;
            manySheep[data._id].text.fill = '#FFCCCC';

            manySheep[data._id].stillFrame = manySheep[data._id].stillFrames.down;
            manySheep[data._id].game = game;
            manySheep[data._id].queue = [];
            manySheep[data._id].maxHp = data.skills.life.level * 10;
            updateHpBar(manySheep[data._id]);
            manySheep[data._id].ready = true;
        }
        manySheep[data._id].sprite.revive();
        manySheep[data._id].text.revive();
        manySheep[data._id].text.text = 'Sheep (' + (data.skills.life.level * 10) + ')';
        manySheep[data._id].maxHp = (data.skills.life.level * 10);
        manySheep[data._id].queue.push(game);
        var lastHp = manySheep[data._id].game.wellness.hp;
        if (lastHp !== game.wellness.hp) {
            manySheep[data._id].game.wellness = game.wellness;
            updateHpBar(manySheep[data._id]);
        }
    });
    function destroySheep (id) {
        if (manySheep[id] !== void 0) {
            manySheep[id].sprite.destroy();
            manySheep[id].text.destroy();
            delete manySheep[id];
        }
    }
    comms.on('sheep-removed', destroySheep);
    comms.on('sheep-update-not-in-sect', function (sheep) {
        //console.log('removing sheep from sect');
        if (sheep._id in manySheep) {
            manySheep[sheep._id].sprite.kill();
            manySheep[sheep._id].text.kill();
        }
    });
}