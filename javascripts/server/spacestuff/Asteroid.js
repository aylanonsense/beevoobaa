if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'server/utils/FloatingMass'
], function(
	FloatingMass
) {
	function Asteroid(params) {
		this._pointMass = new FloatingMass(params.x, params.y, 0, params.mass, params.radius);
		this._pointMass.vel.x = params.velX || 0;
		this._pointMass.vel.y = params.velY || 0;
	}
	Asteroid.prototype.tick = function(t) {
		//this._pointMass.tick(t);
	};
	return Asteroid;
});