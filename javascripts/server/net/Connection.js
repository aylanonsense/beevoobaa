define(function() {
	var NEXT_CONN_ID = 0;
	function Connection(socket) {
		this.id = NEXT_CONN_ID++;
		this.socket = socket;
		this.gameData = {};
	}
	return Connection;
});