//configure requirejs
requirejs.config({ baseUrl: '/', paths: { jquery: '/client/lib/jquery' } });

//start client
requirejs([
	'jquery',
	'client/Constants',
	'client/net/Connection',
	'client/SpaceGame'
], function(
	$,
	Constants,
	Connection,
	Game
) {
	var ctx = $('#game-canvas')[0].getContext('2d');

	//add network listeners
	Connection.onDisconnected(Game.onDisconnected);
	Connection.onReceive(Game.onReceive);

	//add input listeners
	$('#game-canvas').on('mousemove mouseup mousedown', Game.onMouseEvent);

	//set up the game loop
	function loop() {
		Game.tick(1 / Constants.TARGET_FRAMES_PER_SECOND);
		render();
		requestAnimationFrame(loop);
	}
	function render() {
		ctx.fillStyle = '#222';
		ctx.fillRect(0, 0, Constants.CANVAS_WIDTH, Constants.CANVAS_HEIGHT);
		Game.render(ctx);
	}

	//kick off the game loop
	render();
	requestAnimationFrame(loop);
});