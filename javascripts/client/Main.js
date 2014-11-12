if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'client/Constants'
], function(
	ClientConstants
) {
	return function() {
		var ctx = document.getElementById('game-canvas').getContext('2d');

		function tick() {
			//TODO
		}
		function render() {
			ctx.fillStyle = '#222';
			ctx.fillRect(0, 0, ClientConstants.CANVAS_WIDTH, ClientConstants.CANVAS_HEIGHT);
			//TODO
		}

		//set up loop
		function loop() {
			tick();
			render();
			requestAnimationFrame(loop);
		}
		requestAnimationFrame(loop);
	};
});