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
	$('#top').click(function (event) {
		console.log("hiding #top")
		console.log(event.target)
		console.log($('#top')[0])
		if (event.target == $('#top')[0]) {
			$('#top').css('display', 'none');
		}
	});
	$(document).on('focus', 'input', function () {
		window.bypassPhaserInput = true
	});
	$(document).on('blur', 'input', function () {
	    window.bypassPhaserInput = false;
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
		console.log("creating cookie: ", data);
		cookies.create(data.name, data.value, data.days);
	});

	return socket;
}());