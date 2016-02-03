function initializeGame (main) {
    main.game = new Phaser.Game(1000, 450, Phaser.CANVAS, 'canvas', {
        preload: preload, 
        create: create,
        update: update,
        render: render
    });

    var plugins = [new Map(main), new Player(main), new Others(main)];

    function preload() {
        main.game.time.advancedTiming = true;
        main.game.stage.disableVisibilityChange = true;
        plugins.forEach(function (plugin) {
            plugin.preload();
        });
    }
    function create() {
        plugins.forEach(function (plugin) {
            plugin.create();
        });
        comms.emit('game-ready', true);
    }
    function update() {
        plugins.forEach(function (plugin) {
            plugin.update();
        });
    }
    var renderInterval = 250;
    var nextRender = Date.now();
    function render () {
        //if (Date.now() < nextRender) {
        //    return;
        //}
        nextRender = Date.now() + renderInterval;
        main.game.debug.text(main.game.time.fps + 'fps', 2, 15, "#00ff00");
        plugins.forEach(function (plugin) {
            plugin.render();
        });
    }
    
}