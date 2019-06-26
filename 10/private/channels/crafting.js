var craftCombos = [
    {
        items: ['wolf_tooth', 'slire_roll', 'wield1'],
        result: 'wield2'
    }
];

function findCombo (items) {
    var i, j;
        //console.log('craft attempt:', items);
        for (i = 0; i < craftCombos.length; i += 1) {
            if (craftCombos[i].items.length !== items.length) {
                continue;
            }
            //console.log("combo length match")
            for (j = 0; j < items.length; j += 1) {
                if (craftCombos[i].items.indexOf(items[j]) === -1) {
                    //console.log('item not in combo:', items[j]);
                    break;
                }
                if (j === items.length - 1) {
                    //console.log('combo found:', craftCombos[i]);
                    return craftCombos[i];
                }
            }
        }
        return false;
}

module.exports = function (m, session) {
    var socket = session.socket;
    socket.on('craft-attempt', function (items) {
        var combo = findCombo(items);
        if (combo) {
            socket.emit('craft-result', combo);
        } else {
            socket.emit('craft-result', {
                items: items,
                result: false
            });
        }
    });
    socket.on('craft-claim', function (items) {
        var combo = findCombo(items);
        var legit = true;
        if (combo) {
            items.forEach(function (item) {
                var id = session.user.inventory.indexOf(item);
                if (id === -1) {
                    legit = false;
                } else {
                    session.user.inventory.remove(id)
                }
            });
            if (legit) {
                session.user.inventory.add(combo.result);
            } else {
                socket.emit('craft-result', {
                    items: [],
                    result: false
                });
            }
        }
    });
};