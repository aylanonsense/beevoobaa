define([
	'client/Constants',
	'client/net/Connection'
], function(
	Constants,
	Connection
) {
	var SECONDS_BETWEEN_PINGS = 1.00;
	var NEXT_PING_ID = 0;
	var serverTimeOffset = { min: null, max: null };
	var clientEnforcedDelay = null;
	var pingsSinceDelayLowered = 0;
	var timeToNextPing = SECONDS_BETWEEN_PINGS;
	var pings = [];
	var minGameTimeDiff = null;
	var maxGameTimeDiff = null;

	function tick(t) {
		timeToNextPing -= t;
		if(timeToNextPing <= 0) {
			//send ping
			var id = NEXT_PING_ID++;
			pings.push({ pingId: id, sent: performance.now(), received: null });
			if(pings.length > 20) { pings.shift(); }
			Connection.send({ messageType: 'ping', pingId: id });
			timeToNextPing += SECONDS_BETWEEN_PINGS;
		}
	}

	function onReceive(msg) {
		if(msg.messageType === 'ping-response') {
			var now = performance.now();
			for(var i = 0; i < pings.length; i++) {
				if(pings[i].pingId === msg.pingId) {
					//found the correct ping
					pings[i].received = now;
					var lag = pings[i].received - pings[i].sent;
					var reportedServerTime = msg.time;
					var minServerTime = reportedServerTime;
					var maxServerTime = reportedServerTime + lag;

					//see if we can't gain a better estimate of server time
					var minServerTimeOffset = Math.min(now - minServerTime, now - maxServerTime);
					var maxServerTimeOffset = Math.max(now - minServerTime, now - maxServerTime);
					if(serverTimeOffset.min === null ||
						serverTimeOffset.min < minServerTimeOffset) {
						serverTimeOffset.min = minServerTimeOffset;
					}
					if(serverTimeOffset.max === null ||
						serverTimeOffset.max > maxServerTimeOffset) {
						serverTimeOffset.max = maxServerTimeOffset;
					}

					//may need to increase/decrease delay depending on lag
					pingsSinceDelayLowered++;
					recalculateClientEnforcedDelay();
					break;
				}
			}
			return true;
		}
		return false;
	}

	function recalculateClientEnforcedDelay() {
		if(pings.length === 0) { throw new Error("No pings have been sent!"); }

		//create a sorted array of latency times (worst latency first)
		var latencies = pings.map(function(ping) {
			return ping.received - ping.sent;
		}).sort(function(a, b) { return b - a; });

		//the worst latencies are ignored (15% of messages will come in late)
		var idealDelay = latencies[Math.min(3, pings.length - 1)] + 3; //buffer ms added

		//if we don't have an enforced delay yet, this is the best estimate to use
		if(clientEnforcedDelay === null) {
			clientEnforcedDelay = idealDelay;
			pingsSinceDelayLowered = 0;
		}
		//if the network slowed down we can safely adopt the new delay -- client will stutter
		else if(clientEnforcedDelay <= idealDelay) {
			clientEnforcedDelay = idealDelay;
			pingsSinceDelayLowered = 0;
		}
		//if the client's network got better, we might not trust that it will stay good
		else {
			//we only lower the client's delay if the "gains" are worth it
			var gains = Math.sqrt(clientEnforcedDelay - idealDelay); //we undervalue huge gains
			if(gains * pingsSinceDelayLowered > 50) {
				clientEnforcedDelay = idealDelay;
			}
		}
	}

	function render(ctx) {
		ctx.fillStyle = '#ff0';
		ctx.font = "10px Lucida Console";
		var x = Constants.CANVAS_WIDTH - 10;
		for(var i = pings.length - 1; i >= 0 && x > 10; i--) {
			x -= 20;
			if(pings[i].received !== null) {
				var t = pings[i].received - pings[i].sent;
				ctx.fillRect(x, Constants.CANVAS_HEIGHT - 20 - t, 16, t);
				ctx.fillText(Math.floor(t), x, Constants.CANVAS_HEIGHT - 10);
			}
		}
		if(clientEnforcedDelay !== null) {
			ctx.strokeStyle = '#f00';
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.moveTo(10, Constants.CANVAS_HEIGHT - 20 - clientEnforcedDelay);
			ctx.lineTo(Constants.CANVAS_WIDTH - 10,
				Constants.CANVAS_HEIGHT - 20 - clientEnforcedDelay);
			ctx.stroke();
		}
		ctx.fillStyle = '#fff';
		ctx.font = "16px Lucida Console";
		var time = getClientTime();
		if(time !== null) {
			var n = Math.floor(time / 100) / 10;
			ctx.fillText("" + n + (n % 1 === 0 ? ".0" : ""), 10, 20);
		}
	}

	function getClientTime() {
		if(clientEnforcedDelay === null) {
			return null;
		}
		else {
			var serverTime = getServerTime();
			if(serverTime === null) {
				return null;
			}
			else {
				return serverTime - clientEnforcedDelay;
			}
		}
	}

	function getServerTime() {
		if(serverTimeOffset.max === null) {
			return null;
		}
		else {
			var offset = serverTimeOffset.min +
				0.5 * (serverTimeOffset.max - serverTimeOffset.min);
			return performance.now() - offset;
		}
	}

	return {
		logThing: function(thing) {
			console.log("GOT   msg-time=" + Math.floor(thing.time) +
				"   client-time=" + Math.floor(getClientTime()) +
				"   diff=" + Math.floor(thing.time - getClientTime()) +
				"   delay=" + Math.floor(clientEnforcedDelay) +
				"   time-offset=" + Math.floor(serverTimeOffset.min) + " to " +
				Math.ceil(serverTimeOffset.max));
		},
		tick: tick,
		onReceive: onReceive,
		render: render,
		getClientTime: getClientTime,
		getServerTime: getServerTime
	};
});