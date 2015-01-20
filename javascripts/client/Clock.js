define(function() {
	var serverTimeOffset = null;
	var clientAdditionalTimeOffset = null;

	function getServerTime() {
		if(serverTimeOffset === null) { return null; }
		return performance.now() + serverTimeOffset;
	}
	function setServerTimeOffset(offset) {
		serverTimeOffset = offset;
	}
	function getClientTime() {
		if(serverTimeOffset === null) { return null; }
		if(clientAdditionalTimeOffset === null) { return null; }
		return performance.now() + serverTimeOffset + clientAdditionalTimeOffset;
	}
	function setClientTimeOffset(offset) {
		clientAdditionalTimeOffset = offset;
	}
	function getServerReceiveTime() {
		var serverTime = getServerTime();
		var clientTime = getClientTime();
		if(serverTime !== null && clientTime !== null) {
			return 2 * serverTime - clientTime;
		}
		return null;
	}

	return {
		getClientTime: getClientTime,
		setClientTimeOffset: setClientTimeOffset,
		getServerTime: getServerTime,
		setServerTimeOffset: setServerTimeOffset,
		getServerReceiveTime: getServerReceiveTime
	};
});