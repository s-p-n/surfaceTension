function wellnessUpdate(wellness) {
    var wellnessHTML = 'HP: ' + wellness.hp + '<br>' +
        'Hunger: ' + wellness.hunger + '%<br>' +
        'Infections: none<br>' +
        'Illnesses: none<br>' +
        'Diseases: none<br>';
    $('#infoBox').html(wellnessHTML);
}