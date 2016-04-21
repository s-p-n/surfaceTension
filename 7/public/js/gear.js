var gear = {
    restore: function (gear) {
        if (gear.shirt.type === 1) {
            $('.shirt').append($('<img src="/assets/game/items/shirt.png">'));
        }
        if (gear.pants.type === 1) {
            $('.pants').append($('<img src="/assets/game/items/pants.png">'));
        }
    }
}