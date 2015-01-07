define(function() {
	var NEXT_PLAYER_ID = 0;
	function Player(socket) {
		this._playerId = NEXT_PLAYER_ID++;
		this.socket = socket;
	}
	Player.prototype.sameAs = function(player) {
		return player && player._playerId === this._playerId;
	};
	return Player;
});