
function initializeGame (main) {
    var sortInterval = 100;
    var lastSort = 0;
    main.game = new Phaser.Game(1000, 700, Phaser.CANVAS, 'canvas', {
        preload: preload, 
        create: create,
        update: update,
        render: render
    });
    main.objects;
    main.map = new Map (main);
    main.player = new Player(main);
    main.herbs = new Herbs(main);
    main.mines = new Mines(main);
    main.groundItems = new GroundItems(main);
    main.utils = {
        isClose: function (sprite) {
            var result = main.player.closeRect.intersects(sprite);
            return result
        },
        sortUp: function (sprite) {
            var curIndex = main.objects.getIndex(sprite);
            var i = curIndex - 1;
            var sprBottom = sprite.bottom;
            while (i > 0 && sprBottom < main.objects.children[i].bottom) {
                main.objects.swap(main.objects.children[i], sprite);
                i -= 1;
            }
        },
        sortDown: function (sprite) {
            var curIndex = main.objects.getIndex(sprite);
            var i = curIndex + 1;
            var sprBottom = sprite.bottom;
            while (i < main.objects.length && sprBottom > main.objects.children[i].bottom) {
                main.objects.swap(main.objects.children[i], sprite);
                i += 1;
            }
        }
    }
    main.scale = 2;
    var plugins = new Plugins(main.player, new Others(main), main.herbs, main.mines, main.groundItems);

    function preload() {
        main.game.time.advancedTiming = true;
        main.game.stage.disableVisibilityChange = true;
        main.game.world.setBounds(0, 0, 2048 * main.scale, 2048 * main.scale);
        main.game.world.scale.setTo(main.scale, main.scale);
        //main.game.stage.scale.setTo(3, 3);
        //main.game.scale.setScreenSize(true);
        main.map.preload();
        plugins.preload();
    }
    function create() {
        main.game.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        main.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        main.game.scale.minWidth = 512;
        main.game.scale.minHeight = 512;
        main.game.scale.maxWidth = 1024;
        main.game.scale.maxHeight = 1024;
        main.game.scale.updateLayout();
        main.game.scale.refresh();
        main.map.create();
        main.objects = main.game.add.group();
        plugins.create();
        comms.emit('game-ready', true);
    }
    var cameraXY = [0, 0];
    function update() {
        var now = Date.now();
        main.map.update();
        plugins.update();
        /*
        if (main.game.camera.x !== cameraXY[0] || 
            main.game.camera.y !== cameraXY[1]
        ) {
            main.herbs.viewChange();
        }
        cameraXY[0] = main.game.camera.x;
        cameraXY[1] = main.game.camera.y;
        /*
        if (lastSort + sortInterval < now) {
            lastSort = now;
            main.objects.sort('bottom', Phaser.Group.SORT_ASCENDING);
        }
        */
    }
    function render () {
        main.game.debug.text(main.game.time.fps + 'fps', 2, 15, "#00ff00");
        main.game.debug.text(main.objects.length + ' objects', 2, 45, "#00ff00");
        main.map.render();
        plugins.render();
    }
    
}