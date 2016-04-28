var gameObj = null;
var comms = (function () {
	var socket = io();

	$('html').on('submit', 'form[method="socket"]', function (e) {
		var formData = [];
		$(this).find('input[name]').each(function () {
			var type = $(this).attr('type');
			var result = {name: $(this).attr('name'), value: void 0};
			switch (type) {
				case 'checkbox':
					result.value = this.checked.toString();
					break;
				default:
					result.value = $(this).val();
			}
			formData.push(result);
		});
		socket.emit($(this).attr('action'), formData);
		e.stopPropagation();
		e.preventDefault();
		return false;
	});
	$('.logout').click(function () {
		cookies.erase('sessionID');
	});
	$('#evilMode').change(function (e) {
		console.log('evilMode ' + $(this).prop('checked'));
		if ($(this).prop('checked')) {
			$(this).siblings('label').css('color', '#FFCCCC');
		} else {
			$(this).siblings('label').css('color', '#CCCCCC');
		}
	});
	socket.on('connect', function () {
		if (window.gameObj === null) {
		    window.gameObj = {};
		} else {
		    window.location.reload();
		}
	});
	socket.on('content', function (data) {
		$(data.selector).html(data.html);
	});

	socket.on('cookie', function (data) {
		cookies.create(data.name, data.value, data.days);
	});

	return socket;
}());