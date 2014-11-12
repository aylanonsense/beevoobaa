if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'jquery',
	'game/Blah'
], function(
	$,
	Blah
) {
	return function() {
		console.log("Client started!", Blah.a);
	};
});