//configure requirejs
requirejs.config({ baseUrl: '/', paths: { jquery: '/client/lib/jquery' } });

//start client
requirejs([
	'jquery',
	'client/phys-example/BallSimulator',
	'client/Constants'
], function(
	$,
	Main,
	Constants
) {
	var ctx = $('#game-canvas')[0].getContext('2d');

	function render() {
		ctx.fillStyle = '#222';
		ctx.fillRect(0, 0, Constants.CANVAS_WIDTH, Constants.CANVAS_HEIGHT);
		Main.render(ctx);
	}

	function loop() {
		Main.tick(1 / 60);
		render();
		requestAnimationFrame(loop);
	}

	render();
	requestAnimationFrame(loop);
});