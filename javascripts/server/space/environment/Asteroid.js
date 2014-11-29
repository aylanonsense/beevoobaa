if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'server/space/SpaceObject'
], function(
	SUPERCLASS
) {
	function Asteroid(params) {
		SUPERCLASS.call(this, params);
	}
	Asteroid.prototype = Object.create(SUPERCLASS.prototype);
	return Asteroid;
});