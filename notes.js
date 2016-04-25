melee: {
    maxHit: weaponMaxHit + (meleeLevel * .3)
    reduceHit: oponentMeleeLvl / meleeLevel
}

life: {
    hp: 10 * lifeLevel
    immunity: (function (lvl) {
        // example:
        // lvl 5 is 0.05 immunity, and lvl 99 is 0.99 immunity.
        // everything over lvl 100 is completely immune.
        if (lvl < 10) {
            return parseFloat('0.0' + lvl);
        }
        if (lvl < 100) {
            return parseFloat('0.' + lvl);
        }
        return 1;
    }(lifeLevel))
}

function calcLvlXp (lvl) {
    var i, xp = 100, multi = 1.3;
    for (i = 1; i < lvl; i += 1) {
        xp *= multi;
    }
    return xp;
}

function toohard (maxKills) {
    var lvl, kills = 0;
    for (lvl = 1; kills < maxKills; lvl += 1) {
        kills = (calcLvlXp(lvl + 1) - calcLvlXp(lvl)) / (lvl * 40);
    }
    return [lvl, kills];
}