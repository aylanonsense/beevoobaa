//configure requirejs
requirejs.config({ baseUrl: '/', paths: { jquery: '/client/lib/jquery' } });

//start client
requirejs([
	'jquery',
	'client/Constants',
	'client/net/Connection',
	'client/Game'
], function(
	$,
	Constants,
	Connection,
	Game
) {
	var ctx = $('#game-canvas')[0].getContext('2d');

	//add network listeners
	Connection.onConnected(Game.onConnected);
	Connection.onReceive(Game.onReceive);
	Connection.onDisconnected(Game.onDisconnected);

	//add input listeners
	var keyboard = {};
	for(var key in Constants.KEY_BINDINGS) { keyboard[Constants.KEY_BINDINGS[key]] = false; }
	$(document).on('keydown keyup', function(evt) {
		evt.isDown = (evt.type === 'keydown');
		if(Constants.KEY_BINDINGS[evt.which] &&
			keyboard[Constants.KEY_BINDINGS[evt.which]] !== evt.isDown) {
			keyboard[Constants.KEY_BINDINGS[evt.which]] = evt.isDown;
			evt.gameKey = Constants.KEY_BINDINGS[evt.which];
			Game.onKeyboardEvent(evt, keyboard);
		}
	});
	$('#game-canvas').on('mousemove mouseup mousedown', Game.onMouseEvent);

	//set up the game loop
	function loop() {
		Game.tick(1 / Constants.TARGET_FRAME_RATE);
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