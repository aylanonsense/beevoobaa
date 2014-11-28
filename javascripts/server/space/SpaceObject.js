if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'server/utils/PhysicsObject'
], function(
	PhysicsObject
) {
	function SpaceObject(params) {
		this.physics = new PhysicsObject(params);
	}
	SpaceObject.prototype.startOfFrame = function(t) {};
	SpaceObject.prototype.tick = function(t) {};
	SpaceObject.prototype.endOfFrame = function(t) {};
	return SpaceObject;
});