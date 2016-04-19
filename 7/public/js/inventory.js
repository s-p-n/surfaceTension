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
        self.items[firstEmptySlot] = {
            name: item,
            num: 1
        };
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
    $(document).on('click', '.item', function (e) {
        var id = $(this).attr('data-id');
        var item;
        if (id === void 0) {
            return;
        }
        if (sprite !== null) {
            sprite.destroy();
            sprite = null;
            return;
        }
        item = inventory.items[parseInt(id)];
        inventory.render();
        sprite = gameObj.game.add.sprite(700, 350, item.name);
        sprite.inventory_id = id;
        e.preventDefault();
        return false;
    });
    $(document).on('mousemove', function (e) {
        var xMod, yMod, x, y;
        if (gameObj.utils === void 0) {
            return;
        }
        x = e.pageX - (12.5 * gameObj.scale) + gameObj.game.camera.x;
        y = e.pageY - (12.5 * gameObj.scale) + gameObj.game.camera.y;
        if (sprite === null) {
            return true;
        }
        xMod = x % (gridSize * gameObj.scale);
        yMod = y % (gridSize * gameObj.scale);
        x /= gameObj.scale;
        y /= gameObj.scale;
        xMod /= gameObj.scale;
        yMod /= gameObj.scale;
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
    $(document).on('click', '#canvas', function (e) {
        var data = {}, item;
        if (sprite === null) {
            return true;
        }
        item = inventory.items[parseInt(sprite.inventory_id)];
        if (item.num === 1) {
            inventory.items.splice(sprite.inventory_id, 1);
            sprite.destroy();
            sprite = null;
        } else {
            item.num -= 1;
        }
        data.inventory_id = sprite.inventory_id;
        data.name = sprite.key;
        data.place = [sprite.x, sprite.y];
        comms.emit('item-placed', data);
        if (item.num <= 0) {
            sprite.destroy();
            sprite = null;
        }
    });
}());