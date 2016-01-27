function initializeGame (main) {
    main.game = new Phaser.Game(1000, 450, Phaser.AUTO, 'canvas', {
        preload: preload, 
        create: create,
        update: update,
        render: render
    });

    var plugins = [new Map(main), new Player(main)];

    function preload() {
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
    function render() {
        plugins.forEach(function (plugin) {
            plugin.render();
        });
    }
}