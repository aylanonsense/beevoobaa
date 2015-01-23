//configure requirejs
requirejs.config({ baseUrl: '/', paths: { jquery: '/client/lib/jquery' } });

//start client
requirejs([
	'jquery',
	'client/Constants',
	'client/net/Pinger',
	'client/Clock',
	'client/net/Connection',
	'client/Game'
], function(
	$,
	Constants,
	Pinger,
	Clock,
	Connection,
	Game
) {
	var $canvas = $('<canvas width="' + Constants.CANVAS_WIDTH + 'px" height="' +
		Constants.CANVAS_HEIGHT + 'px"></canvas>').appendTo("#game-canvas-area");
	var ctx = $canvas[0].getContext('2d');
	var bufferedMessages = [];
	var prevGameTime = null;
	var prevTimestamp = performance.now();
	var keyboard = {};
	for(var key in Constants.KEY_BINDINGS) { keyboard[Constants.KEY_BINDINGS[key]] = false; }

	//add network listeners
	Connection.onConnected(function() {
		reset();
		Game.onConnected();
	});
	Connection.onReceive(function(msg) {
		if(!Pinger.onReceive(msg)) {
			var time = Clock.getClientTime();
			if(time === null) {
				//console.log("Message arrived from server pre-sync (so it was ignored)", msg);
			}
			else if(time > msg.time) {
				//console.log("Message arrived from server " + Math.ceil(time - msg.time) +
				//	"ms too late (so it was ignored)", msg);
			}
			else {
				bufferedMessages.push(msg);
			}
		}
	});
	Connection.onDisconnected(function() {
		Game.onDisconnected();
		reset();
	});
	Connection.connect();

	//add input listeners
	$(document).on('keydown keyup', function(evt) {
		evt.isDown = (evt.type === 'keydown');
		if(Constants.KEY_BINDINGS[evt.which] &&
			keyboard[Constants.KEY_BINDINGS[evt.which]] !== evt.isDown) {
			keyboard[Constants.KEY_BINDINGS[evt.which]] = evt.isDown;
			evt.gameKey = Constants.KEY_BINDINGS[evt.which];
			Game.onKeyboardEvent(evt, keyboard);
		}
	});
	$canvas.on('mousemove mouseup mousedown', Game.onMouseEvent);

	function processBufferedMessages(startTime, endTime) {
		var numMessagesToRemove = 0;
		for(var i = 0; i < bufferedMessages.length; i++) {
			var msg = bufferedMessages[i];
			//if the msg is relevant now, apply it
			if(startTime <= msg.time && msg.time <= endTime) {
				if(!Game.onReceive(msg)) {
					throw new Error("Unsure how to handle '" + msg.messageType + "' message", msg);
				}
				numMessagesToRemove++;
			}
			//if it occurs in the future, the rest must also occur in the future
			else if(msg.time > endTime) {
				break;
			}
			//otherwise it's dated, but how could that have happened?
			else {
				console.error("How did an old message make it into the bufferedMessages array?", msg);
				numMessagesToRemove++;
			}
		}
		if(numMessagesToRemove > 0) {
			bufferedMessages = bufferedMessages.slice(numMessagesToRemove, bufferedMessages.length);
		}
	}

	//set up the game loop
	function loop(timestamp) {
		//get game time
		var t = Math.min(timestamp - prevTimestamp, 100) / 1000;
		prevTimestamp = timestamp;
		Pinger.tick(t);

		//use game time to advance simulation
		var gameTime = Clock.getClientTime();
		if(gameTime === null || prevGameTime === null) {
			//game is starting up, nothing is happening
			prevGameTime = gameTime;
		}
		else if(gameTime <= prevGameTime) {
			//game stuttered, don't update anything
		}
		else {
			if(gameTime - prevGameTime > 50) {
				//game is moving too fast (3 frames per frame), pace it over a couple of frames
				processBufferedMessages(prevGameTime, prevGameTime + 50);
				Game.tick(50 / 1000, prevGameTime + 50);
				prevGameTime += 50;
			}
			else {
				//game is moving normally
				processBufferedMessages(prevGameTime, gameTime);
				Game.tick((gameTime - prevGameTime) / 1000, gameTime);
				prevGameTime = gameTime;
			}
		}
		render();
		requestAnimationFrame(loop);
	}

	function render() {
		ctx.fillStyle = '#222';
		ctx.fillRect(0, 0, Constants.CANVAS_WIDTH, Constants.CANVAS_HEIGHT);
		Game.render(ctx);
		Pinger.render(ctx, Constants.CANVAS_WIDTH - 300 - 10,
			Constants.CANVAS_HEIGHT - 50 - 10, 300, 50);
	}

	function reset() {
		Game.reset();
		Pinger.reset();
		Clock.reset();
		bufferedMessages = [];
		prevGameTime = null;
		prevTimestamp = performance.now();
	}

	//kick off the game loop
	render();
	requestAnimationFrame(loop);
});