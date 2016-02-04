var inventory = {
    items: Array(30),
    add: function (item) {
        var self = this;
        var i, firstEmptySlot = 30;
        for (i = 0; i < 30; i += 1) {
            if (self.items[i] !== void 0 && 
                self.items[i].name === item && 
                self.items[i].num < 64
            ) {
                self.items[i].num += 1;
                self.render();
                return true;
            }
            if (self.items[i] === void 0 && firstEmptySlot === 30) {
                firstEmptySlot = i;
            }
        }
        if (firstEmptySlot === 30) {
            return false;
        }
        console.log('first empty slot:', firstEmptySlot);
        self.items[firstEmptySlot] = {
            name: item,
            num: 1
        };
        console.log('items:', self.items);
        self.render();
        return true;
    },
    restore: function (inventory) {
        this.items = inventory;
        this.render();
    },
    getItemImage: function (item) {
        return $('<span class="multiplier">x' + item.num + '</span><img src="/assets/game/items/' + item.name + '.png" />');
    },
    render: function () {
        var self = this;
        $('#rightPanel .item').each(function (i, item) {
            $(item).html('');
            $(item).attr('data-id', void 0);
            $(item).css('cursor', 'default');
            if (self.items[i] !== void 0) {
                console.log("Adding img to inventory:", item, i, self.items[i])
                $(item).append(self.getItemImage(self.items[i]));
                $(item).attr('data-id', i);
                $(item).css('cursor', 'pointer');
            }
        });
    }
};
(function () {
    var sprite = null;
    var gridSize = 25;
    $(document).on('mousedown', '.item', function (e) {
        var id = $(this).attr('data-id');
        var item;
        if (id === void 0) {
            return;
        }
        item = inventory.items[parseInt(id)];
        if (item.num === 1) {
            inventory.items.splice(id, 1);
        } else {
            item.num -= 1;
        }
        inventory.render();
        sprite = gameObj.game.add.sprite(700, 350, item.name);
        sprite.inventory_id = id;
        e.preventDefault();
        return false;
    });
    $(document).on('mousemove', function (e) {
        var xMod, yMod;
        var x = e.pageX - 12.5;
        var y = e.pageY - 12.5;
        if (sprite === null) {
            return true;
        }
        xMod = x % gridSize;
        yMod = y % gridSize;
        if (xMod > 12.5) {
            sprite.x = x + (gridSize - xMod);
        } else {
            sprite.x = x - xMod;
        }
        if (yMod > 12.5) {
            sprite.y = y + (gridSize - yMod);
        } else {
            sprite.y = y - yMod;
        }
    });
    $(document).on('mouseup', function (e) {
        var herb = {};
        if (sprite === null) {
            return true;
        }
        herb.inventory_id = sprite.inventory_id;
        herb.name = sprite.key;
        herb.place = [sprite.x, sprite.y];
        comms.emit('herb-planted', herb);
        sprite.destroy();
        sprite = null;
    });
}());