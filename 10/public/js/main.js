
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
    main.others = new Others(main);
    main.herbs = new Herbs(main);
    main.wolves = new Wolves(main);
    main.mines = new Mines(main);
    main.groundItems = new GroundItems(main);
    main.utils = {
        isClose: function (sprite) {
            var result = main.player.closeRect.intersects(sprite);
            return result
        },
        sortUp: function (sprite) {
            main.objects.sort('bottom', Phaser.Group.SORT_ASCENDING);
            /*
            var curIndex = main.objects.getIndex(sprite);
            var i = curIndex - 1;
            var sprBottom = sprite.bottom;
            console.log("start index:", curIndex);
            while (i > 0 && sprBottom <= main.objects.children[i].bottom) {
                console.log("up swapping", sprBottom, "with", main.objects.children[i].bottom);
                main.objects.swap(main.objects.children[i], sprite);
                i -= 1;
            }
            console.log("end index:", main.objects.getIndex(sprite));
            */
        },
        sortDown: function (sprite) {
            main.objects.sort('bottom', Phaser.Group.SORT_ASCENDING);
            /*
            var curIndex = main.objects.getIndex(sprite);
            var i = curIndex + 1;
            var sprBottom = sprite.bottom;
            console.log("start index:", curIndex);
            while (i < main.objects.length && sprBottom >= main.objects.children[i].bottom) {
                console.log("down swapping", sprBottom, "with", main.objects.children[i].bottom);
                main.objects.swap(main.objects.children[i], sprite);
                i += 1;
            }
            console.log("end index:", main.objects.getIndex(sprite));
            */
        }
    }
    main.scale = 1;
    var plugins = new Plugins(main.player, main.others, main.herbs, main.mines, main.groundItems, main.wolves);

    function preload() {
        main.game.time.advancedTiming = true;
        main.game.stage.disableVisibilityChange = true;
        //main.game.stage.scale.setTo(3, 3);
        //main.game.scale.setScreenSize(true);
        main.game.load.audio('background', 'git-off/CreativeSpark-Unified_String_Theory-V2.mp3')
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
        window.bgSound = new Phaser.Sound(main.game, 'background', 1, true)
    }
    var cameraXY = [0, 0];
    function update() {
        var now = Date.now();
        plugins.update();
    }
    var renderThrottle = 1000;
    var lastRender = Date.now();
    function render () {
        if (Date.now() > lastRender + renderThrottle) {
            main.game.debug.text(main.game.time.fps + 'fps', 2, 15, "#00ff00");
            main.game.debug.text(main.objects.length + ' objects', 2, 45, "#00ff00");
            main.map.render();
            plugins.render();
        }
    }
    
}