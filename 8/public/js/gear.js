var gear = {
    slots: {
        head: {
            type: 0
        },
        leftGlove: {
            type: 0
        },
        shirt: {
            type: 0
        },
        rightGlove: {
            type: 0
        },
        pants: {
            type: 0
        },
        leftShoe: {
            type: 0
        },
        rightShoe: {
            type: 0
        }
    },
    restore: function (gear) {
        this.slots = gear;
        this.render();
    },
    add: function (slot, type) {
        if (this.slots[slot].type === 0) {
            this.slots[slot].type = type;
        } else {
            this.remove(slot);
            this.slots[slot].type = type;
        }
    },
    remove: function (slot) {
        if (this.slots[slot].type !== 0 &&
            inventory.add(slot + this.slots[slot].type)
        ) {
            this.slots[slot].type = 0;
            comms.emit('gear-removed', slot);
            this.render();
            return true;
        }
        return false;
    },
    getGearImage: function (slot, type) {
        return '<img src="/assets/game/gear/' + slot + '/' + type + '.png">';
    },
    render: function () {
        var self = this;
        var slot;
        for (slot in self.slots) {
            $('#rightPanelGear .' + slot).
                html('').
                css('cursor', 'default').
                attr('data-type', void 0);
            if (self.slots[slot].type !== 0) {
                console.log('gear.render:', slot, self.slots[slot]);
                $('#rightPanelGear .' + slot).
                    html(self.getGearImage(slot, self.slots[slot].type)).
                    css('cursor', 'pointer').
                    attr('data-type', self.slots[slot].type);
            }
        }
    }
};
(function ($) {
    $(document).on('click', '#rightPanelGear div', function (e) {
        if ($(this).attr('data-type') === void 0) {
            return;
        }
        //console.log('gear click:', $(this).attr('data-type'), );
        gear.remove($(this).attr('class'))
    });
}(jQuery));