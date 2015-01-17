//configure requirejs
requirejs.config({ baseUrl: '/', paths: { jquery: '/client/lib/jquery' } });

//start client
requirejs([
	'jquery',
	'client/Constants',
	'client/Pinger',
	'client/net/Connection',
	'client/Game'
], function(
	$,
	Constants,
	Pinger,
	Connection,
	Game
) {
	var ctx = $('#game-canvas')[0].getContext('2d');

	//add network listeners
	Connection.onConnected(Game.onConnected);
	Connection.onReceive(function(msg) {
		if(!Pinger.onReceive(msg)) {
			var time = Pinger.getClientTime();
			if(!Game.onReceive(msg, time)) {
				throw new Error("Unsure how to handle '" + msg.messageType + "' message");
			}
		}
	});
	Connection.onDisconnected(Game.onDisconnected);
	Connection.connect();

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
	var prevGameTime = null;
	var prevTimestamp = performance.now();
	function loop(timestamp) {
		//get game time
		var t = Math.min(timestamp - prevTimestamp, 100) / 1000;
		prevTimestamp = timestamp;
		Pinger.tick(t);
		var gameTime = Pinger.getClientTime();

		//use game time to advance simulation
		if(gameTime === null || prevGameTime === null) {
			//game is starting up, nothing is happening
			prevGameTime = gameTime;
		}
		else if(gameTime <= prevGameTime) {
			//game stuttered, don't update anything
		}
		else if(gameTime - prevGameTime > 50) {
			//game is moving too fast (3 frames per frame), pace it over a couple of frames
			Game.tick(50 / 1000, prevGameTime + 50, prevGameTime);
			prevGameTime += 50;
		}
		else {
			//game is moving normally
			Game.tick((gameTime - prevGameTime) / 1000, gameTime, prevGameTime);
			prevGameTime = gameTime;
		}
		render();
		requestAnimationFrame(loop);
	}
	function render() {
		ctx.fillStyle = '#222';
		ctx.fillRect(0, 0, Constants.CANVAS_WIDTH, Constants.CANVAS_HEIGHT);
		Game.render(ctx);
		Pinger.render(ctx);
	}

	//kick off the game loop
	render();
	requestAnimationFrame(loop);
});