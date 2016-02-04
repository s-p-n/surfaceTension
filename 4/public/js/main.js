function initializeGame (main) {
    var sortInterval = 100;
    var lastSort = 0;
    main.game = new Phaser.Game(1000, 450, Phaser.CANVAS, 'canvas', {
        preload: preload, 
        create: create,
        update: update,
        render: render
    });
    main.objects;
    main.map = new Map (main);
    var plugins = new Plugins(new Player(main), new Others(main), new Herbs(main));

    function preload() {
        main.game.time.advancedTiming = true;
        main.game.stage.disableVisibilityChange = true;
        main.map.preload();
        plugins.preload();
    }
    function create() {
        main.map.create();
        main.objects = main.game.add.group();
        plugins.create();
        comms.emit('game-ready', true);
    }
    function update() {
        var now = Date.now();
        main.map.update();
        plugins.update();
        if (lastSort + sortInterval < now) {
            lastSort = now;
            main.objects.sort('bottom', Phaser.Group.SORT_ASCENDING);
        }
    }
    function render () {
        main.game.debug.text(main.game.time.fps + 'fps', 2, 15, "#00ff00");
        main.map.render();
        plugins.render();
    }
    
}