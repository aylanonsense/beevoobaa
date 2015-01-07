define([
], function(
) {
	function tick(t) {
		//TODO
	}

	function render(ctx) {
		//TODO
	}

	function onConnected() {
		console.log("Connected!");
		//TODO
	}

	function onReceive(msg) {
		//TODO
	}

	function onDisconnected() {
		console.log("Disconnected!");
		//TODO
	}

	function onKeyboardEvent(evt, keyboard) {
		//TODO
	}

	function onMouseEvent(evt) {
		//TODO
	}

	return {
		tick: tick,
		render: render,
		onReceive: onReceive,
		onConnected: onConnected,
		onDisconnected: onDisconnected,
		onKeyboardEvent: onKeyboardEvent,
		onMouseEvent: onMouseEvent
	};
});