function calcLvlXp (lvl) {
    var i, xp = 100, multi = 1.3;
    for (i = 1; i < lvl; i += 1) {
        xp *= multi;
    }
    return xp;
}
function statsUpdate(game) {
    var wellness = game.wellness;
    var skills = game.skills;
    var statsHTML = 'HP: ' + wellness.hp + '<br>' +
        'Hunger: ' + wellness.hunger + '%<br>' +
        'Infections: none<br>' +
        'Illnesses: none<br>' +
        'Diseases: none<br>' +
        'Life (' + ((skills.life.experience/calcLvlXp(skills.life.level))*100).toFixed(2) + '%): ' + skills.life.level +
        '<br>Medic (' + ((skills.medic.experience/calcLvlXp(skills.medic.level))*100).toFixed(2) + '%): ' + skills.medic.level +
        '<br>Melee (' + ((skills.melee.experience/calcLvlXp(skills.melee.level))*100).toFixed(2) + '%): ' + skills.melee.level;
    $('#infoBox').html(statsHTML);
}