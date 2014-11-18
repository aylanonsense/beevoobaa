if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'jquery',
	'client/Constants',
	'client/net/Connection',
	'client/ship/console-config'
], function(
	$,
	ClientConstants,
	Connection,
	consoleConfig
) {
	return function() {
		var consoles = [];
		var lastConsoleToHandleAnEvent = null;

		function tick() {
			for(var i = 0; i < consoles.length; i++) {
				consoles[i].tick();
			}
		}
		function render(ctx) {
			ctx.fillStyle = '#222';
			ctx.fillRect(0, 0, ClientConstants.CANVAS_WIDTH, ClientConstants.CANVAS_HEIGHT);
			for(var i = 0; i < consoles.length; i++) {
				consoles[i].render(ctx);
			}
		}

		//set up loop
		var ctx = $('#game-canvas')[0].getContext('2d');
		function loop() {
			tick();
			render(ctx);
			requestAnimationFrame(loop);
		}
		requestAnimationFrame(loop);

		Connection.onDisconnected(function() {
			console.log("Disconnected!");
			consoles = [];
		});
		Connection.onReceive(function(msg) {
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
		});

		//add user mouse input support
		$('#game-canvas').on('mousemove mouseup mousedown', function(evt) {
			if(!lastConsoleToHandleAnEvent || !lastConsoleToHandleAnEvent.onMouse(evt.type, evt.offsetX, evt.offsetY)) {
				for(var i = consoles.length - 1; i >= 0; i--) {
					if(consoles[i].onMouse(evt.type, evt.offsetX, evt.offsetY)) {
						lastConsoleToHandleAnEvent = consoles[i];
						break;
					}
				}
			}
		});
	};
});