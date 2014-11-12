if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'client/Constants',
	'client/ui/Speedometer'
], function(
	ClientConstants,
	Speedometer
) {
	return function() {
		var speedometer = new Speedometer();

		function tick() {
			speedometer.tick();
		}
		function render(ctx) {
			ctx.fillStyle = '#222';
			ctx.fillRect(0, 0, ClientConstants.CANVAS_WIDTH, ClientConstants.CANVAS_HEIGHT);
			speedometer.render(ctx);
		}

		//set up loop
		var ctx = document.getElementById('game-canvas').getContext('2d');
		function loop() {
			tick();
			render(ctx);
			requestAnimationFrame(loop);
		}
		requestAnimationFrame(loop);
	};
});