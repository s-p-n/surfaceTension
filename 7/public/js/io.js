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
		console.log('action:', $(this).attr('action'), formData);
		socket.emit($(this).attr('action'), formData);
		e.stopPropagation();
		e.preventDefault();
		return false;
	});
	socket.on('connect', function () {
		if (window.gameObj === void 0) {
		    window.gameObj = {};
		} else {
		    window.location.reload();
		}
	});
	socket.on('content', function (data) {
		console.log("content:", data);
		$(data.selector).html(data.html);
	});

	socket.on('cookie', function (data) {
		console.log("setting cookie:", data);
		cookies.create(data.name, data.value, data.days);
	});

	return socket;
}());