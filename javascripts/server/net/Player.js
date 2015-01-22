define(function() {
	var NEXT_PLAYER_ID = 0;
	function Player(socket) {
		this.id = NEXT_PLAYER_ID++;
		this.socket = socket;
		this.gameData = {};
	}
	Player.prototype.sameAs = function(player) {
		return player && player.id === this.id;
	};
	return Player;
});