define([
	'client/net/Connection',
	'client/Clock'
], function(
	Connection,
	Clock
) {
	var NEXT_PING_ID = 0;
	var SECONDS_BETWEEN_PINGS = 1.00;
	var NUM_CACHED_PINGS = 20;
	var PINGS_TO_IGNORE = 4;
	var timeToNextPing = SECONDS_BETWEEN_PINGS;
	var pings = [];
	var pingsSinceDelayLowered = 0;
	var serverTimeOffset = { min: null, max: null };
	var clientEnforcedDelay = null;
	var recentPackets = [];

	function reset() {
		timeToNextPing = SECONDS_BETWEEN_PINGS;
		pings = [];
		pingsSinceDelayLowered = 0;
		serverTimeOffset = { min: null, max: null };
		clientEnforcedDelay = null;
	}

	function tick(t) {
		timeToNextPing -= t;
		if(timeToNextPing <= 0) {
			//record ping being sent out
			var id = NEXT_PING_ID++;
			pings.push({ pingId: id, sent: performance.now(), received: null });
			if(pings.length > NUM_CACHED_PINGS) { pings.shift(); }

			//send ping
			Connection.send({ messageType: 'ping', pingId: id });
			timeToNextPing += SECONDS_BETWEEN_PINGS;
		}
	}

	function onReceive(msg) {
		if(msg.messageType === 'ping-response') {
			var time = performance.now();
			for(var i = 0; i < pings.length; i++) {
				if(pings[i].pingId === msg.pingId) {
					//we got a response to one of our pings
					pings[i].received = time;
					var lag = pings[i].received - pings[i].sent;

					//see if we can't gain a better estimate of server time
					var offsetChanged = false;
					var minServerTimeOffset = Math.min(time - msg.time, time - msg.time - lag);
					var maxServerTimeOffset = Math.max(time - msg.time, time - msg.time - lag);
					if(serverTimeOffset.min === null || serverTimeOffset.min < minServerTimeOffset) {
						serverTimeOffset.min = minServerTimeOffset;
						offsetChanged = true;
					}
					if(serverTimeOffset.max === null || serverTimeOffset.max > maxServerTimeOffset) {
						serverTimeOffset.max = maxServerTimeOffset;
						offsetChanged = true;
					}

					//if we have a better estimate of server time, update the game clock
					if(offsetChanged) {
						Clock.setServerTimeOffset(serverTimeOffset.min +
							(serverTimeOffset.max - serverTimeOffset.min) / 2);
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
		//create a sorted array of latency times (worst latency first)
		var latencies = pings.map(function(ping) {
			return ping.received - ping.sent;
		}).sort(function(a, b) { return b - a; });

		//the worst latencies are ignored (3 / 15 of messages will come in late)
		var idealDelay = latencies[Math.min(PINGS_TO_IGNORE, pings.length - 1)] + 3; //buffer ms added
		var delayChanged = false;

		//if we don't have an enforced delay yet, this is the best estimate to use
		if(clientEnforcedDelay === null) {
			clientEnforcedDelay = idealDelay;
			pingsSinceDelayLowered = 0;
			delayChanged = true;
		}
		//if the network got worse we can safely adopt the new delay -- client will stutter
		else if(clientEnforcedDelay <= idealDelay) {
			clientEnforcedDelay = idealDelay;
			pingsSinceDelayLowered = 0;
			delayChanged = true;
		}
		//if the network got better, we might not trust that it will stay good
		else {
			//we only lower the client's delay if the "gains" are worth it
			var gains = Math.sqrt(clientEnforcedDelay - idealDelay); //we undervalue huge gains
			if(gains * pingsSinceDelayLowered > 50) {
				clientEnforcedDelay = idealDelay;
				delayChanged = true;
			}
		}

		//if we changed the delay, the game clock needs to be updated
		if(delayChanged) {
			Clock.setClientTimeOffset(clientEnforcedDelay);
		}
	}

	function render(ctx, x, y, width, height) {
		ctx.fillStyle = '#0f0';
		ctx.font = "7px Lucida Console";

		//draw latency bars
		var maxLag = Math.max.apply(this, pings.map(function(ping) {
			return ping.received - ping.sent;
		}));
		var barX = x + width;
		var barWidth = (width - 40) / NUM_CACHED_PINGS;
		for(var i = pings.length - 1; i >= 0; i--) {
			barX -= barWidth;
			if(pings[i].received !== null) {
				var lag = pings[i].received - pings[i].sent;
				var barHeight = (height - 10) * lag / maxLag;
				ctx.fillRect(barX, y + height - 10 - barHeight, barWidth - 3, barHeight);
				ctx.fillText("" + Math.floor(lag), barX, y + height);
			}
		}

		//draw delay line (or simulated latency)
		if(clientEnforcedDelay !== null) {
			ctx.strokeStyle = '#ff0';
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(x + 40, y + (height - 10) * (1 - clientEnforcedDelay / maxLag));
			ctx.lineTo(x + width, y + (height - 10) * (1 - clientEnforcedDelay / maxLag));
			ctx.stroke();
		}

		//draw ping text
		ctx.font = "11px Lucida Console";
		var totalLag = 0;
		var numPings = 0;
		for(var i = 0; i < pings.length; i++) {
			if(pings[i].received !== null) {
				numPings++;
				totalLag += pings[i].received - pings[i].sent;
			}
		}
		if(numPings > 0) {
			ctx.fillStyle = '#fff';
			ctx.fillText(Math.round(totalLag / numPings) + "ms", x, y + 7);
		}
		if(clientEnforcedDelay !== null) {
			ctx.fillStyle = '#ff0';
			ctx.fillText(Math.round(clientEnforcedDelay) + "ms", x, y + 21);
		}
		if(recentPackets.length > 0) {
			var numLatePackets = recentPackets.filter(function(packet) {
				return packet.success;
			}).length;
			ctx.fillStyle = '#f06';
			ctx.fillText((Math.round(1000 * numLatePackets / recentPackets.length) / 10) +
				"%", x, y + 35);
		}
	}

	function recordPacketReceive(success) {
		var time = performance.now();
		recentPackets.push({ success: success, time: time });
		recentPackets = recentPackets.filter(function(packet) {
			return packet.time + 8000 > time;
		});
	}

	return {
		reset: reset,
		tick: tick,
		onReceive: onReceive,
		recordPacketReceive: recordPacketReceive,
		render: render
	};
});