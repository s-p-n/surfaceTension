var crafting = {
    items: [],
    result: false,
    add: function (item) {
        this.items.push(item);
        this.render();
        comms.emit('craft-attempt', this.items);
        return true;
    },
    remove: function (id) {
        var item = this.items[id];
        if (item !== void 0 && inventory.add(item)) {
            this.items.splice(id, 1);
            this.render();
            comms.emit('craft-attempt', this.items);
            return true;
        } else if (id == this.items.length) {
            comms.emit('craft-claim', this.items);
        }
        return false;
    },
    restore: function (crafting) {
        this.items = crafting.items;
        this.result = crafting.result;
        this.render();
    },
    getItemImage: function (item) {
        return $('<img src="/assets/game/items/' + item + '.png" />');
    },
    render: function () {
        var self = this;
        var i;
        $('#rightPanelCrafting').html('');
        for (i = 0; i <= this.items.length; i += 1) {
            $('#rightPanelCrafting').append('<div class="item" />');
            $('#rightPanelCrafting').append(' ');
        }
        $('#rightPanelCrafting .item').each(function (i, item) {
            $(item).html('');
            if (self.items[i] !== void 0) {
                $(item).append(self.getItemImage(self.items[i]));
                $(item).attr('data-id', i);
                $(item).css('cursor', 'pointer');
            } else if (self.result) {
                $(item).append(self.getItemImage(self.result));
                $(item).attr('data-id', i);
                $(item).css({
                    'cursor': 'pointer',
                    'background': '#CCFFCC'
                });
            } else {
                $(item).css('background', 'rgba(255, 255, 255, 0.5)');
            }
        });
    }
};