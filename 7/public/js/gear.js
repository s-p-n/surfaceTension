var gear = {
    restore: function (gear) {
        if (gear.pants.type === 1) {
            $('.pants').append($('<img src="/assets/game/items/pants.png">'));
        }
    }
}