if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'client/Constants',
	'client/ui/PowerLevel',
	'client/ui/DummyPowerLevel'
], function(
	ClientConstants,
	PowerLevel,
	DummyPowerLevel
) {
	return function() {
		var powerLevel = new PowerLevel();
		var dummyPowerLevel = new DummyPowerLevel(100);
		var dummyPowerLevel2 = new DummyPowerLevel(300);

		setInterval(function() {
			var r = 100 * Math.random();
			var r2 = 100 * Math.random();
			powerLevel.receiveUpdate({ powerLevel: { value: r, changePerSecond: (r2 - r) } });
			dummyPowerLevel.setPowerLevel(r);
			dummyPowerLevel2.setPowerLevel(r2);
		}, 1000 * 2);

		function tick() {
			powerLevel.tick();
		}
		function render(ctx) {
			ctx.fillStyle = '#222';
			ctx.fillRect(0, 0, ClientConstants.CANVAS_WIDTH, ClientConstants.CANVAS_HEIGHT);
			powerLevel.render(ctx);
			dummyPowerLevel.render(ctx);
			dummyPowerLevel2.render(ctx);
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