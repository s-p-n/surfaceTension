var edibleItems = ['slire_roll'];
var eatQueue = {
    food: null,
    add: function (item) {
        if (this.food !== null && item !== this.food.name) {
            return false;
        }
        if (edibleItems.indexOf(item) === -1) {
            return false;
        }
        if (this.food === null) {
            this.food = {name: item, num: 1};
        } else {
            this.food.num += 1;
        }
        this.render();
        return true;
    },
    remove: function () {
        if (this.food === null) {
            return false;
        }
        //if (this.food.num > 1) {
        //    this.food.num -= 1;
        //} else {
            this.food = null;
        //}
        comms.emit('eatQueue-item-removed');
        this.render();
        return true;
    },
    restore: function (queue) {
        console.log('Restoring Food Queue:', queue);
        this.food = queue;
        this.render();
    },
    getItemImage: function (item) {
        return $('<span class="multiplier">x' + item.num + '</span><img src="/assets/game/items/' + item.name + '.png" />');
    },
    render: function () {
        var eatQueue = $('#rightPanelEatQueue .eatQueue');
        eatQueue.
            html('').
            css('cursor', 'default');
        if (this.food !== null) {
            eatQueue.append(this.getItemImage(this.food));
            eatQueue.css('cursor', 'pointer');
        }
    }
}