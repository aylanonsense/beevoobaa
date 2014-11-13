if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
], function(
) {
	function Player(socket) {
		this.socket = socket;
	}
	return Player;
});