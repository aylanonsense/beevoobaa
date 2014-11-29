if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'client/ship/console-config'
], function(
	consoleConfig
) {
	var consoles = [];
	var lastConsoleToHandleAnEvent = null;

	function tick(t) {
		for(var i = 0; i < consoles.length; i++) {
			consoles[i].tick(t);
		}
	}

	function render(ctx) {
		for(var i = 0; i < consoles.length; i++) {
			consoles[i].render(ctx);
		}
	}

	function onReceive(msg) {
		if(msg.type === 'console-update') {
			for(var i = 0; i < msg.reports.length; i++) {
				var report = msg.reports[i];
				var consoleExists = false;
				//update existing console
				for(var j = 0; j < consoles.length; j++) {
					if(report.id === consoles[j].getId()) {
						consoles[j].receiveUpdate(report);
						consoleExists = true;
						break;
					}
				}
				//add a new console
				if(!consoleExists) {
					var console = consoleConfig[report.type];
					consoles.push(new console.module(console.x, console.y, report));
				}
			}
		}
	}

	function onDisconnected() {
		console.log("Disconnected!");
		consoles = [];
		lastConsoleToHandleAnEvent = null;
	}

	function onMouseEvent(evt) {
		if(!lastConsoleToHandleAnEvent || !lastConsoleToHandleAnEvent.onMouse(evt.type, evt.offsetX, evt.offsetY)) {
			for(var i = consoles.length - 1; i >= 0; i--) {
				if(consoles[i].onMouse(evt.type, evt.offsetX, evt.offsetY)) {
					lastConsoleToHandleAnEvent = consoles[i];
					break;
				}
			}
		}
	}

	return {
		tick: tick,
		render: render,
		onReceive: onReceive,
		onDisconnected: onDisconnected,
		onMouseEvent: onMouseEvent
	};
});