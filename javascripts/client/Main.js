//configure requirejs
requirejs.config({
	baseUrl: '/',
	paths: {
		jquery: '/client/lib/jquery',
		create: '/client/lib/instanqi8'
	}
});

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
	var SECONDS_BETWEEN_FLUSH_MESSAGES = 2.5 / 60;
	var timeToNextFlushMessages = SECONDS_BETWEEN_FLUSH_MESSAGES;
	var timeDebt = 0;
	var tryingToChangeTimeDebt = 0;

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

	function processBufferedMessages(endTime) {
		var numMessagesToRemove = 0;
		var time = Clock.getClientTime();
		for(var i = 0; i < bufferedMessages.length; i++) {
			var msg = bufferedMessages[i];
			//if the msg is relevant now, apply it
			if(msg.time <= endTime) {
				if(!Game.onReceive(msg, time - msg.time)) {
					throw new Error("Unsure how to handle '" + msg.messageType + "' message", msg);
				}
				numMessagesToRemove++;
			}
			//if it occurs in the future, the rest must also occur in the future
			else if(msg.time > endTime) {
				break;
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
			timeDebt = 0;
		}
		//if we have a lot of time to make up, just reset and let's start again
		else if(gameTime - prevGameTime > 1000) {
			reset();
		}
		else {
			//figure out if we have time debt to make up (by speeding up or slowing down the game)
			if(timeDebt > 75 / 1000) { tryingToChangeTimeDebt = -1; }
			else if(timeDebt < -75 / 1000) { tryingToChangeTimeDebt = 1; }
			else if((tryingToChangeTimeDebt === -1 && timeDebt < 10 / 1000) ||
				(tryingToChangeTimeDebt === 1 && timeDebt > -10 / 1000)) {
				tryingToChangeTimeDebt = 0;
			}

			//if we are trying to make up time debt, we need speed up or slow down the simulation
			var tAdjusted = t;
			if(tryingToChangeTimeDebt > 0) { tAdjusted /= 10.0; }
			else if(tryingToChangeTimeDebt < 0) { tAdjusted *= 2.0; }

			//we need to record our time debt (as in, are we ahead of or behind the server)
			if(gameTime <= prevGameTime) {
				//game stuttered, our simulation is now "ahead" of the server
				timeDebt += tAdjusted;
			}
			else if(gameTime - prevGameTime > 50) {
				//we have to make up a lot of time, so we chunk it
				timeDebt += 50 / 1000 - tAdjusted; //game is "behind" the server now
				prevGameTime += 50;
			}
			else {
				//game is moving normally
				timeDebt += ((gameTime - prevGameTime) / 1000) - tAdjusted;
				prevGameTime = gameTime;
			}

			processBufferedMessages(gameTime);
			Game.tick(tAdjusted);
		}

		if(tryingToChangeTimeDebt !== 0) {
			console.log(tryingToChangeTimeDebt, timeDebt);
		}
		render();
		timeToNextFlushMessages -= t;
		if(timeToNextFlushMessages <= 0) {
			timeToNextFlushMessages = SECONDS_BETWEEN_FLUSH_MESSAGES;
			Connection.flush();
		}
		requestAnimationFrame(loop);
	}

	function render() {
		ctx.fillStyle = '#222';
		ctx.fillRect(0, 0, Constants.CANVAS_WIDTH, Constants.CANVAS_HEIGHT);
		Game.render(ctx);
		Pinger.render(ctx, Constants.CANVAS_WIDTH - 350 - 10,
			Constants.CANVAS_HEIGHT - 75 - 10, 350, 75);
	}

	function reset() {
		Game.reset();
		Pinger.reset();
		Clock.reset();
		Connection.reset();
		bufferedMessages = [];
		prevGameTime = null;
		prevTimestamp = performance.now();
		timeDebt = 0;
		tryingToChangeTimeDebt = 0;
	}

	//kick off the game loop
	render();
	requestAnimationFrame(loop);
});